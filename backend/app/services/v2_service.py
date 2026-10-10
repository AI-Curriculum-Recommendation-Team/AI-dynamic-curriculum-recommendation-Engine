"""
V2 Service logic: Achievement badges, notification triggers, and curriculum adaptation helpers.
"""
from sqlalchemy.orm import Session
from app.models.v2_models import Achievement
from app.models.student import Notification


BADGE_DEFINITIONS = {
    "FIRST_STEP": {
        "name": "First Step",
        "description": "Selected your target career goal and created your student profile",
        "icon": "target",
    },
    "DIAGNOSTIC_ACE": {
        "name": "Diagnostic Ace",
        "description": "Completed your baseline skill assessment quiz",
        "icon": "compass",
    },
    "ROADMAP_INIT": {
        "name": "Roadmap Champion",
        "description": "Generated your personalized AI multi-week curriculum roadmap",
        "icon": "map",
    },
    "QUIZ_APPRENTICE": {
        "name": "Quiz Apprentice",
        "description": "Attempted your first adaptive topic quiz",
        "icon": "brain",
    },
    "MASTERY_HERO": {
        "name": "Mastery Hero",
        "description": "Scored 80%+ mastery on an adaptive quiz and unlocked the next topic",
        "icon": "award",
    },
    "KNOWLEDGE_EXPLORER": {
        "name": "Knowledge Explorer",
        "description": "Uploaded study material into your AI Vector Knowledge Base",
        "icon": "file-text",
    },
    "FLASHCARD_WIZARD": {
        "name": "Flashcard Wizard",
        "description": "Generated and reviewed interactive AI flashcard sets",
        "icon": "layers",
    },
}


def award_badge(db: Session, student_id: int, badge_key: str) -> bool:
    """Award an achievement badge to a student if not already earned."""
    if badge_key not in BADGE_DEFINITIONS:
        return False

    existing = (
        db.query(Achievement)
        .filter(Achievement.student_id == student_id, Achievement.badge_key == badge_key)
        .first()
    )
    if existing:
        return False

    meta = BADGE_DEFINITIONS[badge_key]
    badge = Achievement(
        student_id=student_id,
        badge_key=badge_key,
        badge_name=meta["name"],
        description=meta["description"],
        icon=meta["icon"],
    )
    db.add(badge)

    # Also notify student
    notif = Notification(
        student_id=student_id,
        title=f"🏆 Achievement Unlocked: {meta['name']}!",
        message=meta["description"],
        type="success",
    )
    db.add(notif)
    db.commit()
    return True
