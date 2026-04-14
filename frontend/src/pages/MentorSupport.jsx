import React, { useState, useEffect } from 'react';
import { mentorAPI, notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const MentorSupport = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [form, setForm] = useState({ scheduled_at: '', topic: '' });
  const [availability, setAvailability] = useState(null);
  const [notif, setNotif] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const isMentor = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    const fetch = async () => { try { const [m, s] = await Promise.all([mentorAPI.list(), mentorAPI.listSessions()]); setMentors(m); setSessions(s); if (isMentor) setDevelopers(await mentorAPI.getDeveloperProgress().catch(() => [])); } catch (err) { console.error(err); } finally { setLoading(false); } };
    fetch();
  }, [isMentor]);

  const checkAvail = async () => { if (!selectedMentor || !form.scheduled_at) return; try { setAvailability(await mentorAPI.checkAvailability(selectedMentor.id, form.scheduled_at)); } catch (err) { console.error(err); } };
  const requestSession = async (e) => { e.preventDefault(); try { const s = await mentorAPI.requestSession({ mentor_id: selectedMentor.id, topic: form.topic, scheduled_at: form.scheduled_at }); setSessions([s, ...sessions]); setSelectedMentor(null); setForm({ scheduled_at: '', topic: '' }); setAvailability(null); setNotif('✓ Request sent!'); setTimeout(() => setNotif(''), 5000); } catch (err) { setNotif('Failed: ' + err.message); } };
  const respond = async (id, status) => { try { const u = await mentorAPI.respondSession(id, { status, mentor_note: status === 'rejected' ? rejectNote : null }); setSessions(sessions.map((s) => s.id === u.id ? u : s)); setRespondingId(null); setRejectNote(''); setNotif(`✓ Session ${status}!`); setTimeout(() => setNotif(''), 3000); } catch (err) { console.error(err); } };

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;
  const pending = sessions.filter((s) => s.status === 'pending');
  const resolved = sessions.filter((s) => s.status !== 'pending');

  return (
    <div className="page-container">
      <div className="page-header"><h1>👨‍🏫 Mentor Support</h1><p>{isMentor ? 'Manage session requests' : 'Request mentoring sessions'}</p></div>
      {notif && <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', background: notif.startsWith('✓') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: notif.startsWith('✓') ? '#6ee7b7' : '#fca5a5' }}>{notif}</div>}

      {isMentor && pending.filter((s) => s.mentor_id === user.id).length > 0 && (<div style={{ marginBottom: '24px' }}><h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>⏳ Pending Requests</h2>
        {pending.filter((s) => s.mentor_id === user.id).map((s) => (<div key={s.id} className="form-card" style={{ marginBottom: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><h3 style={{ color: '#f1f5f9', margin: '0 0 4px' }}>{s.developer_name}</h3><p style={{ color: '#94a3b8', margin: '0 0 4px', fontSize: '13px' }}>Topic: {s.topic}</p><p style={{ color: '#64748b', margin: 0, fontSize: '12px' }}>Scheduled: {new Date(s.scheduled_at).toLocaleString()}</p></div>
          <div style={{ display: 'flex', gap: '8px' }}><button className="action-btn" onClick={() => respond(s.id, 'accepted')}>✓ Accept</button><button className="action-btn" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} onClick={() => setRespondingId(respondingId === s.id ? null : s.id)}>✕ Decline</button></div></div>
          {respondingId === s.id && <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}><input type="text" placeholder="Reason (optional)" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' }} /><button className="action-btn" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontSize: '13px' }} onClick={() => respond(s.id, 'rejected')}>Confirm</button></div>}
        </div>))}
      </div>)}

      {!isMentor && (<><h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Available Mentors</h2><div className="mentors-grid">{mentors.map((m) => (<div key={m.id} className="mentor-card"><div className="mentor-avatar">👤</div><h3>{m.full_name}</h3><p className="mentor-role">{m.dev_role ? `${m.dev_role.charAt(0).toUpperCase() + m.dev_role.slice(1)} Expert` : m.role}</p><button className="contact-btn" onClick={() => { setSelectedMentor(m); setAvailability(null); }}>Request Session</button></div>))}</div></>)}

      {selectedMentor && (<div className="modal-overlay" onClick={() => setSelectedMentor(null)}><div className="modal-content" onClick={(e) => e.stopPropagation()}><div className="modal-header"><h2>Request — {selectedMentor.full_name}</h2><button className="modal-close" onClick={() => setSelectedMentor(null)}>✕</button></div>
        <form onSubmit={requestSession}><div className="modal-form-group"><label>Date & Time</label><input type="datetime-local" value={form.scheduled_at} onChange={(e) => { setForm({ ...form, scheduled_at: e.target.value }); setAvailability(null); }} required />{form.scheduled_at && <button type="button" onClick={checkAvail} style={{ marginTop: '6px', background: 'none', border: '1px solid #334155', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Check Availability</button>}{availability && <p style={{ marginTop: '6px', fontSize: '13px', color: availability.available ? '#10b981' : '#ef4444' }}>{availability.available ? '✓ Available' : `✕ Conflict: "${availability.conflict}"`}</p>}</div>
          <div className="modal-form-group"><label>Topic</label><input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="E.g. API design review" required /></div>
          <button type="submit" className="action-btn" style={{ width: '100%' }} disabled={availability && !availability.available}>{availability && !availability.available ? 'Unavailable' : 'Send Request'}</button></form></div></div>)}

      {sessions.length > 0 && (<div style={{ marginTop: '24px' }}><h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Session History</h2><div className="analysis-table"><table><thead><tr><th>{isMentor ? 'Developer' : 'Mentor'}</th><th>Topic</th><th>Scheduled</th><th>Status</th></tr></thead><tbody>{resolved.map((s) => (<tr key={s.id}><td>{isMentor ? s.developer_name : s.mentor_name}</td><td>{s.topic}</td><td>{new Date(s.scheduled_at).toLocaleString()}</td><td><span className={`badge ${s.status === 'accepted' ? 'success' : 'warning'}`}>{s.status}</span></td></tr>))}</tbody></table></div></div>)}

      {isMentor && developers.length > 0 && (<div style={{ marginTop: '32px' }}><h2 style={{ color: '#f1f5f9', marginBottom: '16px' }}>Developer Progress</h2><div className="analysis-table"><table><thead><tr><th>Developer</th><th>Role</th><th>Completed</th><th>Rate</th></tr></thead><tbody>{developers.map((d) => (<tr key={d.id}><td>{d.full_name}</td><td>{d.dev_role || 'N/A'}</td><td>{d.modules_completed}/{d.total_modules}</td><td><span className="badge success">{d.completion_rate}%</span></td></tr>))}</tbody></table></div></div>)}
    </div>
  );
};
export default MentorSupport;
