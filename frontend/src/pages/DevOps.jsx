import React, { useState, useEffect } from 'react';
import { pipelineAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const DevOps = () => {
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', tools: '', success_rate: 90 });
  const [triggering, setTriggering] = useState(null);
  const [notif, setNotif] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => { pipelineAPI.list().then(setPipelines).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleCreate = async (e) => { e.preventDefault(); try { const p = await pipelineAPI.create({ name: form.name, tools: form.tools, success_rate: parseInt(form.success_rate) || 0, status: 'Active' }); setPipelines([p, ...pipelines]); setShowForm(false); setForm({ name: '', tools: '', success_rate: 90 }); setNotif('✓ Pipeline created!'); setTimeout(() => setNotif(''), 3000); } catch (err) { setNotif('Failed: ' + err.message); } };
  const handleTrigger = async (id) => { setTriggering(id); try { const u = await pipelineAPI.trigger(id); setPipelines(pipelines.map((p) => p.id === u.id ? u : p)); setNotif('✓ Pipeline triggered!'); setTimeout(() => setNotif(''), 3000); } catch (err) { console.error(err); } finally { setTriggering(null); } };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await pipelineAPI.delete(id); setPipelines(pipelines.filter((p) => p.id !== id)); };

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;
  return (
    <div className="page-container">
      <div className="page-header"><h1>🚀 DevOps & CI/CD</h1><p>Manage deployment pipelines</p>{isAdmin && <button className="action-btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Pipeline'}</button>}</div>
      {notif && <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>{notif}</div>}
      {showForm && isAdmin && <div className="form-card"><form onSubmit={handleCreate}><input type="text" placeholder="Pipeline name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><input type="text" placeholder="Tools (e.g. GitHub Actions, Docker)" value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} /><input type="number" placeholder="Success rate (%)" value={form.success_rate} onChange={(e) => setForm({ ...form, success_rate: e.target.value })} min="0" max="100" /><button type="submit" className="action-btn">Create</button></form></div>}
      <div className="pipelines-list">{pipelines.map((p) => (<div key={p.id} className="pipeline-card"><div className="pipeline-header"><h3>{p.name}</h3><span className={`status ${p.status.toLowerCase().replace(' ', '-')}`}>{p.status}</span></div><div className="pipeline-content"><div className="info-row"><span className="label">Last Run:</span><span>{p.last_run ? new Date(p.last_run).toLocaleString() : 'Never'}</span></div><div className="info-row"><span className="label">Success Rate:</span><span className="success-rate">{p.success_rate}%</span></div><div className="info-row"><span className="label">Tools:</span><span>{p.tools || 'N/A'}</span></div></div>{isAdmin && <div style={{ display: 'flex', gap: '8px' }}><button className="manage-btn" onClick={() => handleTrigger(p.id)} disabled={triggering === p.id}>{triggering === p.id ? 'Running...' : '▶ Run'}</button><button className="delete-btn" onClick={() => handleDelete(p.id)} style={{ padding: '8px 12px' }}>🗑️</button></div>}</div>))}{pipelines.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No pipelines.</p>}</div>
    </div>
  );
};
export default DevOps;
