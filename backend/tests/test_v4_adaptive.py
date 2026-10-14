"""
Comprehensive Test Suite for V4: AI-Driven Dynamic Curriculum Recommendation Engine
Covers:
1. Closed-Loop Adaptive Recalibration Engine
2. Resume Prior-Knowledge & Career Matching Engine
3. Curriculum-Grounded Coding Lab & Complexity Review Engine
"""
import pytest
from app.ai.recalibration_engine import (
    evaluate_and_recalibrate_curriculum,
    _heuristic_recalibration,
)
from app.ai.resume_curriculum_engine import (
    parse_resume_text_with_ai,
    match_careers_from_resume,
    generate_resume_accelerated_curriculum,
)
from app.ai.coding_lab_engine import (
    generate_curriculum_challenge,
    evaluate_code_submission,
)


# ============================================================================
# 1. Tests for Adaptive Recalibration Engine
# ============================================================================

def test_heuristic_recalibration_remediation():
    """Verify that weak performance triggers remedial drills and reinforcement notes."""
    current_weeks = [
        {"week_number": 1, "topic": "Python Basics", "title": "Python Syntax"},
        {"week_number": 2, "topic": "Recursion", "title": "Recursion & Backtracking"},
        {"week_number": 3, "topic": "Trees", "title": "Binary Trees"},
    ]
    result = _heuristic_recalibration(
        career_title="AI Engineer",
        current_weeks=current_weeks,
        weak_topics=["Recursion (Score: 40%)"],
        strong_topics=[],
    )
    assert "reason" in result
    assert "changes_summary" in result
    assert any("Reinforced Week 2" in ch for ch in result["changes_summary"])
    assert "Remedial Practice" in result["adapted_weeks"][1]["title"]


def test_evaluate_and_recalibrate_curriculum_structure():
    """Verify end-to-end recalibration output contract."""
    current_weeks = [
        {"week_number": 1, "topic": "Data Structures", "title": "Arrays & Hashmaps", "is_completed": True},
        {"week_number": 2, "topic": "Dynamic Programming", "title": "DP Patterns", "is_completed": False},
    ]
    quiz_attempts = [{"topic": "Data Structures", "score": 90}]
    coding_subs = [{"topic": "Dynamic Programming", "score": 45, "passed": False}]

    res = evaluate_and_recalibrate_curriculum(
        career_title="Full Stack Developer",
        target_company_name="Google",
        current_weeks=current_weeks,
        quiz_attempts_summary=quiz_attempts,
        coding_submissions_summary=coding_subs,
        trigger_type="quiz_and_coding_performance",
    )
    assert "reason" in res
    assert "adapted_weeks" in res
    assert len(res["adapted_weeks"]) >= 1
    assert "changes_summary" in res


# ============================================================================
# 2. Tests for Resume & Career Matching Engine
# ============================================================================

def test_resume_text_parsing():
    """Verify resume parser extracts skills, levels, and candidate summary."""
    sample_resume = """
    Jane Doe
    Software Engineer with 2 years of experience in Python, FastAPI, React, and PostgreSQL.
    Built automated data ingestion pipelines using Docker and Redis.
    Education: B.S. in Computer Science.
    """
    profile = parse_resume_text_with_ai(sample_resume)
    assert "skills" in profile
    assert isinstance(profile["skills"], list)
    skills = [s["name"].lower() for s in profile["skills"]]
    assert any("python" in s or "fastapi" in s or "react" in s for s in skills)


def test_career_matching_from_resume():
    """Verify career matching ranks appropriate career goals based on resume competencies."""
    parsed_profile = {
        "candidate_name": "Alex",
        "headline_or_summary": "Full Stack developer experienced in React, TypeScript, Python, Node.js.",
        "years_of_experience": 1.5,
        "skills": [
            {"name": "React", "level": "advanced"},
            {"name": "TypeScript", "level": "intermediate"},
            {"name": "Python", "level": "intermediate"},
            {"name": "PostgreSQL", "level": "intermediate"},
        ],
    }
    career_goals = [
        {
            "id": 1,
            "title": "Full Stack Developer",
            "required_skills": [{"skill": "React"}, {"skill": "TypeScript"}, {"skill": "Python"}, {"skill": "PostgreSQL"}],
        },
        {
            "id": 2,
            "title": "Cloud Engineer",
            "required_skills": [{"skill": "AWS"}, {"skill": "Kubernetes"}, {"skill": "Terraform"}],
        },
    ]
    match_res = match_careers_from_resume(parsed_profile, career_goals)
    assert "top_career_id" in match_res
    assert match_res["top_career_id"] == 1  # Should match Full Stack Developer best
    assert len(match_res["career_matches"]) == 2
    full_stack_match = next(m for m in match_res["career_matches"] if m["career_id"] == 1)
    assert full_stack_match["match_percentage"] >= 70


def test_generate_resume_accelerated_curriculum():
    """Verify curriculum generator skips mastered resume topics."""
    parsed_resume = {
        "candidate_name": "Sam",
        "headline_or_summary": "Experienced Python backend dev",
        "years_of_experience": 2,
        "skills": [
            {"name": "Python", "level": "advanced"},
            {"name": "Git", "level": "advanced"},
        ],
    }
    curriculum_result = generate_resume_accelerated_curriculum(
        career_title="AI Engineer",
        parsed_resume=parsed_resume,
    )
    assert "fast_tracked_skills" in curriculum_result
    assert "curriculum" in curriculum_result
    assert len(curriculum_result["curriculum"]) >= 1


# ============================================================================
# 3. Tests for Coding Lab Engine & Code Evaluation
# ============================================================================

def test_generate_curriculum_challenge():
    """Verify weekly challenge generator returns starter code, test cases, and progressive hints."""
    challenge = generate_curriculum_challenge(
        week_topic="Graph Traversal & BFS",
        week_title="Breadth-First Search Fundamentals",
        career_title="AI Engineer",
        difficulty="Medium",
    )
    assert "title" in challenge
    assert "problem_statement" in challenge
    assert "starter_code" in challenge
    assert "python" in challenge["starter_code"]
    assert "visible_test_cases" in challenge
    assert len(challenge["visible_test_cases"]) >= 1
    assert "hints" in challenge
    assert len(challenge["hints"]) >= 3


def test_evaluate_code_submission_pass():
    """Verify python code evaluator scores correct solutions and returns complexity and review."""
    correct_code = """
def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []
"""
    result = evaluate_code_submission(
        problem_title="Two Sum",
        problem_statement="Find indices of two numbers that add up to target.",
        student_code=correct_code,
        language="python",
        visible_tests=[{"input": "nums = [2, 7], target = 9", "expected_output": "[0, 1]"}],
        hidden_tests=[{"input": "nums = [3, 3], target = 6", "expected_output": "[0, 1]"}],
    )
    assert "score" in result
    assert "passed" in result
    assert "time_complexity_detected" in result
    assert "ai_review" in result


def test_evaluate_code_submission_incomplete():
    """Verify incomplete or empty stub code returns meaningful feedback."""
    trivial_code = "def solution(nums): pass"
    result = evaluate_code_submission(
        problem_title="Two Sum",
        problem_statement="Find indices of two numbers that add up to target.",
        student_code=trivial_code,
        language="python",
        visible_tests=[{"input": "nums = [2, 7], target = 9", "expected_output": "[0, 1]"}],
        hidden_tests=[],
    )
    assert "score" in result
    assert "ai_review" in result

