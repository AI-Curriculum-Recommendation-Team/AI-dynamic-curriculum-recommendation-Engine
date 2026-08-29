import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
import './AuthPage.css';

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
      <div className="auth-orbs">
        <div className="orb orb-indigo" style={{ top: '-20%', right: '-10%' }} />
        <div className="orb orb-emerald" style={{ bottom: '-10%', left: '-10%' }} />
      </div>

      <div className="auth-container animate-fade-up">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="navbar-logo-icon">C</div>
            <span className="gradient-text font-bold">CurriculumAI</span>
          </Link>
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Start your personalized AI learning journey</p>
        </div>

        <div className="auth-card card-glass">
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
              {loading ? <div className="spinner" /> : <><ArrowRight size={18} /> Create Account</>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
