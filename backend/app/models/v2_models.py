from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Float, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class TopicQuiz(Base):
    __tablename__ = "topic_quizzes"

    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("curriculum_weeks.id"), nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    question_count = Column(Integer, default=5)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("topic_quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # list of strings or dicts
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, default="medium")
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)

    # Relationships
    quiz = relationship("TopicQuiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("topic_quizzes.id"), nullable=False)
    score = Column(Float, nullable=False)  # Percentage 0-100
    answers = Column(JSON, default=dict)  # Question ID -> selected answer
    weak_concepts = Column(JSON, default=list)
    action_taken = Column(String, default="in_progress")  # advanced, remedial_added, in_progress
    taken_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    quiz = relationship("TopicQuiz", back_populates="attempts")


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    week_number = Column(Integer, default=1)
    report_text = Column(Text, nullable=False)
    skill_progress = Column(JSON, default=dict)
    completion_percentage = Column(Float, default=0.0)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    badge_key = Column(String, nullable=False)  # unique per student check in logic
    badge_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, default="award")
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
