"""
AI Recalibration Engine:
Analyzes continuous student quiz performance, coding challenge results,
and adjusts upcoming curriculum weeks dynamically.
"""
from typing import Dict, Any, List, Optional
from app.ai.llm_client import generate_json_content


def evaluate_and_recalibrate_curriculum(
    career_title: str,
    target_company_name: Optional[str],
    current_weeks: List[Dict[str, Any]],
    quiz_attempts_summary: List[Dict[str, Any]],
    coding_submissions_summary: List[Dict[str, Any]],
    trigger_type: str = "manual",
) -> Dict[str, Any]:
    """
    Evaluates student performance history and generates a dynamically adapted curriculum roadmap.
    """
    # Calculate average quiz score and identify struggling topics
    weak_topics = []
    strong_topics = []
    
    for qa in quiz_attempts_summary:
        score = qa.get("score", 0)
        topic = qa.get("topic", "")
        if score < 60:
            weak_topics.append(f"{topic} (Score: {score}%)")
        elif score >= 85:
            strong_topics.append(f"{topic} (Score: {score}%)")

    for cs in coding_submissions_summary:
        passed = cs.get("passed", False)
        topic = cs.get("topic", "")
        score = cs.get("score", 0)
        if not passed or score < 60:
            if topic and f"{topic} (Coding)" not in weak_topics:
                weak_topics.append(f"{topic} (Coding Score: {score}%)")
        elif score >= 85:
            if topic and f"{topic} (Coding)" not in strong_topics:
                strong_topics.append(f"{topic} (Coding Score: {score}%)")

    prompt = f"""
You are the AI Chief Academic Officer of an Adaptive Dynamic Curriculum Recommendation Engine.
A student is enrolled in the career track: '{career_title}'
Target Company Focus: '{target_company_name or "General Industry Best Practices"}'
Trigger Type for Recalibration: '{trigger_type}'

Current Curriculum Weeks:
{current_weeks}

Student Recent Performance Data:
- Weak Topics identified: {weak_topics if weak_topics else "None detected yet (good progress)"}
- Strong Topics identified: {strong_topics if strong_topics else "Consistent standard performance"}

Your Task:
Dynamically recalibrate the remaining or upcoming weeks of the curriculum to personalize the student's learning journey.
Guidelines:
1. If weak topics exist, insert reinforcement sub-modules, remedial hands-on drills, or prerequisite review into the immediate next week before progressing.
2. If strong topics exist, fast-track by condensing elementary material and introducing high-leverage industry topics (e.g. System Design, Scalability, Advanced Patterns).
3. If a target company is specified ({target_company_name}), bias future weeks toward that company's real-world tech stack and interview standards.
4. Keep the total number of weeks reasonable (between 6 and 10 weeks).
5. Preserve completed weeks if they are marked done, only adapt upcoming/in-progress weeks.

Return ONLY a valid JSON object with the following exact structure:
{{
  "reason": "Clear 1-2 sentence executive explanation of why the curriculum was adapted",
  "changes_summary": [
    "Specific change made to Week X (e.g. Added Trees remedial practice)",
    "Specific change made to Week Y (e.g. Accelerated into System Design)"
  ],
  "ai_recommendations": "Encouraging, actionable pedagogical advice directly to the student",
  "adapted_weeks": [
    {{
      "week_number": 1,
      "title": "Title of week",
      "topic": "Core topic name",
      "description": "Comprehensive explanation of what to learn",
      "learning_objectives": ["Obj 1", "Obj 2", "Obj 3"],
      "estimated_hours": 10,
      "resources": [
        {{"title": "Resource title", "url": "https://...", "type": "video/documentation/project"}}
      ],
      "practical_challenge_preview": "Brief teaser of what hands-on task to complete this week"
    }}
  ]
}}
"""

    result = generate_json_content(prompt)
    if result and "adapted_weeks" in result and isinstance(result["adapted_weeks"], list):
        return result

    # Fallback heuristic recalibration if LLM unavailable
    return _heuristic_recalibration(
        career_title=career_title,
        current_weeks=current_weeks,
        weak_topics=weak_topics,
        strong_topics=strong_topics,
    )


def _heuristic_recalibration(
    career_title: str,
    current_weeks: List[Dict[str, Any]],
    weak_topics: List[str],
    strong_topics: List[str],
) -> Dict[str, Any]:
    """Fallback rule-based recalibration when LLM is offline."""
    changes = []
    reason = "Dynamic heuristic recalibration applied based on recent performance metrics."
    adapted = []

    for w in current_weeks:
        week_copy = dict(w)
        # If week matches a weak topic, flag it with extra practice
        matched_weak = any(w.get("topic", "").lower() in wt.lower() for wt in weak_topics)
        if matched_weak:
            week_copy["title"] = f"{week_copy.get('title', '')} (Reinforced with Remedial Practice)"
            week_copy["description"] = f"{week_copy.get('description', '')} [AI Recalibration: Extra drills added based on diagnostic score]."
            changes.append(f"Reinforced Week {week_copy.get('week_number')}: added prerequisite refresher drills.")
        adapted.append(week_copy)

    if not changes:
        changes.append("Curriculum pacing validated; optimized upcoming milestone milestones.")

    return {
        "reason": reason,
        "changes_summary": changes,
        "ai_recommendations": f"Keep focusing on mastery in {career_title}. Practice coding and review quiz explanations.",
        "adapted_weeks": adapted,
    }
