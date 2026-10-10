from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    mime_type = Column(String, default="application/pdf")
    file_size = Column(Integer, default=0)
    is_indexed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    notes = relationship("StudentNote", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    vector_id = Column(String, nullable=True)
    embedding = Column(JSON, nullable=True)  # List of float embedding coordinates

    # Relationships
    document = relationship("Document", back_populates="chunks")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    curriculum_week_id = Column(Integer, ForeignKey("curriculum_weeks.id"), nullable=True)
    title = Column(String, default="AI Tutor Session")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.id")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    source_chunks = Column(JSON, default=list)  # Referenced citations from RAG
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="messages")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=True)
    source_type = Column(String, default="curriculum")  # curriculum, document, custom
    source_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    items = relationship("FlashcardItem", back_populates="flashcard", cascade="all, delete-orphan")


class FlashcardItem(Base):
    __tablename__ = "flashcard_items"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"), nullable=False)
    front_text = Column(Text, nullable=False)  # Question or concept
    back_text = Column(Text, nullable=False)   # Answer or explanation
    difficulty = Column(String, default="medium")  # easy, medium, hard
    is_mastered = Column(Boolean, default=False)

    # Relationships
    flashcard = relationship("Flashcard", back_populates="items")


class StudentNote(Base):
    __tablename__ = "student_notes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    curriculum_week_id = Column(Integer, ForeignKey("curriculum_weeks.id"), nullable=True)
    title = Column(String, nullable=False)
    summary_text = Column(Text, nullable=False)
    key_takeaways = Column(JSON, default=list)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    document = relationship("Document", back_populates="notes")
