import React, { useState, useEffect } from 'react';
import { repoAPI } from '../services/api';
import '../styles/Pages.css';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', description: '', tech_stack: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    repoAPI.list()
      .then(setRepositories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newRepo = await repoAPI.create({
        ...form,
        tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setRepositories([...repositories, newRepo]);
      setShowForm(false);
      setForm({ name: '', url: '', description: '', tech_stack: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this repository?')) return;
    try {
      await repoAPI.delete(id);
      setRepositories(repositories.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📦 Repositories</h1>
        <p>Manage and view all your repositories</p>
        <button className="action-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Repository'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Repository Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="url" placeholder="Repository URL (https://github.com/...)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="text" placeholder="Tech Stack (comma-separated: React, Django, PostgreSQL)" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
            <button type="submit" className="action-btn">Add Repository</button>
          </form>
        </div>
      )}

      <div className="repositories-list">
        <table className="repositories-table">
          <thead>
            <tr>
              <th>Repository Name</th>
              <th>Tech Stack</th>
              <th>Status</th>
              <th>Analyzed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.id}>
                <td>{repo.name}</td>
                <td>{(repo.tech_stack || []).join(', ')}</td>
                <td><span className="badge active">Active</span></td>
                <td>{repo.is_analyzed ? '✓' : '✗'}</td>
                <td><button className="delete-btn" onClick={() => handleDelete(repo.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Repositories;
