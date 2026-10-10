import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Sun, Moon, Monitor,
  LogOut, User, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../../store';
import { authService, notificationService } from '../../services';
import type { NotificationItem } from '../../types';
import toast from 'react-hot-toast';
import './Navbar.css';

interface NavbarProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function Navbar({ sidebarCollapsed, onToggleSidebar }: NavbarProps) {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setNotifsOpen(false);
    setProfileOpen(false);
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
    try { await authService.logout(); } catch {}
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const cycleTheme = () => {
    const order: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme as any) + 1) % order.length];
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const initials = user?.email?.charAt(0).toUpperCase() ?? '?';
  const username = user?.email?.split('@')[0] ?? '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Sidebar Toggle (single clean control) ── */}
        {onToggleSidebar && (
          <button
            className="navbar-sidebar-toggle"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}
            id="sidebar-toggle-btn"
            aria-label={sidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
          </button>
        )}

        {/* ── Logo ── */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon"><span>C</span></div>
          <span className="navbar-logo-text">
            Curriculum<span className="gradient-text">AI</span>
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* ── Right Actions: Theme, Notifications, User Profile & Logout ── */}
        <div className="navbar-actions">

          {/* Theme Toggle (Light / Dark) */}
          <button
            className="navbar-icon-btn"
            onClick={cycleTheme}
            title={`Switch theme (Current: ${theme})`}
            id="theme-toggle"
            aria-label="Toggle color theme"
          >
            <ThemeIcon size={17} />
          </button>

          {/* Notification Bell */}
          {isAuthenticated && (
            <div className="notifs-wrapper">
              <button
                className="navbar-icon-btn"
                onClick={() => { setNotifsOpen(o => !o); setProfileOpen(false); }}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && <span className="notifs-badge">{unreadCount}</span>}
              </button>

              {notifsOpen && (
                <div className="notifs-dropdown animate-fade-up">
                  <div className="notifs-dropdown-header">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button className="btn btn-ghost btn-sm text-xs" onClick={handleMarkAllRead}>
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notifs-list">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                        <div className={`notif-type-dot ${n.type}`} />
                        <div className="flex-1">
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-time">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-xs text-muted">No notifications yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profile card (matching shared user card image) */}
          {isAuthenticated ? (
            <div className="navbar-user-wrapper">
              <button
                className="navbar-user-chip"
                onClick={() => { setProfileOpen(o => !o); setNotifsOpen(false); }}
                id="profile-menu-btn"
                title="Account menu"
              >
                <div className="navbar-avatar">{initials}</div>
                <div className="navbar-user-meta">
                  <span className="navbar-user-name">{username}</span>
                  <span className="navbar-user-email">{user?.email}</span>
                </div>
              </button>

              {profileOpen && (
                <div className="navbar-profile-dropdown animate-fade-up">
                  <div className="navbar-profile-header">
                    <div className="navbar-avatar navbar-avatar-lg">{initials}</div>
                    <div>
                      <div className="font-bold text-sm">{username}</div>
                      <div className="text-xs text-muted">{user?.email}</div>
                      {user?.role === 'admin' && (
                        <span className="badge badge-indigo" style={{ fontSize: '0.65rem', marginTop: 4 }}>Admin</span>
                      )}
                    </div>
                  </div>
                  <div className="navbar-profile-divider" />
                  <Link to="/profile" className="navbar-profile-item" onClick={() => setProfileOpen(false)}>
                    <User size={15} /> Profile Settings
                  </Link>
                  <button className="navbar-profile-item navbar-profile-logout" onClick={handleLogout}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Direct logout button in navbar if authenticated */}
          {isAuthenticated && (
            <button
              className="navbar-icon-btn navbar-logout-btn"
              onClick={handleLogout}
              title="Logout"
              id="navbar-logout-btn"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
