import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../api';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { Plus, X, FolderOpen } from 'lucide-react';

const PROJECT_COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name required'); return; }
    setLoading(true);
    try {
      const res = await projectAPI.create(form);
      toast.success('Project created!');
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Project</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" placeholder="e.g. Website Redesign"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="What's this project about?"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="tag-group">
              {PROJECT_COLORS.map(c => (
                <div key={c} onClick={() => setForm({...form, color: c})}
                  style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                    border: form.color===c ? '3px solid white' : '3px solid transparent',
                    boxSizing:'border-box', transition:'all 0.15s' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{flex:1, justifyContent:'center'}}>
              {loading ? <div className="spinner"/> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    projectAPI.getAll()
      .then(res => setProjects(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?';

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', marginTop:80 }}>
      <div className="spinner" style={{ width:40, height:40, borderColor:'rgba(99,102,241,0.3)', borderTopColor:'#6366f1' }}/>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Projects</h2>
          <p className="page-subtitle">{projects.length} project{projects.length!==1?'s':''} total</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18}/> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={64} />
          <h3>No projects yet</h3>
          {isAdmin ? (
            <>
              <p>Create your first project to get started</p>
              <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
                <Plus size={16}/> Create Project
              </button>
            </>
          ) : (
            <p style={{ marginTop: 8, fontSize: 13 }}>
              You're a <strong style={{ color: 'var(--text-primary)' }}>Member</strong> — ask your Admin to create a project and add you.
            </p>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
              <div className="project-card-accent" style={{ background: p.color || '#6366f1' }} />
              <div style={{ marginTop: 8 }}>
                <h3 className="project-card-title">{p.name}</h3>
                <p className="project-card-desc">{p.description || 'No description'}</p>
                <div className="project-meta">
                  <div className="member-avatars">
                    {p.members?.slice(0,4).map(m => (
                      <div key={m.user?._id||m.user} className="avatar" title={m.user?.name}>
                        {initials(m.user?.name || '?')}
                      </div>
                    ))}
                    {p.members?.length > 4 && (
                      <div className="avatar" style={{ background:'var(--border-light)', color:'var(--text-secondary)', fontSize:11 }}>
                        +{p.members.length - 4}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
                      {p.doneCount}/{p.taskCount} done
                    </span>
                  </div>
                </div>
                {p.taskCount > 0 && (
                  <div className="progress-bar" style={{ marginTop:12 }}>
                    <div className="progress-fill" style={{ width:`${Math.round((p.doneCount/p.taskCount)*100)}%`, background: p.color||'#6366f1' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreated={p => setProjects([p,...projects])} />
      )}
    </div>
  );
}
