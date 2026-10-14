from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Float, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(JSON, default=dict)  # structured summary, education, experience, projects
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan")


class ResumeSkill(Base):
    __tablename__ = "resume_skills"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    proficiency_level = Column(String, default="intermediate")  # beginner, intermediate, advanced
    confidence_score = Column(Float, default=0.85)  # 0.0 - 1.0
    matched_curriculum_topic = Column(String, nullable=True)
    is_verified = Column(Boolean, default=True)

    # Relationships
    resume = relationship("Resume", back_populates="skills")


class CompanyCurriculumProfile(Base):
    __tablename__ = "company_curriculum_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False, unique=True)
    tier = Column(String, default="tier_1_product")  # tier_1_product, high_growth_startup, enterprise_it
    target_role = Column(String, nullable=False)
    core_tech_stack = Column(JSON, default=list)  # e.g. ["Python", "DSA", "Distributed Systems"]
    interview_focus_areas = Column(JSON, default=list)
    description = Column(Text, nullable=True)
    difficulty_level = Column(String, default="Hard")  # Easy, Medium, Hard
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CurriculumRecalibration(Base):
    __tablename__ = "curriculum_recalibrations"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_id = Column(Integer, ForeignKey("curricula.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    trigger_type = Column(String, nullable=False)  # quiz_low_score, quiz_high_score, coding_lab, resume_fast_track, manual
    trigger_source_title = Column(String, nullable=True)  # e.g. "Week 2 Quiz: Recursion (35%)"
    reason = Column(Text, nullable=False)
    changes_summary = Column(JSON, default=list)  # list of bullet points explaining specific adaptations
    previous_weeks_snapshot = Column(JSON, default=list)
    new_weeks_snapshot = Column(JSON, default=list)
    ai_recommendations = Column(Text, nullable=True)
    recalibrated_at = Column(DateTime(timezone=True), server_default=func.now())


class CurriculumCodingChallenge(Base):
    __tablename__ = "curriculum_coding_challenges"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_week_id = Column(Integer, ForeignKey("curriculum_weeks.id"), nullable=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    problem_statement = Column(Text, nullable=False)
    constraints = Column(Text, nullable=True)
    starter_code = Column(JSON, default=dict)  # {"python": "...", "javascript": "...", "cpp": "..."}
    visible_test_cases = Column(JSON, default=list)  # [{"input": "...", "expected_output": "...", "explanation": "..."}]
    hidden_test_cases = Column(JSON, default=list)
    hints = Column(JSON, default=list)  # [Tier 1, Tier 2, Tier 3 progressive hints]
    solution_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submissions = relationship("CodingSubmission", back_populates="challenge", cascade="all, delete-orphan")


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("curriculum_coding_challenges.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String, default="python")
    passed = Column(Boolean, default=False)
    tests_passed = Column(Integer, default=0)
    tests_total = Column(Integer, default=0)
    time_complexity_detected = Column(String, nullable=True)  # e.g., O(N), O(N log N)
    space_complexity_detected = Column(String, nullable=True)
    ai_review = Column(Text, nullable=True)
    score = Column(Float, default=0.0)  # 0.0 - 100.0
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    challenge = relationship("CurriculumCodingChallenge", back_populates="submissions")


class CareerReadiness(Base):
    __tablename__ = "career_readiness"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    overall_score = Column(Float, default=0.0)  # 0.0 - 100.0
    curriculum_completion_score = Column(Float, default=0.0)
    quiz_mastery_score = Column(Float, default=0.0)
    coding_score = Column(Float, default=0.0)
    target_company_id = Column(Integer, ForeignKey("company_curriculum_profiles.id"), nullable=True)
    skill_gap_matrix = Column(JSON, default=list)  # list of dicts: skill, required_level, current_level, gap_status
    recommended_action = Column(Text, nullable=True)
    last_calculated_at = Column(DateTime(timezone=True), server_default=func.now())
