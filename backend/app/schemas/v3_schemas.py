from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ---- Document Schemas ----
class DocumentOut(BaseModel):
    id: int
    filename: str
    file_size: int
    mime_type: str
    is_indexed: bool
    chunk_count: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class DocumentChunkOut(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    content: str

    class Config:
        from_attributes = True


# ---- AI Tutor / Chat Schemas ----
class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    source_chunks: List[Dict[str, Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionOut(BaseModel):
    id: int
    title: str
    curriculum_week_id: Optional[int]
    started_at: datetime
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "AI Tutor Session"
    curriculum_week_id: Optional[int] = None


class ChatMessageRequest(BaseModel):
    message: str
    topic: Optional[str] = None


class ChatMessageResponse(BaseModel):
    session_id: int
    user_message: ChatMessageOut
    ai_message: ChatMessageOut
    sources: List[Dict[str, Any]] = []


# ---- Flashcards Schemas ----
class FlashcardItemSchema(BaseModel):
    id: Optional[int] = None
    front_text: str
    back_text: str
    difficulty: str = "medium"
    is_mastered: bool = False

    class Config:
        from_attributes = True


class FlashcardOut(BaseModel):
    id: int
    title: str
    topic: Optional[str]
    source_type: str
    source_id: Optional[int]
    created_at: datetime
    items: List[FlashcardItemSchema] = []

    class Config:
        from_attributes = True


class FlashcardGenerateRequest(BaseModel):
    topic: Optional[str] = None
    document_id: Optional[int] = None
    count: int = 6


# ---- Student Notes Schemas ----
class StudentNoteOut(BaseModel):
    id: int
    title: str
    summary_text: str
    key_takeaways: List[str]
    document_id: Optional[int]
    curriculum_week_id: Optional[int]
    generated_at: datetime

    class Config:
        from_attributes = True


class NoteSummarizeRequest(BaseModel):
    title: Optional[str] = None
    custom_content: Optional[str] = None
