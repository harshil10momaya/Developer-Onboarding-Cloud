import React, { useState } from 'react';
import '../styles/Pages.css';

const ProgressTracker = () => {
  const [stats] = useState({
    modulesCompleted: 32,
    totalModules: 45,
    timeSpent: 48,
    averageScore: 92,
    weeklyProgress: [20, 35, 40, 50, 45, 55, 60],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Progress Tracker</h1>
        <p>Monitor your learning progress</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Modules Completed</h4>
          <p className="stat-value">{stats.modulesCompleted}/{stats.totalModules}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stats.modulesCompleted / stats.totalModules) * 100}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <h4>Time Spent</h4>
          <p className="stat-value">{stats.timeSpent} hrs</p>
        </div>

        <div className="stat-card">
          <h4>Average Score</h4>
          <p className="stat-value">{stats.averageScore}%</p>
        </div>
      </div>

      <div className="chart-section">
        <h3>Weekly Progress</h3>
        <div className="weekly-chart">
          {stats.weeklyProgress.map((value, index) => (
            <div key={index} className="chart-bar">
              <div className="bar-fill" style={{ height: `${value}%` }}></div>
              <span className="day-label">{stats.days[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
