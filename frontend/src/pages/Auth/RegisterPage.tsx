import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Zap, BookOpen, Award, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
import './AuthPage.css';

const BRAND_FEATURES = [
  {
    icon: <Zap size={18} />,
    title: 'Start in Minutes',
    desc: 'Choose your goal, take a quick quiz, and get your AI roadmap instantly.',
  },
  {
    icon: <BookOpen size={18} />,
    title: 'Curated Resources',
    desc: 'Handpicked videos, docs, and articles for every learning milestone.',
  },
  {
    icon: <Award size={18} />,
    title: 'Earn Achievements',
    desc: 'Track streaks, unlock badges and level up as you progress.',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authService.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
      });
      setAuth(data.user, data.access_token);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-orbs">
          <div className="orb orb-indigo" style={{ top: '-5%', right: '-10%', opacity: 0.30 }} />
          <div className="orb orb-emerald" style={{ bottom: '-10%', left: '-10%', opacity: 0.25 }} />
          <div className="orb orb-violet" style={{ top: '40%', left: '30%', opacity: 0.15 }} />
        </div>
        <div className="auth-brand-content animate-fade-up">
          <Link to="/" className="auth-brand-logo">
            <div className="navbar-logo-icon" style={{ width: 40, height: 40, fontSize: '1.125rem' }}>C</div>
            <span className="auth-brand-logo-text">CurriculumAI</span>
          </Link>
          <h2 className="auth-brand-headline">
            Your Career.<br />
            <span className="gradient-text">Your Roadmap.</span>
          </h2>
          <p className="auth-brand-desc">
            Join thousands of learners accelerating their careers with AI-crafted, personalized learning paths built for your exact goals.
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
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Start your personalized AI learning journey</p>
          </div>

          <div className="auth-card">
            <GoogleAuthButton mode="register" />

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" id="register-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    id="full-name-input"
                    type="text"
                    className="form-input input-with-icon"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
              </div>

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
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="password-input"
                    type="password"
                    className="form-input input-with-icon"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="confirm-password-input"
                    type="password"
                    className="form-input input-with-icon"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  />
                </div>
                {errors.confirm && <span className="form-error">{errors.confirm}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg mt-2"
                disabled={loading}
                id="register-btn"
              >
                {loading
                  ? <div className="spinner" />
                  : <><ArrowRight size={18} /> Create Account</>
                }
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
            Free forever · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
