import React, { useState, useEffect } from 'react';
import { progressAPI, dashboardAPI } from '../services/api';
import '../styles/Pages.css';

const ProgressTracker = () => {
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([progressAPI.getMyProgress(), dashboardAPI.getStats()])
      .then(([progressData, statsData]) => {
        setProgress(progressData);
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  const completed = progress.filter((p) => p.status === 'completed').length;
  const total = progress.length || stats?.total_modules || 0;
  const timeSpent = stats?.time_spent_hours || 0;
  const avgScore = stats?.average_score || 0;

  const weeklyProgress = [20, 35, 40, 50, 45, 55, 60];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Progress Tracker</h1>
        <p>Monitor your learning progress</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Modules Completed</h4>
          <p className="stat-value">{completed}/{total}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h4>Time Spent</h4>
          <p className="stat-value">{timeSpent} hrs</p>
        </div>
        <div className="stat-card">
          <h4>Average Score</h4>
          <p className="stat-value">{avgScore}%</p>
        </div>
      </div>

      <div className="chart-section">
        <h3>Weekly Progress</h3>
        <div className="weekly-chart">
          {weeklyProgress.map((value, index) => (
            <div key={index} className="chart-bar">
              <div className="bar-fill" style={{ height: `${value}%` }}></div>
              <span className="day-label">{days[index]}</span>
            </div>
          ))}
        </div>
      </div>

      {progress.length > 0 && (
        <div className="modules-list" style={{ marginTop: '24px' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '16px' }}>Module Details</h3>
          {progress.map((p) => (
            <div key={p.id} className="module-item">
              <div className="module-header">
                <h3>Module {p.module_id}</h3>
                <span className={`status ${p.status.replace('_', '-')}`}>
                  {p.status === 'completed' ? 'Completed' : p.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                </span>
              </div>
              <div className="module-meta">
                <span className="course-tag">Score: {p.score ?? 'N/A'}</span>
                <span className="date">Time: {p.time_spent_minutes} min</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
