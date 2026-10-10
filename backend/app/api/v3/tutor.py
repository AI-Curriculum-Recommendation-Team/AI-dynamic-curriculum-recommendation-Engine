from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, CurriculumWeek
from app.models.v3_models import Document, DocumentChunk, ChatSession, ChatMessage
from app.schemas.v3_schemas import (
    ChatSessionOut, ChatSessionCreate, ChatMessageRequest,
    ChatMessageResponse, ChatMessageOut
)
from app.ai.rag_engine import search_relevant_chunks, answer_with_rag

router = APIRouter(prefix="/tutor", tags=["V3 AI Tutor / RAG"])


@router.post("/sessions", response_model=ChatSessionOut)
def start_tutor_session(
    req: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Start a new AI tutor interactive study session."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    title = req.title or "AI Study Session"
    if req.curriculum_week_id:
        week = db.query(CurriculumWeek).filter(CurriculumWeek.id == req.curriculum_week_id).first()
        if week:
            title = f"Tutor: {week.topic}"

    session = ChatSession(
        student_id=student.id,
        curriculum_week_id=req.curriculum_week_id,
        title=title,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Initial friendly welcome message from AI tutor
    welcome_text = (
        f"👋 Hello **{student.full_name.split()[0]}**! I am your AI Study Tutor.\n\n"
        f"You can ask me anything about your curriculum, request step-by-step code walkthroughs, "
        f"or ask questions about any textbooks and PDFs you have uploaded to your Knowledge Base. How can I help you today?"
    )
    init_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=welcome_text,
        source_chunks=[],
    )
    db.add(init_msg)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "title": session.title,
        "curriculum_week_id": session.curriculum_week_id,
        "started_at": session.started_at,
        "message_count": len(session.messages),
    }


@router.get("/sessions", response_model=List[ChatSessionOut])
def list_tutor_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: List all AI tutor chat sessions for student."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.student_id == student.id)
        .order_by(ChatSession.started_at.desc())
        .all()
    )
    out = []
    for s in sessions:
        out.append({
            "id": s.id,
            "title": s.title,
            "curriculum_week_id": s.curriculum_week_id,
            "started_at": s.started_at,
            "message_count": len(s.messages),
        })
    return out


@router.get("/sessions/{session_id}/history", response_model=List[ChatMessageOut])
def get_chat_history(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Get full chronological message history for a tutor session."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.student_id == student.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return session.messages


@router.post("/sessions/{session_id}/message", response_model=ChatMessageResponse)
def send_message_to_tutor(
    session_id: int,
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    V3: Send question to AI Tutor and receive grounded RAG response.
    Performs vector similarity search against the student's uploaded documents
    and grounds the AI response with citations.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.student_id == student.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Record user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=req.message.strip(),
        source_chunks=[],
    )
    db.add(user_msg)
    db.flush()

    # Determine topic from week or request
    topic = req.topic or "Computer Science & Engineering"
    if session.curriculum_week_id:
        week = db.query(CurriculumWeek).filter(CurriculumWeek.id == session.curriculum_week_id).first()
        if week:
            topic = week.topic

    # Gather all vector chunks from student's documents
    student_docs = db.query(Document).filter(Document.student_id == student.id).all()
    doc_map = {d.id: d.filename for d in student_docs}

    chunks_with_meta = []
    for d in student_docs:
        for c in d.chunks:
            chunks_with_meta.append({
                "content": c.content,
                "embedding": c.embedding,
                "filename": doc_map.get(c.document_id, "Document"),
                "chunk_index": c.chunk_index,
                "document_id": c.document_id,
            })

    # Perform semantic retrieval
    top_chunks = search_relevant_chunks(req.message, chunks_with_meta, top_k=4)

    # Build conversation context for continuity
    history_records = [
        {"role": m.role, "content": m.content}
        for m in session.messages[-8:]
    ]

    # Generate grounded response
    rag_result = answer_with_rag(
        question=req.message,
        topic=topic,
        retrieved_chunks=top_chunks,
        chat_history=history_records,
    )

    # Save AI response message
    ai_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=rag_result["answer"],
        source_chunks=rag_result["sources"],
    )
    db.add(ai_msg)
    db.commit()

    db.refresh(user_msg)
    db.refresh(ai_msg)

    return {
        "session_id": session.id,
        "user_message": user_msg,
        "ai_message": ai_msg,
        "sources": rag_result["sources"],
    }


@router.delete("/sessions/{session_id}")
def delete_tutor_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Delete an AI tutor chat session."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.student_id == student.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return {"message": "Chat session deleted"}
