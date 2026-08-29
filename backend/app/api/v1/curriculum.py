from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek
from app.schemas.student import CurriculumOut, CurriculumGenerateRequest
from app.ai.curriculum_generator import generate_curriculum_for_student, generate_topic_quiz, generate_weekly_report

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])


@router.post("/generate", response_model=CurriculumOut)
def generate_curriculum(
    request: CurriculumGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger AI curriculum generation for the student."""
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if request.career_goal_id:
        student.career_goal_id = request.career_goal_id
        db.commit()

    if not student.career_goal_id:
        raise HTTPException(
            status_code=400,
            detail="Please select a career goal first"
        )

    # Reload student with relationships
    db.refresh(student)

    curriculum = generate_curriculum_for_student(db, student)
    if not curriculum:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate curriculum. Please try again."
        )
    return curriculum


@router.get("/my", response_model=CurriculumOut)
def get_my_curriculum(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the student's active curriculum."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    curriculum = (
        db.query(Curriculum)
        .filter(Curriculum.student_id == student.id, Curriculum.is_active == True)
        .order_by(Curriculum.generated_at.desc())
        .first()
    )
    if not curriculum:
        raise HTTPException(status_code=404, detail="No curriculum found. Please generate one first.")
    return curriculum


@router.get("/roadmap")
def get_roadmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get visual roadmap data for the student's curriculum."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    curriculum = (
        db.query(Curriculum)
        .filter(Curriculum.student_id == student.id, Curriculum.is_active == True)
        .first()
    )
    if not curriculum:
        raise HTTPException(status_code=404, detail="No curriculum found")

    roadmap = []
    for week in sorted(curriculum.weeks, key=lambda w: w.week_number):
        progress = next((p for p in week.progress if p.student_id == student.id), None)
        roadmap.append({
            "week_id": week.id,
            "week_number": week.week_number,
            "topic": week.topic,
            "subtopics": week.subtopics,
            "estimated_hours": week.estimated_hours,
            "difficulty": week.difficulty,
            "status": progress.status if progress else "not_started",
        })

    return {
        "career_goal": student.career_goal.title if student.career_goal else "",
        "total_weeks": curriculum.total_weeks,
        "strong_skills": curriculum.strong_skills,
        "skill_gaps": curriculum.skill_gaps,
        "weeks": roadmap,
    }


@router.get("/resources/{week_id}")
def get_resources(
    week_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get learning resources for a specific curriculum week."""
    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
    if not week:
        raise HTTPException(status_code=404, detail="Week not found")
    return {
        "topic": week.topic,
        "subtopics": week.subtopics,
        "resources": week.resources,
        "estimated_hours": week.estimated_hours,
    }


# V2: Adaptive Quiz
@router.get("/quiz/{week_id}")
def get_topic_quiz(
    week_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Generate an adaptive quiz for a completed topic."""
    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
    if not week:
        raise HTTPException(status_code=404, detail="Week not found")
    quiz = generate_topic_quiz(week.topic, week.difficulty)
    if not quiz:
        raise HTTPException(status_code=503, detail="Quiz generation failed. Try again later.")
    return quiz


@router.post("/quiz/{week_id}/submit")
def submit_topic_quiz(
    week_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    V2 Adaptive Learning Loop:
    - Score >= 80%: Mark topic completed and advance to next topic.
    - Score < 60%: Identify weakness, dynamically inject extra practice resources.
    - Otherwise: Mark in-progress.
    """
    from app.models.student import Progress, Notification

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
    if not week:
        raise HTTPException(status_code=404, detail="Week not found")

    score_pct = float(data.get("score_percentage", 0.0))
    action = "in_progress"
    message = ""

    progress = db.query(Progress).filter(
        Progress.curriculum_week_id == week_id,
        Progress.student_id == student.id,
    ).first()

    if not progress:
        progress = Progress(student_id=student.id, curriculum_week_id=week_id, status="not_started")
        db.add(progress)

    if score_pct >= 80.0:
        action = "advanced"
        progress.status = "completed"
        week.status = "completed"
        message = f"Mastery achieved ({score_pct:.0f}%)! You have unlocked and advanced to the next topic."

        # Smart notification
        notif = Notification(
            student_id=student.id,
            title=f"Topic Mastered: {week.topic}",
            message=f"You passed the adaptive quiz with {score_pct:.0f}%! Topic marked as Completed.",
            type="success",
        )
        db.add(notif)

    elif score_pct < 60.0:
        action = "remedial_added"
        progress.status = "in_progress"
        week.status = "in_progress"

        # Dynamically inject extra targeted practice resources
        remedial = [
            {
                "type": "practice",
                "title": f"Reinforcement Labs: {week.topic} Fundamentals",
                "url": f"https://www.google.com/search?q={week.topic}+practice+exercises+tutorial",
            },
            {
                "type": "video",
                "title": f"Conceptual Deep-Dive: Master {week.topic}",
                "url": f"https://www.youtube.com/results?search_query={week.topic}+explained+step+by+step",
            },
        ]
        # Append to existing resources avoiding duplicates
        existing_titles = {r.get("title") for r in (week.resources or [])}
        updated_resources = list(week.resources or [])
        for r in remedial:
            if r["title"] not in existing_titles:
                updated_resources.append(r)
        week.resources = updated_resources

        message = (
            f"Score: {score_pct:.0f}%. AI identified key gaps in '{week.topic}'. "
            "We have dynamically updated your curriculum with targeted remedial practice!"
        )

        # Smart notification
        notif = Notification(
            student_id=student.id,
            title="Curriculum Dynamically Updated",
            message=f"Based on your {score_pct:.0f}% quiz score on {week.topic}, targeted practice materials were added to your roadmap.",
            type="warning",
        )
        db.add(notif)
    else:
        action = "in_progress"
        progress.status = "in_progress"
        week.status = "in_progress"
        message = f"Good progress ({score_pct:.0f}%)! Keep reviewing the resources to reach 80% mastery."

    db.commit()
    db.refresh(week)

    return {
        "score_percentage": score_pct,
        "action": action,
        "message": message,
        "status": progress.status,
        "resources": week.resources,
    }



# V2: Weekly Report
@router.get("/report/weekly")
def get_weekly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Get personalized AI weekly progress report."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    curriculum = (
        db.query(Curriculum)
        .filter(Curriculum.student_id == student.id, Curriculum.is_active == True)
        .first()
    )
    if not curriculum:
        raise HTTPException(status_code=404, detail="No curriculum found")

    progress_data = []
    total = len(curriculum.weeks)
    completed_count = 0

    for week in curriculum.weeks:
        prog = next((p for p in week.progress if p.student_id == student.id), None)
        st = prog.status if prog else "not_started"
        if st == "completed":
            completed_count += 1
        progress_data.append({"topic": week.topic, "status": st})

    completion_pct = (completed_count / total * 100) if total > 0 else 0
    career_title = student.career_goal.title if student.career_goal else "your goal"

    report = generate_weekly_report(
        student_name=student.full_name,
        career_goal=career_title,
        progress_data=progress_data,
        completion_pct=completion_pct,
    )
    return {"report": report, "completion_percentage": completion_pct}
