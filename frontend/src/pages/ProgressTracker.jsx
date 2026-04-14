import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI, dashboardAPI, courseAPI, mentorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const ProgressTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMentor = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, c] = await Promise.all([dashboardAPI.getStats(), courseAPI.list()]);
        setStats(s); setCourses(c);
        if (isMentor) setDevelopers(await mentorAPI.getDeveloperProgress().catch(() => []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [isMentor]);

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;
  return (
    <div className="page-container">
      <div className="page-header"><h1>📊 Progress Tracker</h1><p>{isMentor ? 'Monitor all developers' : 'Your learning progress'}</p></div>
      <div className="stats-grid">
        <div className="stat-card"><h4>Lectures Completed</h4><p className="stat-value">{stats?.completed_lectures || 0}/{stats?.total_lectures || 0}</p><div className="progress-bar"><div className="progress-fill" style={{ width: `${stats?.lectures_completion_rate || 0}%` }}></div></div></div>
        <div className="stat-card"><h4>Courses</h4><p className="stat-value">{stats?.total_courses || 0}</p></div>
        <div className="stat-card"><h4>Time Spent</h4><p className="stat-value">{stats?.time_spent_hours || 0} hrs</p></div>
        <div className="stat-card"><h4>Avg Score</h4><p className="stat-value">{stats?.average_score || 0}%</p></div>
      </div>
      {courses.length > 0 && (<div style={{ marginTop: '24px' }}><h3 style={{ color: '#f1f5f9', marginBottom: '16px' }}>Course Progress</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {courses.map((c) => (<div key={c.id} className="module-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.id}`)}>
          <div className="module-header"><h3>{c.title}</h3><span className={`status ${c.progress_percent === 100 ? 'completed' : c.progress_percent > 0 ? 'in-progress' : 'draft'}`}>{c.progress_percent === 100 ? 'Completed' : c.progress_percent > 0 ? 'In Progress' : 'Not Started'}</span></div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}><div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${c.progress_percent}%` }}></div></div><span style={{ color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>{c.completed_lectures}/{c.total_lectures} · {c.progress_percent}%</span></div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>{c.lectures.map((l) => (<div key={l.id} title={l.title} style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', background: l.is_completed ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)', border: `1px solid ${l.is_completed ? 'rgba(16,185,129,0.4)' : 'rgba(100,116,139,0.2)'}`, color: l.is_completed ? '#10b981' : '#64748b' }}>{l.is_completed ? '✓' : l.order}</div>))}</div>
        </div>))}
      </div></div>)}
      {isMentor && developers.length > 0 && (<div style={{ marginTop: '32px' }}><h3 style={{ color: '#f1f5f9', marginBottom: '16px' }}>All Developers</h3><div className="analysis-table"><table><thead><tr><th>Developer</th><th>Role</th><th>Completed</th><th>Rate</th><th>Time</th></tr></thead><tbody>{developers.map((d) => (<tr key={d.id}><td>{d.full_name}</td><td>{d.dev_role || 'N/A'}</td><td>{d.modules_completed}/{d.total_modules}</td><td><span className="badge success">{d.completion_rate}%</span></td><td>{d.time_spent_hours} hrs</td></tr>))}</tbody></table></div></div>)}
    </div>
  );
};
export default ProgressTracker;
