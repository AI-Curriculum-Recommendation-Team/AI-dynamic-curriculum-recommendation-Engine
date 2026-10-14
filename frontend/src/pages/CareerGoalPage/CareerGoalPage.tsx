import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { careerService, studentService, resumeService } from '../../services';
import { useStudentStore } from '../../store';
import type { CareerGoal, CareerMatchAnalysis } from '../../types';
import GuidedJourneyFlow from '../../components/GuidedJourneyFlow/GuidedJourneyFlow';
import { ArrowRight, Check, Target, Sparkles, UploadCloud, FileText } from 'lucide-react';
import './CareerGoalPage.css';

const CAREER_ICONS: Record<string, string> = {
  'AI Engineer': '🤖',
  'Data Scientist': '📊',
  'Data Analyst': '📈',
  'Full Stack Developer': '💻',
  'Cloud Engineer': '☁️',
};

export default function CareerGoalPage() {
  const navigate = useNavigate();
  const { student, updateStudent } = useStudentStore();
  const [careers, setCareers] = useState<CareerGoal[]>([]);
  const [selected, setSelected] = useState<number | null>(student?.career_goal_id || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState<CareerMatchAnalysis | null>(null);

  useEffect(() => {
    careerService.listCareers()
      .then(data => {
        setCareers(data);
        if (!selected && data.length > 0) {
          // If no goal set yet, default to first or keep null
          if (student?.career_goal_id) {
            setSelected(student.career_goal_id);
          }
        }
      })
      .catch(() => toast.error('Failed to load real career paths'))
      .finally(() => setLoading(false));
  }, [student, selected]);

  const handleSelect = (id: number) => {
    setSelected(id);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|txt)$/i)) {
      toast.error('Please upload a PDF or TXT resume file');
      return;
    }

    setMatching(true);
    const toastId = toast.loading('AI analyzing resume & evaluating career trajectories...');
    try {
      const result = await resumeService.analyzeCareerMatch(file);
      setMatchAnalysis(result);
      if (result.top_career_id) {
        setSelected(result.top_career_id);
      }
      const topCareer = result.career_matches?.find(m => m.career_id === result.top_career_id);
      toast.success(
        `AI Match complete! Top recommended role: ${topCareer?.title || 'Selected'} (${topCareer?.match_percentage || 85}% match)`,
        { id: toastId }
      );
    } catch {
      toast.error('Failed to analyze resume. Please try again or select manually.', { id: toastId });
    } finally {
      setMatching(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected) {
      toast.error('Please click on a career path card to select it');
      return;
    }
    setSaving(true);
    try {
      await studentService.setCareerGoal(selected);
      updateStudent({ career_goal_id: selected });
      const targetCareer = careers.find(c => c.id === selected);
      toast.success(`Target set to ${targetCareer?.title || 'Career Goal'}! Next: Diagnostic Skill Quiz 🎯`);
      navigate('/assessment');
    } catch {
      toast.error('Failed to save career goal');
    } finally {
      setSaving(false);
    }
  };

  const selectedCareerObj = careers.find(c => c.id === selected);

  return (
    <div className="page-container">
      <div className="container">
        {/* Stage 1 in the 5-Stage Journey */}
        <GuidedJourneyFlow currentStep={1} careerTitle={selectedCareerObj?.title} />

        <div className="page-header animate-fade-up">
          <span className="badge badge-indigo mb-3 flex items-center gap-1.5" style={{ width: 'fit-content' }}>
            <Target size={14} /> Stage 1: Define Target Role
          </span>
          <h1 className="page-title">Choose Your Career Goal</h1>
          <p className="page-subtitle">
            Select the professional role you want to achieve. Google Gemini AI will construct an adaptive, 
            personalized curriculum specifically aligned to industry requirements.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center" style={{ padding: '4rem' }}>
            <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
          </div>
        ) : (
          <>
            {/* AI Resume Matcher Dropzone */}
            <div className="resume-career-matcher animate-fade-up">
              <div className="resume-matcher-header">
                <div className="resume-matcher-title">
                  <Sparkles size={18} className="text-accent" />
                  <span>Not Sure? Let AI Match Your Career From Your Resume</span>
                </div>
                {matchAnalysis && (
                  <span className="badge badge-emerald text-xs flex items-center gap-1">
                    <FileText size={12} /> {matchAnalysis.skills_detected} Skills Extracted for {matchAnalysis.candidate_name}
                  </span>
                )}
              </div>

              <label className="resume-matcher-dropzone">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleResumeUpload}
                  style={{ display: 'none' }}
                  disabled={matching}
                />
                <UploadCloud size={28} className="text-accent mb-2" />
                <p className="text-sm font-semibold text-primary">
                  {matching ? 'Analyzing Resume with AI...' : 'Upload Resume (PDF or TXT) to Auto-Match Career Goal'}
                </p>
                <p className="text-xs text-muted mt-1">
                  Gemini AI parses your skills, compares them to job market benchmarks, and recommends your best target role.
                </p>
              </label>

              {matchAnalysis && matchAnalysis.headline && (
                <div className="mt-3 p-2.5 rounded bg-surface border border-subtle text-xs text-secondary">
                  <strong>AI Profile Summary:</strong> {matchAnalysis.headline}
                </div>
              )}

              {matchAnalysis?.skills && matchAnalysis.skills.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Extracted Competencies & Experience:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchAnalysis.skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="badge badge-indigo text-xs flex items-center gap-1"
                        style={{ padding: '3px 8px' }}
                      >
                        <strong>{sk.name}</strong>
                        <span className="opacity-75 font-normal">({sk.level})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="career-select-grid animate-fade-up delay-100">
              {careers.map((career, i) => {
                const isSelected = selected === career.id;
                const match = matchAnalysis?.career_matches?.find(m => m.career_id === career.id);
                const isTopMatch = matchAnalysis?.top_career_id === career.id;

                return (
                  <div
                    key={career.id}
                    role="button"
                    tabIndex={0}
                    className={`career-select-card card-3d ${isSelected ? 'selected' : ''} ${isTopMatch ? 'ai-recommended' : ''}`}
                    style={{ animationDelay: `${i * 60}ms`, cursor: 'pointer' }}
                    onClick={() => handleSelect(career.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect(career.id)}
                    id={`career-${career.id}`}
                  >
                    {match && (
                      <div className="career-match-badge">
                        <Sparkles size={11} /> {match.match_percentage}% AI Match
                      </div>
                    )}

                    <div className="career-select-check">
                      {isSelected ? (
                        <div className="career-check-active">
                          <Check size={14} className="text-white" />
                        </div>
                      ) : (
                        <div className="career-check-inactive" />
                      )}
                    </div>

                    <div className="career-select-icon">
                      {career.icon || CAREER_ICONS[career.title] || '🎯'}
                    </div>

                    <h3 className="career-select-title">{career.title}</h3>
                    <p className="career-select-desc text-sm text-secondary">{career.description}</p>

                    {match && (
                      <p className="text-xs text-accent font-medium mb-3 italic">
                        {match.recommendation_reason}
                      </p>
                    )}

                    <div className="career-select-skills mt-4">
                      <span className="text-xs text-muted mb-1 block font-semibold">Core Competencies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(career.required_skills as any[]).slice(0, 5).map((s: any) => (
                          <span key={s.skill || s} className="badge badge-indigo text-xs">
                            {s.skill || s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="career-confirm animate-fade-up delay-300 mt-8 text-center">
              <button
                type="button"
                className="btn btn-primary btn-xl btn-glow"
                onClick={handleConfirm}
                disabled={!selected || saving}
                id="confirm-career-btn"
                style={{ minWidth: '280px', padding: '1rem 2rem' }}
              >
                {saving ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <span>Confirm Target & Start Assessment</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {selectedCareerObj && (
                <p className="text-sm text-secondary mt-3">
                  Selected: <strong className="text-accent">{selectedCareerObj.title}</strong> — Proceed to diagnostic quiz
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
