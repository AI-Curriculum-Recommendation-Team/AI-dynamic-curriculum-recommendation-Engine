import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AuthCallback from './pages/Auth/AuthCallback';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CareerGoalPage from './pages/CareerGoalPage/CareerGoalPage';
import AssessmentPage from './pages/AssessmentPage/AssessmentPage';
import ResultsPage from './pages/ResultsPage/ResultsPage';
import CurriculumPage from './pages/CurriculumPage/CurriculumPage';
import RoadmapPage from './pages/RoadmapPage/RoadmapPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import TutorPage from './pages/TutorPage/TutorPage';
import DocumentsPage from './pages/DocumentsPage/DocumentsPage';
import FlashcardsPage from './pages/FlashcardsPage/FlashcardsPage';
import NotesPage from './pages/NotesPage/NotesPage';
import { useAuthStore, useThemeStore } from './store';

// ── Auth Guards ──────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  const hasHydrated = useAuthStore.persist?.hasHydrated?.() ?? true;
  if (!hasHydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const hasHydrated = useAuthStore.persist?.hasHydrated?.() ?? true;
  if (!hasHydrated) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── Layout: decides whether to show sidebar ───────────────────────
const NO_SIDEBAR_PATHS = ['/', '/login', '/register', '/auth/callback'];

function AppLayout({ sidebarCollapsed, onToggleSidebar }: {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const showSidebar = isAuthenticated && !NO_SIDEBAR_PATHS.includes(location.pathname);

  const sidebarW = showSidebar
    ? (sidebarCollapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)')
    : '0px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Sticky Navbar — spans full width above the sidebar+content */}
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={showSidebar ? onToggleSidebar : undefined}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Persistent Sidebar */}
        {showSidebar && <Sidebar collapsed={sidebarCollapsed} />}

        {/* Main content — shifts right to match sidebar width */}
        <main
          style={{
            flex: 1,
            marginLeft: sidebarW,
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: 0,
          }}
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected — User */}
            <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/career"     element={<ProtectedRoute><CareerGoalPage /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
            <Route path="/results"    element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/curriculum" element={<ProtectedRoute><CurriculumPage /></ProtectedRoute>} />
            <Route path="/roadmap"    element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/tutor"      element={<ProtectedRoute><TutorPage /></ProtectedRoute>} />
            <Route path="/documents"  element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
            <Route path="/notes"      element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />

            {/* Protected — Admin */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────────
export default function App() {
  const { theme } = useThemeStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
      <AppLayout
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(c => !c)}
      />
    </BrowserRouter>
  );
}
