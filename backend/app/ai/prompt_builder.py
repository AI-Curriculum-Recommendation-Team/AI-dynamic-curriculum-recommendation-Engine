"""
Prompt builder for AI curriculum generation and quiz generation.
"""
from typing import Dict, List, Any


def build_curriculum_prompt(
    career_goal: str,
    skills_with_levels: List[Dict[str, Any]],
    assessment_scores: Dict[str, float],
) -> str:
    """Build the curriculum generation prompt for the LLM."""
    skill_list = "\n".join(
        f"- {s['name']} ({s['level']}, self-rated: {s['score']}%)"
        for s in skills_with_levels
    )
    score_list = "\n".join(
        f"- {skill}: {score:.0f}%"
        for skill, score in assessment_scores.items()
    ) if assessment_scores else "No assessment taken yet."

    return f"""You are an expert AI curriculum advisor for a professional learning platform.

Analyze the following student profile and generate a highly personalized, week-by-week learning curriculum.

== STUDENT PROFILE ==
Career Goal: {career_goal}

Current Skills & Self-Rated Levels:
{skill_list if skill_list else "No skills listed yet"}

Assessment Scores:
{score_list}

== INSTRUCTIONS ==
1. Identify strong skills (assessment score >= 70% OR self-rated as "advanced")
2. Identify weak skills (assessment score < 70%)
3. Identify skills required for {career_goal} that the student is missing entirely
4. Determine a logical learning priority order (most critical gaps first)
5. Generate a week-by-week curriculum sequence (6-10 weeks based on gaps)
6. For each week, include:
   - 2-4 realistic subtopics
   - 2-3 curated learning resources (mix of video, docs, practice)
   - Estimated study hours (8-15 hours)
   - Difficulty level (beginner/intermediate/advanced)

== IMPORTANT ==
- Be specific to {career_goal} requirements
- Order topics logically (prerequisites before advanced topics)
- Skip skills the student already has (score >= 75%)
- Provide REAL resource titles (e.g., "Machine Learning by Andrew Ng - Coursera", "Official PyTorch Documentation")

Return ONLY a valid JSON object with this exact schema:
{{
  "career": "{career_goal}",
  "strong_skills": ["skill1", "skill2"],
  "weak_skills": ["skill3", "skill4"],
  "skill_gaps": ["missing1", "missing2"],
  "learning_priorities": ["topic1", "topic2", "topic3"],
  "roadmap": [
    {{
      "week": 1,
      "topic": "Topic Name",
      "subtopics": ["Subtopic A", "Subtopic B"],
      "resources": [
        {{"type": "video", "title": "Course Title", "url": "https://example.com"}},
        {{"type": "docs", "title": "Documentation", "url": "https://docs.example.com"}},
        {{"type": "practice", "title": "Exercise Set", "url": "https://example.com"}}
      ],
      "estimated_hours": 10,
      "difficulty": "intermediate"
    }}
  ],
  "total_weeks": 6
}}"""


def build_quiz_prompt(
    topic: str,
    skill_level: str = "intermediate",
    num_questions: int = 5,
) -> str:
    """Build the quiz generation prompt for V2 adaptive learning."""
    return f"""You are an expert technical quiz creator for a learning platform.

Generate a quiz to assess understanding of: "{topic}"
Target difficulty: {skill_level}
Number of questions: {num_questions}

Requirements:
- Multiple choice questions with 4 options each
- One clearly correct answer per question
- Mix of conceptual and practical questions
- Include brief explanation for the correct answer

Return ONLY a valid JSON object:
{{
  "topic": "{topic}",
  "difficulty": "{skill_level}",
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correct_answer": "A. Option 1",
      "explanation": "Brief explanation of why this is correct",
      "skill": "specific skill being tested"
    }}
  ]
}}"""


def build_weekly_report_prompt(
    student_name: str,
    career_goal: str,
    progress_data: List[Dict[str, Any]],
    completion_pct: float,
) -> str:
    """Build weekly AI progress report prompt for V2."""
    completed = [p["topic"] for p in progress_data if p["status"] == "completed"]
    in_progress = [p["topic"] for p in progress_data if p["status"] == "in_progress"]
    not_started = [p["topic"] for p in progress_data if p["status"] == "not_started"]

    return f"""You are a personal learning coach AI on a professional education platform.

Write a personalized weekly progress report for:
Student: {student_name}
Career Goal: {career_goal}
Overall Completion: {completion_pct:.1f}%

Completed Topics: {', '.join(completed) if completed else 'None yet'}
In Progress: {', '.join(in_progress) if in_progress else 'None'}
Upcoming Topics: {', '.join(not_started[:3]) if not_started else 'All complete!'}

Write a motivational, professional weekly report that:
1. Celebrates completed topics
2. Gives specific advice for in-progress topics
3. Previews what's coming next
4. Provides a motivational closing message

Keep it concise (150-200 words), encouraging, and professional.
Return as plain text (not JSON)."""
