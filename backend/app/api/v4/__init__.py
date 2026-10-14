from fastapi import APIRouter
from app.api.v4.curriculum_adaptive import router as curriculum_router
from app.api.v4.resume_adaptive import router as resume_router
from app.api.v4.companies_adaptive import router as companies_router
from app.api.v4.coding_adaptive import router as coding_router
from app.api.v4.readiness_adaptive import router as readiness_router

router = APIRouter(prefix="/v4")

router.include_router(curriculum_router)
router.include_router(resume_router)
router.include_router(companies_router)
router.include_router(coding_router)
router.include_router(readiness_router)
