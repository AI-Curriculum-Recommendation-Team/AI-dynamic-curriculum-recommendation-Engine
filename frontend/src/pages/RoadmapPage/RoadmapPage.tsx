import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Circle, PlayCircle, Zap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { curriculumService, progressService } from '../../services';
import type { RoadmapData } from '../../types';
import TopicQuizModal from '../../components/TopicQuizModal/TopicQuizModal';
import GuidedJourneyFlow from '../../components/GuidedJourneyFlow/GuidedJourneyFlow';
import './RoadmapPage.css';

const STATUS_CONFIG = {
  not_started: { icon: Circle, color: '#64748b', label: 'Not Started', bg: 'rgba(100, 116, 139, 0.1)' },
  in_progress: { icon: PlayCircle, color: '#f59e0b', label: 'In Progress', bg: 'rgba(245, 158, 11, 0.12)' },
  completed: { icon: CheckCircle2, color: '#10b981', label: 'Completed', bg: 'rgba(16, 185, 129, 0.15)' },
};

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<{ id: number; topic: string } | null>(null);

  const fetchRoadmap = () => {
    curriculumService.getRoadmap()
      .then(setRoadmap)
      .catch(() => toast.error('Failed to load roadmap'));
  };

  useEffect(() => {
    curriculumService.getRoadmap()
      .then(setRoadmap)
      .catch(() => toast.error('Failed to load roadmap'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (weekId: number, status: string) => {
    try {
      await progressService.updateProgress(weekId, status);
      setRoadmap(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          weeks: prev.weeks.map(w => w.week_id === weekId ? { ...w, status: status as any } : w),
        };
      });
      toast.success(`Module marked as ${status.replace('_', ' ')} ✓`);
    } catch {
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="card-3d text-center p-6" style={{ maxWidth: 360 }}>
          <div className="spinner mb-4" style={{ width: 44, height: 44, margin: '0 auto 1rem auto' }} />
          <p className="text-secondary text-sm font-semibold">Loading Roadmap Node Map...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="page-container container">
        <div className="card-3d text-center" style={{ padding: '3rem' }}>
          <h2>No Roadmap Available</h2>
          <p className="text-secondary mt-2">Generate an AI curriculum first to view your interactive roadmap.</p>
        </div>
      </div>
    );
  }

  const completed = roadmap.weeks.filter(w => w.status === 'completed').length;
  const inProgress = roadmap.weeks.filter(w => w.status === 'in_progress').length;
  const pct = Math.round((completed / roadmap.weeks.length) * 100);

  return (
    <div className="page-container">
      <div className="container-narrow">
        {/* Stage 5 in the 5-Stage Journey */}
        <GuidedJourneyFlow currentStep={5} careerTitle={roadmap.career_goal} />

        <div className="page-header animate-fade-up">
          <span className="badge badge-emerald mb-3 flex items-center gap-1" style={{ width: 'fit-content' }}>
            <Sparkles size={14} /> Stage 5: Execution & Mastery Roadmap
          </span>
          <h1 className="page-title">
            Your Dynamic Roadmap to <span className="gradient-text">{roadmap.career_goal}</span>
          </h1>
          <p className="page-subtitle">
            {roadmap.total_weeks} weeks · {completed} completed · {inProgress} in progress · {pct}% total mastery
          </p>
        </div>

        {/* Milestone Progress Bar */}
        <div className="card-3d animate-fade-up delay-100 mb-8" style={{ padding: '1.5rem 2rem' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Target Milestone Progress</span>
            <span className="text-accent font-bold text-base">{pct}% Completed</span>
          </div>
          <div className="progress-bar-wrap" style={{ height: 10 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            {['not_started', 'in_progress', 'completed'].map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`status-dot ${s.replace('_', '-')}`} />
                <span className="text-xs text-muted capitalize">
                  {s.replace('_', ' ')}: {roadmap.weeks.filter(w => w.status === s).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Visual Roadmap Timeline */}
        <div className="roadmap-timeline animate-fade-up delay-200">
          {roadmap.weeks.map((week, i) => {
            const cfg = STATUS_CONFIG[week.status] || STATUS_CONFIG.not_started;
            const Icon = cfg.icon;
            const isLast = i === roadmap.weeks.length - 1;

            return (
              <div key={week.week_id} className="roadmap-item">
                {/* Connecting SVG visual timeline line */}
                {!isLast && (
                  <div
                    className={`roadmap-line ${week.status === 'completed' ? 'done' : ''}`}
                  />
                )}

                {/* Glowing status circle node */}
                <div 
                  className="roadmap-node-circle" 
                  style={{ background: cfg.bg, borderColor: cfg.color }}
                  title={`Status: ${cfg.label}`}
                >
                  <Icon size={20} color={cfg.color} />
                </div>

                {/* 3D Roadmap Content Card */}
                <div className="roadmap-content card-3d">
                  <div className="roadmap-content-header">
                    <div>
                      <span className="roadmap-week-label">Week {week.week_number} Module</span>
                      <h3 className="roadmap-topic text-primary">{week.topic}</h3>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`badge badge-${week.difficulty === 'beginner' ? 'emerald' : week.difficulty === 'advanced' ? 'rose' : 'amber'}`}>
                        {week.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-muted text-xs">
                        <Clock size={12} />
                        <span>~{week.estimated_hours}h</span>
                      </div>
                    </div>
                  </div>

                  {week.subtopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {week.subtopics.slice(0, 4).map(s => (
                        <span key={s} className="subtopic-chip">{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Interactive Status Controls and Quiz Trigger */}
                  <div className="roadmap-controls mt-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['not_started', 'in_progress', 'completed'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`roadmap-status-btn ${week.status === s ? 'active' : ''}`}
                          onClick={() => updateStatus(week.week_id, s)}
                          id={`set-${s}-week-${week.week_id}`}
                          style={{
                            borderColor: week.status === s ? cfg.color : undefined,
                            color: week.status === s ? cfg.color : undefined,
                          }}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm btn-glow ml-auto"
                      onClick={() => setActiveQuiz({ id: week.week_id, topic: week.topic })}
                    >
                      <Zap size={13} /> Take Topic Quiz
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeQuiz && (
          <TopicQuizModal
            weekId={activeQuiz.id}
            topicTitle={activeQuiz.topic}
            onClose={() => setActiveQuiz(null)}
            onAdapted={fetchRoadmap}
          />
        )}
      </div>
    </div>
  );
}
