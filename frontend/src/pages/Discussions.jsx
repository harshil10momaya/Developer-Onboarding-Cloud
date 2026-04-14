import React, { useState, useEffect } from 'react';
import { discussionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const CATS = ['Backend', 'Frontend', 'Database', 'DevOps', 'General'];

const Discussions = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'General' });
  const [filterCat, setFilterCat] = useState('');
  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');

  const fetchDisc = () => { setLoading(true); discussionAPI.list(filterCat || undefined).then(setDiscussions).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchDisc(); }, [filterCat]);

  const handleCreate = async (e) => { e.preventDefault(); try { const d = await discussionAPI.create(form); setDiscussions([d, ...discussions]); setShowForm(false); setForm({ title: '', body: '', category: 'General' }); } catch (err) { console.error(err); } };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await discussionAPI.delete(id); setDiscussions(discussions.filter((d) => d.id !== id)); if (selected?.id === id) setSelected(null); };
  const openThread = async (d) => { setSelected(d); try { setReplies(await discussionAPI.listReplies(d.id)); } catch (err) { console.error(err); } };
  const handleReply = async (e) => { e.preventDefault(); if (!replyText.trim()) return; try { const r = await discussionAPI.createReply(selected.id, replyText); setReplies([...replies, r]); setReplyText(''); } catch (err) { console.error(err); } };

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;
  return (
    <div className="page-container">
      <div className="page-header"><h1>💬 Discussions</h1><p>Community discussions</p><button className="action-btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Discussion'}</button></div>
      <div className="filter-bar"><button className={`filter-btn ${filterCat === '' ? 'active' : ''}`} onClick={() => setFilterCat('')}>All</button>{CATS.map((c) => <button key={c} className={`filter-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>)}</div>

      {showForm && <div className="form-card"><form onSubmit={handleCreate}><input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /><textarea placeholder="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows="3" style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} /><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}>{CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select><button type="submit" className="action-btn">Post</button></form></div>}

      {selected && <div className="form-card" style={{ marginBottom: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><h3 style={{ color: '#f1f5f9', margin: '0 0 4px' }}>{selected.title}</h3><p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px' }}>by {selected.author_name} · {selected.category}</p>{selected.body && <p style={{ color: '#cbd5e1', margin: '0 0 16px' }}>{selected.body}</p>}</div><button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>✕</button></div>
        <div style={{ borderTop: '1px solid #334155', paddingTop: '12px' }}><p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>{replies.length} replies</p>{replies.map((r) => (<div key={r.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}><p style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>{r.author_name}</p><p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>{r.body}</p></div>))}
          <form onSubmit={handleReply} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}><input type="text" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ flex: 1, padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' }} /><button type="submit" className="action-btn">Reply</button></form></div></div>}

      <div className="discussions-list">{discussions.map((d) => (<div key={d.id} className="discussion-item"><div className="discussion-content" onClick={() => openThread(d)} style={{ cursor: 'pointer' }}><h3>{d.title}</h3><p className="author">by {d.author_name}</p><div className="discussion-meta"><span className="category">{d.category}</span><span className="replies">💬 {d.reply_count} replies</span><span className="views">👁️ {d.views} views</span></div></div><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><button className="join-btn" onClick={() => openThread(d)}>View →</button>{(d.author_id === user?.id || user?.role === 'admin') && <button className="delete-btn" onClick={() => handleDelete(d.id)}>🗑️</button>}</div></div>))}{discussions.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No discussions yet.</p>}</div>
    </div>
  );
};
export default Discussions;
