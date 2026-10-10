import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Brain, Target, TrendingUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
import './AuthPage.css';

const BRAND_FEATURES = [
  {
    icon: <Brain size={18} />,
    title: 'AI-Powered Curriculum',
    desc: 'Gemini AI builds a personalized roadmap for your career goal.',
  },
  {
    icon: <Target size={18} />,
    title: 'Skill Gap Analysis',
    desc: 'Identify exactly what you need to learn with precision.',
  },
  {
    icon: <TrendingUp size={18} />,
    title: 'Track Your Progress',
    desc: 'Visual dashboards to see your growth week by week.',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(form);
      setAuth(data.user, data.access_token);
      toast.success(`Welcome back! 👋`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-orbs">
          <div className="orb orb-indigo" style={{ top: '-10%', left: '-10%', opacity: 0.35 }} />
          <div className="orb orb-emerald" style={{ bottom: '-5%', right: '-10%', opacity: 0.25 }} />
        </div>
        <div className="auth-brand-content animate-fade-up">
          <Link to="/" className="auth-brand-logo">
            <div className="navbar-logo-icon" style={{ width: 40, height: 40, fontSize: '1.125rem' }}>C</div>
            <span className="auth-brand-logo-text">CurriculumAI</span>
          </Link>
          <h2 className="auth-brand-headline">
            Learn Smarter.<br />
            <span className="gradient-text">Grow Faster.</span>
          </h2>
          <p className="auth-brand-desc">
            Your AI-driven personalized learning platform. Build real skills for your dream career with a roadmap crafted just for you.
          </p>
          <div className="auth-brand-features">
            {BRAND_FEATURES.map((f, i) => (
              <div key={f.title} className={`auth-brand-feature animate-fade-up delay-${(i + 1) * 100}`}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner animate-fade-up">
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="navbar-logo-icon" style={{ width: 32, height: 32, fontSize: '0.875rem' }}>C</div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  CurriculumAI
                </span>
              </div>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
          </div>

          <div className="auth-card">
            <GoogleAuthButton mode="login" />

            <div className="auth-divider">
              <span>or sign in with email</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" id="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="email-input"
                    type="email"
                    className="form-input input-with-icon"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="password-input"
                    type="password"
                    className="form-input input-with-icon"
                    placeholder="Your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg mt-2"
                disabled={loading}
                id="login-btn"
              >
                {loading
                  ? <div className="spinner" />
                  : <><ArrowRight size={18} /> Sign In</>
                }
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
