from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import (
    Student, Assessment, AssessmentQuestion, AssessmentResult, Skill, StudentSkill
)
from app.schemas.student import AssessmentOut, AssessmentSubmit, AssessmentResultOut

router = APIRouter(prefix="/assessments", tags=["Assessments"])


# NOTE: Specific routes MUST be defined before wildcard /{career_id} route
# to prevent FastAPI from matching /submit, /results/... as career_id values.

@router.post("/submit", response_model=AssessmentResultOut)
def submit_assessment(
    data: AssessmentSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit assessment answers and calculate scores."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    assessment = db.query(Assessment).filter(Assessment.id == data.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Calculate scores per skill
    skill_correct = {}
    skill_total = {}

    for question in assessment.questions:
        skill_name = question.skill.name
        if skill_name not in skill_total:
            skill_total[skill_name] = 0
            skill_correct[skill_name] = 0
        skill_total[skill_name] += 1

        given_answer = data.answers.get(question.id, "")
        if given_answer.strip().lower() == question.correct_answer.strip().lower():
            skill_correct[skill_name] += 1

    # Convert to percentage scores
    scores_per_skill = {
        skill: round((skill_correct.get(skill, 0) / total) * 100, 1)
        for skill, total in skill_total.items()
    }

    overall_score = (
        sum(scores_per_skill.values()) / len(scores_per_skill)
        if scores_per_skill else 0
    )

    # Save result
    result = AssessmentResult(
        student_id=student.id,
        assessment_id=data.assessment_id,
        scores_per_skill=scores_per_skill,
        overall_score=overall_score,
    )
    db.add(result)

    # Update student skill scores based on assessment
    for skill_name, score in scores_per_skill.items():
        skill = db.query(Skill).filter(Skill.name == skill_name).first()
        if skill:
            existing = db.query(StudentSkill).filter(
                StudentSkill.student_id == student.id,
                StudentSkill.skill_id == skill.id,
            ).first()
            if existing:
                existing.proficiency_score = int(score)
            else:
                db.add(StudentSkill(
                    student_id=student.id,
                    skill_id=skill.id,
                    proficiency_score=int(score),
                    self_rated_level="beginner" if score < 40 else "intermediate" if score < 75 else "advanced",
                ))

    db.commit()
    db.refresh(result)
    return result


@router.get("/results/latest/me", response_model=AssessmentResultOut)
def get_my_latest_result(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    result = (
        db.query(AssessmentResult)
        .filter(AssessmentResult.student_id == student.id)
        .order_by(AssessmentResult.taken_at.desc())
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="No assessment results found")
    return result


@router.get("/results/{result_id}", response_model=AssessmentResultOut)
def get_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    result = db.query(AssessmentResult).filter(
        AssessmentResult.id == result_id,
        AssessmentResult.student_id == student.id
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


@router.get("/{career_id}", response_model=AssessmentOut)
def get_assessment(
    career_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the assessment for a career goal."""
    assessment = db.query(Assessment).filter(
        Assessment.career_goal_id == career_id
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found for this career goal")
    return assessment
