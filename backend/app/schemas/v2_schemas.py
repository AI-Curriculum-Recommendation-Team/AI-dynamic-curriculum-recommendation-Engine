from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class QuizQuestionSchema(BaseModel):
    id: Optional[int] = None
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: str = "medium"


class QuizDetailOut(BaseModel):
    quiz_id: int
    week_id: int
    topic: str
    difficulty: str
    question_count: int
    questions: List[QuizQuestionSchema]


class QuizSubmitRequest(BaseModel):
    answers: Dict[str, str]  # question index or id -> selected answer (e.g. "A", "B", etc.)
    score_percentage: Optional[float] = None


class QuizAttemptOut(BaseModel):
    id: int
    quiz_id: int
    score: float
    action_taken: str
    weak_concepts: List[str]
    taken_at: datetime

    class Config:
        from_attributes = True


class WeeklyReportOut(BaseModel):
    id: Optional[int] = None
    week_number: int
    report: str
    completion_percentage: float
    generated_at: Optional[datetime] = None


class AchievementOut(BaseModel):
    id: int
    badge_key: str
    badge_name: str
    description: str
    icon: str
    earned_at: datetime

    class Config:
        from_attributes = True


class AdaptiveCurriculumResponse(BaseModel):
    adapted: bool
    message: str
    difficulty_level: str
    remedial_resources: List[Dict[str, Any]]
