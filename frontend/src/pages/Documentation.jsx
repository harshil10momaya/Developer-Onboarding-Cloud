import React, { useState, useEffect } from 'react';
import { docsAPI } from '../services/api';
import '../styles/Pages.css';

const DOC_CATEGORIES = ['Basics', 'API', 'Database', 'DevOps', 'Guidelines'];

const Documentation = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Basics', content: '' });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    docsAPI.list()
      .then(setDocs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newDoc = await docsAPI.create(form);
      setDocs([newDoc, ...docs]);
      setShowForm(false);
      setForm({ title: '', category: 'Basics', content: '' });
    } catch (err) { setError(err.message); }
  };

  const openDoc = async (doc) => {
    try {
      const fullDoc = await docsAPI.get(doc.id);
      setSelectedDoc(fullDoc);
      setEditing(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await docsAPI.update(selectedDoc.id, {
        title: selectedDoc.title,
        category: selectedDoc.category,
        content: selectedDoc.content,
      });
      setDocs(docs.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDoc(updated);
      setEditing(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      await docsAPI.delete(id);
      setDocs(docs.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📖 Documentation</h1>
        <p>Access complete documentation and guides</p>
        <button className="action-btn" onClick={() => { setShowForm(!showForm); setSelectedDoc(null); }}>
          {showForm ? 'Cancel' : '+ New Document'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="form-card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <input type="text" placeholder="Document title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }}>
              {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Document content (Markdown supported)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows="8" style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', fontFamily: 'monospace' }} />
            <button type="submit" className="action-btn">Create Document</button>
          </form>
        </div>
      )}

      {/* Document viewer */}
      {selectedDoc && (
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              {editing ? (
                <input type="text" value={selectedDoc.title} onChange={(e) => setSelectedDoc({ ...selectedDoc, title: e.target.value })} style={{ padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '18px', fontWeight: '600', width: '100%' }} />
              ) : (
                <h2 style={{ color: '#f1f5f9', margin: '0 0 4px 0' }}>{selectedDoc.title}</h2>
              )}
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
                {selectedDoc.category} · 👁️ {selectedDoc.views} views · Updated {new Date(selectedDoc.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {editing ? (
                <button className="action-btn" onClick={handleUpdate}>Save</button>
              ) : (
                <button className="action-btn" onClick={() => setEditing(true)} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Edit</button>
              )}
              <button onClick={() => setSelectedDoc(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
          </div>
          {editing ? (
            <textarea value={selectedDoc.content || ''} onChange={(e) => setSelectedDoc({ ...selectedDoc, content: e.target.value })} rows="12" style={{ width: '100%', padding: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          ) : (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '14px' }}>
              {selectedDoc.content || 'No content yet.'}
            </div>
          )}
        </div>
      )}

      {/* Document list */}
      <div className="docs-list">
        {docs.map((doc) => (
          <div key={doc.id} className="doc-item">
            <div className="doc-content" onClick={() => openDoc(doc)} style={{ cursor: 'pointer' }}>
              <h3>{doc.title}</h3>
              <div className="doc-meta">
                <span className="category">{doc.category}</span>
                <span className="views">👁️ {doc.views} views</span>
                <span className="updated">Updated: {new Date(doc.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="read-btn" onClick={() => openDoc(doc)}>Read →</button>
              <button className="delete-btn" onClick={() => handleDelete(doc.id)}>🗑️</button>
            </div>
          </div>
        ))}
        {docs.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No documents yet. Create one!</p>}
      </div>
    </div>
  );
};

export default Documentation;
