import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Zap } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await authAPI.signup(form);
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
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
          <p>Create your account to get started</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="Enter Your Name"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="Enter Your Email"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter Your Password (Min. 6 characters)"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error && <p className="form-error" style={{marginBottom:'12px'}}>{error}</p>}
          <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
            {loading ? <><div className="spinner" />&nbsp;Creating account…</> : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
