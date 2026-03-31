import React, { useState, useEffect } from 'react';
import { repoAPI, codeAnalysisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const Repositories = () => {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', description: '', tech_stack: '' });
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(null);

  const canAdd = user?.role === 'developer' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    repoAPI.list().then(setRepositories).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newRepo = await repoAPI.create({ ...form, tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean) });
      setRepositories([...repositories, newRepo]);
      setShowForm(false);
      setForm({ name: '', url: '', description: '', tech_stack: '' });
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this repository?')) return;
    await repoAPI.delete(id);
    setRepositories(repositories.filter((r) => r.id !== id));
  };

  const handleAnalyze = async (repoId) => {
    setAnalyzing(repoId);
    try {
      await codeAnalysisAPI.analyze(repoId);
      setRepositories(repositories.map((r) => r.id === repoId ? { ...r, is_analyzed: true } : r));
    } catch (err) { console.error(err); }
    finally { setAnalyzing(null); }
  };

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📦 Repositories</h1>
        <p>Manage and analyze your project repositories</p>
        {canAdd && <button className="action-btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Repository'}</button>}
      </div>

      {showForm && canAdd && (
        <div className="form-card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Repository Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="url" placeholder="Repository URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="text" placeholder="Tech Stack (comma-separated)" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
            <button type="submit" className="action-btn">Add Repository</button>
          </form>
        </div>
      )}

      <div className="repositories-list">
        <table className="repositories-table">
          <thead><tr><th>Name</th><th>Tech Stack</th><th>Status</th><th>Analysis</th><th>Actions</th></tr></thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.id}>
                <td><strong>{repo.name}</strong><br /><span style={{ color: '#64748b', fontSize: '12px' }}>{repo.description}</span></td>
                <td>{(repo.tech_stack || []).join(', ')}</td>
                <td><span className="badge active">Active</span></td>
                <td>{repo.is_analyzed ? <span className="badge success">Analyzed</span> : <span className="badge warning">Pending</span>}</td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  {!repo.is_analyzed && (
                    <button className="action-btn" onClick={() => handleAnalyze(repo.id)} disabled={analyzing === repo.id} style={{ fontSize: '12px', padding: '4px 10px' }}>
                      {analyzing === repo.id ? '...' : 'Analyze'}
                    </button>
                  )}
                  {canDelete && <button className="delete-btn" onClick={() => handleDelete(repo.id)}>🗑️</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Repositories;
