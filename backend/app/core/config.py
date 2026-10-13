from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "AI Curriculum Recommendation Engine"
    VERSION: str = "3.0.0"
    API_V1_STR: str = "/api/v1"
    API_V2_STR: str = "/api/v2"
    API_V3_STR: str = "/api/v3"

    # Database
    DATABASE_URL: str = "postgresql://curriculum_user:curriculum_pass@localhost:5432/curriculum_db"

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # AI
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Admin
    ADMIN_EMAIL: str = "admin@example.com"

    @property
    def cors_origins(self) -> List[str]:
        origins = []
        try:
            val = self.BACKEND_CORS_ORIGINS.strip()
            if val.startswith("["):
                origins = json.loads(val)
            else:
                origins = [o.strip() for o in val.split(",") if o.strip()]
        except Exception:
            origins = ["http://localhost:5173"]

        if self.FRONTEND_URL and self.FRONTEND_URL.strip():
            url = self.FRONTEND_URL.strip().rstrip("/")
            if url not in origins:
                origins.append(url)
        return origins

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
