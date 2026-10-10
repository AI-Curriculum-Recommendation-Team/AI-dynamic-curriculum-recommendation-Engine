from fastapi import APIRouter
from app.api.v2 import quiz, curriculum, reports, notifications, achievements

router = APIRouter(prefix="/v2")
router.include_router(quiz.router)
router.include_router(curriculum.router)
router.include_router(reports.router)
router.include_router(notifications.router)
router.include_router(achievements.router)
