import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Clock, ChevronDown, ChevronUp, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { curriculumService } from '../../services';
import { useStudentStore } from '../../store';
import type { Curriculum } from '../../types';
import TopicQuizModal from '../../components/TopicQuizModal/TopicQuizModal';
import GuidedJourneyFlow from '../../components/GuidedJourneyFlow/GuidedJourneyFlow';
import './CurriculumPage.css';

const RESOURCE_ICONS: Record<string, string> = {
  video: '🎥',
  docs: '📄',
  practice: '⚡',
  project: '🛠️',
};

export default function CurriculumPage() {
  const { student } = useStudentStore();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);
  const [activeQuiz, setActiveQuiz] = useState<{ id: number; topic: string } | null>(null);

  const loadCurriculum = () => {
    curriculumService.getMyCurriculum()
      .then(setCurriculum)
      .catch(() => setCurriculum(null));
  };

  useEffect(() => {
    curriculumService.getMyCurriculum()
      .then(setCurriculum)
      .catch(() => setCurriculum(null))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    toast.loading('Google Gemini AI is crafting your dynamic curriculum...', { id: 'gen', duration: 30000 });
    try {
      const cur = await curriculumService.generate();
      setCurriculum(cur);
      toast.success('Curriculum generated successfully with Google Gemini! 🎉', { id: 'gen' });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Generation failed. Check server/API keys.', { id: 'gen' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="card-3d text-center p-6" style={{ maxWidth: 360 }}>
          <div className="spinner mb-4" style={{ width: 44, height: 44, margin: '0 auto 1rem auto' }} />
          <p className="text-secondary text-sm font-semibold">Loading AI Curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Stage 4 in the 5-Stage Journey */}
        <GuidedJourneyFlow currentStep={4} careerTitle={student?.career_goal?.title} />

        <div className="curriculum-header animate-fade-up">
          <div>
            <span className="badge badge-indigo mb-3 flex items-center gap-1" style={{ width: 'fit-content' }}>
              <Sparkles size={14} /> Stage 4: AI Curriculum Engine
            </span>
            <h1 className="page-title">Personalized Learning Curriculum</h1>
            {curriculum ? (
              <p className="page-subtitle">
                {curriculum.total_weeks}-Week Custom Roadmap · Tailored for {student?.career_goal?.title || 'Your Goal'}
              </p>
            ) : (
              <p className="page-subtitle">
                Google Gemini AI dynamically creates your syllabus based on your assessment results.
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              className="btn btn-primary btn-glow"
              onClick={handleGenerate}
              disabled={generating}
              id="generate-curriculum-btn"
            >
              {generating ? (
                <div className="spinner" />
              ) : (
                <>
                  <Brain size={16} /> {curriculum ? 'Regenerate with AI' : 'Generate AI Curriculum'}
                </>
              )}
            </button>
            {curriculum && (
              <Link to="/roadmap" className="btn btn-secondary">
                <BookOpen size={16} /> Stage 5: Open Roadmap
              </Link>
            )}
          </div>
        </div>

        {/* Skill Analysis Summary */}
        {curriculum && (
          <div className="grid-3 mt-6 animate-fade-up delay-100">
            <div className="skill-group card-3d">
              <h4 className="text-sm font-bold text-emerald mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Strong Competencies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {curriculum.strong_skills.length > 0
                  ? curriculum.strong_skills.map(s => <span key={s} className="badge badge-emerald text-xs">{s}</span>)
                  : <span className="text-xs text-muted">Building foundation through coursework</span>}
              </div>
            </div>
            <div className="skill-group card-3d">
              <h4 className="text-sm font-bold text-amber mb-2 flex items-center gap-1.5">
                <Zap size={16} /> Accelerated Focus Areas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {curriculum.weak_skills.length > 0
                  ? curriculum.weak_skills.map(s => <span key={s} className="badge badge-amber text-xs">{s}</span>)
                  : <span className="text-xs text-muted">Balanced profile across modules</span>}
              </div>
            </div>
            <div className="skill-group card-3d">
              <h4 className="text-sm font-bold text-rose mb-2 flex items-center gap-1.5">
                <Sparkles size={16} /> High Priority Gaps
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {curriculum.skill_gaps.length > 0
                  ? curriculum.skill_gaps.map(s => <span key={s} className="badge badge-rose text-xs">{s}</span>)
                  : <span className="text-xs text-muted">No blockers identified</span>}
              </div>
            </div>
          </div>
        )}

        {/* Curriculum Weeks */}
        {curriculum ? (
          <div className="weeks-list mt-6 animate-fade-up delay-200">
            {curriculum.weeks.map((week, i) => (
              <div
                key={week.id}
                className={`week-card card-3d ${expandedWeek === i ? 'expanded' : ''}`}
              >
                <button
                  type="button"
                  className="week-header"
                  onClick={() => setExpandedWeek(expandedWeek === i ? null : i)}
                  id={`week-${week.week_number}-toggle`}
                >
                  <div className="week-header-left">
                    <div className={`week-num-badge difficulty-${week.difficulty}`}>
                      W{week.week_number}
                    </div>
                    <div>
                      <div className="week-topic text-primary">{week.topic}</div>
                      <div className="week-meta">
                        <Clock size={12} />
                        ~{week.estimated_hours}h · Level: {week.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`week-status-badge status-${week.status}`}>
                      {week.status.replace('_', ' ')}
                    </span>
                    {expandedWeek === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {expandedWeek === i && (
                  <div className="week-details">
                    {/* Subtopics */}
                    {week.subtopics.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Key Concepts</h4>
                        <div className="flex flex-wrap gap-2">
                          {week.subtopics.map(s => (
                            <span key={s} className="subtopic-tag">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {week.resources.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Curated Resources</h4>
                        <div className="resources-list">
                          {week.resources.map((r: any, ri: number) => (
                            <a
                              key={ri}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-item"
                            >
                              <span className="resource-icon">{RESOURCE_ICONS[r.type] || '🔗'}</span>
                              <div>
                                <div className="resource-title">{r.title}</div>
                                <div className="resource-type text-xs text-muted">{r.type}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Adaptive Quiz Action */}
                    <div className="mt-4 pt-3 flex justify-between items-center flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <div className="text-xs text-muted">
                        Test your understanding to advance or dynamically adapt practice materials.
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm btn-glow"
                        onClick={() => setActiveQuiz({ id: week.id, topic: week.topic })}
                      >
                        <Zap size={14} /> Take Adaptive Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card-3d text-center animate-fade-up delay-100" style={{ padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
            <h2>No Curriculum Generated Yet</h2>
            <p className="text-secondary mt-2" style={{ maxWidth: 460, margin: '0.5rem auto 0' }}>
              {!student?.career_goal_id
                ? 'Please select your career goal and take the diagnostic assessment first.'
                : 'Your skill baseline is recorded. Click below to have Google Gemini AI assemble your personalized roadmap!'}
            </p>
            {!student?.career_goal_id ? (
              <Link to="/career" className="btn btn-primary mt-4">Select Career Goal</Link>
            ) : (
              <button type="button" className="btn btn-primary btn-lg btn-glow mt-4" onClick={handleGenerate} disabled={generating}>
                <Brain size={18} /> Generate AI Curriculum
              </button>
            )}
          </div>
        )}
      </div>

      {activeQuiz && (
        <TopicQuizModal
          weekId={activeQuiz.id}
          topicTitle={activeQuiz.topic}
          onClose={() => setActiveQuiz(null)}
          onAdapted={loadCurriculum}
        />
      )}
    </div>
  );
}
