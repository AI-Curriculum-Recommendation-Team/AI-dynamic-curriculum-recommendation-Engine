import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, Brain, Map,
  FileText, Layers, StickyNote, Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
}

const NAV_SECTIONS = [
  {
    label: 'Main',
    links: [
      { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
      { to: '/career',     label: 'Career Goal', icon: Target },
      { to: '/curriculum', label: 'Curriculum',  icon: Brain },
      { to: '/roadmap',    label: 'Roadmap',     icon: Map },
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

export default function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} id="app-sidebar">
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
            >
              <span className="sidebar-link-icon"><Shield size={collapsed ? 22 : 20} /></span>
              {!collapsed && <span className="sidebar-link-label">Admin Panel</span>}
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
