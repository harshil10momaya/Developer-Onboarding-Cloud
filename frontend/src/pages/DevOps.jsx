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
  const [triggeringId, setTriggeringId] = useState(null);
  const [notification, setNotification] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    pipelineAPI.list()
      .then(setPipelines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const p = await pipelineAPI.create({ name: form.name, tools: form.tools, success_rate: parseInt(form.success_rate) || 0, status: 'Active' });
      setPipelines([p, ...pipelines]);
      setShowForm(false);
      setForm({ name: '', tools: '', success_rate: 90 });
      setNotification('✓ Pipeline created!');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) { setNotification('Failed: ' + err.message); }
  };

  const handleTrigger = async (id) => {
    setTriggeringId(id);
    try {
      const updated = await pipelineAPI.trigger(id);
      setPipelines(pipelines.map((p) => (p.id === updated.id ? updated : p)));
      setNotification('✓ Pipeline triggered successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) { console.error(err); }
    finally { setTriggeringId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pipeline?')) return;
    await pipelineAPI.delete(id);
    setPipelines(pipelines.filter((p) => p.id !== id));
  };

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🚀 DevOps & CI/CD</h1>
        <p>Manage deployment pipelines and infrastructure</p>
        {isAdmin && (
          <button className="action-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Pipeline'}
          </button>
        )}
      </div>

      {notification && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>{notification}</div>
      )}

      {showForm && isAdmin && (
        <div className="form-card">
          <form onSubmit={handleCreate}>
            <input type="text" placeholder="Pipeline name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="text" placeholder="Tools (e.g. GitHub Actions, Docker, K8s)" value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} />
            <input type="number" placeholder="Success rate (%)" value={form.success_rate} onChange={(e) => setForm({ ...form, success_rate: e.target.value })} min="0" max="100" />
            <button type="submit" className="action-btn">Create Pipeline</button>
          </form>
        </div>
      )}

      <div className="pipelines-list">
        {pipelines.map((pipeline) => (
          <div key={pipeline.id} className="pipeline-card">
            <div className="pipeline-header">
              <h3>{pipeline.name}</h3>
              <span className={`status ${pipeline.status.toLowerCase().replace(' ', '-')}`}>{pipeline.status}</span>
            </div>
            <div className="pipeline-content">
              <div className="info-row"><span className="label">Last Run:</span><span>{pipeline.last_run ? new Date(pipeline.last_run).toLocaleString() : 'Never'}</span></div>
              <div className="info-row"><span className="label">Success Rate:</span><span className="success-rate">{pipeline.success_rate}%</span></div>
              <div className="info-row"><span className="label">Tools:</span><span>{pipeline.tools || 'N/A'}</span></div>
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="manage-btn" onClick={() => handleTrigger(pipeline.id)} disabled={triggeringId === pipeline.id}>
                  {triggeringId === pipeline.id ? 'Running...' : '▶ Run Pipeline'}
                </button>
                <button className="delete-btn" onClick={() => handleDelete(pipeline.id)} style={{ padding: '8px 12px' }}>🗑️</button>
              </div>
            )}
          </div>
        ))}
        {pipelines.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No pipelines configured.</p>}
      </div>
    </div>
  );
};

export default DevOps;
