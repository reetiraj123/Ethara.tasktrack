import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI } from '../api';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, UserPlus, ArrowLeft, AlertTriangle } from 'lucide-react';

const STATUS_COLS = [
  { key: 'TODO', label: 'To Do', color: '#9999cc' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#06b6d4' },
  { key: 'DONE', label: 'Done', color: '#10b981' },
];
const PRIORITY_COLORS = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };

function DeleteProjectModal({ projectName, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} style={{ color: 'var(--red)' }} />
            </div>
            <h3 className="modal-title">Delete Project</h3>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16}/></button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{projectName}</strong>?
        </p>
        <p style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 24 }}>
          This will permanently delete the project and <strong>all tasks</strong> inside it. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, justifyContent: 'center', background: 'var(--red)', color: 'white', border: 'none' }}
          >
            {loading ? <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : <><Trash2 size={14} /> Delete Project</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({ title:'', description:'', priority:'MEDIUM', dueDate:'', assignee:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setLoading(true);
    try {
      const payload = { ...form, assignee: form.assignee||null, dueDate: form.dueDate||null };
      const res = await taskAPI.create(projectId, payload);
      toast.success('Task created!');
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create Task</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Task title..." value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Details..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-input" value={form.assignee} onChange={e=>setForm({...form,assignee:e.target.value})}>
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{flex:1,justifyContent:'center'}}>
              {loading ? <div className="spinner"/> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Email required'); return; }
    setLoading(true);
    try {
      const res = await projectAPI.addMember(projectId, { email, role });
      toast.success('Member added!');
      onAdded(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Member</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Member Email</label>
            <input className="form-input" type="email" placeholder="teammate@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Project Role</label>
            <select className="form-input" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{flex:1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{flex:1,justifyContent:'center'}}>
              {loading?<div className="spinner"/>:'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  useEffect(() => {
    Promise.all([
      projectAPI.getOne(id),
      taskAPI.getByProject(id)
    ]).then(([pRes, tRes]) => {
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
    }).catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const myRole = project?.members?.find(m => m.user?._id === user?._id || m.user === user?._id)?.role;
  const canAdmin = myRole === 'ADMIN' || isAdmin;
  const isOwner = project?.owner?._id === user?._id || project?.owner === user?._id || isAdmin;

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await taskAPI.updateStatus(taskId, status);
      setTasks(tasks.map(t => t._id === taskId ? res.data.data : t));
      toast.success('Status updated');
    } catch (err) { toast.error('Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) { toast.error('Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await projectAPI.removeMember(id, userId);
      setProject({...project, members: project.members.filter(m => (m.user?._id||m.user) !== userId)});
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteProject = async () => {
    setDeleteLoading(true);
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
      setDeleteLoading(false);
    }
  };

  const initials = (name) => name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : null;
  const isOverdue = (t) => t.dueDate && t.status!=='DONE' && new Date()>new Date(t.dueDate);

  if (loading) return <div style={{display:'flex',justifyContent:'center',marginTop:80}}><div className="spinner" style={{width:40,height:40,borderColor:'rgba(99,102,241,0.3)',borderTopColor:'#6366f1'}}/></div>;
  if (!project) return <div className="empty-state"><p>Project not found.</p></div>;

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn btn-icon btn-secondary" onClick={()=>navigate('/projects')}><ArrowLeft size={16}/></button>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:12,height:12,borderRadius:'50%',background:project.color||'#6366f1'}}/>
              <h2 className="page-title">{project.name}</h2>
            </div>
            <p className="page-subtitle">{project.description||'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canAdmin && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={()=>setShowMemberModal(true)}>
                <UserPlus size={15}/> Add Member
              </button>
              <button className="btn btn-primary btn-sm" onClick={()=>setShowTaskModal(true)}>
                <Plus size={15}/> New Task
              </button>
            </>
          )}
          {isOwner && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowDeleteModal(true)}
              title="Delete this project"
            >
              <Trash2 size={15}/> Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:24,borderBottom:'1px solid var(--border)',paddingBottom:0}}>
        {['board','members'].map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)}
            style={{padding:'8px 20px',background:'none',color:activeTab===tab?'var(--accent)':'var(--text-secondary)',
              borderBottom:activeTab===tab?'2px solid var(--accent)':'2px solid transparent',
              fontWeight:600,fontSize:14,transition:'all 0.2s',textTransform:'capitalize'}}>
            {tab === 'board' ? 'Kanban Board' : 'Members'}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <div className="kanban-board">
          {STATUS_COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{color:col.color}}>{col.label}</span>
                  <span className="kanban-count">{colTasks.length}</span>
                </div>
                {colTasks.length === 0 ? (
                  <p style={{fontSize:13,color:'var(--text-secondary)',textAlign:'center',padding:'20px 0'}}>No tasks</p>
                ) : colTasks.map(task => (
                  <div key={task._id} className="task-card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                      <div className="task-card-title" style={{cursor:'pointer'}} onClick={()=>navigate(`/tasks/${task._id}`)}>{task.title}</div>
                      {canAdmin && (
                        <button className="btn btn-icon btn-danger" style={{width:28,height:28,flexShrink:0}} onClick={()=>handleDeleteTask(task._id)}>
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                    <div className="task-card-meta" style={{marginBottom:10}}>
                      <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      {isOverdue(task) && <span className="badge badge-overdue">Overdue</span>}
                      {task.dueDate && <span className={`task-card-due ${isOverdue(task)?'overdue':''}`}>{formatDate(task.dueDate)}</span>}
                    </div>
                    {task.assignee && (
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                        <div className="avatar" style={{width:22,height:22,fontSize:10}}>{initials(task.assignee.name)}</div>
                        <span style={{fontSize:12,color:'var(--text-secondary)'}}>{task.assignee.name}</span>
                      </div>
                    )}
                    <select value={task.status}
                      onChange={e=>handleStatusChange(task._id,e.target.value)}
                      style={{width:'100%',padding:'5px 8px',background:'var(--bg-primary)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-secondary)',fontSize:12,cursor:'pointer'}}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{maxWidth:500}}>
          {project.members.map(m => {
            const u = m.user;
            const uid = u?._id||u;
            return (
              <div key={uid} className="member-item">
                <div className="avatar">{initials(u?.name)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14}}>{u?.name||'Unknown'}</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)'}}>{u?.email||''}</div>
                </div>
                <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                {canAdmin && uid !== project.owner?._id && uid !== project.owner && (
                  <button className="btn btn-icon btn-danger" style={{width:28,height:28}} onClick={()=>handleRemoveMember(uid)}>
                    <X size={13}/>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showTaskModal && (
        <CreateTaskModal projectId={id} members={project.members.filter(m=>m.user?._id||m.user)}
          onClose={()=>setShowTaskModal(false)} onCreated={t=>setTasks([t,...tasks])}/>
      )}
      {showMemberModal && (
        <AddMemberModal projectId={id} onClose={()=>setShowMemberModal(false)}
          onAdded={p=>setProject(p)}/>
      )}
      {showDeleteModal && (
        <DeleteProjectModal
          projectName={project.name}
          loading={deleteLoading}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  );
}
