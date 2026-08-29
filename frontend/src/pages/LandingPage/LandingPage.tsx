import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Target, TrendingUp, Zap, Star, BookOpen, Users, Move, RotateCcw, Play, Pause, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store';
import './LandingPage.css';

const CAREER_PATHS = [
  { icon: '🤖', title: 'AI Engineer', color: 'indigo', skills: ['Python', 'ML', 'LLMs', 'MLOps'] },
  { icon: '📊', title: 'Data Scientist', color: 'emerald', skills: ['Python', 'Statistics', 'ML', 'Viz'] },
  { icon: '📈', title: 'Data Analyst', color: 'amber', skills: ['SQL', 'Excel', 'Tableau', 'Python'] },
  { icon: '💻', title: 'Full Stack Dev', color: 'indigo', skills: ['React', 'Node.js', 'SQL', 'APIs'] },
  { icon: '☁️', title: 'Cloud Engineer', color: 'emerald', skills: ['AWS', 'Docker', 'K8s', 'DevOps'] },
];

const FEATURES = [
  {
    icon: <Brain size={28} />,
    title: 'AI-Powered Curriculum',
    desc: 'Gemini AI analyzes your skills and generates a personalized learning path tailored exactly to your career goal.',
    color: 'indigo',
  },
  {
    icon: <Target size={28} />,
    title: 'Skill Gap Analysis',
    desc: 'Precisely identify what you know, what you\'re missing, and what to learn next with intelligent gap analysis.',
    color: 'emerald',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Progress Tracking',
    desc: 'Track every topic — from Not Started to Completed — with visual progress indicators and completion stats.',
    color: 'amber',
  },
  {
    icon: <Zap size={28} />,
    title: 'Adaptive Learning (V2)',
    desc: 'AI quizzes after each topic adjust your curriculum dynamically based on your performance.',
    color: 'indigo',
  },
];

