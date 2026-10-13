import logging
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")


def normalize_database_url(url: str) -> str:
    """Normalize and URL-encode password if it contains special characters like @."""
    if not url:
        return url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    if url.startswith("postgresql://") and "@" in url:
        try:
            scheme, rest = url.split("://", 1)
            credentials, host_db = rest.rsplit("@", 1)
            if ":" in credentials:
                user, password = credentials.split(":", 1)
                encoded_password = urllib.parse.quote_plus(urllib.parse.unquote(password))
                return f"{scheme}://{user}:{encoded_password}@{host_db}"
        except Exception:
            pass
    return url


def get_engine():
    db_url = normalize_database_url(settings.DATABASE_URL)
    connect_args = {}
    engine_kwargs = {}

    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    else:
        engine_kwargs["pool_pre_ping"] = True
        engine_kwargs["pool_size"] = 5
        engine_kwargs["max_overflow"] = 10
        engine_kwargs["pool_recycle"] = 300

    try:
        eng = create_engine(db_url, connect_args=connect_args, **engine_kwargs)
        # Test connection
        with eng.connect():
            pass
        return eng
    except Exception as e:
        logger.warning(
            f"Could not connect to database at {db_url}: {e}. "
            "Falling back to local SQLite database (curriculum.db)..."
        )
        return create_engine(
            "sqlite:///./curriculum.db",
            connect_args={"check_same_thread": False},
        )

engine = get_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

