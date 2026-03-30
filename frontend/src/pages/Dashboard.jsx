import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, repoAPI, progressAPI, moduleAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [progress, setProgress] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [repoForm, setRepoForm] = useState({ name: '', url: '', description: '', tech_stack: '' });
  const [showArchModal, setShowArchModal] = useState(false);

  const weeklyData = [20, 35, 40, 50, 45, 55, 60, 55];
  const maxValue = 60;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, repoData, progressData, moduleData] = await Promise.all([
          dashboardAPI.getStats(),
          repoAPI.list(),
          progressAPI.getMyProgress(),
          moduleAPI.list(),
        ]);
        setStats(statsData);
        setRepos(repoData);
        setProgress(progressData);
        setModules(moduleData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateChartPath = () => {
    const width = 720, height = 150, padding = 20;
    const chartHeight = height - 2 * padding;
    const pointSpacing = (width - 2 * padding) / (weeklyData.length - 1);
    let path = `M ${padding} ${height - padding - (weeklyData[0] / maxValue) * chartHeight}`;
    for (let i = 1; i < weeklyData.length; i++) {
      const x = padding + i * pointSpacing;
      const y = height - padding - (weeklyData[i] / maxValue) * chartHeight;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  // Find the first in-progress or not-started module to continue learning
  const handleContinueLearning = () => {
    const inProg = progress.find((p) => p.status === 'in_progress');
    const notStarted = progress.find((p) => p.status === 'not_started');
    if (inProg || notStarted) {
      navigate('/modules');
    } else {
      navigate('/learning-paths');
    }
  };

  // Add repo from dashboard
  const handleAddRepo = async (e) => {
    e.preventDefault();
    try {
      const newRepo = await repoAPI.create({
        ...repoForm,
        tech_stack: repoForm.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setRepos([...repos, newRepo]);
      setShowAddRepo(false);
      setRepoForm({ name: '', url: '', description: '', tech_stack: '' });
      // Update stats
      setStats((prev) => prev ? { ...prev, total_repositories: prev.total_repositories + 1 } : prev);
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark module progress
  const handleMarkProgress = async (moduleId, newStatus) => {
    try {
      const updated = await progressAPI.update(moduleId, { status: newStatus });
      setProgress(progress.map((p) => (p.module_id === moduleId ? updated : p)));
      // Refresh stats
      const newStats = await dashboardAPI.getStats();
      setStats(newStats);
    } catch (err) {
      console.error(err);
    }
  };

  const getModuleTitle = (moduleId) => {
    const mod = modules.find((m) => m.id === moduleId);
    return mod ? mod.title : `Module ${moduleId}`;
  };

  const completionRate = stats ? stats.completion_rate : 0;
  const totalTimeHrs = stats ? stats.time_spent_hours : 0;
  const avgScore = stats ? stats.average_score : 0;

  if (loading) {
    return <div className="dashboard-wrapper"><div className="loading-message">Loading dashboard...</div></div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Top Header */}
      <header className="dashboard-top-header">
        <div className="header-left">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search Repository / Modules..." onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/repositories`);
              }
            }} />
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn notification-btn" onClick={() => navigate('/discussions')}>🔔 <span className="badge">1</span></button>
          <button className="header-btn" onClick={() => navigate('/repositories')}>📁</button>
          <button className="header-btn" onClick={() => navigate('/devops')}>⚙️</button>
          <div className="user-profile" onClick={logout} style={{ cursor: 'pointer' }} title="Click to logout">
            <div className="avatar">👤</div>
            <div className="user-info">
              <p className="user-name">{user?.full_name || 'User'}</p>
              <p className="user-role">{user?.dev_role ? `${user.dev_role.charAt(0).toUpperCase() + user.dev_role.slice(1)} Developer` : user?.role}</p>
            </div>
            <span className="dropdown">▼</span>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-cards-grid">
          <div className="stat-card" onClick={() => navigate('/repositories')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Repositories</h3>
              <p className="stat-value">{stats?.total_repositories || 0}</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/modules')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Modules Generated</h3>
              <p className="stat-value">{stats?.modules_generated || 0}</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/mentor-support')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Active Developers</h3>
              <p className="stat-value">{stats?.active_developers || 0}</p>
            </div>
          </div>
          <div className="stat-card completion-card" onClick={() => navigate('/progress-tracker')} style={{ cursor: 'pointer' }}>
            <div className="stat-content">
              <h3>Completion Rate</h3>
              <p className="stat-value">{completionRate}%</p>
            </div>
            <div className="progress-circle">
              <div className="circle-background">
                <svg viewBox="0 0 100 100" className="progress-ring">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8"
                    strokeDasharray={`${(completionRate / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          <div className="left-column">
            <div className="content-card onboarding-card">
              <div className="card-header">
                <div className="user-welcome">
                  <div className="welcome-avatar">👤</div>
                  <div className="welcome-text">
                    <p className="welcome-label">Welcome, <span className="highlight">{user?.full_name}!</span></p>
                    <div className="progress-bar-inline">
                      <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
                    </div>
                    <p className="progress-text">{completionRate}% Completed</p>
                  </div>
                </div>
              </div>

              <div className="learning-path">
                <h3>Your Learning Path ({user?.dev_role ? `${user.dev_role.charAt(0).toUpperCase() + user.dev_role.slice(1)} Developer` : 'Developer'})</h3>
                <div className="path-items">
                  {progress.length > 0 ? (
                    progress.map((p) => (
                      <div key={p.id} className={`path-item ${p.status === 'completed' ? 'completed' : p.status === 'in_progress' ? 'in-progress' : 'upcoming'}`}>
                        <div className="item-marker" style={{ cursor: 'pointer' }} onClick={() => {
                          if (p.status === 'not_started') handleMarkProgress(p.module_id, 'in_progress');
                          else if (p.status === 'in_progress') handleMarkProgress(p.module_id, 'completed');
                        }} title={p.status === 'completed' ? 'Completed' : 'Click to advance'}>
                          {p.status === 'completed' ? '✓' : p.status === 'in_progress' ? '◐' : '◯'}
                        </div>
                        <span className="item-text">{getModuleTitle(p.module_id)}</span>
                        <span className="item-status">
                          {p.status === 'completed' ? 'Completed' : p.status === 'in_progress' ? 'In Progress' : 'Upcoming'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8' }}>No modules assigned yet. <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/learning-paths')}>Browse learning paths →</span></p>
                  )}
                </div>
              </div>

              <button className="continue-btn" onClick={handleContinueLearning}>Continue Learning →</button>
            </div>
          </div>

          <div className="right-columns">
            {/* Codebase Overview */}
            <div className="content-card codebase-card">
              <h3>Codebase Overview</h3>
              <div className="chart-container">
                <svg viewBox="0 0 200 200" className="pie-chart">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f97316" strokeWidth="50" strokeDasharray={`${(40/100)*502.4} 502.4`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="50" strokeDasharray={`${(35/100)*502.4} 502.4`} strokeDashoffset={`-${(40/100)*502.4}`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="50" strokeDasharray={`${(15/100)*502.4} 502.4`} strokeDashoffset={`-${(75/100)*502.4}`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#6366f1" strokeWidth="50" strokeDasharray={`${(10/100)*502.4} 502.4`} strokeDashoffset={`-${(90/100)*502.4}`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                </svg>
              </div>
              <div className="chart-legend">
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f97316' }}></span><span>Frontend 40%</span></div>
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span><span>Backend 35%</span></div>
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#06b6d4' }}></span><span>Database 15%</span></div>
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#6366f1' }}></span><span>DevOps 10%</span></div>
              </div>
              <button className="view-architecture-btn" onClick={() => setShowArchModal(true)}>View Architecture</button>
            </div>

            {/* Team Activity */}
            <div className="content-card team-activity-card">
              <h3>Team Activity</h3>
              <div className="activity-list">
                <div className="activity-item"><div className="activity-avatar">👤</div><div className="activity-content"><p className="activity-name">Priya Sharma</p><p className="activity-action">Completed API Module</p></div><span className="activity-time">1 day ago</span></div>
                <div className="activity-item"><div className="activity-avatar">👤</div><div className="activity-content"><p className="activity-name">Rohit Verma</p><p className="activity-action">Finished <span className="highlight">DevOps</span> Setup</p></div><span className="activity-time">5 hrs ago</span></div>
                <div className="activity-item"><div className="activity-avatar">👤</div><div className="activity-content"><p className="activity-name">Neha Gupta</p><p className="activity-action">Started DB Design</p></div><span className="activity-time">1 hr ago</span></div>
              </div>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); navigate('/mentor-support'); }}>View All →</a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="content-card analytics-card">
            <h3>Learning Analytics</h3>
            <div className="analytics-metrics">
              <div className="metric"><div className="metric-icon">✓</div><div className="metric-content"><p className="metric-label">Modules Completed</p><p className="metric-value">{stats?.modules_completed || 0}/{stats?.total_modules || 0}</p></div></div>
              <div className="metric"><div className="metric-icon">⏱️</div><div className="metric-content"><p className="metric-label">Time Spent</p><p className="metric-value">{totalTimeHrs} hrs</p></div></div>
              <div className="metric"><div className="metric-icon">📊</div><div className="metric-content"><p className="metric-label">Avg. Score</p><p className="metric-value">{avgScore}%</p><span className="trend">↑</span></div></div>
            </div>
            <div className="chart-section">
              <h4>Weekly Progress</h4>
              <svg width="100%" height="160" viewBox="0 0 760 160" className="line-chart">
                {[0, 20, 40, 60].map((y, i) => (<line key={`grid-${i}`} x1="20" x2="740" y1={140 - i * 35} y2={140 - i * 35} stroke="#374151" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />))}
                <path d={generateChartPath()} stroke="#3b82f6" strokeWidth="3" fill="none" />
                {weeklyData.map((point, i) => { const x = 20 + (i / (weeklyData.length - 1)) * 700; const y = 140 - (point / maxValue) * 120; return <circle key={`point-${i}`} cx={x} cy={y} r="4" fill="#3b82f6" />; })}
              </svg>
              <div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span></div>
            </div>
          </div>

          <div className="content-card repositories-card">
            <h3>Recent Repositories</h3>
            <div className="repositories-list">
              {repos.slice(0, 3).map((repo) => (
                <div key={repo.id} className="repo-item" onClick={() => navigate('/repositories')} style={{ cursor: 'pointer' }}>
                  <div className="repo-icon">📁</div>
                  <div className="repo-content">
                    <p className="repo-name">{repo.name}</p>
                    <p className="repo-stack">{(repo.tech_stack || []).join(' - ')}</p>
                  </div>
                  <span className="repo-status">{repo.is_analyzed ? 'Analyzed' : 'Pending'}</span>
                </div>
              ))}
              {repos.length === 0 && <p style={{ color: '#94a3b8' }}>No repositories yet.</p>}
            </div>
            <button className="add-repo-btn" onClick={() => setShowAddRepo(true)}>+ Add Repository</button>
          </div>
        </div>
      </div>

      {/* Add Repo Modal */}
      {showAddRepo && (
        <div className="modal-overlay" onClick={() => setShowAddRepo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Repository</h2>
              <button className="modal-close" onClick={() => setShowAddRepo(false)}>✕</button>
            </div>
            <form onSubmit={handleAddRepo}>
              <div className="modal-form-group"><label>Repository Name</label><input type="text" value={repoForm.name} onChange={(e) => setRepoForm({ ...repoForm, name: e.target.value })} placeholder="E.g. My Awesome Project" required /></div>
              <div className="modal-form-group"><label>URL</label><input type="url" value={repoForm.url} onChange={(e) => setRepoForm({ ...repoForm, url: e.target.value })} placeholder="https://github.com/user/repo" required /></div>
              <div className="modal-form-group"><label>Description</label><input type="text" value={repoForm.description} onChange={(e) => setRepoForm({ ...repoForm, description: e.target.value })} placeholder="Brief description" /></div>
              <div className="modal-form-group"><label>Tech Stack</label><input type="text" value={repoForm.tech_stack} onChange={(e) => setRepoForm({ ...repoForm, tech_stack: e.target.value })} placeholder="React, Node.js, PostgreSQL" /></div>
              <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '8px' }}>Add Repository</button>
            </form>
          </div>
        </div>
      )}

      {/* Architecture Modal */}
      {showArchModal && (
        <div className="modal-overlay" onClick={() => setShowArchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Architecture Overview</h2>
              <button className="modal-close" onClick={() => setShowArchModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '20px', fontFamily: 'monospace', fontSize: '13px' }}>
                <p style={{ color: '#3b82f6', fontWeight: '600', marginTop: 0 }}>┌─────────────────────────────────┐</p>
                <p style={{ color: '#f97316' }}>│  Frontend (React + Vite)        │</p>
                <p style={{ color: '#3b82f6' }}>│  ↕ REST API (JSON)              │</p>
                <p style={{ color: '#3b82f6' }}>├─────────────────────────────────┤</p>
                <p style={{ color: '#10b981' }}>│  Backend (FastAPI + Python)     │</p>
                <p style={{ color: '#3b82f6' }}>│  ↕ SQLAlchemy ORM               │</p>
                <p style={{ color: '#3b82f6' }}>├─────────────────────────────────┤</p>
                <p style={{ color: '#06b6d4' }}>│  Database (PostgreSQL)          │</p>
                <p style={{ color: '#3b82f6' }}>│  + Redis (Caching)              │</p>
                <p style={{ color: '#3b82f6' }}>├─────────────────────────────────┤</p>
                <p style={{ color: '#6366f1' }}>│  Cloud (AWS EC2 + S3 + RDS)     │</p>
                <p style={{ color: '#6366f1', marginBottom: 0 }}>│  Docker + Kubernetes + CI/CD    │</p>
                <p style={{ color: '#3b82f6', marginBottom: 0 }}>└─────────────────────────────────┘</p>
              </div>
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                  <p style={{ color: '#f97316', fontWeight: '600', margin: '0 0 4px 0', fontSize: '13px' }}>Frontend</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>React 19, Vite 8, React Router</p>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <p style={{ color: '#10b981', fontWeight: '600', margin: '0 0 4px 0', fontSize: '13px' }}>Backend</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>FastAPI, SQLAlchemy, JWT Auth</p>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                  <p style={{ color: '#06b6d4', fontWeight: '600', margin: '0 0 4px 0', fontSize: '13px' }}>Database</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>PostgreSQL, Redis, Alembic</p>
                </div>
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <p style={{ color: '#6366f1', fontWeight: '600', margin: '0 0 4px 0', fontSize: '13px' }}>DevOps</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>Docker, K8s, GitHub Actions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
