from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, Notification
from app.schemas.student import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationOut])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2 Smart Notifications: List student notifications ordered by newest first."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return []
    return (
        db.query(Notification)
        .filter(Notification.student_id == student.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )


@router.put("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.student_id == student.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return {"message": "No notifications"}

    db.query(Notification).filter(
        Notification.student_id == student.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
