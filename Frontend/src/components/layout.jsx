import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LayoutDashboard, FolderKanban, User, LogOut, Crown, Shield, Zap } from 'lucide-react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text" style={{ display:'flex', alignItems:'center', gap:6 }}><Zap size={18} style={{ color:'#6366f1', flexShrink:0 }} /> TaskFlow</div>
          <div className="logo-sub">Team Task Manager</div>

        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /><span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FolderKanban size={18} /><span>Projects</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <User size={18} /><span>Profile</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip" style={isAdmin ? { border: '1px solid rgba(99,102,241,0.35)', borderRadius: 10, padding: '6px 8px', background: 'rgba(99,102,241,0.07)' } : {}}>
            <div className="avatar" style={isAdmin ? { background: 'linear-gradient(135deg, #6366f1, #a855f7)' } : {}}>{initials}</div>
            <div className="user-info" style={{ flex: 1, overflow: 'hidden' }}>
              <div className="name truncate">{user?.name}</div>
              <div className="role" style={{ display: 'flex', alignItems: 'center', gap: 4, color: isAdmin ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {isAdmin ? <Crown size={11} /> : <Shield size={11} />}
                {user?.role}
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-icon btn-secondary" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
