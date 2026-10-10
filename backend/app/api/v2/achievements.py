from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, AssessmentResult
from app.models.v2_models import Achievement
from app.schemas.v2_schemas import AchievementOut
from app.services.v2_service import award_badge

router = APIRouter(prefix="/achievements", tags=["V2 Achievements"])


@router.get("", response_model=List[AchievementOut])
@router.get("/", response_model=List[AchievementOut])
def get_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Get student's earned badges and milestone awards."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Evaluate dynamic badges retroactively
    if student.career_goal_id:
        award_badge(db, student.id, "FIRST_STEP")

    has_assessment = db.query(AssessmentResult).filter(AssessmentResult.student_id == student.id).first()
    if has_assessment:
        award_badge(db, student.id, "DIAGNOSTIC_ACE")

    has_curr = db.query(Curriculum).filter(Curriculum.student_id == student.id).first()
    if has_curr:
        award_badge(db, student.id, "ROADMAP_INIT")

    achievements = (
        db.query(Achievement)
        .filter(Achievement.student_id == student.id)
        .order_by(Achievement.earned_at.desc())
        .all()
    )
    return achievements
