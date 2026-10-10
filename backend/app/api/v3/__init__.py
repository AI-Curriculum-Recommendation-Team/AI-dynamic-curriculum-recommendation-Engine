from fastapi import APIRouter
from app.api.v3 import documents, tutor, flashcards, notes

router = APIRouter(prefix="/v3")
router.include_router(documents.router)
router.include_router(tutor.router)
router.include_router(flashcards.router)
router.include_router(notes.router)
