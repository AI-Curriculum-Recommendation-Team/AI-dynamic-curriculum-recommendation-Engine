from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek, StudentSkill, Progress
from app.models.v2_models import TopicQuiz, QuizAttempt
from app.models.v4_models import CareerReadiness, CompanyCurriculumProfile, CodingSubmission

router = APIRouter(prefix="/readiness", tags=["V4 Placement Readiness & Skill Gap Matrix"])


@router.get("")
def get_career_readiness_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes a multi-dimensional career readiness score based on:
    - Curriculum Completion (30%)
    - Quiz Mastery (30%)
    - Coding Challenge Success (40%)
    Also outputs a live Skill Gap Matrix against target company requirements.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 1. Curriculum Completion Score
    curriculum = db.query(Curriculum).filter(
        Curriculum.student_id == student.id,
        Curriculum.is_active == True
    ).first()

    completion_score = 0.0
    if curriculum:
        weeks = db.query(CurriculumWeek).filter(CurriculumWeek.curriculum_id == curriculum.id).all()
        if weeks:
            completed_weeks = sum(1 for w in weeks if w.is_completed)
            completion_score = round((completed_weeks / len(weeks)) * 100, 1)

    # 2. Quiz Mastery Score
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).all()
    if quiz_attempts:
        quiz_score = round(sum(q.score for q in quiz_attempts) / len(quiz_attempts), 1)
    else:
        quiz_score = 0.0

    # 3. Coding Challenge Score
    coding_subs = db.query(CodingSubmission).filter(CodingSubmission.student_id == student.id).all()
    if coding_subs:
        coding_score = round(sum(s.score for s in coding_subs) / len(coding_subs), 1)
    else:
        coding_score = 0.0

    # 4. Weighted Overall Score
    overall_score = round(
        (completion_score * 0.30) + (quiz_score * 0.30) + (coding_score * 0.40),
        1
    )

    # 5. Target Company & Skill Gap Matrix
    readiness = db.query(CareerReadiness).filter(CareerReadiness.student_id == student.id).first()
    target_company = None
    if readiness and readiness.target_company_id:
        target_company = db.query(CompanyCurriculumProfile).filter(
            CompanyCurriculumProfile.id == readiness.target_company_id
        ).first()

    if not target_company:
        # Default to first company
        target_company = db.query(CompanyCurriculumProfile).first()

    # Build Skill Gap Matrix
    required_stack = target_company.core_tech_stack if target_company else ["Python", "Algorithms", "System Design", "SQL"]
    student_skills = {
        ss.skill.name.lower(): ss.proficiency_score
        for ss in student.skills if ss.skill
    }

    gap_matrix = []
    for skill_req in required_stack:
        student_level = student_skills.get(skill_req.lower(), 25)
        # Determine status
        if student_level >= 75:
            status = "mastered"
        elif student_level >= 50:
            status = "in_progress"
        else:
            status = "needs_focus"

        gap_matrix.append({
            "skill": skill_req,
            "target_level": 85,
            "current_level": student_level,
            "status": status,
        })

    # Actionable AI Recommendation
    if overall_score >= 80:
        recommendation = f"Outstanding readiness! You are in the top tier for {target_company.company_name if target_company else 'hiring companies'}. Focus on high-level system design and mock interviews."
    elif overall_score >= 55:
        recommendation = f"Solid foundation. Complete remaining coding labs and review weak topics to reach the 80%+ hiring bar for {target_company.company_name if target_company else 'target roles'}."
    else:
        recommendation = f"Early stage. Focus on weekly curriculum milestones and quiz quizzes to steadily build your core competencies."

    # Update readiness record
    if not readiness:
        readiness = CareerReadiness(
            student_id=student.id,
            overall_score=overall_score,
            curriculum_completion_score=completion_score,
            quiz_mastery_score=quiz_score,
            coding_score=coding_score,
            target_company_id=target_company.id if target_company else None,
            skill_gap_matrix=gap_matrix,
            recommended_action=recommendation,
        )
        db.add(readiness)
    else:
        readiness.overall_score = overall_score
        readiness.curriculum_completion_score = completion_score
        readiness.quiz_mastery_score = quiz_score
        readiness.coding_score = coding_score
        readiness.skill_gap_matrix = gap_matrix
        readiness.recommended_action = recommendation

    db.commit()

    return {
        "overall_score": overall_score,
        "curriculum_completion_score": completion_score,
        "quiz_mastery_score": quiz_score,
        "coding_score": coding_score,
        "target_company": {
            "id": target_company.id,
            "company_name": target_company.company_name,
            "tier": target_company.tier,
            "target_role": target_company.target_role,
        } if target_company else None,
        "skill_gap_matrix": gap_matrix,
        "recommended_action": recommendation,
    }
