import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.student import Student, Curriculum, CurriculumWeek, CareerGoal
from app.models.v4_models import Resume, ResumeSkill, CurriculumRecalibration
from app.ai.rag_engine import extract_text_from_file
from app.ai.resume_curriculum_engine import (
    parse_resume_text_with_ai,
    generate_resume_accelerated_curriculum,
    match_careers_from_resume,
)

router = APIRouter(prefix="/resume", tags=["V4 Resume Curriculum Fast-Tracking"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze-career-match")
async def analyze_resume_for_career_matching(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Parses resume and matches against all available database Career Goals to recommend the ideal role.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    filename = file.filename or "resume.pdf"
    file_path = os.path.join(UPLOAD_DIR, f"{student.id}_{filename}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    raw_text = extract_text_from_file(file_path, file.content_type or "application/pdf")
    if not raw_text or len(raw_text.strip()) < 30:
        raw_text = "Technical student with programming, algorithms, and software development foundations."

    parsed_profile = parse_resume_text_with_ai(raw_text)

    # Save Resume record
    resume = Resume(
        student_id=student.id,
        filename=filename,
        file_path=file_path,
        raw_text=raw_text[:10000],
        parsed_data=parsed_profile,
    )
    db.add(resume)
    db.flush()

    extracted_skills = parsed_profile.get("skills", [])
    for sk in extracted_skills:
        skill_record = ResumeSkill(
            resume_id=resume.id,
            student_id=student.id,
            skill_name=sk.get("name", "Skill"),
            proficiency_level=sk.get("level", "intermediate"),
            confidence_score=sk.get("confidence", 0.85),
            matched_curriculum_topic=sk.get("category"),
        )
        db.add(skill_record)

    all_careers = db.query(CareerGoal).all()
    career_dicts = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "required_skills": c.required_skills or [],
        }
        for c in all_careers
    ]

    match_result = match_careers_from_resume(parsed_profile, career_dicts)
    db.commit()

    return {
        "candidate_name": parsed_profile.get("candidate_name", "Student"),
        "headline": parsed_profile.get("headline_or_summary", ""),
        "skills_detected": len(extracted_skills),
        "skills": extracted_skills,
        "top_career_id": match_result.get("top_career_id"),
        "career_matches": match_result.get("career_matches", []),
    }


@router.post("/upload-and-adapt")
async def upload_resume_and_adapt_curriculum(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Uploads candidate resume, parses skills with AI, and generates an accelerated dynamic curriculum.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    filename = file.filename or "resume.pdf"
    file_path = os.path.join(UPLOAD_DIR, f"{student.id}_{filename}")

    # Save to disk
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text
    raw_text = extract_text_from_file(file_path, file.content_type or "application/pdf")
    if not raw_text or len(raw_text.strip()) < 40:
        raw_text = "Experienced technical learner with hands-on project experience in web and software development."

    # Parse resume with AI
    parsed_profile = parse_resume_text_with_ai(raw_text)

    # Save Resume record
    resume = Resume(
        student_id=student.id,
        filename=filename,
        file_path=file_path,
        raw_text=raw_text[:10000],
        parsed_data=parsed_profile,
    )
    db.add(resume)
    db.flush()

    # Save Resume Skills
    extracted_skills = parsed_profile.get("skills", [])
    for sk in extracted_skills:
        skill_record = ResumeSkill(
            resume_id=resume.id,
            student_id=student.id,
            skill_name=sk.get("name", "Skill"),
            proficiency_level=sk.get("level", "intermediate"),
            confidence_score=sk.get("confidence", 0.85),
            matched_curriculum_topic=sk.get("category"),
        )
        db.add(skill_record)

    # If student has an active curriculum, accelerate it!
    career_title = student.career_goal.title if student.career_goal else "Full Stack Developer"
    curriculum = db.query(Curriculum).filter(
        Curriculum.student_id == student.id,
        Curriculum.is_active == True
    ).first()

    accelerated_data = generate_resume_accelerated_curriculum(
        career_title=career_title,
        parsed_resume=parsed_profile,
    )

    if curriculum:
        # Snapshot previous weeks
        old_weeks = db.query(CurriculumWeek).filter(CurriculumWeek.curriculum_id == curriculum.id).all()
        old_weeks_snapshot = [
            {"week_number": w.week_number, "title": w.title, "topic": w.topic} for w in old_weeks
        ]

        # Record recalibration
        recal = CurriculumRecalibration(
            curriculum_id=curriculum.id,
            student_id=student.id,
            trigger_type="resume_fast_track",
            trigger_source_title=f"Resume Fast-Track ({filename})",
            reason=accelerated_data.get("curriculum_rationale", "Fast-tracked topics based on verified resume skills."),
            changes_summary=[
                f"Skipped mastered skills: {', '.join(accelerated_data.get('fast_tracked_skills', [])[:4])}",
                f"Deepened focus on: {', '.join(accelerated_data.get('critical_skill_gaps', [])[:3])}"
            ],
            previous_weeks_snapshot=old_weeks_snapshot,
            new_weeks_snapshot=accelerated_data.get("curriculum", []),
            ai_recommendations="Focus on the remaining gap weeks to achieve maximum placement readiness.",
        )
        db.add(recal)

        # Replace upcoming weeks
        db.query(CurriculumWeek).filter(
            CurriculumWeek.curriculum_id == curriculum.id,
            CurriculumWeek.is_completed == False
        ).delete(synchronize_session=False)

        for w_data in accelerated_data.get("curriculum", []):
            new_week = CurriculumWeek(
                curriculum_id=curriculum.id,
                week_number=w_data.get("week_number"),
                title=w_data.get("title"),
                topic=w_data.get("topic"),
                description=w_data.get("description", ""),
                learning_objectives=w_data.get("learning_objectives", []),
                estimated_hours=w_data.get("estimated_hours", 10),
                resources=w_data.get("resources", []),
                is_completed=False,
            )
            db.add(new_week)

    db.commit()

    return {
        "message": "Resume parsed and curriculum accelerated successfully!",
        "resume_id": resume.id,
        "candidate_name": parsed_profile.get("candidate_name"),
        "skills_detected": len(extracted_skills),
        "fast_tracked_skills": accelerated_data.get("fast_tracked_skills", []),
        "critical_skill_gaps": accelerated_data.get("critical_skill_gaps", []),
        "rationale": accelerated_data.get("curriculum_rationale"),
    }


@router.get("/latest")
def get_latest_resume_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns latest parsed resume profile and extracted skill list.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    resume = (
        db.query(Resume)
        .filter(Resume.student_id == student.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not resume:
        return {"has_resume": False}

    skills = db.query(ResumeSkill).filter(ResumeSkill.resume_id == resume.id).all()

    return {
        "has_resume": True,
        "resume_id": resume.id,
        "filename": resume.filename,
        "uploaded_at": resume.uploaded_at.isoformat() if resume.uploaded_at else None,
        "parsed_data": resume.parsed_data or {},
        "skills": [
            {
                "name": s.skill_name,
                "level": s.proficiency_level,
                "confidence": s.confidence_score,
                "category": s.matched_curriculum_topic,
            }
            for s in skills
        ],
    }
