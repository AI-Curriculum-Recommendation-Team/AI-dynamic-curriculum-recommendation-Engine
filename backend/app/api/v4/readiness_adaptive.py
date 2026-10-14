from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek, StudentSkill, AssessmentResult
from app.models.v2_models import TopicQuiz, QuizAttempt
from app.models.v4_models import CareerReadiness, CompanyCurriculumProfile, CodingSubmission, ResumeSkill, CurriculumCodingChallenge

router = APIRouter(prefix="/readiness", tags=["V4 Placement Readiness & Skill Gap Matrix"])


@router.get("")
def get_career_readiness_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes a multi-dimensional, company-calibrated career readiness score and live skill gap matrix.
    Dynamically recalculates based on:
    - Target Company Tier & Hiring Bar (Google=90%, Startups=80%, Enterprise=70%)
    - Active Curriculum Roadmap Progress
    - Diagnostic Assessment & Weekly Quiz Mastery
    - Hands-On Coding Lab Evaluations
    - Verified Resume Competencies
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 1. Target Company Profile
    readiness = db.query(CareerReadiness).filter(CareerReadiness.student_id == student.id).first()
    target_company = None
    if readiness and readiness.target_company_id:
        target_company = db.query(CompanyCurriculumProfile).filter(
            CompanyCurriculumProfile.id == readiness.target_company_id
        ).first()

    if not target_company:
        target_company = db.query(CompanyCurriculumProfile).first()

    # Determine company target benchmark based on tier
    tier_target_map = {
        "tier_1_product": 90,
        "high_growth_startup": 80,
        "enterprise_it": 70,
    }
    tier_target = tier_target_map.get(target_company.tier if target_company else "tier_1_product", 85)

    # 2. Curriculum Completion Score
    curriculum = db.query(Curriculum).filter(
        Curriculum.student_id == student.id,
        Curriculum.is_active == True
    ).first()

    completion_score = 0.0
    if curriculum:
        weeks = db.query(CurriculumWeek).filter(CurriculumWeek.curriculum_id == curriculum.id).all()
        if weeks:
            completed_weeks = sum(1 for w in weeks if w.status == 'completed')
            in_progress_weeks = sum(1 for w in weeks if w.status == 'in_progress')
            # Grant proportional credit for in-progress work
            completion_score = round(((completed_weeks + (in_progress_weeks * 0.4)) / len(weeks)) * 100, 1)

    # 3. Quiz Mastery Score (Diagnostic Assessment + Weekly Topic Quizzes)
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).all()
    assessment_res = db.query(AssessmentResult).filter(AssessmentResult.student_id == student.id).order_by(AssessmentResult.taken_at.desc()).first()

    quiz_scores_list = [q.score for q in quiz_attempts]
    if assessment_res and assessment_res.overall_score:
        quiz_scores_list.append(assessment_res.overall_score)

    if quiz_scores_list:
        quiz_score = round(sum(quiz_scores_list) / len(quiz_scores_list), 1)
    else:
        quiz_score = 65.0  # Baseline foundational competency

    # 4. Coding Challenge Score
    coding_subs = db.query(CodingSubmission).filter(CodingSubmission.student_id == student.id).all()
    if coding_subs:
        coding_score = round(sum(s.score for s in coding_subs) / len(coding_subs), 1)
    else:
        # If no submissions yet, derive from quiz mastery foundation
        coding_score = round(quiz_score * 0.8, 1)

    # 5. Build Unified Dynamic Skill Map for Student
    unified_skills: Dict[str, float] = {}

    # From diagnostic assessment
    if assessment_res and assessment_res.scores_per_skill:
        for sk, sc in assessment_res.scores_per_skill.items():
            unified_skills[sk.lower()] = float(sc)

    # From student skills
    for ss in student.skills:
        if ss.skill and ss.proficiency_score:
            unified_skills[ss.skill.name.lower()] = max(unified_skills.get(ss.skill.name.lower(), 0), float(ss.proficiency_score))

    # From resume skills
    res_skills = db.query(ResumeSkill).filter(ResumeSkill.student_id == student.id).all()
    level_score_map = {"beginner": 60.0, "intermediate": 80.0, "advanced": 95.0}
    for rs in res_skills:
        sc = level_score_map.get((rs.proficiency_level or "intermediate").lower(), 75.0)
        unified_skills[rs.skill_name.lower()] = max(unified_skills.get(rs.skill_name.lower(), 0), sc)

    # From topic quizzes
    for qa, tq in db.query(QuizAttempt, TopicQuiz).join(TopicQuiz, QuizAttempt.quiz_id == TopicQuiz.id).filter(QuizAttempt.student_id == student.id).all():
        if tq.topic:
            unified_skills[tq.topic.lower()] = max(unified_skills.get(tq.topic.lower(), 0), float(qa.score))

    # From coding challenges
    for cs, cc in db.query(CodingSubmission, CurriculumCodingChallenge).join(CurriculumCodingChallenge, CodingSubmission.challenge_id == CurriculumCodingChallenge.id).filter(CodingSubmission.student_id == student.id).all():
        if cc.topic:
            unified_skills[cc.topic.lower()] = max(unified_skills.get(cc.topic.lower(), 0), float(cs.score))

    # 6. Skill Gap Matrix against Target Company Stack
    required_stack = target_company.core_tech_stack if target_company else ["Python", "Algorithms", "System Design", "SQL"]
    gap_matrix = []
    stack_match_percentages = []

    for skill_req in required_stack:
        req_lower = skill_req.lower()
        # Find best matching student skill
        matched_level = 0.0
        for sk_name, score in unified_skills.items():
            if sk_name in req_lower or req_lower in sk_name:
                matched_level = max(matched_level, score)

        if matched_level == 0.0:
            # Baseline based on career quiz score
            matched_level = round(quiz_score * 0.75, 1)

        # Status determined relative to company tier target
        if matched_level >= tier_target:
            status = "mastered"
        elif matched_level >= (tier_target * 0.65):
            status = "in_progress"
        else:
            status = "needs_focus"

        gap_matrix.append({
            "skill": skill_req,
            "target_level": tier_target,
            "current_level": int(matched_level),
            "status": status,
        })
        stack_match_percentages.append(min(100.0, (matched_level / tier_target) * 100))

    company_stack_match = round(sum(stack_match_percentages) / max(len(stack_match_percentages), 1), 1)

    # 7. Composite Overall Readiness Score
    # Calibrated dynamically:
    # 20% Curriculum Progress + 25% Quiz Mastery + 25% Coding Lab + 30% Company Stack Match
    overall_score = round(
        (completion_score * 0.20) +
        (quiz_score * 0.25) +
        (coding_score * 0.25) +
        (company_stack_match * 0.30),
        1
    )

    # Cap between 10 and 99
    overall_score = min(99.0, max(15.0, overall_score))

    # 8. Actionable Recommendation
    co_name = target_company.company_name if target_company else "Target Companies"
    if overall_score >= 82:
        recommendation = f"Exceptional alignment for {co_name} ({target_company.target_role})! You meet the {tier_target}% hiring benchmark across core stack competencies. Focus on system design trade-offs and timed coding labs."
    elif overall_score >= 60:
        recommendation = f"Solid progression toward {co_name}. Focus on strengthening '{gap_matrix[0]['skill'] if gap_matrix else 'core topics'}' in upcoming weekly labs to bridge the gap to the {tier_target}% hiring threshold."
    else:
        recommendation = f"Actively calibrating foundation for {co_name}. Complete your active week coding challenge and weekly quiz to raise your composite readiness."

    # Update or insert readiness record
    if not readiness:
        readiness = CareerReadiness(
            student_id=student.id,
            overall_score=overall_score,
            curriculum_completion_score=completion_score,
            quiz_mastery_score=quiz_score,
            coding_score=coding_score,
            target_company_id=target_company.id if target_company else None,
            skill_gap_matrix=gap_matrix,
            recommended_action=recommendation,
        )
        db.add(readiness)
    else:
        readiness.overall_score = overall_score
        readiness.curriculum_completion_score = completion_score
        readiness.quiz_mastery_score = quiz_score
        readiness.coding_score = coding_score
        readiness.target_company_id = target_company.id if target_company else None
        readiness.skill_gap_matrix = gap_matrix
        readiness.recommended_action = recommendation

    db.commit()

    return {
        "overall_score": int(overall_score),
        "curriculum_completion_score": completion_score,
        "quiz_mastery_score": quiz_score,
        "coding_score": coding_score,
        "company_match_percentage": int(company_stack_match),
        "target_company": {
            "id": target_company.id,
            "company_name": target_company.company_name,
            "tier": target_company.tier,
            "target_role": target_company.target_role,
            "benchmark_target": tier_target,
        } if target_company else None,
        "skill_gap_matrix": gap_matrix,
        "recommended_action": recommendation,
    }
