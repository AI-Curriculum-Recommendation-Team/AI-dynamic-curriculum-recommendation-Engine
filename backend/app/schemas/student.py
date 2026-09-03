from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ---- Student ----

class StudentCreate(BaseModel):
    full_name: str
    education: Optional[str] = None
    learning_preference: str = "video"


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    education: Optional[str] = None
    learning_preference: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    education: Optional[str]
    learning_preference: str
    career_goal_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Skills ----

class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


class SkillOut(BaseModel):
    id: int
    name: str
    category: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True


class StudentSkillCreate(BaseModel):
    skill_name: str
    self_rated_level: str = "beginner"  # beginner, intermediate, advanced
    proficiency_score: int = 0


class StudentSkillOut(BaseModel):
    id: int
    skill: SkillOut
    self_rated_level: str
    proficiency_score: int

    class Config:
        from_attributes = True


# ---- Career Goal ----

class CareerGoalOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    icon: Optional[str]
    required_skills: List[Any]

    class Config:
        from_attributes = True


class CareerGoalSet(BaseModel):
    career_goal_id: int


# ---- Assessment ----

class AssessmentQuestionOut(BaseModel):
    id: int
    question_text: str
    options: List[str]
    skill_id: int
    skill: Optional["SkillOut"] = None  # Include skill name for frontend display
    difficulty: str

    class Config:
        from_attributes = True


class AssessmentOut(BaseModel):
    id: int
    title: str
    career_goal_id: int
    questions: List[AssessmentQuestionOut]

    class Config:
        from_attributes = True


class AssessmentSubmit(BaseModel):
    assessment_id: int
    answers: Dict[int, str]  # {question_id: selected_answer}


class AssessmentResultOut(BaseModel):
    id: int
    assessment_id: int
    scores_per_skill: Dict[str, float]
    overall_score: float
    taken_at: datetime

    class Config:
        from_attributes = True


# ---- Curriculum ----

class ResourceOut(BaseModel):
    type: str
    title: str
    url: str


class CurriculumWeekOut(BaseModel):
    id: int
    week_number: int
    topic: str
    subtopics: List[str]
    resources: List[Any]
    estimated_hours: int
    difficulty: str
    status: str

    class Config:
        from_attributes = True


class CurriculumOut(BaseModel):
    id: int
    career_goal_id: int
    skill_gaps: List[str]
    strong_skills: List[str]
    weak_skills: List[str]
    learning_priorities: List[str]
    total_weeks: int
    generated_at: datetime
    weeks: List[CurriculumWeekOut]

    class Config:
        from_attributes = True


class CurriculumGenerateRequest(BaseModel):
    career_goal_id: Optional[int] = None  # Uses student's current goal if not provided


# ---- Progress ----

class ProgressUpdate(BaseModel):
    status: str  # not_started, in_progress, completed
    notes: Optional[str] = None


class ProgressOut(BaseModel):
    id: int
    curriculum_week_id: int
    status: str
    notes: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True


class ProgressSummary(BaseModel):
    total_topics: int
    completed: int
    in_progress: int
    not_started: int
    completion_percentage: float


# ---- Admin ----

class AdminUserOut(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime
    student_name: Optional[str] = None

    class Config:
        from_attributes = True


class PlatformStats(BaseModel):
    total_users: int
    total_students: int
    total_curricula: int
    active_users_today: int
    career_goal_distribution: Dict[str, int]


# ---- V2 Adaptive Quiz & Notifications ----

class QuizSubmitRequest(BaseModel):
    score_percentage: float
    topic: str


class QuizSubmitResult(BaseModel):
    score_percentage: float
    status: str
    action: str  # "advanced" or "remedial_added"
    message: str
    resources: List[Dict[str, Any]] = []


class NotificationOut(BaseModel):
    id: int
    student_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