const STEPS = [
  { num: '01', title: 'Choose Career Goal', desc: 'Select your target role (AI Engineer, Full Stack, Cloud, Data Science, etc.)' },
  { num: '02', title: 'Diagnostic Skill Quiz', desc: 'Take an adaptive quiz to measure current proficiencies and identify skill gaps.' },
  { num: '03', title: 'Explore Skill Profile', desc: 'Interactive Radar & Bar Visualizers show where you stand against industry benchmarks.' },
  { num: '04', title: 'AI Dynamic Curriculum', desc: 'Google Gemini AI constructs a personalized multi-week roadmap with curated resources.' },
  { num: '05', title: 'Roadmap & Adaptive Mastery', desc: 'Follow modules and take topic mastery quizzes that adapt materials dynamically.' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  // 3D Interactive Cube State & Cursor Rotation
  const [rotation, setRotation] = useState({ x: -14, y: 25 });
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeFace, setActiveFace] = useState<string>('front');

  const cubeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startRotationRef = useRef<{ x: number; y: number }>({ x: -14, y: 25 });
  const autoRotateTimerRef = useRef<number | null>(null);

  // Smooth Auto-Rotation Loop when idle
  useEffect(() => {
    if (!autoRotate || isDragging) return;

    let animFrame: number;
    const animate = () => {
      setRotation(prev => ({
        x: prev.x,
        y: (prev.y + 0.35) % 360,
      }));
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [autoRotate, isDragging]);

  // Pointer drag handlers (Mouse)
  const handlePointerDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startRotationRef.current = { ...rotation };

    if (autoRotateTimerRef.current) {
      window.clearTimeout(autoRotateTimerRef.current);
    }
  };

  const handlePointerMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setRotation({
      // Clamping X between -65 and +65 deg keeps faces nicely upright and readable
      x: Math.max(-65, Math.min(65, startRotationRef.current.x - deltaY * 0.45)),
      y: (startRotationRef.current.y + deltaX * 0.45) % 360,
    });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // After 5 seconds of inactivity, gently resume auto-rotate if enabled
    if (autoRotate) {
      autoRotateTimerRef.current = window.setTimeout(() => {
        // Keeps user's angle and continues smoothly
      }, 5000);
    }
  };

  // Touch drag handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    startRotationRef.current = { ...rotation };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    setRotation({
      x: Math.max(-65, Math.min(65, startRotationRef.current.x - deltaY * 0.45)),
      y: (startRotationRef.current.y + deltaX * 0.45) % 360,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Snap to preset face view
  const snapToFace = (face: string, x: number, y: number) => {
    setActiveFace(face);
    setAutoRotate(false);
    setRotation({ x, y });
  };

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb-indigo" style={{ top: '-10%', right: '-5%' }} />
          <div className="orb orb-emerald" style={{ bottom: '10%', left: '-5%' }} />
        </div>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge animate-fade-up">
              <Star size={14} />
              <span>AI-Powered Personalized Learning Platform</span>
            </div>

            <h1 className="hero-title animate-fade-up delay-100">
              Your Career. Your Path.
              <br />
              <span className="gradient-text">AI-Crafted Just For You.</span>
            </h1>

            <p className="hero-subtitle animate-fade-up delay-200">
              Stop following generic course sequences. CurriculumAI analyzes your unique skill profile
              and generates a personalized, career-aligned learning roadmap using Google Gemini AI.
            </p>

            <div className="hero-actions animate-fade-up delay-300">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-xl">
                {isAuthenticated ? 'Go to Dashboard' : 'Start Learning Free'}
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-xl">
                Sign In
              </Link>
            </div>

            <div className="hero-stats animate-fade-up delay-400">
              <div className="hero-stat">
                <span className="hero-stat-num gradient-text">5</span>
                <span className="hero-stat-label">Career Paths</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num gradient-text">AI</span>
                <span className="hero-stat-label">Gemini Powered</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num gradient-text">100%</span>
                <span className="hero-stat-label">Personalized</span>
              </div>
            </div>
          </div>

          {/* 3D Hero Visual - Interactive Manually Rotatable 3D Learning Core */}
          <div className="hero-visual animate-fade-up delay-300">
            <div className="cube-interactive-wrapper">
              <div className="cube-hint-badge">
                <Move size={13} className="text-accent" />
                <span>Drag cursor to rotate 3D box manually</span>
              </div>

              <div 
                className={`cube-scene-container ${isDragging ? 'grabbing' : 'grab'}`}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  ref={cubeRef}
                  className="cube-3d"
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Glowing Internal Core Sphere */}
                  <div className="cube-internal-core" />

                  {/* Front Face: AI Curriculum */}
                  <div className="cube-face cube-front">
                    <div className="face-glow-corner tl" />
                    <div className="face-glow-corner tr" />
                    <div className="cube-face-inner">
                      <div className="cube-badge badge-cyan">
                        <Brain size={14} />
                        <span>AI Engine</span>
                      </div>
                      <h4>Dynamic Syllabus</h4>
                      <p>Gemini AI generates customized multi-week curricula mapped to your target tech role.</p>
                      <div className="cube-tags">
                        <span>Python</span>
                        <span>ML/AI</span>
                        <span>System Design</span>
                      </div>
                    </div>
                  </div>

                  {/* Back Face: Skill Assessment */}
                  <div className="cube-face cube-back">
                    <div className="face-glow-corner tl" />
                    <div className="face-glow-corner tr" />
                    <div className="cube-face-inner">
                      <div className="cube-badge badge-emerald">
                        <Target size={14} />
                        <span>Diagnostics</span>
                      </div>
                      <h4>Skill Gap Analysis</h4>
                      <p>Interactive radar charts benchmark your competency against real industry demand.</p>
                      <div className="cube-tags">
                        <span>Radar Profile</span>
                        <span>Benchmarks</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Face: Adaptive Quizzes */}
                  <div className="cube-face cube-right">
                    <div className="face-glow-corner tl" />
                    <div className="face-glow-corner tr" />
                    <div className="cube-face-inner">
                      <div className="cube-badge badge-amber">
                        <Zap size={14} />
                        <span>Adaptive V2</span>
                      </div>
                      <h4>Topic Quizzes</h4>
                      <p>AI mastery tests evaluate your retention and adjust your upcoming modules automatically.</p>
                      <div className="cube-tags">
                        <span>Smart Retest</span>
                        <span>Dynamic Level</span>
                      </div>
                    </div>
                  </div>

                  {/* Left Face: Roadmap & Mastery */}
                  <div className="cube-face cube-left">
                    <div className="face-glow-corner tl" />
                    <div className="face-glow-corner tr" />
                    <div className="cube-face-inner">
                      <div className="cube-badge badge-violet">
                        <BookOpen size={14} />
                        <span>Milestones</span>
                      </div>
                      <h4>Curated Resources</h4>
                      <p>Direct video, doc, and article links for every week with interactive progress markers.</p>
                      <div className="cube-tags">
                        <span>Step-by-Step</span>
                        <span>Tracked</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Face */}
                  <div className="cube-face cube-top">
                    <div className="cube-face-inner top-bottom-face">
                      <Sparkles size={20} className="text-accent mb-1 animate-pulse" />
                      <span className="gradient-text font-bold text-sm">CurriculumAI</span>
                      <span className="text-xs text-muted">Core Learning Engine</span>
                    </div>
                  </div>

                  {/* Bottom Face */}
                  <div className="cube-face cube-bottom">
                    <div className="cube-face-inner top-bottom-face">
                      <span className="text-emerald font-bold text-sm">100% Tailored</span>
                      <span className="text-xs text-muted">Powered by Google Gemini</span>
                    </div>
                  </div>
                </div>

                {/* Holographic Radar Base Platform & Dynamic Shadow */}
                <div className="cube-holo-pedestal">
                  <div className="holo-ring holo-ring-1" />
                  <div className="holo-ring holo-ring-2" />
                  <div className="cube-shadow-ring" />
                </div>
              </div>

              {/* Manual 3D Controls Toolbar */}
              <div className="cube-controls-bar">
                <button 
                  type="button" 
                  className={`cube-ctrl-btn ${activeFace === 'front' ? 'active' : ''}`}
                  onClick={() => snapToFace('front', -10, 0)}
                  title="Front: AI Engine"
                >
                  <Brain size={12} />
                  <span>AI Engine</span>
                </button>
                <button 
                  type="button" 
                  className={`cube-ctrl-btn ${activeFace === 'right' ? 'active' : ''}`}
                  onClick={() => snapToFace('right', -10, -90)}
                  title="Right: Adaptive Quizzes"
                >
                  <Zap size={12} />
                  <span>Quizzes</span>
                </button>
                <button 
                  type="button" 
                  className={`cube-ctrl-btn ${activeFace === 'back' ? 'active' : ''}`}
                  onClick={() => snapToFace('back', -10, -180)}
                  title="Back: Skill Gap"
                >
                  <Target size={12} />
                  <span>Skill Gap</span>
                </button>
                <button 
                  type="button" 
                  className={`cube-ctrl-btn ${activeFace === 'left' ? 'active' : ''}`}
                  onClick={() => snapToFace('left', -10, 90)}
                  title="Left: Roadmap Milestones"
                >
                  <BookOpen size={12} />
                  <span>Roadmap</span>
                </button>

                <div className="ctrl-divider" />

                <button 
                  type="button" 
                  className={`cube-icon-btn ${autoRotate ? 'active' : ''}`}
                  onClick={() => setAutoRotate(prev => !prev)}
                  title={autoRotate ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
                >
                  {autoRotate ? <Pause size={13} /> : <Play size={13} />}
                </button>

                <button 
                  type="button" 
                  className="cube-icon-btn"
                  onClick={() => snapToFace('front', -14, 25)}
                  title="Reset 3D Angle"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-indigo mb-4">Career Paths</span>
            <h2>Choose Your Destination</h2>
            <p className="mt-2 text-secondary">
              Pick a career goal and let AI build the perfect roadmap for you.
            </p>
          </div>
          <div className="career-grid mt-8">
            {CAREER_PATHS.map((career, i) => (
              <div
                key={career.title}
                className="career-card card-3d animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="career-icon">{career.icon}</div>
                <h3 className="career-title">{career.title}</h3>
                <div className="career-skills flex flex-wrap gap-2 mt-3">
                  {career.skills.map((s) => (
                    <span key={s} className="badge badge-indigo">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-emerald mb-4">Platform Features</span>
            <h2>Everything You Need to Grow</h2>
          </div>
          <div className="grid-2 mt-8">
            {FEATURES.map((feat, i) => (
              <div key={feat.title} className={`feature-card card-3d animate-fade-up delay-${(i + 1) * 100}`}>
                <div className={`feature-icon feature-icon-${feat.color}`}>{feat.icon}</div>
                <h3 className="mt-4">{feat.title}</h3>
                <p className="mt-2 text-secondary">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-amber mb-4">How It Works</span>
            <h2>From Zero to Career-Ready</h2>
          </div>
          <div className="steps-grid mt-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className={`step-card animate-fade-up delay-${i * 100}`}>
                <div className="step-num gradient-text">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="text-secondary text-sm mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card card-3d text-center">
            <div className="orb orb-indigo" style={{ top: '-30%', left: '30%', opacity: 0.3 }} />
            <BookOpen size={48} className="cta-icon" />
            <h2 className="mt-4 gradient-text">Ready to Build Your Future?</h2>
            <p className="mt-3 text-secondary" style={{ maxWidth: 480, margin: '0.75rem auto 0' }}>
              Join learners who are using AI to accelerate their careers with personalized, 
              skill-gap-driven learning paths.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Link to="/register" className="btn btn-primary btn-xl">
                <Users size={18} />
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="navbar-logo-icon" style={{ width: 28, height: 28, fontSize: '0.875rem' }}>C</div>
              <span className="font-semibold">CurriculumAI</span>
            </div>
            <p className="text-sm text-muted">
              Built with dedication as an Academic Mini Project · Powered by Google Gemini AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
