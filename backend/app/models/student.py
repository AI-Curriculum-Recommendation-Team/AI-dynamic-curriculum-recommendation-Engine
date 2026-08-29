from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    education = Column(String, nullable=True)
    learning_preference = Column(String, default="video")  # video, text, projects, mixed
    career_goal_id = Column(Integer, ForeignKey("career_goals.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="student")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    career_goal = relationship("CareerGoal", back_populates="students")
    assessment_results = relationship("AssessmentResult", back_populates="student")
    curricula = relationship("Curriculum", back_populates="student")
    progress = relationship("Progress", back_populates="student")
    notifications = relationship("Notification", back_populates="student", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)

    student_skills = relationship("StudentSkill", back_populates="skill")
    assessment_questions = relationship("AssessmentQuestion", back_populates="skill")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    self_rated_level = Column(String, default="beginner")  # beginner, intermediate, advanced
    proficiency_score = Column(Integer, default=0)  # 0-100

    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    required_skills = Column(JSON, default=list)  # List of skill names with required levels

    students = relationship("Student", back_populates="career_goal")
    assessments = relationship("Assessment", back_populates="career_goal")
    curricula = relationship("Curriculum", back_populates="career_goal")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    career_goal_id = Column(Integer, ForeignKey("career_goals.id"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    career_goal = relationship("CareerGoal", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="assessment")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    question_text = Column(String, nullable=False)
    options = Column(JSON)  # List of option strings
    correct_answer = Column(String, nullable=False)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    explanation = Column(String, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")
    skill = relationship("Skill", back_populates="assessment_questions")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    scores_per_skill = Column(JSON)  # {"Python": 80, "ML": 40, ...}
    overall_score = Column(Float, default=0.0)
    taken_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="assessment_results")
    assessment = relationship("Assessment", back_populates="results")


class Curriculum(Base):
    __tablename__ = "curricula"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    career_goal_id = Column(Integer, ForeignKey("career_goals.id"), nullable=False)
    skill_gaps = Column(JSON, default=list)
    strong_skills = Column(JSON, default=list)
    weak_skills = Column(JSON, default=list)
    learning_priorities = Column(JSON, default=list)
    total_weeks = Column(Integer, default=0)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    student = relationship("Student", back_populates="curricula")
    career_goal = relationship("CareerGoal", back_populates="curricula")
    weeks = relationship("CurriculumWeek", back_populates="curriculum", cascade="all, delete-orphan")


class CurriculumWeek(Base):
    __tablename__ = "curriculum_weeks"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_id = Column(Integer, ForeignKey("curricula.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    topic = Column(String, nullable=False)
    subtopics = Column(JSON, default=list)
    resources = Column(JSON, default=list)
    estimated_hours = Column(Integer, default=8)
    difficulty = Column(String, default="medium")
    status = Column(String, default="not_started")  # not_started, in_progress, completed

    curriculum = relationship("Curriculum", back_populates="weeks")
    progress = relationship("Progress", back_populates="curriculum_week")


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    curriculum_week_id = Column(Integer, ForeignKey("curriculum_weeks.id"), nullable=False)
    status = Column(String, default="not_started")  # not_started, in_progress, completed
    notes = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student = relationship("Student", back_populates="progress")
    curriculum_week = relationship("CurriculumWeek", back_populates="progress")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")  # success, warning, info
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="notifications")
