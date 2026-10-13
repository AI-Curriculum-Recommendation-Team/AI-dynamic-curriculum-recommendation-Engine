"""
Database Migration Script: SQLite -> Cloud PostgreSQL
Transfers all data from local curriculum.db to your Cloud PostgreSQL database.

Usage:
    python backend/migrate_to_cloud.py
    # or pass target DB URL explicitly:
    python backend/migrate_to_cloud.py "postgresql://user:pass@host:5432/dbname"
"""

import sys
import os
import sqlite3
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.core.config import settings
from app.core.database import Base
# Import all models to ensure metadata is complete
import app.models  # noqa: F401


# Ordered table list to respect foreign key constraints
ORDERED_TABLES = [
    "users",
    "skills",
    "career_goals",
    "students",
    "student_skills",
    "assessments",
    "assessment_questions",
    "assessment_results",
    "curricula",
    "curriculum_weeks",
    "progress",
    "notifications",
    "topic_quizzes",
    "quiz_questions",
    "quiz_attempts",
    "weekly_reports",
    "achievements",
    "documents",
    "document_chunks",
    "chat_sessions",
    "chat_messages",
    "flashcards",
    "flashcard_items",
    "student_notes",
]


def find_sqlite_file() -> Path:
    candidates = [
        backend_dir / "curriculum.db",
        backend_dir.parent / "curriculum.db",
        Path("curriculum.db"),
    ]
    for p in candidates:
        if p.exists() and p.is_file():
            return p.resolve()
    raise FileNotFoundError("Could not find local curriculum.db in backend/ or root directory.")


def get_target_url() -> str:
    if len(sys.argv) > 1 and sys.argv[1].startswith(("postgres://", "postgresql://")):
        return sys.argv[1]
    
    url = settings.DATABASE_URL
    if not url or url.startswith("sqlite"):
        raise ValueError(
            "Target DATABASE_URL is not set to PostgreSQL.\n"
            "Provide it as argument: python backend/migrate_to_cloud.py \"postgresql://...\"\n"
            "or set DATABASE_URL in backend/.env"
        )
    return url


import urllib.parse


def normalize_database_url(url: str) -> str:
    """Normalize and URL-encode password if it contains special characters like @."""
    if not url:
        return url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    if url.startswith("postgresql://") and "@" in url:
        try:
            scheme, rest = url.split("://", 1)
            # The last @ separates user:password from host:port/dbname
            credentials, host_db = rest.rsplit("@", 1)
            if ":" in credentials:
                user, password = credentials.split(":", 1)
                encoded_password = urllib.parse.quote_plus(urllib.parse.unquote(password))
                return f"{scheme}://{user}:{encoded_password}@{host_db}"
        except Exception:
            pass
    return url


import json
from datetime import datetime
from sqlalchemy import Boolean, DateTime, JSON


def coerce_row(table_name: str, row_dict: dict) -> dict:
    table = Base.metadata.tables.get(table_name)
    if table is None:
        return row_dict

    coerced = {}
    for col in table.columns:
        cname = col.name
        if cname not in row_dict:
            continue
        val = row_dict[cname]
        if val is None:
            coerced[cname] = None
            continue

        # SQLite stores booleans as 1/0 integers -> cast to bool
        if isinstance(col.type, Boolean):
            coerced[cname] = bool(val)
        # SQLite stores JSON as string -> parse to dict/list
        elif isinstance(col.type, JSON):
            if isinstance(val, str):
                try:
                    coerced[cname] = json.loads(val)
                except Exception:
                    coerced[cname] = val
            else:
                coerced[cname] = val
        # SQLite stores DateTime as string -> parse to datetime object
        elif isinstance(col.type, DateTime):
            if isinstance(val, str):
                try:
                    coerced[cname] = datetime.fromisoformat(val)
                except Exception:
                    coerced[cname] = val
            else:
                coerced[cname] = val
        else:
            coerced[cname] = val
    return coerced


def migrate():
    sqlite_path = find_sqlite_file()
    print(f"[*] Source SQLite database: {sqlite_path}")

    raw_target_url = normalize_database_url(get_target_url())

    # Mask password for display
    display_url = raw_target_url
    if "@" in display_url and ":" in display_url:
        prefix, rest = display_url.rsplit("@", 1)
        scheme_user = prefix.split(":", 2)[:2]
        display_url = f"{':'.join(scheme_user)}:****@{rest}"
    print(f"[*] Target Cloud Database: {display_url}")

    # Connect to target Postgres
    target_engine = create_engine(
        raw_target_url,
        pool_pre_ping=True,
        connect_args={"sslmode": "require"} if "localhost" not in raw_target_url else {}
    )

    print("\n[*] Initializing target schema (creating tables if not exist)...")
    Base.metadata.create_all(bind=target_engine)
    print("[+] Target schema verified.")

    # Connect to SQLite
    sqlite_conn = sqlite3.connect(str(sqlite_path))
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    # Discover tables present in SQLite
    sqlite_cursor.execute("SELECT tbl_name FROM sqlite_master WHERE type='table'")
    available_tables = {row[0] for row in sqlite_cursor.fetchall()}

    tables_to_migrate = [t for t in ORDERED_TABLES if t in available_tables]
    # Add any extra tables that exist in SQLite but not in the predefined list
    for t in sorted(available_tables - set(ORDERED_TABLES)):
        if not t.startswith("sqlite_"):
            tables_to_migrate.append(t)

    print(f"\n[*] Found {len(tables_to_migrate)} tables to migrate.")
    print("-" * 60)
    print(f"{'Table':<25} {'SQLite Rows':<15} {'Status':<15}")
    print("-" * 60)

    total_rows = 0

    with target_engine.begin() as pg_conn:
        for table_name in tables_to_migrate:
            sqlite_cursor.execute(f"SELECT * FROM {table_name}")
            rows = sqlite_cursor.fetchall()
            row_count = len(rows)

            if row_count == 0:
                print(f"{table_name:<25} {row_count:<15} [SKIPPED - EMPTY]")
                continue

            # Convert and coerce rows
            data = [coerce_row(table_name, dict(row)) for row in rows]

            table_obj = Base.metadata.tables.get(table_name)
            if table_obj is not None:
                stmt = pg_insert(table_obj).on_conflict_do_nothing()
            else:
                columns = [desc[0] for desc in sqlite_cursor.description]
                cols_clause = ", ".join(f'"{c}"' for c in columns)
                bind_clause = ", ".join(f":{c}" for c in columns)
                stmt = text(
                    f'INSERT INTO "{table_name}" ({cols_clause}) '
                    f'VALUES ({bind_clause}) '
                    f'ON CONFLICT DO NOTHING'
                )

            pg_conn.execute(stmt, data)
            total_rows += row_count
            print(f"{table_name:<25} {row_count:<15} [COPIED OK]")

        # Reset serial sequences for tables with an 'id' column in Postgres
        print("\n[*] Synchronizing PostgreSQL ID sequences...")
        for table_name in tables_to_migrate:
            try:
                pg_conn.execute(text(
                    f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), "
                    f"coalesce((SELECT MAX(id) FROM \"{table_name}\"), 1), true);"
                ))
            except Exception:
                # Table might not use a serial sequence or 'id' column
                pass

    sqlite_conn.close()
    print("-" * 60)
    print(f"[SUCCESS] Migration completed! Transferred {total_rows} total rows to Cloud PostgreSQL.")
    print("Your cloud database is now fully populated with your application data!\n")


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    try:
        migrate()
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        sys.exit(1)
