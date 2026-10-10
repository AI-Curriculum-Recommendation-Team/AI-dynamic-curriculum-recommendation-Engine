from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, Progress
from app.models.v2_models import WeeklyReport
from app.schemas.v2_schemas import WeeklyReportOut
from app.ai.curriculum_generator import generate_weekly_report

router = APIRouter(prefix="/reports", tags=["V2 Reports"])


@router.get("/weekly", response_model=WeeklyReportOut)
def get_weekly_progress_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Get or generate AI weekly progress report."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    curriculum = (
        db.query(Curriculum)
        .filter(Curriculum.student_id == student.id, Curriculum.is_active == True)
        .first()
    )
    if not curriculum:
        raise HTTPException(status_code=404, detail="No curriculum found to report on")

    total = len(curriculum.weeks)
    completed_count = 0
    progress_data = []

    for week in curriculum.weeks:
        prog = next((p for p in week.progress if p.student_id == student.id), None)
        st = prog.status if prog else "not_started"
        if st == "completed":
            completed_count += 1
        progress_data.append({"topic": week.topic, "status": st})

    completion_pct = round((completed_count / total * 100), 1) if total > 0 else 0.0
    career_title = student.career_goal.title if student.career_goal else "your target role"

    report_text = generate_weekly_report(
        student_name=student.full_name,
        career_goal=career_title,
        progress_data=progress_data,
        completion_pct=completion_pct,
    )

    db_report = WeeklyReport(
        student_id=student.id,
        week_number=max(1, completed_count),
        report_text=report_text,
        skill_progress={"completed": completed_count, "total": total},
        completion_percentage=completion_pct,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return {
        "id": db_report.id,
        "week_number": db_report.week_number,
        "report": db_report.report_text,
        "completion_percentage": db_report.completion_percentage,
        "generated_at": db_report.generated_at,
    }
