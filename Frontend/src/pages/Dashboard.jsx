import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api';
import { CheckCircle, Clock, AlertTriangle, FolderOpen, ListTodo, TrendingUp } from 'lucide-react';

const PRIORITY_COLORS = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };
const STATUS_COLORS = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in_progress', DONE: 'badge-done' };

function StatCard({ icon, value, label, accentClass, iconBg }) {
  return (
    <div className={`stat-card ${accentClass}`}>
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
      <div className="spinner" style={{ width: 40, height: 40, borderColor: 'rgba(99,102,241,0.3)', borderTopColor: '#6366f1' }} />
    </div>
  );

  const { stats, recentTasks, myTasks } = data || {};

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—';
  const isOverdue = (t) => t.dueDate && t.status !== 'DONE' && new Date() > new Date(t.dueDate);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of your team's progress</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<FolderOpen size={22} color="#6366f1"/>} value={stats?.totalProjects ?? 0} label="Total Projects" accentClass="stat-accent-purple" iconBg="rgba(99,102,241,0.15)" />
        <StatCard icon={<ListTodo size={22} color="#06b6d4"/>} value={stats?.totalTasks ?? 0} label="Total Tasks" accentClass="stat-accent-cyan" iconBg="rgba(6,182,212,0.15)" />
        <StatCard icon={<Clock size={22} color="#f59e0b"/>} value={stats?.inProgressTasks ?? 0} label="In Progress" accentClass="stat-accent-yellow" iconBg="rgba(245,158,11,0.15)" />
        <StatCard icon={<CheckCircle size={22} color="#10b981"/>} value={stats?.doneTasks ?? 0} label="Completed" accentClass="stat-accent-green" iconBg="rgba(16,185,129,0.15)" />
        <StatCard icon={<AlertTriangle size={22} color="#ef4444"/>} value={stats?.overdueTasks ?? 0} label="Overdue" accentClass="stat-accent-red" iconBg="rgba(239,68,68,0.15)" />
        <StatCard icon={<TrendingUp size={22} color="#6366f1"/>} value={`${stats?.completionRate ?? 0}%`} label="Completion Rate" accentClass="stat-accent-purple" iconBg="rgba(99,102,241,0.15)" />
      </div>

      {stats?.totalTasks > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="flex items-center justify-between mb-4">
            <span className="section-title">Overall Progress</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stats.doneTasks}/{stats.totalTasks} tasks done</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <p className="section-title">Recent Tasks</p>
          {recentTasks?.length === 0 ? (
            <p className="text-muted text-sm">No tasks yet.</p>
          ) : recentTasks?.map(task => (
            <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)}
              className="task-card" style={{ marginBottom: 8 }}>
              <div className="task-card-title">{task.title}</div>
              <div className="task-card-meta">
                <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_',' ')}</span>
                <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                {task.project && <span className="text-sm text-muted">{task.project.name}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <p className="section-title">My Tasks</p>
          {myTasks?.length === 0 ? (
            <p className="text-muted text-sm">No tasks assigned to you.</p>
          ) : myTasks?.map(task => (
            <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)}
              className="task-card" style={{ marginBottom: 8 }}>
              <div className="task-card-title">{task.title}</div>
              <div className="task-card-meta">
                <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_',' ')}</span>
                {isOverdue(task) && <span className="badge badge-overdue">Overdue</span>}
                <span className={`task-card-due ${isOverdue(task) ? 'overdue' : ''}`}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
