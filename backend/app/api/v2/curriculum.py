from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek, Progress
from app.schemas.student import CurriculumOut

router = APIRouter(prefix="/curriculum", tags=["V2 Adaptive Curriculum"])


@router.post("/adapt")
def adapt_curriculum(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Trigger curriculum adaptation based on performance feedback."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    curriculum = (
        db.query(Curriculum)
        .filter(Curriculum.student_id == student.id, Curriculum.is_active == True)
        .first()
    )
    if not curriculum:
        raise HTTPException(status_code=404, detail="Active curriculum not found")

    week_id = data.get("week_id")
    score_pct = float(data.get("score_percentage", 50.0))

    if week_id:
        week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
        if week:
            if score_pct < 60:
                week.difficulty = "easy"
                # Add extra practice
                extra = [
                    {"type": "practice", "title": f"Step-by-step Foundation: {week.topic}", "url": "https://exercism.org"},
                    {"type": "video", "title": f"Deep Dive Crash Course: {week.topic}", "url": "https://freecodecamp.org"},
                ]
                existing = {r.get("title") for r in (week.resources or [])}
                current_res = list(week.resources or [])
                for r in extra:
                    if r["title"] not in existing:
                        current_res.append(r)
                week.resources = current_res
            elif score_pct >= 85:
                week.difficulty = "hard"
                # Add advanced challenge
                extra = [
                    {"type": "project", "title": f"Advanced Capstone Challenge: {week.topic}", "url": "https://github.com"},
                ]
                existing = {r.get("title") for r in (week.resources or [])}
                current_res = list(week.resources or [])
                for r in extra:
                    if r["title"] not in existing:
                        current_res.append(r)
                week.resources = current_res

            db.commit()
            db.refresh(week)

    return {
        "adapted": True,
        "message": "Curriculum successfully adapted based on your performance analytics.",
        "curriculum_id": curriculum.id,
    }


@router.get("/updated", response_model=CurriculumOut)
def get_updated_curriculum(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Get the latest adapted curriculum."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    curriculum = (
        db.query(Curriculum)
        .filter(Curriculum.student_id == student.id, Curriculum.is_active == True)
        .order_by(Curriculum.generated_at.desc())
        .first()
    )
    if not curriculum:
        raise HTTPException(status_code=404, detail="Curriculum not found")
    return curriculum
