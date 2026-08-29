import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Monitor, LogOut, User, LayoutDashboard, Shield, Menu, X, BookOpen, Bell, CheckCheck, Target, Brain } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../../store';
import { authService, notificationService } from '../../services';
import type { NotificationItem } from '../../types';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifsOpen, setNotifsOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setNotifsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getNotifications()
        .then(setNotifications)
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const cycleTheme = () => {
    const themes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/career', label: 'Career Goal', icon: Target },
        { to: '/curriculum', label: 'Curriculum', icon: Brain },
        { to: '/roadmap', label: 'Roadmap', icon: BookOpen },
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
      ]
    : [];

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <span>C</span>
          </div>
          <span className="navbar-logo-text">
            Curriculum<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {isAuthenticated && (
          <div className="navbar-links">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`navbar-link ${location.pathname.startsWith(to) ? 'active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className="btn btn-ghost btn-sm navbar-theme-btn"
            onClick={cycleTheme}
            title={`Theme: ${theme}`}
            id="theme-toggle"
          >
            <ThemeIcon size={16} />
          </button>

          {/* V2 Smart Notification Bell */}
          {isAuthenticated && (
            <div className="notifs-wrapper" style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-sm notifs-bell-btn"
                onClick={() => setNotifsOpen(!notifsOpen)}
                title="Smart Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && <span className="notifs-badge">{unreadCount}</span>}
              </button>

              {notifsOpen && (
                <div className="notifs-dropdown card-3d animate-fade-up">
                  <div className="notifs-dropdown-header">
                    <span className="font-bold text-sm">Smart Notifications</span>
                    {unreadCount > 0 && (
                      <button className="btn btn-ghost btn-sm text-xs p-1" onClick={handleMarkAllRead}>
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notifs-list">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                          <div className={`notif-type-dot ${n.type}`} />
                          <div className="flex-1">
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-message">{n.message}</div>
                            <div className="notif-time">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-xs text-muted">
                        No notifications yet. Notifications will appear when your curriculum adapts or milestones are reached.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="navbar-user-section">
              <div className="navbar-user-chip">
                <div className="navbar-avatar">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-user-email">{user?.email?.split('@')[0]}</span>
                {user?.role === 'admin' && (
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    Admin
                  </span>
                )}
              </div>

              <Link to="/profile" className="btn btn-ghost btn-sm" title="Profile">
                <User size={16} />
              </Link>

              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="btn btn-ghost btn-sm navbar-mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-btn"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="navbar-mobile-dropdown">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="navbar-mobile-link">
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link to="/profile" className="navbar-mobile-link">
                <User size={16} /> Profile
              </Link>
              <button className="navbar-mobile-link" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
