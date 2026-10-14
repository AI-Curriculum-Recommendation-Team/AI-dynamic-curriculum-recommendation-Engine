from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek
from app.models.v4_models import CompanyCurriculumProfile, CurriculumRecalibration, CareerReadiness
from app.ai.recalibration_engine import evaluate_and_recalibrate_curriculum

router = APIRouter(prefix="/companies", tags=["V4 Company Curriculum Alignment"])


class TargetCompanyRequest(BaseModel):
    company_id: int


@router.get("")
def list_company_curriculum_profiles(
    db: Session = Depends(get_db),
):
    """
    Returns all pre-seeded company profiles with core tech stacks and hiring criteria.
    """
    companies = db.query(CompanyCurriculumProfile).order_by(CompanyCurriculumProfile.id).all()
    return [
        {
            "id": c.id,
            "company_name": c.company_name,
            "tier": c.tier,
            "target_role": c.target_role,
            "difficulty_level": c.difficulty_level,
            "description": c.description,
            "core_tech_stack": c.core_tech_stack or [],
            "interview_focus_areas": c.interview_focus_areas or [],
        }
        for c in companies
    ]


@router.post("/apply-target")
def apply_target_company_to_curriculum(
    req: TargetCompanyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Applies target company focus to the student's active curriculum and recalibrates it.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    company = db.query(CompanyCurriculumProfile).filter(CompanyCurriculumProfile.id == req.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    # Update or create CareerReadiness target company
    readiness = db.query(CareerReadiness).filter(CareerReadiness.student_id == student.id).first()
    if not readiness:
        readiness = CareerReadiness(student_id=student.id, target_company_id=company.id)
        db.add(readiness)
    else:
        readiness.target_company_id = company.id

    curriculum = db.query(Curriculum).filter(
        Curriculum.student_id == student.id,
        Curriculum.is_active == True
    ).first()

    if not curriculum:
        db.commit()
        return {
            "message": f"Target company set to {company.company_name}. Choose a career goal to generate an aligned curriculum.",
            "company_name": company.company_name,
            "target_role": company.target_role,
        }

    weeks = db.query(CurriculumWeek).filter(CurriculumWeek.curriculum_id == curriculum.id).order_by(CurriculumWeek.week_number).all()
    current_weeks_data = [
        {
            "week_number": w.week_number,
            "title": w.topic,
            "topic": w.topic,
            "description": f"{w.topic} ({len(w.subtopics or [])} subtopics)",
            "learning_objectives": w.subtopics or [],
            "estimated_hours": w.estimated_hours,
            "resources": w.resources or [],
            "is_completed": w.status == "completed",
        }
        for w in weeks
    ]

    career_title = student.career_goal.title if student.career_goal else "Software Engineering"

    recal_result = evaluate_and_recalibrate_curriculum(
        career_title=career_title,
        target_company_name=company.company_name,
        current_weeks=current_weeks_data,
        quiz_attempts_summary=[],
        coding_submissions_summary=[],
        trigger_type=f"company_alignment_{company.company_name}",
    )

    adapted_weeks = recal_result.get("adapted_weeks", [])

    # Record recalibration
    recal = CurriculumRecalibration(
        curriculum_id=curriculum.id,
        student_id=student.id,
        trigger_type="company_alignment",
        trigger_source_title=f"Target Company Alignment: {company.company_name}",
        reason=f"Recalibrated curriculum roadmap to match {company.company_name}'s hiring stack ({company.target_role}).",
        changes_summary=recal_result.get("changes_summary", [f"Aligned curriculum with {company.company_name} core competencies"]),
        previous_weeks_snapshot=current_weeks_data,
        new_weeks_snapshot=adapted_weeks,
        ai_recommendations=f"Master the tech stack for {company.company_name}: {', '.join(company.core_tech_stack or [])}.",
    )
    db.add(recal)

    # Apply changes to uncompleted weeks
    for w_data in adapted_weeks:
        w_num = w_data.get("week_number")
        existing_w = next((w for w in weeks if w.week_number == w_num), None)
        if existing_w and existing_w.status != "completed":
            existing_w.topic = w_data.get("topic") or w_data.get("title") or existing_w.topic
            existing_w.subtopics = w_data.get("learning_objectives") or existing_w.subtopics or []
            if w_data.get("resources"):
                existing_w.resources = w_data.get("resources")

    db.commit()

    return {
        "message": f"Curriculum aligned with {company.company_name} ({company.target_role})!",
        "company_name": company.company_name,
        "tier": company.tier,
        "target_role": company.target_role,
        "core_tech_stack": company.core_tech_stack,
        "changes_summary": recal.changes_summary,
    }
