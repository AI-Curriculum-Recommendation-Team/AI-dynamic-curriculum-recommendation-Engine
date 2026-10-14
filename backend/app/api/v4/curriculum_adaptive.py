from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek
from app.models.v2_models import TopicQuiz, QuizAttempt
from app.models.v4_models import CurriculumRecalibration, CompanyCurriculumProfile, CodingSubmission
from app.ai.recalibration_engine import evaluate_and_recalibrate_curriculum

router = APIRouter(prefix="/curriculum", tags=["V4 Adaptive Curriculum Recalibration"])


@router.post("/recalibrate")
def recalibrate_curriculum(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Analyzes student quiz attempts, coding submissions, and curriculum weeks,
    and dynamically adapts the remaining weeks of the student's curriculum.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    curriculum = db.query(Curriculum).filter(
        Curriculum.student_id == student.id,
        Curriculum.is_active == True
    ).first()

    if not curriculum:
        raise HTTPException(status_code=400, detail="No active curriculum found. Choose a career goal first.")

    # Collect existing weeks
    weeks = db.query(CurriculumWeek).filter(
        CurriculumWeek.curriculum_id == curriculum.id
    ).order_by(CurriculumWeek.week_number).all()

    current_weeks_data = [
        {
            "week_number": w.week_number,
            "title": w.topic,
            "topic": w.topic,
            "description": f"{w.topic} - {len(w.subtopics or [])} core competencies",
            "learning_objectives": w.subtopics or [],
            "estimated_hours": w.estimated_hours,
            "is_completed": w.status == "completed",
            "resources": w.resources or [],
        }
        for w in weeks
    ]

    # Gather Quiz Attempts
    quiz_attempts = (
        db.query(QuizAttempt, TopicQuiz)
        .join(TopicQuiz, QuizAttempt.quiz_id == TopicQuiz.id)
        .filter(QuizAttempt.student_id == student.id)
        .all()
    )
    quiz_summary = [
        {"topic": tq.topic, "score": qa.score, "passed": qa.score >= 60}
        for qa, tq in quiz_attempts
    ]

    # Gather Coding Submissions
    coding_subs = db.query(CodingSubmission).filter(
        CodingSubmission.student_id == student.id
    ).all()
    coding_summary = [
        {"score": cs.score, "passed": cs.passed}
        for cs in coding_subs
    ]

    # Target Company if any
    career_title = student.career_goal.title if student.career_goal else "Software Engineering"
    target_company_name = None

    # Call AI Recalibration Engine
    recal_result = evaluate_and_recalibrate_curriculum(
        career_title=career_title,
        target_company_name=target_company_name,
        current_weeks=current_weeks_data,
        quiz_attempts_summary=quiz_summary,
        coding_submissions_summary=coding_summary,
        trigger_type="manual_recalibration",
    )

    adapted_weeks = recal_result.get("adapted_weeks", [])
    if not adapted_weeks:
        raise HTTPException(status_code=500, detail="Recalibration engine returned empty roadmap.")

    # Save snapshot to CurriculumRecalibration
    recalibration_record = CurriculumRecalibration(
        curriculum_id=curriculum.id,
        student_id=student.id,
        trigger_type="manual_recalibration",
        trigger_source_title="Performance Analytics & Student Request",
        reason=recal_result.get("reason", "Dynamic curriculum recalibration based on performance."),
        changes_summary=recal_result.get("changes_summary", []),
        previous_weeks_snapshot=current_weeks_data,
        new_weeks_snapshot=adapted_weeks,
        ai_recommendations=recal_result.get("ai_recommendations", ""),
    )
    db.add(recalibration_record)

    # Update or recreate curriculum weeks in DB
    # Keep completed weeks, update in-progress or upcoming weeks
    for w_data in adapted_weeks:
        week_num = w_data.get("week_number")
        existing_week = next((w for w in weeks if w.week_number == week_num), None)
        if existing_week:
            if existing_week.status != "completed":
                existing_week.topic = w_data.get("topic") or w_data.get("title") or existing_week.topic
                existing_week.subtopics = w_data.get("learning_objectives") or existing_week.subtopics or []
                existing_week.estimated_hours = w_data.get("estimated_hours", existing_week.estimated_hours)
                if w_data.get("resources"):
                    existing_week.resources = w_data.get("resources")
        else:
            # New week inserted
            new_week = CurriculumWeek(
                curriculum_id=curriculum.id,
                week_number=week_num,
                topic=w_data.get("topic") or w_data.get("title", f"Week {week_num}"),
                subtopics=w_data.get("learning_objectives", []),
                estimated_hours=w_data.get("estimated_hours", 10),
                difficulty="medium",
                resources=w_data.get("resources", []),
                status="not_started",
            )
            db.add(new_week)

    db.commit()

    return {
        "message": "Curriculum successfully recalibrated!",
        "recalibration_id": recalibration_record.id,
        "reason": recalibration_record.reason,
        "changes_summary": recalibration_record.changes_summary,
        "ai_recommendations": recalibration_record.ai_recommendations,
        "total_weeks": len(adapted_weeks),
    }


@router.get("/recalibrations")
def get_curriculum_recalibrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns audit history of all dynamic curriculum adjustments for the student.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    records = (
        db.query(CurriculumRecalibration)
        .filter(CurriculumRecalibration.student_id == student.id)
        .order_by(CurriculumRecalibration.recalibrated_at.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "trigger_type": r.trigger_type,
            "trigger_source_title": r.trigger_source_title,
            "reason": r.reason,
            "changes_summary": r.changes_summary or [],
            "ai_recommendations": r.ai_recommendations,
            "recalibrated_at": r.recalibrated_at.isoformat() if r.recalibrated_at else None,
        }
        for r in records
    ]
