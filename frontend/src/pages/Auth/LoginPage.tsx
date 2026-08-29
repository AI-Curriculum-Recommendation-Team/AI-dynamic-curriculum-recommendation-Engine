import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
import './AuthPage.css';

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
      <div className="auth-orbs">
        <div className="orb orb-indigo" style={{ top: '-20%', left: '-5%' }} />
        <div className="orb orb-emerald" style={{ bottom: '-10%', right: '-10%' }} />
      </div>

      <div className="auth-container animate-fade-up">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="navbar-logo-icon">C</div>
            <span className="gradient-text font-bold">CurriculumAI</span>
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your learning journey</p>
        </div>

        <div className="auth-card card-glass">
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
              {loading ? <div className="spinner" /> : <><ArrowRight size={18} /> Sign In</>}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
