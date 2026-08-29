from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.models.student import Student, Curriculum, CareerGoal
from app.schemas.student import AdminUserOut, PlatformStats

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[AdminUserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: List all users with student profiles."""
    users = db.query(User).all()
    result = []
    for user in users:
        student_name = user.student.full_name if user.student else None
        result.append(AdminUserOut(
            id=user.id,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            student_name=student_name,
        ))
    return result


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: Activate or deactivate a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}


@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: Change user role (user/admin)."""
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"message": f"Role updated to {role}"}


@router.get("/stats", response_model=PlatformStats)
def get_platform_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: Get platform-wide statistics."""
    total_users = db.query(User).count()
    total_students = db.query(Student).count()
    total_curricula = db.query(Curriculum).count()

    # Active today (created within last 24h)
    yesterday = datetime.utcnow() - timedelta(hours=24)
    active_today = db.query(User).filter(User.created_at >= yesterday).count()

    # Career goal distribution
    goals = db.query(CareerGoal).all()
    career_dist = {}
    for goal in goals:
        count = db.query(Student).filter(Student.career_goal_id == goal.id).count()
        if count > 0:
            career_dist[goal.title] = count

    return PlatformStats(
        total_users=total_users,
        total_students=total_students,
        total_curricula=total_curricula,
        active_users_today=active_today,
        career_goal_distribution=career_dist,
    )
