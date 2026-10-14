import { useEffect, useState } from 'react';
import { Play, Lightbulb, CheckCircle2, XCircle, Code2, Clock, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { codingLabService } from '../../services';
import type { CodingChallenge, CodingSubmissionResult } from '../../types';
import './CodingLabPage.css';

export default function CodingLabPage() {
  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CodingSubmissionResult | null>(null);

  // Hints
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [hintsList, setHintsList] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    setLoading(true);
    try {
      const data = await codingLabService.getCurrentWeekChallenge();
      setChallenge(data);
      const initialCode = data.starter_code?.[language] || data.starter_code?.python || '# Write solution here\n';
      setCode(initialCode);
      if (data.latest_submission) {
        setResult({
          submission_id: data.latest_submission.id,
          passed: data.latest_submission.passed,
          score: data.latest_submission.score,
          tests_passed: data.latest_submission.passed ? data.visible_test_cases.length : 0,
          tests_total: data.visible_test_cases.length,
          time_complexity_detected: data.latest_submission.time_complexity,
          ai_review: data.latest_submission.ai_review || '',
        });
      }
    } catch {
      toast.error('Failed to load coding challenge. Ensure you have an active curriculum.');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'cpp') => {
    setLanguage(newLang);
    if (challenge?.starter_code?.[newLang]) {
      setCode(challenge.starter_code[newLang]);
    }
  };

  const handleRevealHint = async () => {
    if (hintsList.length === 0 && challenge) {
      setLoadingHints(true);
      try {
        const res = await codingLabService.getHints(challenge.id);
        setHintsList(res.hints || []);
        setRevealedHints(1);
      } catch {
        toast.error('Could not load hints.');
      } finally {
        setLoadingHints(false);
      }
    } else {
      setRevealedHints(prev => Math.min(prev + 1, hintsList.length));
    }
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    if (!code.trim()) {
      toast.error('Please write some code before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await codingLabService.submit(challenge.id, code, language);
      setResult(res);
      if (res.passed) {
        toast.success(`Passed all test cases! Score: ${res.score}% 🎉`);
      } else {
        toast.error(`Solution failed some test cases (${res.tests_passed}/${res.tests_total}). Check AI review.`);
      }
    } catch {
      toast.error('Submission evaluation failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="page-container container">
        <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
          <Code2 size={48} className="text-muted mx-auto mb-3" />
          <h2>No Active Coding Lab</h2>
          <p className="text-secondary mt-2 max-w-md mx-auto">
            Choose a Career Goal to generate an active curriculum with weekly hands-on coding labs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="page-header animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-indigo">Week {challenge.curriculum_week_id || 1} Practical Lab</span>
            <span className={`badge ${challenge.difficulty === 'Easy' ? 'badge-emerald' : challenge.difficulty === 'Hard' ? 'badge-rose' : 'badge-amber'}`}>
              {challenge.difficulty}
            </span>
          </div>
          <h1 className="page-title">{challenge.title}</h1>
          <p className="page-subtitle">
            Curriculum Topic: <strong className="text-primary">{challenge.topic}</strong>
          </p>
        </div>

        {/* Split Layout: Problem Statement on Left, Code Workspace on Right */}
        <div className="coding-lab-layout">
          {/* Left: Problem Statement & Test Cases */}
          <div className="problem-panel">
            <div className="card-3d">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <Code2 size={18} className="text-indigo-500" /> Problem Statement
              </h3>
              <div className="problem-description mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                {challenge.problem_statement}
              </div>

              {challenge.constraints && (
                <div className="mb-4">
                  <h4 className="text-xs uppercase font-bold text-muted tracking-wider mb-1.5">Constraints</h4>
                  <div className="text-xs text-secondary font-mono" style={{ whiteSpace: 'pre-wrap' }}>
                    {challenge.constraints}
                  </div>
                </div>
              )}

              <h4 className="text-xs uppercase font-bold text-muted tracking-wider mb-2">Visible Examples</h4>
              {challenge.visible_test_cases.map((tc, idx) => (
                <div key={idx} className="test-case-box">
                  <div><strong>Input:</strong> <code>{tc.input}</code></div>
                  <div><strong>Expected Output:</strong> <code>{tc.expected_output}</code></div>
                  {tc.explanation && (
                    <div className="text-xs text-muted mt-1"><em>Explanation: {tc.explanation}</em></div>
                  )}
                </div>
              ))}
            </div>

            {/* Socratic Hints Box */}
            <div className="hints-container card-3d">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Lightbulb size={18} style={{ color: 'var(--clr-amber-500)' }} />
                  <span className="text-sm font-bold">Progressive Socratic Hints</span>
                </div>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={handleRevealHint}
                  disabled={loadingHints || revealedHints >= 3}
                  id="reveal-hint-btn"
                >
                  {loadingHints ? 'Loading...' : revealedHints === 0 ? 'Need a Hint?' : revealedHints < 3 ? 'Next Hint' : 'All Hints Revealed'}
                </button>
              </div>

              {revealedHints > 0 && (
                <div className="mt-3">
                  {hintsList.slice(0, revealedHints).map((hint, idx) => (
                    <div key={idx} className="hint-item flex items-start gap-2">
                      <span className="badge badge-amber text-xs">Hint {idx + 1}</span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Code Workspace */}
          <div className="editor-panel">
            <div className="editor-toolbar">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted uppercase">Language:</span>
                <select
                  className="form-input form-select text-xs py-1 px-2.5"
                  style={{ width: 'auto' }}
                  value={language}
                  onChange={e => handleLanguageChange(e.target.value as any)}
                  id="code-language-select"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="cpp">C++ 20</option>
                </select>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={submitting}
                id="submit-code-btn"
              >
                {submitting ? (
                  <div className="spinner" style={{ width: 14, height: 14 }} />
                ) : (
                  <>
                    <Play size={14} /> Submit & Evaluate
                  </>
                )}
              </button>
            </div>

            {/* Code Textarea */}
            <textarea
              className="code-textarea"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="# Write your solution here..."
              spellCheck={false}
              id="code-editor-textarea"
            />

            {/* Results & AI Code Review Card */}
            {result && (
              <div className={`review-card ${result.passed ? 'success' : 'fail'} animate-fade-up`}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <XCircle size={20} className="text-rose-500" />
                    )}
                    <span className="font-bold text-sm">
                      {result.passed ? 'All Test Cases Passed!' : 'Some Test Cases Failed'}
                    </span>
                    <span className="badge badge-indigo text-xs">Score: {result.score}%</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted">
                    {result.time_complexity_detected && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} /> {result.time_complexity_detected}
                      </span>
                    )}
                    {result.space_complexity_detected && (
                      <span className="flex items-center gap-1 font-mono">
                        <Cpu size={12} /> {result.space_complexity_detected}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-secondary mt-2 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                  <strong>AI Code Review:</strong> {result.ai_review}
                </div>

                {result.solution_explanation && (
                  <div className="text-xs text-muted mt-2 pt-2 border-t border-color">
                    <strong>Optimal Solution Rationale:</strong> {result.solution_explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
