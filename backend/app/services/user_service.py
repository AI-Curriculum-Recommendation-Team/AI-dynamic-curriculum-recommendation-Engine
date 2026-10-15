import logging
import os
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.student import (
    Student, StudentSkill, AssessmentResult, Curriculum,
    CurriculumWeek, Progress, Notification
)
from app.models.v2_models import (
    TopicQuiz, QuizQuestion, QuizAttempt, Achievement, WeeklyReport
)
from app.models.v3_models import (
    Document, DocumentChunk, ChatSession, ChatMessage,
    Flashcard, FlashcardItem, StudentNote
)
from app.models.v4_models import (
    Resume, ResumeSkill, CurriculumRecalibration,
    CurriculumCodingChallenge, CodingSubmission, CareerReadiness
)

logger = logging.getLogger("uvicorn.error")


def cleanup_student_learning_data(student_id: int, db: Session, keep_profile: bool = True):
    """
    Cleans up all learning records for a student adhering to all foreign key constraints.
    - If keep_profile is True: keeps the Student record itself and resets career_goal_id = None.
    - If keep_profile is False: also removes the Student record.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return

    try:
        # Collect curricula and week IDs for this student
        curricula_ids = [c.id for c in db.query(Curriculum.id).filter(Curriculum.student_id == student_id).all()]
        week_ids = []
        if curricula_ids:
            week_ids = [w.id for w in db.query(CurriculumWeek.id).filter(CurriculumWeek.curriculum_id.in_(curricula_ids)).all()]

        # 1. Delete Coding Submissions & Coding Challenges
        # Coding submissions reference coding challenges and student
        db.query(CodingSubmission).filter(CodingSubmission.student_id == student_id).delete(synchronize_session=False)
        if week_ids:
            challenge_subquery = db.query(CurriculumCodingChallenge.id).filter(CurriculumCodingChallenge.curriculum_week_id.in_(week_ids))
            db.query(CodingSubmission).filter(CodingSubmission.challenge_id.in_(challenge_subquery)).delete(synchronize_session=False)

        # Challenges reference curriculum_weeks
        db.query(CurriculumCodingChallenge).filter(CurriculumCodingChallenge.student_id == student_id).delete(synchronize_session=False)
        if week_ids:
            db.query(CurriculumCodingChallenge).filter(CurriculumCodingChallenge.curriculum_week_id.in_(week_ids)).delete(synchronize_session=False)

        # 2. Delete Quizzes (QuizAttempts -> QuizQuestions -> TopicQuizzes)
        # TopicQuiz references curriculum_weeks.id
        quiz_ids = []
        if week_ids:
            quiz_ids = [q.id for q in db.query(TopicQuiz.id).filter(TopicQuiz.week_id.in_(week_ids)).all()]

        # Quiz attempts
        db.query(QuizAttempt).filter(QuizAttempt.student_id == student_id).delete(synchronize_session=False)
        if quiz_ids:
            db.query(QuizAttempt).filter(QuizAttempt.quiz_id.in_(quiz_ids)).delete(synchronize_session=False)
            db.query(QuizQuestion).filter(QuizQuestion.quiz_id.in_(quiz_ids)).delete(synchronize_session=False)
            db.query(TopicQuiz).filter(TopicQuiz.id.in_(quiz_ids)).delete(synchronize_session=False)

        # 3. Delete Progress records
        db.query(Progress).filter(Progress.student_id == student_id).delete(synchronize_session=False)
        if week_ids:
            db.query(Progress).filter(Progress.curriculum_week_id.in_(week_ids)).delete(synchronize_session=False)

        # 4. Delete Chat Messages & Sessions
        session_ids = [s.id for s in db.query(ChatSession.id).filter(
            (ChatSession.student_id == student_id) | (ChatSession.curriculum_week_id.in_(week_ids) if week_ids else False)
        ).all()]
        if session_ids:
            db.query(ChatMessage).filter(ChatMessage.session_id.in_(session_ids)).delete(synchronize_session=False)
            db.query(ChatSession).filter(ChatSession.id.in_(session_ids)).delete(synchronize_session=False)

        # 5. Delete Student Notes
        notes_filter = (StudentNote.student_id == student_id)
        if week_ids:
            notes_filter = notes_filter | (StudentNote.curriculum_week_id.in_(week_ids))
        db.query(StudentNote).filter(notes_filter).delete(synchronize_session=False)

        # 6. Delete Recalibrations (they reference curricula.id and students.id)
        recal_filter = (CurriculumRecalibration.student_id == student_id)
        if curricula_ids:
            recal_filter = recal_filter | (CurriculumRecalibration.curriculum_id.in_(curricula_ids))
        db.query(CurriculumRecalibration).filter(recal_filter).delete(synchronize_session=False)

        # 7. Now safe to delete Curriculum Weeks & Curricula
        if curricula_ids:
            db.query(CurriculumWeek).filter(CurriculumWeek.curriculum_id.in_(curricula_ids)).delete(synchronize_session=False)
        db.query(Curriculum).filter(Curriculum.student_id == student_id).delete(synchronize_session=False)

        # 8. Delete Flashcard Items & Decks
        deck_ids = [d.id for d in db.query(Flashcard.id).filter(Flashcard.student_id == student_id).all()]
        if deck_ids:
            db.query(FlashcardItem).filter(FlashcardItem.flashcard_id.in_(deck_ids)).delete(synchronize_session=False)
            db.query(Flashcard).filter(Flashcard.student_id == student_id).delete(synchronize_session=False)

        # 9. Delete Document Chunks, physical files, and Documents
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

        # 10. Delete Resumes and physical files
        resumes = db.query(Resume).filter(Resume.student_id == student_id).all()
        for r in resumes:
            if r.file_path and os.path.exists(r.file_path):
                try:
                    os.remove(r.file_path)
                except OSError:
                    pass
        resume_ids = [r.id for r in resumes]
        if resume_ids:
            db.query(ResumeSkill).filter(ResumeSkill.resume_id.in_(resume_ids)).delete(synchronize_session=False)
        db.query(ResumeSkill).filter(ResumeSkill.student_id == student_id).delete(synchronize_session=False)
        db.query(Resume).filter(Resume.student_id == student_id).delete(synchronize_session=False)

        # 11. Delete Career Readiness, Achievements, Weekly Reports, Assessments, Notifications, Student Skills
        db.query(CareerReadiness).filter(CareerReadiness.student_id == student_id).delete(synchronize_session=False)
        db.query(Achievement).filter(Achievement.student_id == student_id).delete(synchronize_session=False)
        db.query(WeeklyReport).filter(WeeklyReport.student_id == student_id).delete(synchronize_session=False)
        db.query(AssessmentResult).filter(AssessmentResult.student_id == student_id).delete(synchronize_session=False)
        db.query(Notification).filter(Notification.student_id == student_id).delete(synchronize_session=False)
        db.query(StudentSkill).filter(StudentSkill.student_id == student_id).delete(synchronize_session=False)

        # 12. Student profile handling
        if keep_profile:
            student.career_goal_id = None
            db.commit()
        else:
            db.delete(student)
            db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error during cleanup of student {student_id}: {e}", exc_info=True)
        raise


def delete_user_completely(user_id: int, db: Session):
    """
    Completely deletes a User and all associated Student records and learning data.
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False

        student = db.query(Student).filter(Student.user_id == user_id).first()
        if student:
            cleanup_student_learning_data(student.id, db, keep_profile=False)

        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting user {user_id}: {e}", exc_info=True)
        raise

