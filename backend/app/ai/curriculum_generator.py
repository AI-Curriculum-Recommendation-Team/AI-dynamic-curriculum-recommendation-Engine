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
        topic_name = week_data.get("topic", "")
        enriched_resources = get_curated_resources_for_topic(
            topic_name, 
            week_data.get("resources", [])
        )

        week = CurriculumWeek(
            curriculum_id=curriculum.id,
            week_number=week_data.get("week", 1),
            topic=topic_name,
            subtopics=week_data.get("subtopics", []),
            resources=enriched_resources,
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


CURATED_RESOURCES_DB = {
    "html": [
        {"type": "video", "title": "HTML Full Course for Beginners (YouTube / freeCodeCamp)", "url": "https://www.youtube.com/results?search_query=HTML+full+course+tutorial+freecodecamp"},
        {"type": "docs", "title": "MDN Web Docs - HTML Living Standard", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML"},
        {"type": "practice", "title": "W3Schools Interactive HTML Sandbox & Practice", "url": "https://www.w3schools.com/html/"},
        {"type": "guide", "title": "Roadmap.sh Frontend & HTML Developer Guide", "url": "https://roadmap.sh/frontend"},
    ],
    "css": [
        {"type": "video", "title": "CSS Full Course - Flexbox, Grid & Responsive Design (YouTube)", "url": "https://www.youtube.com/results?search_query=CSS+full+course+tutorial+freecodecamp"},
        {"type": "docs", "title": "MDN Web Docs - CSS Reference & Selectors", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS"},
        {"type": "practice", "title": "W3Schools CSS Interactive Practice & Try-It", "url": "https://www.w3schools.com/css/"},
        {"type": "guide", "title": "CSS-Tricks: Complete Visual Guide to Flexbox & Grid", "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"},
    ],
    "javascript": [
        {"type": "video", "title": "JavaScript Full Course for Beginners (YouTube / Bro Code)", "url": "https://www.youtube.com/results?search_query=JavaScript+full+course+tutorial"},
        {"type": "docs", "title": "MDN Web Docs - Modern JavaScript (ES6+)", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"},
        {"type": "practice", "title": "freeCodeCamp JavaScript Algorithms & Data Structures", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"},
        {"type": "guide", "title": "JavaScript.info - The Modern JavaScript Tutorial", "url": "https://javascript.info/"},
    ],
    "react": [
        {"type": "video", "title": "React JS Crash Course for Beginners (YouTube / Traversy Media)", "url": "https://www.youtube.com/results?search_query=React+crash+course+tutorial"},
        {"type": "docs", "title": "Official React Documentation & Interactive Tutorials", "url": "https://react.dev/"},
        {"type": "practice", "title": "W3Schools React Tutorial & Live Examples", "url": "https://www.w3schools.com/react/"},
        {"type": "guide", "title": "Roadmap.sh React Developer Learning Path", "url": "https://roadmap.sh/react"},
    ],
    "rest apis": [
        {"type": "video", "title": "REST API Concepts, HTTP Methods & Status Codes (YouTube)", "url": "https://www.youtube.com/results?search_query=REST+API+tutorial+for+beginners"},
        {"type": "docs", "title": "MDN Web Docs - HTTP Methods & RESTful Architecture", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods"},
        {"type": "practice", "title": "Postman Learning Center & API Testing Sandbox", "url": "https://learning.postman.com/docs/getting-started/introduction/"},
        {"type": "guide", "title": "RESTful API Tutorial - Design Principles & Best Practices", "url": "https://restfulapi.net/"},
    ],
    "git": [
        {"type": "video", "title": "Git and GitHub for Beginners - Crash Course (YouTube)", "url": "https://www.youtube.com/results?search_query=Git+and+GitHub+for+Beginners+tutorial"},
        {"type": "docs", "title": "Official Pro Git Book & Git Reference", "url": "https://git-scm.com/doc"},
        {"type": "practice", "title": "Learn Git Branching - Interactive Visual Practice", "url": "https://learngitbranching.js.org/"},
        {"type": "guide", "title": "GitHub Docs - Hello World & Workflow Guide", "url": "https://docs.github.com/en/get-started"},
    ],
    "sql": [
        {"type": "video", "title": "SQL Tutorial - Full Database Course for Beginners (YouTube)", "url": "https://www.youtube.com/results?search_query=SQL+tutorial+full+course"},
        {"type": "docs", "title": "PostgreSQL & MySQL Reference Documentation", "url": "https://www.postgresql.org/docs/"},
        {"type": "practice", "title": "SQLBolt - Interactive Lessons in SQL Queries", "url": "https://sqlbolt.com/"},
        {"type": "guide", "title": "W3Schools SQL Tutorial & Database Exercises", "url": "https://www.w3schools.com/sql/"},
    ],
    "node.js": [
        {"type": "video", "title": "Node.js and Express.js Full Course (YouTube / freeCodeCamp)", "url": "https://www.youtube.com/results?search_query=Node.js+and+Express+full+course+tutorial"},
        {"type": "docs", "title": "Official Node.js Documentation & Guides", "url": "https://nodejs.org/en/docs/"},
        {"type": "practice", "title": "W3Schools Node.js Interactive Tutorial", "url": "https://www.w3schools.com/nodejs/"},
        {"type": "guide", "title": "Roadmap.sh Node.js & Backend Developer Roadmap", "url": "https://roadmap.sh/nodejs"},
    ],
    "python": [
        {"type": "video", "title": "Python for Beginners - Full Course (YouTube / Programming with Mosh)", "url": "https://www.youtube.com/results?search_query=Python+for+Beginners+full+course"},
        {"type": "docs", "title": "Official Python 3 Documentation & Standard Library", "url": "https://docs.python.org/3/"},
        {"type": "practice", "title": "W3Schools Python Tutorial & Practice Exercises", "url": "https://www.w3schools.com/python/"},
        {"type": "guide", "title": "Real Python Tutorials & Architecture Deep Dives", "url": "https://realpython.com/"},
    ],
}


def get_curated_resources_for_topic(topic: str, ai_resources: Optional[List[Dict]] = None) -> List[Dict]:
    """Return comprehensive learning resources including YouTube video and interactive sites."""
    import urllib.parse
    cleaned_topic = topic.strip()
    key = cleaned_topic.lower()

    # 1. Match pre-curated resource database
    for db_key, resources in CURATED_RESOURCES_DB.items():
        if db_key == key or db_key in key or key in db_key:
            return resources

    # 2. Build high-quality dynamic links
    encoded = urllib.parse.quote_plus(cleaned_topic)
    default_resources = [
        {
            "type": "video",
            "title": f"{cleaned_topic} Full Course & Video Tutorial (YouTube)",
            "url": f"https://www.youtube.com/results?search_query={encoded}+tutorial+full+course",
        },
        {
            "type": "docs",
            "title": f"{cleaned_topic} Documentation Reference on DevDocs",
            "url": f"https://devdocs.io/#q={encoded}",
        },
        {
            "type": "practice",
            "title": f"{cleaned_topic} Interactive Exercises & Practice (W3Schools)",
            "url": f"https://www.google.com/search?q={encoded}+practice+tutorial+w3schools",
        },
        {
            "type": "guide",
            "title": f"{cleaned_topic} Architecture & Developer Roadmap (Roadmap.sh)",
            "url": f"https://roadmap.sh/search?q={encoded}",
        },
    ]

    # 3. If AI gave valid non-placeholder resources, merge with YouTube video
    if ai_resources:
        valid_ai = [
            r for r in ai_resources
            if r.get("url") and "example.com" not in r.get("url") and r.get("title")
        ]
        if valid_ai:
            has_video = any(r.get("type") == "video" or "youtube" in str(r.get("url", "")) for r in valid_ai)
            if not has_video:
                return [default_resources[0]] + valid_ai
            return valid_ai

    return default_resources


def _build_fallback_curriculum(career_title: str, gap_analysis: Dict) -> Dict:
    """Fallback curriculum if AI is unavailable."""
    priorities = gap_analysis.get("learning_priorities", [])
    roadmap = []
    for i, topic in enumerate(priorities[:8], 1):
        roadmap.append({
            "week": i,
            "topic": topic,
            "subtopics": [f"Introduction to {topic}", f"Core Principles of {topic}", f"Hands-on {topic} Practice"],
            "resources": get_curated_resources_for_topic(topic),
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
