import React, { useState, useEffect } from 'react';
import { mentorAPI, notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const MentorSupport = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [sessionForm, setSessionForm] = useState({ scheduled_at: '', topic: '' });
  const [availability, setAvailability] = useState(null);
  const [notification, setNotification] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const isMentor = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorData, sessionData, notifData] = await Promise.all([
          mentorAPI.list(), mentorAPI.listSessions(), notificationAPI.list(),
        ]);
        setMentors(mentorData);
        setSessions(sessionData);
        setNotifications(notifData);
        if (isMentor) {
          const devData = await mentorAPI.getDeveloperProgress().catch(() => []);
          setDevelopers(devData);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [isMentor]);

  const checkAvailability = async () => {
    if (!selectedMentor || !sessionForm.scheduled_at) return;
    try {
      const result = await mentorAPI.checkAvailability(selectedMentor.id, sessionForm.scheduled_at);
      setAvailability(result);
    } catch (err) { console.error(err); }
  };

  const handleRequestSession = async (e) => {
    e.preventDefault();
    try {
      const newSession = await mentorAPI.requestSession({
        mentor_id: selectedMentor.id,
        topic: sessionForm.topic,
        scheduled_at: sessionForm.scheduled_at,
      });
      setSessions([newSession, ...sessions]);
      setSelectedMentor(null);
      setSessionForm({ scheduled_at: '', topic: '' });
      setAvailability(null);
      setNotification('✓ Session request sent! Waiting for mentor approval.');
      setTimeout(() => setNotification(''), 5000);
    } catch (err) { setNotification('Failed: ' + err.message); }
  };

  const handleRespond = async (sessionId, status) => {
    try {
      const updated = await mentorAPI.respondSession(sessionId, {
        status,
        mentor_note: status === 'rejected' ? rejectNote : null,
      });
      setSessions(sessions.map((s) => (s.id === updated.id ? updated : s)));
      setRespondingId(null);
      setRejectNote('');
      setNotification(`✓ Session ${status}!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;

  const pendingSessions = sessions.filter((s) => s.status === 'pending');
  const resolvedSessions = sessions.filter((s) => s.status !== 'pending');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👨‍🏫 Mentor Support</h1>
        <p>{isMentor ? 'Manage session requests and monitor developers' : 'Request mentoring sessions and track your learning'}</p>
      </div>

      {notification && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', background: notification.startsWith('✓') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${notification.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: notification.startsWith('✓') ? '#6ee7b7' : '#fca5a5' }}>
          {notification}
        </div>
      )}

      {/* MENTOR VIEW: Pending requests */}
      {isMentor && pendingSessions.filter((s) => s.mentor_id === user.id).length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>⏳ Pending Requests</h2>
          {pendingSessions.filter((s) => s.mentor_id === user.id).map((s) => (
            <div key={s.id} className="form-card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: '#f1f5f9', margin: '0 0 4px 0' }}>{s.developer_name}</h3>
                  <p style={{ color: '#94a3b8', margin: '0 0 4px 0', fontSize: '13px' }}>Topic: {s.topic}</p>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '12px' }}>Scheduled: {new Date(s.scheduled_at).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn" onClick={() => handleRespond(s.id, 'accepted')}>✓ Accept</button>
                  <button className="action-btn" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} onClick={() => setRespondingId(respondingId === s.id ? null : s.id)}>✕ Decline</button>
                </div>
              </div>
              {respondingId === s.id && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Reason for declining (optional)" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' }} />
                  <button className="action-btn" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontSize: '13px' }} onClick={() => handleRespond(s.id, 'rejected')}>Confirm Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DEVELOPER VIEW: Mentor directory + request form */}
      {!isMentor && (
        <>
          <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Available Mentors</h2>
          <div className="mentors-grid">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="mentor-card">
                <div className="mentor-avatar">👤</div>
                <h3>{mentor.full_name}</h3>
                <p className="mentor-role">{mentor.dev_role ? `${mentor.dev_role.charAt(0).toUpperCase() + mentor.dev_role.slice(1)} Expert` : mentor.role}</p>
                <button className="contact-btn" onClick={() => { setSelectedMentor(mentor); setAvailability(null); }}>Request Session</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Session request modal */}
      {selectedMentor && (
        <div className="modal-overlay" onClick={() => setSelectedMentor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Session — {selectedMentor.full_name}</h2>
              <button className="modal-close" onClick={() => setSelectedMentor(null)}>✕</button>
            </div>
            <form onSubmit={handleRequestSession}>
              <div className="modal-form-group">
                <label>Date & Time</label>
                <input type="datetime-local" value={sessionForm.scheduled_at} onChange={(e) => { setSessionForm({ ...sessionForm, scheduled_at: e.target.value }); setAvailability(null); }} required />
                {sessionForm.scheduled_at && <button type="button" onClick={checkAvailability} style={{ marginTop: '6px', background: 'none', border: '1px solid #334155', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Check Availability</button>}
                {availability && (
                  <p style={{ marginTop: '6px', fontSize: '13px', color: availability.available ? '#10b981' : '#ef4444' }}>
                    {availability.available ? '✓ Mentor is available at this time' : `✕ Mentor has a conflict: "${availability.conflict}"`}
                  </p>
                )}
              </div>
              <div className="modal-form-group">
                <label>Topic</label>
                <input type="text" value={sessionForm.topic} onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })} placeholder="E.g. API design review, code walkthrough" required />
              </div>
              <button type="submit" className="action-btn" style={{ width: '100%' }} disabled={availability && !availability.available}>
                {availability && !availability.available ? 'Mentor Unavailable' : 'Send Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Session history */}
      {sessions.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Session History</h2>
          <div className="analysis-table">
            <table>
              <thead><tr><th>{isMentor ? 'Developer' : 'Mentor'}</th><th>Topic</th><th>Scheduled</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>
                {resolvedSessions.map((s) => (
                  <tr key={s.id}>
                    <td>{isMentor ? s.developer_name : s.mentor_name}</td>
                    <td>{s.topic}</td>
                    <td>{new Date(s.scheduled_at).toLocaleString()}</td>
                    <td><span className={`badge ${s.status === 'accepted' ? 'success' : 'warning'}`}>{s.status}</span></td>
                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>{s.mentor_note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mentor view: Developer progress */}
      {isMentor && developers.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '16px' }}>Developer Progress</h2>
          <div className="analysis-table">
            <table>
              <thead><tr><th>Developer</th><th>Role</th><th>Completed</th><th>Rate</th><th>Time</th></tr></thead>
              <tbody>
                {developers.map((dev) => (
                  <tr key={dev.id}>
                    <td>{dev.full_name}</td><td>{dev.dev_role || 'N/A'}</td>
                    <td>{dev.modules_completed}/{dev.total_modules}</td>
                    <td><span className="badge success">{dev.completion_rate}%</span></td>
                    <td>{dev.time_spent_hours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorSupport;
