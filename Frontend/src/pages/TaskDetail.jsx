import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskAPI, projectAPI } from '../api';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Flag, Edit2, Save, X } from 'lucide-react';

const STATUS_COLORS = { TODO:'badge-todo', IN_PROGRESS:'badge-in_progress', DONE:'badge-done' };
const PRIORITY_COLORS = { LOW:'badge-low', MEDIUM:'badge-medium', HIGH:'badge-high' };

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [projectRole, setProjectRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    taskAPI.getOne(id)
      .then(async res => {
        const t = res.data.data;
        setTask(t);
        setForm({
          title: t.title, description: t.description||'',
          status: t.status, priority: t.priority,
          dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
          assignee: t.assignee?._id || ''
        });
        if (t.project?._id) {
          const mRes = await projectAPI.getMembers(t.project._id);
          setMembers(mRes.data.data);
          const myMembership = mRes.data.data?.find(
            m => (m.user?._id || m.user) === user?._id
          );
          setProjectRole(myMembership?.role || null);
        }
      }).catch(() => toast.error('Task not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = isAdmin || projectRole === 'ADMIN' || task?.assignee?._id === user?._id;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await taskAPI.update(id, { ...form, assignee: form.assignee||null, dueDate: form.dueDate||null });
      setTask(res.data.data);
      setEditing(false);
      toast.success('Task updated!');
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await taskAPI.updateStatus(id, status);
      setTask(res.data.data);
      setForm({...form, status});
      toast.success('Status updated');
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',marginTop:80}}><div className="spinner" style={{width:40,height:40,borderColor:'rgba(99,102,241,0.3)',borderTopColor:'#6366f1'}}/></div>;
  if (!task) return <div className="empty-state"><p>Task not found.</p></div>;

  const isOverdue = task.dueDate && task.status!=='DONE' && new Date()>new Date(task.dueDate);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}) : 'No due date';

  return (
    <div style={{maxWidth:680}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button className="btn btn-icon btn-secondary" onClick={()=>navigate(-1)}><ArrowLeft size={16}/></button>
        <div style={{flex:1}}>
          {task.project && <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>{task.project.name}</div>}
        </div>
        {canEdit && !editing && (
          <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(true)}><Edit2 size={14}/> Edit</button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(false)}><X size={14}/> Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving?<div className="spinner"/>:<><Save size={14}/> Save</>}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        {editing ? (
          <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
            style={{fontSize:22,fontWeight:700,marginBottom:16,background:'transparent',border:'1px solid var(--border)'}}/>
        ) : (
          <h1 style={{fontSize:22,fontWeight:700,marginBottom:16}}>{task.title}</h1>
        )}

        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_',' ')}</span>
          <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority} PRIORITY</span>
          {isOverdue && <span className="badge badge-overdue">OVERDUE</span>}
        </div>

        <div className="divider"/>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          <div>
            <div style={{fontSize:12,color:'var(--text-secondary)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
              <Flag size={13}/> Priority
            </div>
            {editing ? (
              <select className="form-input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </select>
            ) : <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>}
          </div>
          <div>
            <div style={{fontSize:12,color:'var(--text-secondary)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
              <Calendar size={13}/> Due Date
            </div>
            {editing ? (
              <input type="date" className="form-input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
            ) : <span style={{fontSize:14,color:isOverdue?'var(--red)':'var(--text-primary)'}}>{formatDate(task.dueDate)}</span>}
          </div>
          <div>
            <div style={{fontSize:12,color:'var(--text-secondary)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
              <User size={13}/> Assignee
            </div>
            {editing ? (
              <select className="form-input" value={form.assignee} onChange={e=>setForm({...form,assignee:e.target.value})}>
                <option value="">Unassigned</option>
                {members.map(m=><option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            ) : task.assignee ? (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div className="avatar" style={{width:28,height:28,fontSize:11}}>{task.assignee.name?.split(' ').map(w=>w[0]).join('').toUpperCase()}</div>
                <span style={{fontSize:14}}>{task.assignee.name}</span>
              </div>
            ) : <span style={{fontSize:14,color:'var(--text-secondary)'}}>Unassigned</span>}
          </div>
          <div>
            <div style={{fontSize:12,color:'var(--text-secondary)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Status</div>
            <select value={task.status} onChange={e=>handleStatusChange(e.target.value)}
              style={{padding:'6px 10px',background:'var(--bg-secondary)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-primary)',fontSize:13,cursor:'pointer'}}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        <div className="divider"/>
        <div>
          <div style={{fontSize:12,color:'var(--text-secondary)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Description</div>
          {editing ? (
            <textarea className="form-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{minHeight:120}}/>
          ) : <p style={{fontSize:14,lineHeight:1.7,color:task.description?'var(--text-primary)':'var(--text-secondary)'}}>{task.description||'No description provided.'}</p>}
        </div>

        <div className="divider"/>
        <div style={{fontSize:12,color:'var(--text-secondary)'}}>
          Created by <strong style={{color:'var(--text-primary)'}}>{task.createdBy?.name}</strong> · {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
