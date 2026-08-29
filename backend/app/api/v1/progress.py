from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek, Progress
from app.schemas.student import ProgressUpdate, ProgressOut, ProgressSummary

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/", response_model=List[ProgressOut])
def get_all_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return db.query(Progress).filter(Progress.student_id == student.id).all()


@router.put("/{week_id}", response_model=ProgressOut)
def update_progress(
    week_id: int,
    data: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update progress status for a curriculum week."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    valid_statuses = ["not_started", "in_progress", "completed"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    progress = db.query(Progress).filter(
        Progress.curriculum_week_id == week_id,
        Progress.student_id == student.id,
    ).first()

    if not progress:
        # Create progress record if missing
        week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
        if not week:
            raise HTTPException(status_code=404, detail="Week not found")
        progress = Progress(
            student_id=student.id,
            curriculum_week_id=week_id,
            status=data.status,
            notes=data.notes,
        )
        db.add(progress)
    else:
        progress.status = data.status
        if data.notes is not None:
            progress.notes = data.notes

    # Also update the week status
    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
    if week:
        week.status = data.status

    db.commit()
    db.refresh(progress)
    return progress


@router.get("/summary/me", response_model=ProgressSummary)
def get_progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    all_progress = db.query(Progress).filter(Progress.student_id == student.id).all()
    total = len(all_progress)
    completed = sum(1 for p in all_progress if p.status == "completed")
    in_progress = sum(1 for p in all_progress if p.status == "in_progress")
    not_started = sum(1 for p in all_progress if p.status == "not_started")

    return ProgressSummary(
        total_topics=total,
        completed=completed,
        in_progress=in_progress,
        not_started=not_started,
        completion_percentage=round((completed / total) * 100, 1) if total > 0 else 0,
    )
