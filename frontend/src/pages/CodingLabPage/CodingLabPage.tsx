import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Play, CheckCircle2, XCircle, Code2, Clock, Cpu, Lightbulb, FileText, Check, Lock, Terminal, Sparkles, RotateCcw, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';
import { codingLabService } from '../../services';
import type { CodingChallenge, CodingSubmissionResult, CodingRunResult } from '../../types';
import './CodingLabPage.css';

export default function CodingLabPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [code, setCode] = useState('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'tests' | 'hints'>('description');

  // Execution states
  const [runningTests, setRunningTests] = useState(false);
  const [runResult, setRunResult] = useState<CodingRunResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CodingSubmissionResult | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'run' | 'submit'>('run');

  // Hints
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [hintsList, setHintsList] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);

  const weekIdParam = searchParams.get('week_id');
  const modeParam = searchParams.get('mode');

  useEffect(() => {
    loadChallenge();
  }, [weekIdParam, modeParam]);

  const loadChallenge = async (overrideWeekId?: number, overrideRandom?: boolean) => {
    setLoading(true);
    setRunResult(null);
    setResult(null);
    setRevealedHints(0);
    setHintsList([]);

    try {
      const isSpecificWeek = overrideWeekId !== undefined ? true : Boolean(weekIdParam);
      const targetWeekId = overrideWeekId !== undefined ? overrideWeekId : (weekIdParam ? Number(weekIdParam) : undefined);
      // When clicking Coding Lab from menu (no week_id) or mode=random, request a random learned topic challenge
      const isRandom = overrideRandom !== undefined ? overrideRandom : (!isSpecificWeek || modeParam === 'random');

      const data = await codingLabService.getCurrentWeekChallenge(targetWeekId, isRandom);
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
        setActiveConsoleTab('submit');
      }
    } catch {
      toast.error('Failed to load coding challenge. Ensure you have an active curriculum.');
    } finally {
      setLoading(false);
    }
  };

  const handleShuffleLearnedTopic = () => {
    setSearchParams({ mode: 'random' });
    loadChallenge(undefined, true);
  };

  const handleLanguageChange = (newLang: 'python' | 'javascript' | 'cpp') => {
    setLanguage(newLang);
    if (challenge?.starter_code?.[newLang]) {
      setCode(challenge.starter_code[newLang]);
    }
  };

  const handleResetCode = () => {
    if (challenge?.starter_code?.[language]) {
      setCode(challenge.starter_code[language]);
      toast.success('Code reset to starter template');
    }
  };

  const handleRevealHint = async () => {
    if (hintsList.length === 0 && challenge) {
      setLoadingHints(true);
      try {
        const res = await codingLabService.getHints(challenge.id);
        setHintsList(res.hints || []);
        setRevealedHints(1);
        setActiveLeftTab('hints');
      } catch {
        toast.error('Could not load hints.');
      } finally {
        setLoadingHints(false);
      }
    } else {
      setRevealedHints(prev => Math.min(prev + 1, hintsList.length));
      setActiveLeftTab('hints');
    }
  };

  const handleRunOpenTests = async () => {
    if (!challenge) return;
    if (!code.trim()) {
      toast.error('Please write code before running tests.');
      return;
    }

    setRunningTests(true);
    const toastId = toast.loading('Executing code against open test cases...');
    try {
      const res = await codingLabService.runCode(challenge.id, code, language);
      setRunResult(res);
      setActiveConsoleTab('run');
      if (res.all_passed) {
        toast.success(`Passed ${res.passed_count}/${res.total_count} visible test cases!`, { id: toastId });
      } else {
        toast.error(`Passed ${res.passed_count}/${res.total_count} visible test cases.`, { id: toastId });
      }
    } catch {
      toast.error('Failed to run test cases. Check syntax and try again.', { id: toastId });
    } finally {
      setRunningTests(false);
    }
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    if (!code.trim()) {
      toast.error('Please write some code before submitting.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Grading code & evaluating algorithmic complexity...');
    try {
      const res = await codingLabService.submit(challenge.id, code, language);
      setResult(res);
      setActiveConsoleTab('submit');
      if (res.passed) {
        toast.success(`All test cases passed! Score: ${res.score}% 🎉`, { id: toastId });
      } else {
        toast.error(`Some test cases failed (${res.tests_passed}/${res.tests_total}). Check AI review.`, { id: toastId });
      }
    } catch {
      toast.error('Submission evaluation failed. Try again.', { id: toastId });
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
        <div className="page-header animate-fade-up flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge badge-indigo">
                {challenge.week_number ? `Week ${challenge.week_number}` : challenge.curriculum_week_id ? `Week ${challenge.curriculum_week_id}` : 'Roadmap'} Practical Lab
              </span>
              <span className={`badge ${challenge.difficulty === 'Easy' ? 'badge-emerald' : challenge.difficulty === 'Hard' ? 'badge-rose' : 'badge-amber'}`}>
                {challenge.difficulty}
              </span>
              <span className="badge badge-purple">Learned Topic Practice</span>
            </div>
            <h1 className="page-title">{challenge.title}</h1>
            <p className="page-subtitle">
              Curriculum Topic: <strong className="text-primary">{challenge.topic}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary flex items-center gap-1.5"
              onClick={handleShuffleLearnedTopic}
              title="Practice a random topic you have learned in your roadmap"
              id="shuffle-learned-topic-btn"
            >
              <Shuffle size={14} className="text-indigo-400" /> Practice Another Topic
            </button>
          </div>
        </div>

        {/* Split Layout: Problem Statement on Left, Code Workspace on Right */}
        <div className="coding-lab-layout">
          {/* Left Column: Problem Tabs */}
          <div className="problem-panel">
            <div className="card-3d">
              {/* Tab Navigation */}
              <div className="panel-tabs-header">
                <button
                  type="button"
                  className={`panel-tab-btn ${activeLeftTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('description')}
                >
                  <FileText size={14} /> Description
                </button>
                <button
                  type="button"
                  className={`panel-tab-btn ${activeLeftTab === 'tests' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('tests')}
                >
                  <Terminal size={14} /> Test Cases ({challenge.visible_test_cases.length} Open + {challenge.hidden_tests_count || 2} Hidden)
                </button>
                <button
                  type="button"
                  className={`panel-tab-btn ${activeLeftTab === 'hints' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('hints')}
                >
                  <Lightbulb size={14} /> Hints ({revealedHints}/3)
                </button>
              </div>

              {/* Tab 1: Description */}
              {activeLeftTab === 'description' && (
                <div className="animate-fade-in">
                  <div className="problem-description-content">
                    <ReactMarkdown>{challenge.problem_statement}</ReactMarkdown>
                  </div>

                  {challenge.constraints && (
                    <div className="constraints-card">
                      <div className="text-xs uppercase font-bold text-accent tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles size={13} /> Constraints & Complexity Requirements
                      </div>
                      <div className="constraints-content">
                        <ReactMarkdown>{challenge.constraints}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Test Cases */}
              {activeLeftTab === 'tests' && (
                <div className="animate-fade-in">
                  <div className="text-xs uppercase font-bold text-muted tracking-wider mb-2">
                    Open (Visible) Test Cases
                  </div>
                  {challenge.visible_test_cases.map((tc, idx) => (
                    <div key={idx} className="test-case-card">
                      <div className="font-bold text-xs text-accent mb-1.5">Test Case {idx + 1}</div>
                      <div className="test-case-field">
                        <strong>Input:</strong>
                        <code>{tc.input}</code>
                      </div>
                      <div className="test-case-field">
                        <strong>Expected:</strong>
                        <code>{tc.expected_output}</code>
                      </div>
                      {tc.explanation && (
                        <div className="test-case-field text-xs text-muted mt-1 italic">
                          <strong>Note:</strong> <span>{tc.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="hidden-tests-banner">
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-secondary">
                      <Lock size={14} className="text-muted" />
                      <span>{challenge.hidden_tests_count || 2} Hidden Test Cases</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Hidden tests verify edge cases, boundary numbers, and algorithmic $O(N)$ efficiency upon submission.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Hints */}
              {activeLeftTab === 'hints' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-muted uppercase">Progressive Socratic Guidance</span>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={handleRevealHint}
                      disabled={loadingHints || revealedHints >= 3}
                    >
                      {loadingHints ? 'Loading...' : revealedHints === 0 ? 'Reveal Hint 1' : revealedHints < 3 ? `Reveal Hint ${revealedHints + 1}` : 'All Hints Unlocked'}
                    </button>
                  </div>

                  {revealedHints === 0 ? (
                    <div className="p-4 text-center text-xs text-muted border border-subtle rounded-lg bg-surface">
                      Need intuition on data structures or strategy? Click "Reveal Hint 1" to unlock Socratic advice without giving away the complete solution.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {hintsList.slice(0, revealedHints).map((hint, idx) => (
                        <div key={idx} className="hint-item p-2.5 rounded bg-surface border border-subtle text-xs">
                          <span className="badge badge-amber text-xs mr-2 font-bold">Hint {idx + 1}</span>
                          <div className="text-primary mt-1 hint-markdown">
                            <ReactMarkdown>{hint}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Code Editor & Console Drawer */}
          <div className="editor-panel">
            <div className="editor-toolbar">
              <div className="flex items-center gap-3">
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
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-muted flex items-center gap-1"
                  onClick={handleResetCode}
                  title="Reset to starter code"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              <div className="editor-action-buttons">
                {/* Run Code Button */}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  onClick={handleRunOpenTests}
                  disabled={runningTests || submitting}
                  id="run-tests-btn"
                  title="Run code against visible open test cases"
                >
                  {runningTests ? (
                    <div className="spinner" style={{ width: 13, height: 13 }} />
                  ) : (
                    <>
                      <Play size={13} className="text-emerald-500 fill-emerald-500" />
                      <span>Run Tests</span>
                    </>
                  )}
                </button>

                {/* Submit Code Button */}
                <button
                  type="button"
                  className="btn btn-primary btn-sm btn-glow flex items-center gap-1.5"
                  onClick={handleSubmit}
                  disabled={submitting || runningTests}
                  id="submit-code-btn"
                  title="Submit code for full grading and AI complexity review"
                >
                  {submitting ? (
                    <div className="spinner" style={{ width: 13, height: 13 }} />
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Submit Solution</span>
                    </>
                  )}
                </button>
              </div>
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

            {/* Output & Console Panel */}
            <div className="console-panel">
              <div className="console-header">
                <div className="flex items-center gap-2">
                  <Terminal size={14} />
                  <span>Execution Output & AI Evaluation</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-xs ${activeConsoleTab === 'run' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveConsoleTab('run')}
                  >
                    Open Test Results
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${activeConsoleTab === 'submit' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveConsoleTab('submit')}
                  >
                    Submission & AI Review
                  </button>
                </div>
              </div>

              <div className="console-body">
                {/* Console Tab 1: Run Open Tests */}
                {activeConsoleTab === 'run' && (
                  <div>
                    {!runResult ? (
                      <p className="text-xs text-muted text-center py-4">
                        Click <strong>"Run Tests"</strong> above to test your code against open visible test cases.
                      </p>
                    ) : (
                      <div className="animate-fade-in space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold mb-2">
                          <span className={runResult.all_passed ? 'text-emerald-500' : 'text-rose-500'}>
                            {runResult.all_passed ? '✓ All Visible Tests Passed' : '✗ Some Tests Failed'} ({runResult.passed_count}/{runResult.total_count})
                          </span>
                          <span className="text-muted">{runResult.stdout}</span>
                        </div>

                        {runResult.test_results.map(tr => (
                          <div key={tr.test_index} className={`test-result-row ${tr.passed ? 'passed' : 'failed'}`}>
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                {tr.passed ? (
                                  <CheckCircle2 size={13} className="text-emerald-500" />
                                ) : (
                                  <XCircle size={13} className="text-rose-500" />
                                )}
                                <span>Test Case {tr.test_index}</span>
                                {tr.execution_time_ms && (
                                  <span className="text-muted font-mono font-normal">({tr.execution_time_ms}ms)</span>
                                )}
                              </div>
                              <div className="text-xs text-secondary mt-1 font-mono">
                                In: {tr.input} | Expected: {tr.expected_output}
                              </div>
                            </div>
                            <span className={`badge text-xs ${tr.passed ? 'badge-emerald' : 'badge-rose'}`}>
                              {tr.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        ))}

                        {runResult.feedback && (
                          <div className="p-2 rounded bg-surface border border-subtle text-xs text-secondary mt-2">
                            {runResult.feedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Console Tab 2: Full Submission & Review */}
                {activeConsoleTab === 'submit' && (
                  <div>
                    {!result ? (
                      <p className="text-xs text-muted text-center py-4">
                        Click <strong>"Submit Solution"</strong> to evaluate against open and hidden edge cases with AI complexity analysis.
                      </p>
                    ) : (
                      <div className={`review-card ${result.passed ? 'success' : 'fail'} animate-fade-in`}>
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <XCircle size={18} className="text-rose-500" />
                            )}
                            <span className="font-bold text-sm">
                              {result.passed ? 'Challenge Solved!' : 'Submission Incomplete'}
                            </span>
                            <span className="badge badge-indigo text-xs">Score: {result.score}%</span>
                            <span className="badge badge-emerald text-xs">
                              Tests: {result.tests_passed}/{result.tests_total}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted">
                            {result.time_complexity_detected && (
                              <span className="flex items-center gap-1 font-mono">
                                <Clock size={12} /> Time: {result.time_complexity_detected}
                              </span>
                            )}
                            {result.space_complexity_detected && (
                              <span className="flex items-center gap-1 font-mono">
                                <Cpu size={12} /> Space: {result.space_complexity_detected}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Open and Hidden Breakdown */}
                        <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                          <div className="p-2 rounded bg-surface border border-subtle">
                            <strong>Open Test Cases:</strong> {result.visible_test_results?.filter(t => t.passed).length ?? result.tests_passed} / {result.visible_test_results?.length ?? challenge.visible_test_cases.length} Passed
                          </div>
                          <div className="p-2 rounded bg-surface border border-subtle">
                            <strong>Hidden Edge Cases:</strong> {result.hidden_tests_passed ?? (result.passed ? (challenge.hidden_tests_count || 2) : 0)} / {result.hidden_tests_total ?? (challenge.hidden_tests_count || 2)} Passed
                          </div>
                        </div>

                        <div className="text-xs text-secondary mt-2 leading-relaxed review-markdown">
                          <strong className="text-primary block mb-1">AI Code Review:</strong>
                          <ReactMarkdown>{result.ai_review}</ReactMarkdown>
                        </div>

                        {result.solution_explanation && (
                          <div className="text-xs text-muted mt-2 pt-2 border-t border-color review-markdown">
                            <strong className="text-primary block mb-1">Optimal Algorithmic Rationale:</strong>
                            <ReactMarkdown>{result.solution_explanation}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
