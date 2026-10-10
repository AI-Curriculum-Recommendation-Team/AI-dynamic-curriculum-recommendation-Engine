import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assessmentService } from '../../services';
import { useStudentStore } from '../../store';
import type { Assessment } from '../../types';
import GuidedJourneyFlow from '../../components/GuidedJourneyFlow/GuidedJourneyFlow';
import { Check, ArrowRight, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import './AssessmentPage.css';

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { student } = useStudentStore();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!student?.career_goal_id) {
      toast.error('Please select a career goal first');
      navigate('/career');
      return;
    }
    assessmentService.getAssessment(student.career_goal_id)
      .then(setAssessment)
      .catch(() => toast.error('Failed to load assessment'))
      .finally(() => setLoading(false));
  }, [student, navigate]);

  const question = assessment?.questions[current];
  const total = assessment?.questions.length || 0;
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;
  const isAnswered = question ? answers[question.id] !== undefined : false;

  const handleAnswer = useCallback((qId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  }, []);

  const handleNext = useCallback(() => {
    if (current < total - 1) setCurrent(c => c + 1);
  }, [current, total]);

  const handlePrev = useCallback(() => {
    if (current > 0) setCurrent(c => c - 1);
  }, [current]);

  const handleSubmit = async () => {
    if (!assessment) return;
    if (Object.keys(answers).length < total) {
      toast.error(`Please answer all ${total} questions before submitting`);
      return;
    }
    setSubmitting(true);
    try {
      const result = await assessmentService.submitAssessment({
        assessment_id: assessment.id,
        answers,
      });
      toast.success('Assessment evaluated! Visualizing your skill gap 📊');
      navigate(`/results/${result.id}`);
    } catch {
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!question) return;
      const key = e.key.toUpperCase();
      // Numbers 1-4 or letters A-D
      const num = parseInt(key);
      if (!isNaN(num) && num >= 1 && num <= question.options.length) {
        handleAnswer(question.id, question.options[num - 1]);
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        if (idx < question.options.length) {
          handleAnswer(question.id, question.options[idx]);
        }
      } else if (e.key === 'Enter' && isAnswered) {
        if (current < total - 1) {
          handleNext();
        } else if (Object.keys(answers).length === total) {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [question, isAnswered, current, total, answers, handleAnswer, handleNext]);

  // Clean option parser: returns { letter, text }
  const parseOption = (raw: string, index: number) => {
    const fallbackLetter = String.fromCharCode(65 + index);
    const match = raw.match(/^([A-Da-d0-9])[.)]\s*(.*)$/);
    if (match) {
      return { letter: match[1].toUpperCase(), text: match[2] };
    }
    return { letter: fallbackLetter, text: raw };
  };

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="card-3d text-center p-6" style={{ maxWidth: 360 }}>
          <div className="spinner mb-4" style={{ width: 44, height: 44, margin: '0 auto 1rem auto' }} />
          <p className="text-secondary text-sm font-semibold">Loading Skill Assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="page-container container">
        <div className="card-3d text-center" style={{ padding: '3rem' }}>
          <h2>No Assessment Found</h2>
          <p className="mt-2 text-secondary">No assessment available for your career goal yet.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/career')}>
            Choose Career Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Unified Journey Flow: Stage 2 */}
        <GuidedJourneyFlow currentStep={2} careerTitle={student?.career_goal?.title} />

        <div className="assessment-content-wrap" style={{ maxWidth: 880, margin: '0 auto' }}>
          <div className="page-header animate-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <span className="badge badge-indigo flex items-center gap-1">
              <Brain size={14} /> Diagnostic Skill Assessment
            </span>
            <span className="text-xs text-muted">Use mouse cursor or keys 1-4 / A-D</span>
          </div>
          <h1 className="page-title">{assessment.title}</h1>
          <p className="page-subtitle">Question {current + 1} of {total}</p>
        </div>

        {/* Progress Bar & Question Dots */}
        <div className="assessment-progress animate-fade-up delay-100">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">{Math.round(progress)}% Complete</span>
            <span className="text-sm text-muted">{Object.keys(answers).length}/{total} answered</span>
          </div>
          <div className="progress-bar-wrap" style={{ height: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="question-dots">
            {assessment.questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                className={`q-dot ${i === current ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                onClick={() => setCurrent(i)}
                id={`q-dot-${i}`}
                title={`Go to Question ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Interactive 3D Question Card */}
        {question && (
          <div className="card-3d question-card animate-fade-up delay-200" key={question.id}>
            <div className="question-header">
              <div className="flex items-center justify-between">
                <span className={`badge badge-${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty.toUpperCase()}
                </span>
                <span className="text-xs text-muted">Target Skill: <strong className="text-primary">{question.skill?.name || 'Core'}</strong></span>
              </div>
            </div>

            <h2 className="question-text">{question.question_text}</h2>

            {/* Answer Options Grid with Guaranteed Cursor Selection */}
            <div className="options-grid" role="radiogroup" aria-label="Question choices">
              {question.options.map((opt, idx) => {
                const isSelected = answers[question.id] === opt;
                const { letter, text } = parseOption(opt, idx);

                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswer(question.id, opt)}
                    id={`option-${letter.toLowerCase()}`}
                  >
                    <div className="option-letter-badge">
                      <span>{letter}</span>
                    </div>

                    <div className="option-content-text">
                      {text}
                    </div>

                    <div className="option-selection-indicator">
                      {isSelected ? <Check size={16} className="text-white" /> : <div className="option-radio-circle" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="question-nav">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handlePrev}
                disabled={current === 0}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {current < total - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!isAnswered}
                  id="next-question-btn"
                >
                  Next Question <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-glow"
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length < total}
                  id="submit-assessment-btn"
                >
                  {submitting ? (
                    <div className="spinner" />
                  ) : (
                    <>
                      <Sparkles size={16} /> Complete & Analyze Skills
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function getDifficultyColor(d: string) {
  return d === 'easy' ? 'emerald' : d === 'hard' ? 'rose' : 'amber';
}
