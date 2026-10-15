from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, Skill, StudentSkill
from app.schemas.student import (
    StudentCreate, StudentUpdate, StudentOut,
    StudentSkillCreate, StudentSkillOut, CareerGoalSet, CareerGoalOut
)

router = APIRouter(prefix="/students", tags=["Students"])


def get_student_or_404(current_user: User, db: Session) -> Student:
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.get("/profile", response_model=StudentOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_student_or_404(current_user, db)


@router.put("/profile", response_model=StudentOut)
def update_profile(
    data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(current_user, db)
    if data.full_name is not None:
        student.full_name = data.full_name
    if data.education is not None:
        student.education = data.education
    if data.learning_preference is not None:
        student.learning_preference = data.learning_preference
    db.commit()
    db.refresh(student)
    return student


@router.get("/skills", response_model=List[StudentSkillOut])
def get_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(current_user, db)
    return student.skills


@router.post("/skills", response_model=List[StudentSkillOut])
def set_skills(
    skills: List[StudentSkillCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(current_user, db)

    # Remove all existing skills
    db.query(StudentSkill).filter(StudentSkill.student_id == student.id).delete()

    for skill_data in skills:
        # Get or create skill
        skill = db.query(Skill).filter(Skill.name == skill_data.skill_name).first()
        if not skill:
            skill = Skill(name=skill_data.skill_name)
            db.add(skill)
            db.flush()

        student_skill = StudentSkill(
            student_id=student.id,
            skill_id=skill.id,
            self_rated_level=skill_data.self_rated_level,
            proficiency_score=skill_data.proficiency_score,
        )
        db.add(student_skill)

    db.commit()
    db.refresh(student)
    return student.skills


@router.post("/career")
def set_career_goal(
    data: CareerGoalSet,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = get_student_or_404(current_user, db)
    from app.models.student import CareerGoal
    goal = db.query(CareerGoal).filter(CareerGoal.id == data.career_goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Career goal not found")
    student.career_goal_id = data.career_goal_id
    db.commit()
    return {"message": f"Career goal set to: {goal.title}"}


@router.post("/reset-progress")
def reset_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """User: Reset all learning progress, curriculum, quiz attempts, and career goal to start fresh."""
    student = get_student_or_404(current_user, db)
    try:
        from app.services.user_service import cleanup_student_learning_data
        cleanup_student_learning_data(student.id, db, keep_profile=True)
        return {"message": "Your learning journey and curriculum have been reset. You can now start fresh from Stage 1!"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset learning journey: {str(e)}"
        )


@router.delete("/account")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """User: Permanently delete your own account and all associated data."""
    try:
        from app.services.user_service import delete_user_completely
        delete_user_completely(current_user.id, db)
        return {"message": "Account deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )

