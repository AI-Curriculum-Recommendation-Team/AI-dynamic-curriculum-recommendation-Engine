import os
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.student import (
    Student, StudentSkill, AssessmentResult, Curriculum,
    CurriculumWeek, Progress, Notification
)
from app.models.v2_models import QuizAttempt, Achievement, WeeklyReport
from app.models.v3_models import (
    Document, DocumentChunk, ChatSession, ChatMessage,
    Flashcard, FlashcardItem, StudentNote
)
from app.models.v4_models import (
    Resume, ResumeSkill, CurriculumRecalibration,
    CurriculumCodingChallenge, CodingSubmission, CareerReadiness
)


def cleanup_student_learning_data(student_id: int, db: Session, keep_profile: bool = True):
    """
    Cleans up all learning records for a student.
    - If keep_profile is True: keeps the Student record itself and resets career_goal_id = None.
    - If keep_profile is False: also removes the Student record.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return

    # 1. Delete Chat Messages & Sessions
    session_ids = [s.id for s in db.query(ChatSession.id).filter(ChatSession.student_id == student_id).all()]
    if session_ids:
        db.query(ChatMessage).filter(ChatMessage.session_id.in_(session_ids)).delete(synchronize_session=False)
        db.query(ChatSession).filter(ChatSession.student_id == student_id).delete(synchronize_session=False)

    # 2. Delete Flashcard Items & Decks
    deck_ids = [d.id for d in db.query(Flashcard.id).filter(Flashcard.student_id == student_id).all()]
    if deck_ids:
        db.query(FlashcardItem).filter(FlashcardItem.flashcard_id.in_(deck_ids)).delete(synchronize_session=False)
        db.query(Flashcard).filter(Flashcard.student_id == student_id).delete(synchronize_session=False)

    # 3. Delete Student Notes
    db.query(StudentNote).filter(StudentNote.student_id == student_id).delete(synchronize_session=False)

    # 4. Delete Document Chunks, physical files, and Documents
    docs = db.query(Document).filter(Document.student_id == student_id).all()
    for doc in docs:
        if doc.file_path and os.path.exists(doc.file_path):
            try:
                os.remove(doc.file_path)
            except OSError:
                pass
    doc_ids = [doc.id for doc in docs]
    if doc_ids:
        db.query(DocumentChunk).filter(DocumentChunk.document_id.in_(doc_ids)).delete(synchronize_session=False)
        db.query(Document).filter(Document.student_id == student_id).delete(synchronize_session=False)

    # 5. Delete V2 Quiz Attempts, Achievements, Weekly Reports
    db.query(QuizAttempt).filter(QuizAttempt.student_id == student_id).delete(synchronize_session=False)
    db.query(Achievement).filter(Achievement.student_id == student_id).delete(synchronize_session=False)
    db.query(WeeklyReport).filter(WeeklyReport.student_id == student_id).delete(synchronize_session=False)

    # 6. Delete Progress records
    db.query(Progress).filter(Progress.student_id == student_id).delete(synchronize_session=False)

    # 7. Delete Curricula & Weeks
    curricula_ids = [c.id for c in db.query(Curriculum.id).filter(Curriculum.student_id == student_id).all()]
    if curricula_ids:
        db.query(CurriculumWeek).filter(CurriculumWeek.curriculum_id.in_(curricula_ids)).delete(synchronize_session=False)
        db.query(Curriculum).filter(Curriculum.student_id == student_id).delete(synchronize_session=False)

    # 8. Delete Assessment Results, Notifications, Student Skills
    db.query(AssessmentResult).filter(AssessmentResult.student_id == student_id).delete(synchronize_session=False)
    db.query(Notification).filter(Notification.student_id == student_id).delete(synchronize_session=False)
    db.query(StudentSkill).filter(StudentSkill.student_id == student_id).delete(synchronize_session=False)

    # 9. Delete V4 Coding Submissions & Challenges
    db.query(CodingSubmission).filter(CodingSubmission.student_id == student_id).delete(synchronize_session=False)
    db.query(CurriculumCodingChallenge).filter(CurriculumCodingChallenge.student_id == student_id).delete(synchronize_session=False)

    # 10. Delete V4 Recalibrations, Resumes, and Career Readiness
    db.query(CurriculumRecalibration).filter(CurriculumRecalibration.student_id == student_id).delete(synchronize_session=False)
    db.query(CareerReadiness).filter(CareerReadiness.student_id == student_id).delete(synchronize_session=False)

    resume_ids = [r.id for r in db.query(Resume.id).filter(Resume.student_id == student_id).all()]
    if resume_ids:
        db.query(ResumeSkill).filter(ResumeSkill.resume_id.in_(resume_ids)).delete(synchronize_session=False)
        db.query(Resume).filter(Resume.student_id == student_id).delete(synchronize_session=False)

    if keep_profile:
        student.career_goal_id = None
        db.commit()
    else:
        db.delete(student)
        db.commit()


def delete_user_completely(user_id: int, db: Session):
    """
    Completely deletes a User and all associated Student records.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False

    student = db.query(Student).filter(Student.user_id == user_id).first()
    if student:
        cleanup_student_learning_data(student.id, db, keep_profile=False)

    db.delete(user)
    db.commit()
    return True
