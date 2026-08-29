"""
Skill gap analyzer: compares student skills vs career goal requirements.
"""
from typing import Dict, List, Any


CAREER_REQUIRED_SKILLS = {
    "AI Engineer": {
        "Python": 70,
        "Machine Learning": 70,
        "Deep Learning": 60,
        "Natural Language Processing": 60,
        "Large Language Models": 50,
        "MLOps": 40,
        "Statistics": 60,
        "Data Structures": 50,
    },
    "Data Scientist": {
        "Python": 75,
        "Statistics": 75,
        "Machine Learning": 70,
        "SQL": 65,
        "Data Visualization": 60,
        "Pandas": 65,
        "NumPy": 60,
        "Tableau": 40,
    },
    "Data Analyst": {
        "SQL": 80,
        "Excel": 70,
        "Python": 60,
        "Data Visualization": 70,
        "Tableau": 65,
        "Statistics": 60,
        "Power BI": 50,
    },
    "Full Stack Developer": {
        "HTML": 80,
        "CSS": 75,
        "JavaScript": 80,
        "React": 70,
        "Node.js": 65,
        "SQL": 60,
        "REST APIs": 65,
        "Git": 65,
    },
    "Cloud Engineer": {
        "AWS": 65,
        "Linux": 70,
        "Networking": 65,
        "Docker": 65,
        "Kubernetes": 55,
        "DevOps": 60,
        "Python": 55,
        "Terraform": 50,
    },
}


def analyze_skill_gap(
    career_goal: str,
    student_skills: List[Dict[str, Any]],
    assessment_scores: Dict[str, float],
) -> Dict[str, Any]:
    """
    Analyze student skills against career requirements.
    
    Returns:
        dict with strong_skills, weak_skills, skill_gaps, learning_priorities
    """
    required = CAREER_REQUIRED_SKILLS.get(career_goal, {})
    student_skill_map = {s["name"]: s["score"] for s in student_skills}

    # Override with assessment scores if available
    for skill, score in assessment_scores.items():
        student_skill_map[skill] = score

    strong_skills = []
    weak_skills = []
    skill_gaps = []

    for skill, required_level in required.items():
        student_level = student_skill_map.get(skill, 0)
        if student_level >= 75:
            strong_skills.append(skill)
        elif student_level > 0 and student_level < 75:
            weak_skills.append({"skill": skill, "current": student_level, "required": required_level})
        else:
            skill_gaps.append({"skill": skill, "required": required_level})

    # Prioritize: missing skills first, then weak ones
    priorities = (
        [g["skill"] for g in skill_gaps] +
        [w["skill"] for w in sorted(weak_skills, key=lambda x: x["required"] - x["current"], reverse=True)]
    )

    return {
        "strong_skills": strong_skills,
        "weak_skills": [w["skill"] for w in weak_skills],
        "skill_gaps": [g["skill"] for g in skill_gaps],
        "learning_priorities": priorities[:8],  # Top 8 priorities
        "details": {
            "weak_skills_detail": weak_skills,
            "skill_gaps_detail": skill_gaps,
        }
    }
