from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, CurriculumWeek, Progress, Notification
from app.models.v2_models import TopicQuiz, QuizQuestion, QuizAttempt
from app.schemas.v2_schemas import QuizDetailOut, QuizSubmitRequest, QuizAttemptOut
from app.ai.curriculum_generator import generate_topic_quiz
from app.services.v2_service import award_badge

router = APIRouter(prefix="/quiz", tags=["V2 Quizzes"])


@router.post("/generate/{week_id}", response_model=QuizDetailOut)
def generate_week_quiz(
    week_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: AI generates an adaptive quiz calibrated for a curriculum week."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
    if not week:
        raise HTTPException(status_code=404, detail="Curriculum week not found")

    # Generate quiz questions using Gemini
    raw_quiz = generate_topic_quiz(week.topic, week.difficulty)
    if not raw_quiz or not raw_quiz.get("questions"):
        raise HTTPException(status_code=503, detail="AI quiz generation temporarily unavailable. Please retry.")

    questions_data = raw_quiz.get("questions", [])

    # Save to database
    db_quiz = TopicQuiz(
        week_id=week.id,
        topic=week.topic,
        difficulty=week.difficulty,
        question_count=len(questions_data),
    )
    db.add(db_quiz)
    db.flush()

    saved_questions = []
    for q in questions_data:
        qq = QuizQuestion(
            quiz_id=db_quiz.id,
            question_text=q.get("question_text", ""),
            options=q.get("options", []),
            correct_answer=q.get("correct_answer", ""),
            explanation=q.get("explanation", ""),
            difficulty=week.difficulty,
        )
        db.add(qq)
        db.flush()
        saved_questions.append({
            "id": qq.id,
            "question_text": qq.question_text,
            "options": qq.options,
            "correct_answer": qq.correct_answer,
            "explanation": qq.explanation,
            "difficulty": qq.difficulty,
        })

    db.commit()
    db.refresh(db_quiz)

    return {
        "quiz_id": db_quiz.id,
        "week_id": week.id,
        "topic": week.topic,
        "difficulty": week.difficulty,
        "question_count": len(saved_questions),
        "questions": saved_questions,
    }


@router.get("/{quiz_id}", response_model=QuizDetailOut)
def get_quiz_by_id(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Get quiz details and questions."""
    quiz = db.query(TopicQuiz).filter(TopicQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = []
    for q in quiz.questions:
        questions.append({
            "id": q.id,
            "question_text": q.question_text,
            "options": q.options,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "difficulty": q.difficulty,
        })

    return {
        "quiz_id": quiz.id,
        "week_id": quiz.week_id,
        "topic": quiz.topic,
        "difficulty": quiz.difficulty,
        "question_count": len(questions),
        "questions": questions,
    }


@router.post("/{quiz_id}/submit")
def submit_quiz_attempt(
    quiz_id: int,
    req: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Evaluate quiz answers, calculate score, update progress, and adapt curriculum."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    quiz = db.query(TopicQuiz).filter(TopicQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == quiz.week_id).first()
    if not week:
        raise HTTPException(status_code=404, detail="Curriculum week not found")

    # Calculate score if not provided
    correct_count = 0
    total_q = len(quiz.questions)
    weak_concepts = []

    for idx, q in enumerate(quiz.questions):
        # Match by question ID string or index string
        student_ans = req.answers.get(str(q.id)) or req.answers.get(str(idx)) or ""
        # Check if matching correct answer (letter or full text)
        is_correct = False
        if student_ans.strip() == q.correct_answer.strip():
            is_correct = True
        elif q.options and student_ans.strip().upper() in ["A", "B", "C", "D"]:
            opt_idx = ord(student_ans.strip().upper()) - ord("A")
            if 0 <= opt_idx < len(q.options) and q.options[opt_idx].strip() == q.correct_answer.strip():
                is_correct = True

        if is_correct:
            correct_count += 1
        else:
            weak_concepts.append(q.question_text[:80])

    if req.score_percentage is not None:
        score_pct = float(req.score_percentage)
    else:
        score_pct = round((correct_count / total_q * 100), 1) if total_q > 0 else 0.0

    # Determine action
    progress = db.query(Progress).filter(
        Progress.curriculum_week_id == week.id,
        Progress.student_id == student.id,
    ).first()

    if not progress:
        progress = Progress(student_id=student.id, curriculum_week_id=week.id, status="not_started")
        db.add(progress)

    action = "in_progress"
    message = ""

    if score_pct >= 80.0:
        action = "advanced"
        progress.status = "completed"
        week.status = "completed"
        message = f"Mastery achieved ({score_pct:.0f}%)! You have unlocked and advanced to the next topic."
        award_badge(db, student.id, "MASTERY_HERO")
    elif score_pct < 60.0:
        action = "remedial_added"
        progress.status = "in_progress"
        week.status = "in_progress"
        # Inject remedial resources
        remedials = [
            {
                "type": "practice",
                "title": f"Reinforcement Labs: {week.topic} Fundamentals",
                "url": f"https://www.google.com/search?q={week.topic}+practice+exercises",
            },
            {
                "type": "video",
                "title": f"Conceptual Deep-Dive: Master {week.topic}",
                "url": f"https://www.youtube.com/results?search_query={week.topic}+tutorial",
            },
        ]
        existing = {r.get("title") for r in (week.resources or [])}
        updated_res = list(week.resources or [])
        for r in remedials:
            if r["title"] not in existing:
                updated_res.append(r)
        week.resources = updated_res
        message = f"Score: {score_pct:.0f}%. AI identified key gaps in '{week.topic}'. Remedial practice resources have been added to your syllabus."
    else:
        action = "in_progress"
        progress.status = "in_progress"
        week.status = "in_progress"
        message = f"Solid effort ({score_pct:.0f}%)! Review key topics to achieve 80%+ mastery."

    attempt = QuizAttempt(
        student_id=student.id,
        quiz_id=quiz.id,
        score=score_pct,
        answers=req.answers,
        weak_concepts=weak_concepts,
        action_taken=action,
    )
    db.add(attempt)
    award_badge(db, student.id, "QUIZ_APPRENTICE")

    db.commit()

    return {
        "score_percentage": score_pct,
        "action": action,
        "message": message,
        "status": progress.status,
        "weak_concepts": weak_concepts,
        "resources": week.resources,
    }


@router.get("/history", response_model=List[QuizAttemptOut])
def get_quiz_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V2: Get student's historical quiz attempts and performance records."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student.id)
        .order_by(QuizAttempt.taken_at.desc())
        .limit(20)
        .all()
    )
    return attempts
