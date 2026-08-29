"""
Curriculum generator: orchestrates skill gap analysis + AI generation.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.ai.skill_gap_analyzer import analyze_skill_gap, CAREER_REQUIRED_SKILLS
from app.ai.prompt_builder import build_curriculum_prompt, build_quiz_prompt, build_weekly_report_prompt
from app.ai.llm_client import generate_json_content, generate_content
from app.models.student import (
    Student, CareerGoal, AssessmentResult, Curriculum, CurriculumWeek, Progress
)


def _get_student_skills_data(student: Student) -> List[Dict[str, Any]]:
    """Extract student skills in a usable format."""
    skills = []
    for ss in student.skills:
        skills.append({
            "name": ss.skill.name,
            "level": ss.self_rated_level,
            "score": ss.proficiency_score,
        })
    return skills


def _get_latest_assessment_scores(student: Student) -> Dict[str, float]:
    """Get the latest assessment scores for the student."""
    if not student.assessment_results:
        return {}
    latest = max(student.assessment_results, key=lambda r: r.taken_at)
    return latest.scores_per_skill or {}


def generate_curriculum_for_student(db: Session, student: Student) -> Optional[Curriculum]:
    """
    Main entry point: generate a personalized AI curriculum for a student.
    """
    if not student.career_goal:
        return None

    career_title = student.career_goal.title
    skills_data = _get_student_skills_data(student)
    assessment_scores = _get_latest_assessment_scores(student)

    # Perform skill gap analysis
    gap_analysis = analyze_skill_gap(career_title, skills_data, assessment_scores)

    # Build and send prompt to Gemini
    prompt = build_curriculum_prompt(
        career_goal=career_title,
        skills_with_levels=skills_data,
        assessment_scores=assessment_scores,
    )
    ai_response = generate_json_content(prompt)

    if not ai_response:
        # Fallback: use skill gap analysis directly without AI
        ai_response = _build_fallback_curriculum(career_title, gap_analysis)

    # Deactivate old curricula
    db.query(Curriculum).filter(
        Curriculum.student_id == student.id,
        Curriculum.is_active == True
    ).update({"is_active": False})

    # Create curriculum record
    curriculum = Curriculum(
        student_id=student.id,
        career_goal_id=student.career_goal_id,
        skill_gaps=ai_response.get("skill_gaps", gap_analysis["skill_gaps"]),
        strong_skills=ai_response.get("strong_skills", gap_analysis["strong_skills"]),
        weak_skills=ai_response.get("weak_skills", gap_analysis["weak_skills"]),
        learning_priorities=ai_response.get("learning_priorities", gap_analysis["learning_priorities"]),
        total_weeks=ai_response.get("total_weeks", len(ai_response.get("roadmap", []))),
        is_active=True,
    )
    db.add(curriculum)
    db.flush()

    # Create weekly topics
    for week_data in ai_response.get("roadmap", []):
        week = CurriculumWeek(
            curriculum_id=curriculum.id,
            week_number=week_data.get("week", 1),
            topic=week_data.get("topic", ""),
            subtopics=week_data.get("subtopics", []),
            resources=week_data.get("resources", []),
            estimated_hours=week_data.get("estimated_hours", 10),
            difficulty=week_data.get("difficulty", "intermediate"),
            status="not_started",
        )
        db.add(week)
        db.flush()

        # Create progress entry
        progress = Progress(
            student_id=student.id,
            curriculum_week_id=week.id,
            status="not_started",
        )
        db.add(progress)

    db.commit()
    db.refresh(curriculum)
    return curriculum


def _build_fallback_curriculum(career_title: str, gap_analysis: Dict) -> Dict:
    """Fallback curriculum if AI is unavailable."""
    priorities = gap_analysis.get("learning_priorities", [])
    roadmap = []
    for i, topic in enumerate(priorities[:8], 1):
        roadmap.append({
            "week": i,
            "topic": topic,
            "subtopics": [f"Introduction to {topic}", f"Hands-on {topic} Practice"],
            "resources": [
                {"type": "docs", "title": f"{topic} Official Documentation", "url": f"https://www.google.com/search?q={topic}+tutorial"},
            ],
            "estimated_hours": 10,
            "difficulty": "intermediate",
        })
    return {
        "career": career_title,
        "strong_skills": gap_analysis.get("strong_skills", []),
        "weak_skills": gap_analysis.get("weak_skills", []),
        "skill_gaps": gap_analysis.get("skill_gaps", []),
        "learning_priorities": priorities,
        "roadmap": roadmap,
        "total_weeks": len(roadmap),
    }


def generate_topic_quiz(topic: str, difficulty: str = "intermediate") -> Optional[Dict]:
    """V2: Generate an adaptive quiz for a specific topic."""
    prompt = build_quiz_prompt(topic, difficulty, num_questions=5)
    return generate_json_content(prompt)


def generate_weekly_report(
    student_name: str,
    career_goal: str,
    progress_data: List[Dict],
    completion_pct: float,
) -> str:
    """V2: Generate personalized weekly progress report."""
    prompt = build_weekly_report_prompt(student_name, career_goal, progress_data, completion_pct)
    result = generate_content(prompt)
    return result or "Keep up the great work on your learning journey!"
