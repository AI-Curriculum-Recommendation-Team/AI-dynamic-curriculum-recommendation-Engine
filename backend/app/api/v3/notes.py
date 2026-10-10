from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, CurriculumWeek
from app.models.v3_models import Document, StudentNote
from app.schemas.v3_schemas import StudentNoteOut, NoteSummarizeRequest
from app.ai.study_ai import generate_notes_summary

router = APIRouter(prefix="/notes", tags=["V3 Notes Summarization"])


@router.post("/summarize/{document_id}", response_model=StudentNoteOut)
def summarize_uploaded_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: AI summarizes an uploaded PDF/document into structured study notes."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.student_id == student.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Combine text from chunks
    combined_content = "\n\n".join([c.content for c in doc.chunks[:15]])
    if not combined_content:
        raise HTTPException(status_code=400, detail="Document has no extracted text content.")

    summary_result = generate_notes_summary(
        content=combined_content,
        title=doc.filename.rsplit(".", 1)[0]
    )

    note = StudentNote(
        student_id=student.id,
        document_id=doc.id,
        title=summary_result["title"],
        summary_text=summary_result["summary_text"],
        key_takeaways=summary_result["key_takeaways"],
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/summarize-topic/{week_id}", response_model=StudentNoteOut)
def summarize_curriculum_week(
    week_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: AI generates comprehensive study notes for a curriculum week topic."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
    if not week:
        raise HTTPException(status_code=404, detail="Curriculum week not found")

    prompt_content = (
        f"Curriculum Topic: {week.topic}\n"
        f"Key Subtopics: {', '.join(week.subtopics or [])}\n"
        f"Difficulty: {week.difficulty}\n"
    )

    summary_result = generate_notes_summary(
        content=prompt_content,
        title=f"Week {week.week_number}: {week.topic}"
    )

    note = StudentNote(
        student_id=student.id,
        curriculum_week_id=week.id,
        title=summary_result["title"],
        summary_text=summary_result["summary_text"],
        key_takeaways=summary_result["key_takeaways"],
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("", response_model=List[StudentNoteOut])
@router.get("/", response_model=List[StudentNoteOut])
def get_all_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Get all AI-generated study notes for the student."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return (
        db.query(StudentNote)
        .filter(StudentNote.student_id == student.id)
        .order_by(StudentNote.generated_at.desc())
        .all()
    )


@router.get("/{note_id}", response_model=StudentNoteOut)
def get_single_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Get a specific study note."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    note = (
        db.query(StudentNote)
        .filter(StudentNote.id == note_id, StudentNote.student_id == student.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Delete a study note."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    note = (
        db.query(StudentNote)
        .filter(StudentNote.id == note_id, StudentNote.student_id == student.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}
