import { useEffect, useState } from 'react';
import { BarChart2, Users, BookOpen, Activity, UserCheck, UserX, Shield } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import type { AdminUserOut, PlatformStats } from '../../types';
import './AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.listUsers(),
      adminService.getStats(),
    ]).then(([u, s]) => {
      setUsers(u);
      setStats(s);
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (userId: number) => {
    try {
      const res = await adminService.toggleUserActive(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.is_active } : u));
      toast.success(`User ${res.is_active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleChangeRole = async (userId: number, role: string) => {
    try {
      await adminService.changeUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to change role');
    }
  };

  const chartData = stats ? {
    labels: Object.keys(stats.career_goal_distribution),
    datasets: [{
      data: Object.values(stats.career_goal_distribution),
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'],
      borderWidth: 0,
    }],
  } : null;

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header animate-fade-up">
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-indigo-500)' }}>
              <Shield size={22} />
            </div>
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Platform management & analytics</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid-4 animate-fade-up delay-100">
            {[
              { icon: <Users size={20} />, num: stats.total_users, label: 'Total Users', color: 'indigo' },
              { icon: <BookOpen size={20} />, num: stats.total_students, label: 'Students', color: 'emerald' },
              { icon: <BarChart2 size={20} />, num: stats.total_curricula, label: 'Curricula Generated', color: 'amber' },
              { icon: <Activity size={20} />, num: stats.active_users_today, label: 'New Today', color: 'rose' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Chart + User Table */}
        <div className="admin-layout mt-6">
          {/* Career Distribution */}
          {chartData && (
            <div className="card-3d animate-fade-up delay-200">
              <h3 className="mb-4">Career Goal Distribution</h3>
              <div style={{ maxWidth: 240, margin: '0 auto' }}>
                <Doughnut
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: 'var(--text-secondary)', font: { family: 'Inter', size: 12 }, boxWidth: 12 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="card-3d animate-fade-up delay-300" style={{ overflow: 'hidden' }}>
            <h3 className="mb-4">All Users ({users.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">{user.email.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="admin-user-name">{user.student_name || '—'}</div>
                            <div className="admin-user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="role-select"
                          value={user.role}
                          onChange={e => handleChangeRole(user.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${user.is_active ? 'badge-emerald' : 'badge-rose'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${user.is_active ? 'btn-ghost' : 'btn-secondary'}`}
                          onClick={() => handleToggleActive(user.id)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
