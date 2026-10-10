from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student, CurriculumWeek
from app.models.v3_models import Document, Flashcard, FlashcardItem
from app.schemas.v3_schemas import (
    FlashcardOut, FlashcardGenerateRequest, FlashcardItemSchema
)
from app.ai.study_ai import generate_flashcards_ai
from app.services.v2_service import award_badge

router = APIRouter(prefix="/flashcards", tags=["V3 Flashcards"])


@router.post("/generate/{week_id}", response_model=FlashcardOut)
def generate_flashcards_for_week(
    week_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: AI auto-generates high-yield study flashcards for a curriculum week."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    week = db.query(CurriculumWeek).filter(CurriculumWeek.id == week_id).first()
    if not week:
        raise HTTPException(status_code=404, detail="Curriculum week not found")

    content = f"Topic: {week.topic}\nSubtopics: {', '.join(week.subtopics or [])}\nDifficulty: {week.difficulty}"
    items_data = generate_flashcards_ai(content=content, topic=week.topic, count=6)

    deck = Flashcard(
        student_id=student.id,
        title=f"Week {week.week_number}: {week.topic}",
        topic=week.topic,
        source_type="curriculum",
        source_id=week.id,
    )
    db.add(deck)
    db.flush()

    saved_items = []
    for item in items_data:
        f_item = FlashcardItem(
            flashcard_id=deck.id,
            front_text=item["front_text"],
            back_text=item["back_text"],
            difficulty=item.get("difficulty", "medium"),
            is_mastered=False,
        )
        db.add(f_item)
        db.flush()
        saved_items.append(f_item)

    db.commit()
    db.refresh(deck)

    award_badge(db, student.id, "FLASHCARD_WIZARD")
    return deck


@router.post("/generate-custom", response_model=FlashcardOut)
def generate_custom_flashcards(
    req: FlashcardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: AI generates flashcards from an uploaded document or custom topic."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    topic_title = req.topic or "Key Technical Concepts"
    source_content = ""
    source_type = "custom"
    source_id = None

    if req.document_id:
        doc = db.query(Document).filter(Document.id == req.document_id, Document.student_id == student.id).first()
        if doc:
            source_type = "document"
            source_id = doc.id
            topic_title = doc.filename
            # Extract sample text from chunks
            source_content = "\n\n".join([c.content for c in doc.chunks[:10]])

    items_data = generate_flashcards_ai(
        content=source_content,
        topic=topic_title,
        count=max(3, min(req.count, 12))
    )

    deck = Flashcard(
        student_id=student.id,
        title=f"Deck: {topic_title}",
        topic=topic_title,
        source_type=source_type,
        source_id=source_id,
    )
    db.add(deck)
    db.flush()

    for item in items_data:
        f_item = FlashcardItem(
            flashcard_id=deck.id,
            front_text=item["front_text"],
            back_text=item["back_text"],
            difficulty=item.get("difficulty", "medium"),
            is_mastered=False,
        )
        db.add(f_item)

    db.commit()
    db.refresh(deck)

    award_badge(db, student.id, "FLASHCARD_WIZARD")
    return deck


@router.get("", response_model=List[FlashcardOut])
@router.get("/", response_model=List[FlashcardOut])
def get_student_flashcards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Get all flashcard decks owned by student."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return (
        db.query(Flashcard)
        .filter(Flashcard.student_id == student.id)
        .order_by(Flashcard.created_at.desc())
        .all()
    )


@router.get("/{flashcard_id}", response_model=FlashcardOut)
def get_flashcard_deck(
    flashcard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Get a specific flashcard deck and all its question-answer cards."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    deck = (
        db.query(Flashcard)
        .filter(Flashcard.id == flashcard_id, Flashcard.student_id == student.id)
        .first()
    )
    if not deck:
        raise HTTPException(status_code=404, detail="Flashcard deck not found")
    return deck


@router.put("/items/{item_id}/master")
def toggle_flashcard_mastery(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Mark a flashcard as mastered or unmastered."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    item = (
        db.query(FlashcardItem)
        .join(Flashcard)
        .filter(FlashcardItem.id == item_id, Flashcard.student_id == student.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Flashcard item not found")

    item.is_mastered = not item.is_mastered
    db.commit()
    return {"id": item.id, "is_mastered": item.is_mastered}


@router.delete("/{flashcard_id}")
def delete_flashcard_deck(
    flashcard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Delete a flashcard deck."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    deck = (
        db.query(Flashcard)
        .filter(Flashcard.id == flashcard_id, Flashcard.student_id == student.id)
        .first()
    )
    if not deck:
        raise HTTPException(status_code=404, detail="Flashcard deck not found")

    db.delete(deck)
    db.commit()
    return {"message": "Flashcard deck deleted"}
