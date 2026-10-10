import { Link } from 'react-router-dom';
import { Target, CheckCircle2, Award, BookOpen, Compass, ArrowRight, Sparkles } from 'lucide-react';
import './GuidedJourneyFlow.css';

export type JourneyStep = 1 | 2 | 3 | 4 | 5;

interface Props {
  currentStep: JourneyStep;
  careerTitle?: string;
  className?: string;
}

const STEPS = [
  {
    step: 1,
    title: 'Career Goal',
    desc: 'Pick your dream role',
    icon: Target,
    href: '/career',
  },
  {
    step: 2,
    title: 'Diagnostic Quiz',
    desc: 'Assess baseline skills',
    icon: Compass,
    href: '/assessment',
  },
  {
    step: 3,
    title: 'Skill Profile',
    desc: 'Visual gap analysis',
    icon: Award,
    href: '/results',
  },
  {
    step: 4,
    title: 'AI Curriculum',
    desc: 'Gemini custom syllabus',
    icon: Sparkles,
    href: '/curriculum',
  },
  {
    step: 5,
    title: 'Roadmap & Mastery',
    desc: 'Study & adaptive quizzes',
    icon: BookOpen,
    href: '/roadmap',
  },
];

export default function GuidedJourneyFlow({ currentStep, careerTitle, className = '' }: Props) {
  const currentStepInfo = STEPS.find(s => s.step === currentStep) || STEPS[0];

  return (
    <div className={`journey-flow-card card-3d ${className}`}>
      <div className="journey-flow-header">
        <div className="flex items-center gap-2">
          <span className="badge badge-indigo">5-Stage Learning Journey</span>
          {careerTitle && (
            <span className="badge badge-emerald text-xs">🎯 Target: {careerTitle}</span>
          )}
        </div>
        <div className="journey-step-counter text-xs text-muted">
          Stage <strong className="text-primary">{currentStep}</strong> of 5
        </div>
      </div>

      {/* Responsive Visual Stepper Bar */}
      <div className="journey-stepper-track">
        {STEPS.map((s, idx) => {
          const isDone = s.step < currentStep;
          const isActive = s.step === currentStep;
          const Icon = s.icon;

          return (
            <div key={s.step} className="journey-step-segment">
              <Link
                to={s.href}
                className={`journey-step-node ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                title={`${s.step}. ${s.title}`}
              >
                <div className="journey-node-icon-wrap">
                  {isDone ? <CheckCircle2 size={16} className="text-emerald" /> : <Icon size={15} />}
                </div>
                <div className="journey-node-meta">
                  <span className="journey-node-num">0{s.step}</span>
                  <span className="journey-node-title">{s.title}</span>
                </div>
              </Link>

              {idx < STEPS.length - 1 && (
                <div className={`journey-connector-line ${isDone ? 'done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Contextual guidance message */}
      <div className="journey-current-guidance">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="journey-pulse-dot" />
            <span className="text-xs text-secondary">
              <strong>Now: </strong> {currentStepInfo.title} — {currentStepInfo.desc}
            </span>
          </div>
          <Link to={currentStepInfo.href} className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
            Active Phase <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
