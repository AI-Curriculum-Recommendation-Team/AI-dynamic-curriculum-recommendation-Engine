import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, Brain, Map,
  FileText, Layers, StickyNote, Shield, X,
  Code2, Award,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_SECTIONS = [
  {
    label: 'Main',
    links: [
      { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
      { to: '/career',     label: 'Career Goal', icon: Target },
      { to: '/curriculum', label: 'Curriculum',  icon: Brain },
      { to: '/roadmap',    label: 'Roadmap',      icon: Map },
    ],
  },
  {
    label: 'Adaptive Lab',
    links: [
      { to: '/coding-lab', label: 'Coding Lab',   icon: Code2 },
      { to: '/readiness',  label: 'Readiness AI', icon: Award },
    ],
  },
  {
    label: 'Learning',
    links: [
      { to: '/tutor',      label: 'AI Tutor',   icon: Brain },
      { to: '/documents',  label: 'Documents',  icon: FileText },
      { to: '/flashcards', label: 'Flashcards', icon: Layers },
      { to: '/notes',      label: 'Notes',      icon: StickyNote },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
        id="app-sidebar"
        aria-label="Application navigation"
      >
        {/* Mobile Header */}
        <div className="sidebar-mobile-header">
          <div className="flex items-center gap-2">
            <div className="sidebar-mobile-logo-icon">C</div>
            <span className="sidebar-mobile-title">Menu Navigation</span>
          </div>
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="sidebar-section">
            {!collapsed && (
              <div className="sidebar-section-label">{section.label}</div>
            )}
            {collapsed && <div className="sidebar-section-divider" />}

            {section.links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  title={collapsed ? label : undefined}
                  onClick={onCloseMobile}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={collapsed ? 22 : 20} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="sidebar-link-label">{label}</span>
                      {isActive && <span className="sidebar-active-dot" />}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Admin */}
        {isAuthenticated && user?.role === 'admin' && (
          <div className="sidebar-section">
            {!collapsed && <div className="sidebar-section-label">Admin</div>}
            {collapsed && <div className="sidebar-section-divider" />}
            <Link
              to="/admin"
              className={`sidebar-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              title={collapsed ? 'Admin Panel' : undefined}
              onClick={onCloseMobile}
            >
              <span className="sidebar-link-icon"><Shield size={collapsed ? 22 : 20} /></span>
              {!collapsed && <span className="sidebar-link-label">Admin Panel</span>}
            </Link>
          </div>
        )}
      </nav>
    </aside>
    </>
  );
}
