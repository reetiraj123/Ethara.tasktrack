import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name required'); return; }
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ name });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'U';

  return (
    <div style={{maxWidth:480}}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Profile</h2>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="card">
        <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:28}}>
          <div className="avatar" style={{width:64,height:64,fontSize:22}}>{initials}</div>
          <div>
            <div style={{fontSize:20,fontWeight:700}}>{user?.name}</div>
            <div style={{fontSize:13,color:'var(--text-secondary)'}}>{user?.email}</div>
            <span className="badge badge-admin" style={{marginTop:6,display:'inline-flex'}}>{user?.role}</span>
          </div>
        </div>

        <div className="divider"/>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" value={user?.email} disabled style={{opacity:0.6,cursor:'not-allowed'}}/>
            <p className="form-error" style={{color:'var(--text-secondary)'}}>Email cannot be changed</p>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" value={user?.role} disabled style={{opacity:0.6,cursor:'not-allowed'}}/>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner"/> : <><Save size={16}/> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
