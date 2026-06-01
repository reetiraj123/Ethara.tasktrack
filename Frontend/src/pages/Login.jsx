import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Zap } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('All fields required.'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <button
        onClick={() => navigate('/')}
        style={{ position:'absolute', top:24, left:24, display:'flex', alignItems:'center', gap:6, background:'none', border:'1px solid var(--border)', color:'var(--text-secondary)', padding:'7px 14px', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'var(--transition)', fontFamily:'var(--font)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}
      >
        <ArrowLeft size={14} /> Back
      </button>
      <div className="auth-card">
        <div className="auth-logo">
          <h1 style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><Zap size={22} style={{ color:'#6366f1' }} /> TaskFlow</h1>
          <p>Sign in to manage your team tasks</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          {error && <p className="form-error" style={{marginBottom:'12px'}}>{error}</p>}
          <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
            {loading ? <><div className="spinner" />&nbsp;Signing in…</> : 'Sign In'}
          </button>
        </form>
        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
