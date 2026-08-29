from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.student import CareerGoal
from app.schemas.student import CareerGoalOut

router = APIRouter(prefix="/careers", tags=["Career Goals"])


@router.get("/", response_model=List[CareerGoalOut])
def list_career_goals(db: Session = Depends(get_db)):
    """List all available career paths."""
    return db.query(CareerGoal).all()
