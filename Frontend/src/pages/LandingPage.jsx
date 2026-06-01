import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ShieldCheck, Crown, Shield, Zap, CheckCircle2, XCircle, ArrowRight, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: FolderKanban,
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.2)',
    title: 'Visual Kanban Board',
    desc: 'Drag tasks across TODO, IN PROGRESS, and DONE columns. See your team\'s work at a glance with color-coded priorities.',
  },
  {
    icon: ShieldCheck,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
    title: 'Role-Based Access',
    desc: 'Three-tier permission system — Global Admin, Project Admin, and Member. Every action is controlled and secure.',
  },
  {
    icon: LayoutDashboard,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.2)',
    title: 'Live Dashboard',
    desc: 'Real-time stats on total tasks, completed work, overdue items, and your team\'s overall completion rate.',
  },
];

const ADMIN_CAN = [
  'Create & delete projects',
  'Create & delete tasks',
  'Add & remove members',
  'Assign tasks to anyone',
  'Edit any task',
  'View all dashboards',
];
const MEMBER_CAN = [
  'View all projects they\'re in',
  'Move tasks across columns',
  'Edit tasks assigned to them',
  'View team members',
];
const MEMBER_CANNOT = [
  'Create or delete projects',
  'Create or delete tasks',
  'Add or remove members',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Parallax orbs on mouse move
  useEffect(() => {
    const handler = (e) => {
      const orbs = document.querySelectorAll('.landing-orb');
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 12;
        orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="landing-root">
      {/* ── Background orbs ── */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <Zap size={20} className="landing-logo-icon" />
          <span>TaskFlow</span>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-btn-ghost" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="landing-btn-primary" onClick={() => navigate('/signup')}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero" ref={heroRef}>
        <div className="landing-badge">
          <span className="landing-badge-dot" />
          Production-ready · JWT Auth · RBAC · Kanban
        </div>
        <h1 className="landing-hero-title">
          <span className="landing-gradient-text">Organize.</span>{' '}
          <span className="landing-gradient-text-2">Collaborate.</span>{' '}
          <span className="landing-gradient-text-3">Deliver.</span>
        </h1>
        <p className="landing-hero-sub">
          A full-stack Team Task Manager with real role-based access, Kanban boards,
          live dashboards, and overdue detection — built for real teams.
        </p>
        <div className="landing-hero-cta">
          <button className="landing-cta-primary" onClick={() => navigate('/signup')}>
            <Zap size={18} /> Start for free
            <span className="landing-cta-shimmer" />
          </button>
          <button className="landing-cta-secondary" onClick={() => navigate('/login')}>
            I already have an account →
          </button>
        </div>

        {/* Stats strip */}
        <div className="landing-stats">
          {[
            { value: '3', label: 'Permission Roles' },
            { value: 'JWT', label: 'Secure Auth' },
            { value: '∞', label: 'Projects & Tasks' },
            { value: '100%', label: 'Responsive UI' },
          ].map((s) => (
            <div key={s.label} className="landing-stat">
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Everything your team needs</h2>
          <p className="landing-section-sub">Powerful features wrapped in a clean, fast interface</p>
        </div>
        <div className="landing-features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="landing-feature-card" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="landing-feature-icon" style={{ background: f.glow, color: f.color, boxShadow: `0 0 20px ${f.glow}` }}>
                <f.icon size={26} />
              </div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Comparison ── */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Clear roles, clear responsibilities</h2>
          <p className="landing-section-sub">Know exactly who can do what — no confusion, no conflicts</p>
        </div>
        <div className="landing-roles-grid">
          {/* Admin card */}
          <div className="landing-role-card landing-role-admin">
            <div className="landing-role-header">
              <div className="landing-role-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                <Crown size={22} />
              </div>
              <div>
                <div className="landing-role-name" style={{ color: '#6366f1' }}>Admin</div>
                <div className="landing-role-tagline">Full control over projects & members</div>
              </div>
            </div>
            <ul className="landing-role-list">
              {ADMIN_CAN.map(item => (
                <li key={item} className="landing-role-item landing-role-yes">
                  <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Member card */}
          <div className="landing-role-card landing-role-member">
            <div className="landing-role-header">
              <div className="landing-role-icon" style={{ background: 'rgba(85,85,119,0.2)', color: '#9999b8' }}>
                <Shield size={22} />
              </div>
              <div>
                <div className="landing-role-name" style={{ color: '#9999b8' }}>Member</div>
                <div className="landing-role-tagline">Collaborate without overstepping</div>
              </div>
            </div>
            <ul className="landing-role-list">
              {MEMBER_CAN.map(item => (
                <li key={item} className="landing-role-item landing-role-yes">
                  <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
              {MEMBER_CANNOT.map(item => (
                <li key={item} className="landing-role-item landing-role-no">
                  <XCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="landing-final-cta">
        <div className="landing-final-glow" />
        <Users size={40} className="landing-final-icon" />
        <h2 className="landing-final-title">Ready to get your team organized?</h2>
        <p className="landing-final-sub">Sign up free. The first user automatically becomes Admin.</p>
        <div className="landing-hero-cta" style={{ marginTop: 32 }}>
          <button className="landing-cta-primary" onClick={() => navigate('/signup')}>
            Create your account <ArrowRight size={16} />
            <span className="landing-cta-shimmer" />
          </button>
          <button className="landing-cta-secondary" onClick={() => navigate('/login')}>
            Sign in instead
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-nav-logo" style={{ justifyContent: 'center' }}>
          <Zap size={16} className="landing-logo-icon" />
          <span>TaskFlow</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          Built with Node.js · Express · MongoDB · React · JWT
        </p>
      </footer>
    </div>
  );
}
