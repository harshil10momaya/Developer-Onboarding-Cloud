import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, repoAPI, notificationAPI, courseAPI, mentorAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const role = user?.role;

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, r, n, ss] = await Promise.all([dashboardAPI.getStats(), repoAPI.list(), notificationAPI.list().catch(() => []), mentorAPI.listSessions().catch(() => [])]);
        setStats(s); setRepos(r); setNotifications(n); setSessions(ss);
        if (role === 'developer') setCourses(await courseAPI.list().catch(() => []));
        if (role === 'mentor' || role === 'admin') setDevelopers(await mentorAPI.getDeveloperProgress().catch(() => []));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [role]);

  const unread = notifications.filter((n) => !n.is_read).length;
  const markAllRead = async () => { await notificationAPI.markAllRead().catch(() => {}); setNotifications(notifications.map((n) => ({ ...n, is_read: true }))); };
  const toggleNotif = () => { const opening = !showNotif; setShowNotif(opening); if (opening && unread > 0) markAllRead(); };

  if (loading) return <div className="dashboard-wrapper"><div className="loading-message">Loading dashboard...</div></div>;

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-top-header">
        <div className="header-left"><div className="search-container"><input type="text" placeholder="Search resources..." onKeyDown={(e) => { if (e.key === 'Enter') navigate('/repositories'); }} /></div></div>
        <div className="header-right">
          <div style={{ position: 'relative' }}>
            <button className="header-btn notification-btn" onClick={toggleNotif}>Notifications {unread > 0 && <span className="badge">{unread}</span>}</button>
            {showNotif && (<div style={{ position: 'absolute', right: 0, top: '40px', width: '340px', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', zIndex: 100, maxHeight: '400px', overflow: 'auto' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}><strong style={{ color: '#f0f6fc', fontSize: '14px' }}>Updates</strong></div>
              {notifications.length === 0 ? <p style={{ padding: '20px', color: '#8b949e', textAlign: 'center', fontSize: '13px' }}>No new updates</p> : notifications.slice(0, 10).map((n) => (<div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid #21262d', cursor: n.link ? 'pointer' : 'default' }} onClick={() => n.link && navigate(n.link)}><p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>{n.message}</p></div>))}
            </div>)}
          </div>
          <div className="user-profile" onClick={logout} style={{ cursor: 'pointer' }} title="Logout"><div className="avatar-placeholder"></div><div className="user-info"><p className="user-name">{user?.full_name}</p><p className="user-role">{role}</p></div></div>
        </div>
      </header>
      <div className="dashboard-container">
        <div className="stats-cards-grid">
          <div className="stat-card" onClick={() => navigate('/repositories')} style={{ cursor: 'pointer' }}><div className="stat-content"><h3>REPOSITORIES</h3><p className="stat-value">{stats?.total_repositories || 0}</p></div></div>
          {role === 'developer' && <div className="stat-card" onClick={() => navigate('/progress-tracker')} style={{ cursor: 'pointer' }}><div className="stat-content"><h3>LEARNING PROGRESS</h3><p className="stat-value">{stats?.completed_lectures || 0}/{stats?.total_lectures || 0}</p></div></div>}
          {(role === 'mentor' || role === 'admin') && <div className="stat-card" onClick={() => navigate('/progress-tracker')} style={{ cursor: 'pointer' }}><div className="stat-content"><h3>ACTIVE DEVELOPERS</h3><p className="stat-value">{stats?.active_developers || 0}</p></div></div>}
          <div className="stat-card" onClick={() => navigate('/mentor-support')} style={{ cursor: 'pointer' }}><div className="stat-content"><h3>PENDING SESSIONS</h3><p className="stat-value">{stats?.pending_sessions || 0}</p></div></div>
          {role === 'developer' && <div className="stat-card completion-card" onClick={() => navigate('/progress-tracker')} style={{ cursor: 'pointer' }}><div className="stat-content"><h3>COMPLETION RATE</h3><p className="stat-value">{stats?.lectures_completion_rate || 0}%</p></div><div className="progress-circle"><div className="circle-background"><svg viewBox="0 0 100 100" className="progress-ring"><circle cx="50" cy="50" r="45" fill="none" stroke="#21262d" strokeWidth="8" /><circle cx="50" cy="50" r="45" fill="none" stroke="#238636" strokeWidth="8" strokeDasharray={`${((stats?.lectures_completion_rate || 0) / 100) * 282.7} 282.7`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} /></svg></div></div></div>}
        </div>
        {role === 'developer' && (<div className="main-content-grid"><div className="left-column"><div className="content-card onboarding-card"><h3 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Your Courses</h3><div className="path-items">{courses.slice(0, 5).map((c) => (<div key={c.id} className={`path-item ${c.progress_percent === 100 ? 'completed' : c.progress_percent > 0 ? 'in-progress' : 'upcoming'}`} style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.id}`)}><div className="item-marker">{c.progress_percent === 100 ? '✓' : c.progress_percent > 0 ? '◐' : '◯'}</div><span className="item-text">{c.title}</span><span className="item-status">{c.progress_percent}%</span></div>))}{courses.length === 0 && <p style={{ color: '#94a3b8' }}>No courses available.</p>}</div><button className="continue-btn" onClick={() => navigate('/learning-paths')}>Browse Learning Paths →</button></div></div>
          <div className="right-columns"><div className="content-card repositories-card"><h3>Recent Repositories</h3><div className="repositories-list">{repos.slice(0, 3).map((r) => (<div key={r.id} className="repo-item" onClick={() => navigate('/repositories')} style={{ cursor: 'pointer' }}><div className="repo-content"><p className="repo-name">{r.name}</p><p className="repo-stack">{(r.tech_stack || []).join(' · ')}</p></div><span className="repo-status">{r.is_analyzed ? 'Verified' : 'Pending'}</span></div>))}</div><button className="add-repo-btn" onClick={() => navigate('/repositories')}>View All</button></div></div></div>)}
        {(role === 'mentor' || role === 'admin') && (<div className="main-content-grid"><div className="left-column"><div className="content-card onboarding-card"><h3 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Pending Sessions</h3>{sessions.filter((s) => s.status === 'pending' && s.mentor_id === user.id).length === 0 ? <p style={{ color: '#94a3b8' }}>No pending requests.</p> : sessions.filter((s) => s.status === 'pending' && s.mentor_id === user.id).map((s) => (<div key={s.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}><p style={{ color: '#f1f5f9', margin: '0 0 4px', fontWeight: '600' }}>{s.developer_name}</p><p style={{ color: '#94a3b8', margin: 0, fontSize: '13px' }}>{s.topic}</p></div>))}<button className="continue-btn" onClick={() => navigate('/mentor-support')}>Manage Sessions →</button></div></div>
          <div className="right-columns"><div className="content-card"><h3 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Developer Overview</h3>{developers.slice(0, 4).map((d) => (<div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b' }}><div><p style={{ color: '#f1f5f9', margin: 0, fontSize: '14px' }}>{d.full_name}</p><p style={{ color: '#64748b', margin: 0, fontSize: '12px' }}>{d.dev_role}</p></div><span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>{d.completion_rate}%</span></div>))}<button className="continue-btn" onClick={() => navigate('/progress-tracker')} style={{ marginTop: '12px' }}>View All →</button></div></div></div>)}
      </div>
    </div>
  );
};
export default Dashboard;
