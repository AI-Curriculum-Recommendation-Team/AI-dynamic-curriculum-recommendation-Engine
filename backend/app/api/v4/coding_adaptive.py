from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek
from app.models.v4_models import CurriculumCodingChallenge, CodingSubmission, CareerReadiness
from app.ai.coding_lab_engine import generate_curriculum_challenge, evaluate_code_submission, run_code_against_visible_tests

router = APIRouter(prefix="/coding", tags=["V4 Curriculum Coding Labs"])


class CodeSubmissionRequest(BaseModel):
    code: str
    language: str = "python"


@router.get("/current-week")
def get_or_generate_current_week_challenge(
    week_id: Optional[int] = None,
    random: Optional[bool] = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the coding challenge for:
    1. A specific week (if week_id provided), or
    2. A random topic that the student has learned in their roadmap (if random=True), or
    3. The active current curriculum week.
    If none exists, dynamically generates one grounded in the week's topic using Gemini.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    curriculum = db.query(Curriculum).filter(
        Curriculum.student_id == student.id,
        Curriculum.is_active == True
    ).first()

    if not curriculum:
        raise HTTPException(status_code=400, detail="No active curriculum found. Choose a career goal first.")

    target_week = None

    if week_id is not None:
        target_week = db.query(CurriculumWeek).filter(
            CurriculumWeek.id == week_id,
            CurriculumWeek.curriculum_id == curriculum.id
        ).first()
        if not target_week:
            raise HTTPException(status_code=404, detail=f"Curriculum week {week_id} not found.")

    elif random:
        # Select from topics the student has learned (completed or in-progress in roadmap)
        learned_weeks = (
            db.query(CurriculumWeek)
            .filter(
                CurriculumWeek.curriculum_id == curriculum.id,
                CurriculumWeek.status.in_(["completed", "in_progress"])
            )
            .all()
        )
        if not learned_weeks:
            # Fallback to all weeks in the student's roadmap if none marked completed yet
            learned_weeks = (
                db.query(CurriculumWeek)
                .filter(CurriculumWeek.curriculum_id == curriculum.id)
                .all()
            )

        if not learned_weeks:
            raise HTTPException(status_code=400, detail="Curriculum contains no weeks.")

        import random as py_random
        target_week = py_random.choice(learned_weeks)

    else:
        # Find the current active week (first uncompleted week)
        target_week = (
            db.query(CurriculumWeek)
            .filter(CurriculumWeek.curriculum_id == curriculum.id, CurriculumWeek.status != "completed")
            .order_by(CurriculumWeek.week_number)
            .first()
        )

        if not target_week:
            # All completed, pick the last week
            target_week = (
                db.query(CurriculumWeek)
                .filter(CurriculumWeek.curriculum_id == curriculum.id)
                .order_by(CurriculumWeek.week_number.desc())
                .first()
            )

    if not target_week:
        raise HTTPException(status_code=400, detail="No suitable curriculum week found.")

    # Check if a challenge already exists for this week
    existing_challenge = db.query(CurriculumCodingChallenge).filter(
        CurriculumCodingChallenge.curriculum_week_id == target_week.id,
        CurriculumCodingChallenge.student_id == student.id
    ).first()

    if existing_challenge:
        return _format_challenge_response(existing_challenge, db, student.id)

    # Generate with Gemini
    career_title = student.career_goal.title if student.career_goal else "Software Engineer"
    generated_data = generate_curriculum_challenge(
        week_topic=target_week.topic,
        week_title=target_week.topic,
        career_title=career_title,
        difficulty="Medium" if target_week.week_number > 2 else "Easy",
    )

    challenge = CurriculumCodingChallenge(
        curriculum_week_id=target_week.id,
        student_id=student.id,
        title=generated_data.get("title", f"{target_week.topic} Practical Lab"),
        topic=target_week.topic,
        difficulty=generated_data.get("difficulty", "Medium"),
        problem_statement=generated_data.get("problem_statement", ""),
        constraints=generated_data.get("constraints", ""),
        starter_code=generated_data.get("starter_code", {}),
        visible_test_cases=generated_data.get("visible_test_cases", []),
        hidden_test_cases=generated_data.get("hidden_test_cases", []),
        hints=generated_data.get("hints", []),
        solution_explanation=generated_data.get("solution_explanation", ""),
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    return _format_challenge_response(challenge, db, student.id)


@router.get("/random-learned")
def get_random_learned_challenge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Convenience endpoint to get a random coding challenge from topics the student has learned.
    """
    return get_or_generate_current_week_challenge(random=True, current_user=current_user, db=db)


@router.get("/challenges")
def list_student_coding_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all coding challenges generated for the student across curriculum weeks.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    challenges = (
        db.query(CurriculumCodingChallenge)
        .filter(CurriculumCodingChallenge.student_id == student.id)
        .order_by(CurriculumCodingChallenge.created_at.desc())
        .all()
    )

    result = []
    for c in challenges:
        latest_sub = (
            db.query(CodingSubmission)
            .filter(CodingSubmission.challenge_id == c.id, CodingSubmission.student_id == student.id)
            .order_by(CodingSubmission.submitted_at.desc())
            .first()
        )
        result.append({
            "id": c.id,
            "title": c.title,
            "topic": c.topic,
            "difficulty": c.difficulty,
            "curriculum_week_id": c.curriculum_week_id,
            "has_submitted": latest_sub is not None,
            "passed": latest_sub.passed if latest_sub else False,
            "latest_score": latest_sub.score if latest_sub else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return result


@router.get("/{challenge_id}/hints")
def get_progressive_hints(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the 3-tier progressive Socratic hints for a challenge.
    """
    challenge = db.query(CurriculumCodingChallenge).filter(CurriculumCodingChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    return {
        "challenge_id": challenge.id,
        "title": challenge.title,
        "hints": challenge.hints or [
            "Tier 1: Read the problem carefully and check edge cases.",
            "Tier 2: Consider using a hash map or two-pointer approach.",
            "Tier 3: Iterate through elements and update your running state.",
        ],
    }


@router.post("/{challenge_id}/run")
def run_code_against_open_tests(
    challenge_id: int,
    req: CodeSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Executes student code against ONLY visible/open test cases.
    Does not register a formal graded submission; designed for fast debugging.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    challenge = db.query(CurriculumCodingChallenge).filter(CurriculumCodingChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    run_result = run_code_against_visible_tests(
        problem_title=challenge.title,
        problem_statement=challenge.problem_statement,
        student_code=req.code,
        language=req.language,
        visible_tests=challenge.visible_test_cases or [],
    )

    return run_result


@router.post("/{challenge_id}/submit")
def submit_code_solution(
    challenge_id: int,
    req: CodeSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits student solution, runs AI code review, computes test case pass rate,
    updates readiness score, and returns comprehensive feedback.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    challenge = db.query(CurriculumCodingChallenge).filter(CurriculumCodingChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Evaluate code with AI
    eval_result = evaluate_code_submission(
        problem_title=challenge.title,
        problem_statement=challenge.problem_statement,
        student_code=req.code,
        language=req.language,
        visible_tests=challenge.visible_test_cases or [],
        hidden_tests=challenge.hidden_test_cases or [],
    )

    total_tests = len(challenge.visible_test_cases or []) + len(challenge.hidden_test_cases or [])

    submission = CodingSubmission(
        challenge_id=challenge.id,
        student_id=student.id,
        code=req.code,
        language=req.language,
        passed=eval_result.get("passed", False),
        tests_passed=eval_result.get("tests_passed", 0),
        tests_total=eval_result.get("tests_total", total_tests),
        time_complexity_detected=eval_result.get("time_complexity_detected", "O(N)"),
        space_complexity_detected=eval_result.get("space_complexity_detected", "O(1)"),
        ai_review=eval_result.get("ai_review", "Code evaluated successfully."),
        score=eval_result.get("score", 80.0),
    )
    db.add(submission)

    # Update career readiness coding score
    readiness = db.query(CareerReadiness).filter(CareerReadiness.student_id == student.id).first()
    if not readiness:
        readiness = CareerReadiness(student_id=student.id, coding_score=submission.score)
        db.add(readiness)
    else:
        all_scores = [
            s.score for s in db.query(CodingSubmission.score).filter(CodingSubmission.student_id == student.id).all()
        ] + [submission.score]
        readiness.coding_score = round(sum(all_scores) / len(all_scores), 1)

    db.commit()
    db.refresh(submission)

    return {
        "submission_id": submission.id,
        "passed": submission.passed,
        "score": submission.score,
        "tests_passed": submission.tests_passed,
        "tests_total": submission.tests_total,
        "visible_test_results": eval_result.get("visible_test_results", []),
        "hidden_tests_passed": eval_result.get("hidden_tests_passed", 0),
        "hidden_tests_total": eval_result.get("hidden_tests_total", len(challenge.hidden_test_cases or [])),
        "time_complexity_detected": submission.time_complexity_detected,
        "space_complexity_detected": submission.space_complexity_detected,
        "ai_review": submission.ai_review,
        "solution_explanation": challenge.solution_explanation if submission.passed else None,
    }


def _format_challenge_response(challenge: CurriculumCodingChallenge, db: Session, student_id: int) -> Dict[str, Any]:
    latest_sub = (
        db.query(CodingSubmission)
        .filter(CodingSubmission.challenge_id == challenge.id, CodingSubmission.student_id == student_id)
        .order_by(CodingSubmission.submitted_at.desc())
        .first()
    )

    week_obj = (
        db.query(CurriculumWeek)
        .filter(CurriculumWeek.id == challenge.curriculum_week_id)
        .first()
        if challenge.curriculum_week_id
        else None
    )

    return {
        "id": challenge.id,
        "curriculum_week_id": challenge.curriculum_week_id,
        "week_number": week_obj.week_number if week_obj else None,
        "title": challenge.title,
        "topic": challenge.topic,
        "difficulty": challenge.difficulty,
        "problem_statement": challenge.problem_statement,
        "constraints": challenge.constraints,
        "starter_code": challenge.starter_code or {},
        "visible_test_cases": challenge.visible_test_cases or [],
        "hidden_tests_count": len(challenge.hidden_test_cases or [1, 2]),
        "hints_count": len(challenge.hints or []),
        "latest_submission": {
            "id": latest_sub.id,
            "passed": latest_sub.passed,
            "score": latest_sub.score,
            "code": latest_sub.code,
            "language": latest_sub.language,
            "time_complexity": latest_sub.time_complexity_detected,
            "ai_review": latest_sub.ai_review,
            "submitted_at": latest_sub.submitted_at.isoformat() if latest_sub.submitted_at else None,
        } if latest_sub else None,
    }
