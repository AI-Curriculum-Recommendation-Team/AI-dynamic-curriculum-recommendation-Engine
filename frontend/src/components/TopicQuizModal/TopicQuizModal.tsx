import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight, Brain, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { curriculumService } from '../../services';
import type { Quiz, QuizSubmitResult } from '../../types';
import './TopicQuizModal.css';

interface Props {
  weekId: number;
  topicTitle: string;
  onClose: () => void;
  onAdapted: () => void;
}

export default function TopicQuizModal({ weekId, topicTitle, onClose, onAdapted }: Props) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  useEffect(() => {
    curriculumService.getTopicQuiz(weekId)
      .then(setQuiz)
      .catch(() => {
        toast.error('Failed to generate quiz for this topic');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [weekId]);

  const handleSelectOption = (opt: string) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: opt }));
  };

  const calculateAndSubmit = async () => {
    if (!quiz) return;
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      const selected = answers[idx] || '';
      // check if selected option matches correct answer
      if (selected.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
        correctCount += 1;
      }
    });

    const scorePct = (correctCount / quiz.questions.length) * 100;
    setSubmitting(true);
    try {
      const res = await curriculumService.submitTopicQuiz(weekId, scorePct, topicTitle);
      setResult(res);
      onAdapted();
      if (res.action === 'advanced') {
        toast.success(`🎉 Mastered with ${scorePct.toFixed(0)}%! Advanced to next topic.`);
      } else if (res.action === 'remedial_added') {
        toast.error(`Score: ${scorePct.toFixed(0)}%. Targeted practice resources added!`);
      }
    } catch {
      toast.error('Failed to submit quiz score');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="card-3d quiz-modal-card text-center">
          <div className="flex justify-center mb-4">
            <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
          </div>
          <h3 className="gradient-text">Generating AI Quiz...</h3>
          <p className="text-sm text-secondary mt-2">Gemini AI is crafting adaptive questions for: "{topicTitle}"</p>
        </div>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) return null;

  const currentQ = quiz.questions[currentIdx];
  const isLast = currentIdx === quiz.questions.length - 1;
  const isAnswered = answers[currentIdx] !== undefined;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card-3d quiz-modal-card animate-fade-up">
        {/* Header */}
        <div className="quiz-modal-header">
          <div className="flex items-center gap-2">
            <span className="badge badge-indigo">V2 Adaptive Quiz</span>
            <span className="text-xs text-muted">Topic: {topicTitle}</span>
          </div>
          <button className="btn btn-ghost btn-sm close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {!result ? (
          <>
            {/* Progress bar */}
            <div className="quiz-progress-wrap mt-3">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
                <span>{Math.round(((currentIdx + 1) / quiz.questions.length) * 100)}%</span>
              </div>
              <div className="progress-bar-wrap" style={{ height: 6 }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="quiz-q-body mt-4">
              <h3 className="quiz-question-title">{currentQ.question}</h3>

              <div className="quiz-options-list mt-4">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentIdx] === opt;
                  return (
                    <button
                      key={opt}
                      className={`quiz-opt-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(opt)}
                    >
                      <div className="quiz-opt-dot" />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav controls */}
            <div className="quiz-modal-footer mt-6">
              <button
                className="btn btn-ghost btn-sm"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(i => i - 1)}
              >
                Previous
              </button>

              {isLast ? (
                <button
                  className="btn btn-primary"
                  disabled={!isAnswered || submitting}
                  onClick={calculateAndSubmit}
                >
                  {submitting ? <div className="spinner" /> : <>Submit & Check Mastery <ArrowRight size={16} /></>}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  disabled={!isAnswered}
                  onClick={() => setCurrentIdx(i => i + 1)}
                >
                  Next Question
                </button>
              )}
            </div>
          </>
        ) : (
          /* Result & Adaptation Feedback */
          <div className="quiz-result-view text-center py-4">
            {result.action === 'advanced' ? (
              <div className="result-icon-wrap emerald">
                <CheckCircle2 size={54} color="var(--clr-emerald-500)" />
              </div>
            ) : (
              <div className="result-icon-wrap amber">
                <AlertTriangle size={54} color="var(--clr-amber-500)" />
              </div>
            )}

            <h2 className="mt-3">
              {result.action === 'advanced' ? 'Mastery Achieved!' : 'Adaptive Reinforcement Triggered'}
            </h2>
            <div className="score-badge gradient-text mt-2">
              {result.score_percentage.toFixed(0)}% Score
            </div>

            <p className="text-secondary mt-3" style={{ maxWidth: 440, margin: '0.75rem auto' }}>
              {result.message}
            </p>

            {result.action === 'remedial_added' && (
              <div className="card mt-4 text-left p-3" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-2 text-xs font-bold text-amber mb-2">
                  <Brain size={14} /> AI Curriculum Update Applied:
                </div>
                <div className="text-xs text-secondary">
                  Targeted practice exercises and conceptual deep-dives have been dynamically appended to your weekly resources.
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3 mt-6">
              <button className="btn btn-primary" onClick={onClose}>
                Continue Learning
              </button>
              {result.action !== 'advanced' && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentIdx(0);
                  }}
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
