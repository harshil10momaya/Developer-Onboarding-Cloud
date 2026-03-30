import React, { useState, useEffect } from 'react';
import { discussionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const CATEGORIES = ['Backend', 'Frontend', 'Database', 'DevOps', 'General'];

const Discussions = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'General' });
  const [filterCat, setFilterCat] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');

  const fetchDiscussions = () => {
    setLoading(true);
    discussionAPI.list(filterCat || undefined)
      .then(setDiscussions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDiscussions(); }, [filterCat]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newDisc = await discussionAPI.create(form);
      setDiscussions([newDisc, ...discussions]);
      setShowForm(false);
      setForm({ title: '', body: '', category: 'General' });
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this discussion?')) return;
    try {
      await discussionAPI.delete(id);
      setDiscussions(discussions.filter((d) => d.id !== id));
      if (selectedDiscussion?.id === id) setSelectedDiscussion(null);
    } catch (err) { console.error(err); }
  };

  const openThread = async (disc) => {
    setSelectedDiscussion(disc);
    try {
      const data = await discussionAPI.listReplies(disc.id);
      setReplies(data);
    } catch (err) { console.error(err); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const newReply = await discussionAPI.createReply(selectedDiscussion.id, replyText);
      setReplies([...replies, newReply]);
      setReplyText('');
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💬 Discussions</h1>
        <p>Join community discussions and share knowledge</p>
        <button className="action-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Discussion'}
        </button>
      </div>

      {/* Category filter */}
      <div className="filter-bar">
        <button className={`filter-btn ${filterCat === '' ? 'active' : ''}`} onClick={() => setFilterCat('')}>All</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`filter-btn ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)}>{cat}</button>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="form-card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <input type="text" placeholder="Discussion title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="What's on your mind?" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows="3" style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px' }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="action-btn">Post Discussion</button>
          </form>
        </div>
      )}

      {/* Thread view */}
      {selectedDiscussion && (
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 4px 0' }}>{selectedDiscussion.title}</h3>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px 0' }}>by {selectedDiscussion.author_name} · {selectedDiscussion.category}</p>
              {selectedDiscussion.body && <p style={{ color: '#cbd5e1', margin: '0 0 16px 0' }}>{selectedDiscussion.body}</p>}
            </div>
            <button onClick={() => setSelectedDiscussion(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>

          {/* Replies */}
          <div style={{ borderTop: '1px solid #334155', paddingTop: '12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>{replies.length} replies</p>
            {replies.map((r) => (
              <div key={r.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                <p style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>{r.author_name}</p>
                <p style={{ color: '#cbd5e1', margin: '0', fontSize: '14px' }}>{r.body}</p>
              </div>
            ))}
            <form onSubmit={handleReply} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input type="text" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ flex: 1, padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} />
              <button type="submit" className="action-btn">Reply</button>
            </form>
          </div>
        </div>
      )}

      {/* Discussion list */}
      <div className="discussions-list">
        {discussions.map((discussion) => (
          <div key={discussion.id} className="discussion-item">
            <div className="discussion-content" onClick={() => openThread(discussion)} style={{ cursor: 'pointer' }}>
              <h3>{discussion.title}</h3>
              <p className="author">by {discussion.author_name}</p>
              <div className="discussion-meta">
                <span className="category">{discussion.category}</span>
                <span className="replies">💬 {discussion.reply_count} replies</span>
                <span className="views">👁️ {discussion.views} views</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="join-btn" onClick={() => openThread(discussion)}>View Thread →</button>
              {(discussion.author_id === user?.id || user?.role === 'admin') && (
                <button className="delete-btn" onClick={() => handleDelete(discussion.id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
        {discussions.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No discussions yet. Start one!</p>}
      </div>
    </div>
  );
};

export default Discussions;
