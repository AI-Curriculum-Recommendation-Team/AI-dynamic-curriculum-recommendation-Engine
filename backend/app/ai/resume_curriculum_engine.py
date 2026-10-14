"""
AI Resume Curriculum Engine:
Parses student resume or academic syllabus and generates an accelerated dynamic curriculum.
"""
from typing import Dict, Any, List, Optional
from app.ai.llm_client import generate_json_content


def parse_resume_text_with_ai(raw_text: str) -> Dict[str, Any]:
    """
    Extracts structured candidate profile, detected technical skills,
    proficiency levels, education, and projects from raw resume text.
    """
    truncated_text = raw_text[:7000] if len(raw_text) > 7000 else raw_text

    prompt = f"""
You are an expert Technical Recruiter and Curriculum Architect AI.
Analyze the following candidate resume / CV text and extract structured competencies:

RESUME TEXT:
{truncated_text}

Extract and return ONLY a valid JSON object with this exact structure:
{{
  "candidate_name": "Full name if found, or 'Student'",
  "headline_or_summary": "1-2 sentence executive summary of candidate background",
  "education": "Degree, major, institution, graduation year",
  "years_of_experience": 0.0,
  "skills": [
    {{
      "name": "Skill or tool name (e.g. Python, Docker, React, SQL)",
      "level": "beginner | intermediate | advanced",
      "confidence": 0.9,
      "category": "Programming Languages | Frameworks | Databases | Cloud & DevOps | Core CS"
    }}
  ],
  "top_projects": [
    {{
      "title": "Project title",
      "technologies": ["Tech1", "Tech2"],
      "description": "Short summary of what was built"
    }}
  ]
}}
"""
    result = generate_json_content(prompt)
    if result and "skills" in result and isinstance(result["skills"], list):
        return result

    # Fallback basic extraction
    return {
        "candidate_name": "Student",
        "headline_or_summary": "Aspiring tech professional with technical foundations.",
        "education": "Engineering / Computer Science Background",
        "years_of_experience": 0.5,
        "skills": [
            {"name": "Python", "level": "intermediate", "confidence": 0.8, "category": "Programming Languages"},
            {"name": "SQL", "level": "beginner", "confidence": 0.7, "category": "Databases"},
            {"name": "Git", "level": "intermediate", "confidence": 0.85, "category": "Cloud & DevOps"},
        ],
        "top_projects": [],
    }


def generate_resume_accelerated_curriculum(
    career_title: str,
    parsed_resume: Dict[str, Any],
    target_company: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Compares detected resume skills against the target career goal
    and generates an accelerated dynamic curriculum roadmap that skips mastered topics.
    """
    skills_list = [s.get("name", "") for s in parsed_resume.get("skills", [])]

    prompt = f"""
You are the AI Chief Curriculum Officer of an Adaptive Learning Platform.
A student wants to become: '{career_title}'
Target Company: '{target_company or "General Tech Industry"}'

Candidate Background:
- Summary: {parsed_resume.get("headline_or_summary", "")}
- Verified Skills from Resume: {skills_list}
- Experience: {parsed_resume.get("years_of_experience", 0)} years

Your Task:
Generate an Accelerated Dynamic Curriculum roadmap (6 to 8 weeks).
Key Rules:
1. DO NOT waste weeks reteaching skills they have already demonstrated in their resume.
2. If they already know basic Python/Git, skip the basics and immediately start with Intermediate Algorithms, Architecture, or Application Building.
3. Focus intensively on verified SKILL GAPS needed to land a role as '{career_title}'.
4. State explicitly which topics were fast-tracked or skipped.

Return ONLY a valid JSON object with the following structure:
{{
  "fast_tracked_skills": ["Skill 1 already mastered", "Skill 2 already mastered"],
  "critical_skill_gaps": ["Gap 1 to focus on", "Gap 2 to focus on"],
  "curriculum_rationale": "Clear pedagogical reasoning for this custom fast-tracked roadmap",
  "curriculum": [
    {{
      "week_number": 1,
      "title": "Title of week",
      "topic": "Core topic name",
      "description": "Comprehensive explanation of what to learn and build",
      "learning_objectives": ["Obj 1", "Obj 2", "Obj 3"],
      "estimated_hours": 10,
      "resources": [
        {{"title": "Resource title", "url": "https://...", "type": "video/documentation/project"}}
      ],
      "practical_challenge_preview": "Brief teaser of practical project this week"
    }}
  ]
}}
"""
    result = generate_json_content(prompt)
    if result and "curriculum" in result and isinstance(result["curriculum"], list):
        return result

    # Fallback
    return {
        "fast_tracked_skills": skills_list[:3] if skills_list else ["Basic Syntax"],
        "critical_skill_gaps": ["Advanced System Architecture", "Production Deployment", "Full-Stack Integration"],
        "curriculum_rationale": f"Fast-tracked basic modules to accelerate mastery toward {career_title}.",
        "curriculum": [
            {
                "week_number": 1,
                "title": f"Applied {career_title} Architecture & Advanced Patterns",
                "topic": "Advanced Software Architecture",
                "description": "Deep dive into real-world production design patterns and core data flow.",
                "learning_objectives": ["Master clean architecture", "Design scalable APIs", "Handle state management"],
                "estimated_hours": 12,
                "resources": [{"title": "Architecture Masterclass", "url": "https://roadmap.sh", "type": "documentation"}],
                "practical_challenge_preview": "Build a modular production-ready service.",
            }
        ],
    }
