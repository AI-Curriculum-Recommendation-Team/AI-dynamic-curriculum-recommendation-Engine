from app.models.user import User
from app.models.student import (
    Student, Skill, StudentSkill, CareerGoal,
    Assessment, AssessmentQuestion, AssessmentResult,
    Curriculum, CurriculumWeek, Progress, Notification
)
from app.models.v2_models import (
    TopicQuiz, QuizQuestion, QuizAttempt, WeeklyReport, Achievement
)
from app.models.v3_models import (
    Document, DocumentChunk, ChatSession, ChatMessage,
    Flashcard, FlashcardItem, StudentNote
)
from app.models.v4_models import (
    Resume, ResumeSkill, CompanyCurriculumProfile,
    CurriculumRecalibration, CurriculumCodingChallenge,
    CodingSubmission, CareerReadiness
)

__all__ = [
    "User", "Student", "Skill", "StudentSkill", "CareerGoal",
    "Assessment", "AssessmentQuestion", "AssessmentResult",
    "Curriculum", "CurriculumWeek", "Progress", "Notification",
    "TopicQuiz", "QuizQuestion", "QuizAttempt", "WeeklyReport", "Achievement",
    "Document", "DocumentChunk", "ChatSession", "ChatMessage",
    "Flashcard", "FlashcardItem", "StudentNote",
    "Resume", "ResumeSkill", "CompanyCurriculumProfile",
    "CurriculumRecalibration", "CurriculumCodingChallenge",
    "CodingSubmission", "CareerReadiness",
]
