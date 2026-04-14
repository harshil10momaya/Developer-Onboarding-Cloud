import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const weeklyData = [20, 35, 40, 50, 45, 55, 60, 55]; // Sample data points
  const maxValue = 60;

  // Generate SVG path for line chart
  const generateChartPath = () => {
    const width = 720;
    const height = 150;
    const padding = 20;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const pointSpacing = chartWidth / (weeklyData.length - 1);

    let path = `M ${padding} ${height - padding - (weeklyData[0] / maxValue) * chartHeight}`;
    for (let i = 1; i < weeklyData.length; i++) {
      const x = padding + i * pointSpacing;
      const y = height - padding - (weeklyData[i] / maxValue) * chartHeight;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  return (
    <div className="dashboard-wrapper">
      {/* Top Header */}
      <header className="dashboard-top-header">
        <div className="header-left">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search Repository / Modules..." />
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn notification-btn">🔔 <span className="badge">1</span></button>
          <button className="header-btn">📁</button>
          <button className="header-btn">⚙️</button>
          <div className="user-profile">
            <div className="avatar">👤</div>
            <div className="user-info">
              <p className="user-name">Arjun Mehta</p>
              <p className="user-role">Backend Developer</p>
            </div>
            <span className="dropdown">▼</span>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-cards-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Repositories</h3>
              <p className="stat-value">25</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Modules Generated</h3>
              <p className="stat-value">142</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Active Developers</h3>
              <p className="stat-value">36</p>
            </div>
          </div>

          <div className="stat-card completion-card">
            <div className="stat-content">
              <h3>Completion Rate</h3>
              <p className="stat-value">78%</p>
            </div>
            <div className="progress-circle">
              <div className="circle-background">
                <svg viewBox="0 0 100 100" className="progress-ring">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8" 
                    strokeDasharray={`${(78 / 100) * 282.7} 282.7`} 
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Left Column - Onboarding Progress */}
          <div className="left-column">
            <div className="content-card onboarding-card">
              <div className="card-header">
                <div className="user-welcome">
                  <div className="welcome-avatar">👤</div>
                  <div className="welcome-text">
                    <p className="welcome-label">Welcome, <span className="highlight">Arjun Mehta!</span></p>
                    <div className="progress-bar-inline">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <p className="progress-text">75% Completed</p>
                  </div>
                </div>
              </div>

              <div className="learning-path">
                <h3>Your Learning Path (Backend Developer)</h3>
                <div className="path-items">
                  <div className="path-item completed">
                    <div className="item-marker">✓</div>
                    <span className="item-text">Project Architecture</span>
                    <span className="item-status">Completed</span>
                  </div>
                  <div className="path-item in-progress">
                    <div className="item-marker">◐</div>
                    <span className="item-text">Authentication Module</span>
                    <span className="item-status">In Progress</span>
                  </div>
                  <div className="path-item upcoming">
                    <div className="item-marker">◯</div>
                    <span className="item-text">Database Models</span>
                    <span className="item-status">Upcoming</span>
                  </div>
                  <div className="path-item upcoming">
                    <div className="item-marker">◯</div>
                    <span className="item-text">API Integration</span>
                    <span className="item-status">Upcoming</span>
                  </div>
                </div>
              </div>

              <button className="continue-btn">Continue Learning →</button>
            </div>
          </div>

          {/* Middle & Right Columns */}
          <div className="right-columns">
            {/* Codebase Overview */}
            <div className="content-card codebase-card">
              <h3>Codebase Overview</h3>
              <div className="chart-container">
                <svg viewBox="0 0 200 200" className="pie-chart">
                  {/* Frontend (40%) - Orange */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f97316" strokeWidth="50" 
                    strokeDasharray={`${(40/100)*502.4} 502.4`} 
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  {/* Backend (35%) - Blue */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="50"
                    strokeDasharray={`${(35/100)*502.4} 502.4`}
                    strokeDashoffset={`-${(40/100)*502.4}`}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  {/* Database (15%) - Cyan */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="50"
                    strokeDasharray={`${(15/100)*502.4} 502.4`}
                    strokeDashoffset={`-${(75/100)*502.4}`}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  {/* DevOps (10%) - Purple */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#6366f1" strokeWidth="50"
                    strokeDasharray={`${(10/100)*502.4} 502.4`}
                    strokeDashoffset={`-${(90/100)*502.4}`}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                </svg>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span>
                  <span>Frontend 40%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
                  <span>Backend 35%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#06b6d4' }}></span>
                  <span>Database 15%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#6366f1' }}></span>
                  <span>DevOps 10%</span>
                </div>
              </div>
              <button className="view-architecture-btn">View Architecture</button>
            </div>

            {/* Team Activity */}
            <div className="content-card team-activity-card">
              <h3>Team Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-avatar">👤</div>
                  <div className="activity-content">
                    <p className="activity-name">Priya Sharma</p>
                    <p className="activity-action">Completed API Module</p>
                  </div>
                  <span className="activity-time">1 day ago</span>
                </div>
                <div className="activity-item">
                  <div className="activity-avatar">👤</div>
                  <div className="activity-content">
                    <p className="activity-name">Rohit Verma</p>
                    <p className="activity-action">Finished <span className="highlight">DevOps</span> Setup</p>
                  </div>
                  <span className="activity-time">5 hrs ago</span>
                </div>
                <div className="activity-item">
                  <div className="activity-avatar">👤</div>
                  <div className="activity-content">
                    <p className="activity-name">Neha Gupta</p>
                    <p className="activity-action">Started DB Design</p>
                  </div>
                  <span className="activity-time">1 hr ago</span>
                </div>
              </div>
              <a href="#" className="view-all-link">View All →</a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          {/* Learning Analytics */}
          <div className="content-card analytics-card">
            <h3>Learning Analytics</h3>
            <div className="analytics-metrics">
              <div className="metric">
                <div className="metric-icon">✓</div>
                <div className="metric-content">
                  <p className="metric-label">Modules Completed</p>
                  <p className="metric-value">32/45</p>
                </div>
              </div>
              <div className="metric">
                <div className="metric-icon">⏱️</div>
                <div className="metric-content">
                  <p className="metric-label">Time Spent</p>
                  <p className="metric-value">48 hrs</p>
                </div>
              </div>
              <div className="metric">
                <div className="metric-icon">📊</div>
                <div className="metric-content">
                  <p className="metric-label">Avg. Score</p>
                  <p className="metric-value">92%</p>
                  <span className="trend">↑</span>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h4>Weekly Progress</h4>
              <svg width="100%" height="160" viewBox="0 0 760 160" className="line-chart">
                {/* Grid lines */}
                {[0, 20, 40, 60].map((y, i) => (
                  <line key={`grid-${i}`} x1="20" x2="740" y1={140 - i*35} y2={140 - i*35} stroke="#374151" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
                ))}
                
                {/* Line */}
                <path d={generateChartPath()} stroke="#3b82f6" strokeWidth="3" fill="none" />
                
                {/* Points */}
                {weeklyData.map((point, i) => {
                  const x = 20 + (i / (weeklyData.length - 1)) * (740 - 40);
                  const y = 140 - (point / maxValue) * 120;
                  return <circle key={`point-${i}`} cx={x} cy={y} r="4" fill="#3b82f6" />;
                })}
              </svg>
              <div className="chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
                <span>Mon</span>
              </div>
            </div>
          </div>

          {/* Recent Repositories */}
          <div className="content-card repositories-card">
            <h3>Recent Repositories</h3>
            <div className="repositories-list">
              <div className="repo-item">
                <div className="repo-icon">📁</div>
                <div className="repo-content">
                  <p className="repo-name">E-Commerce Platform</p>
                  <p className="repo-stack">React - Django - PostgreSQL</p>
                </div>
                <span className="repo-status">Analyzed</span>
              </div>
              <div className="repo-item">
                <div className="repo-icon">📁</div>
                <div className="repo-content">
                  <p className="repo-name">Microservices API</p>
                  <p className="repo-stack">Spring Boot - Kubernetes</p>
                </div>
                <span className="repo-status">Analyzed</span>
              </div>
              <div className="repo-item">
                <div className="repo-icon">📁</div>
                <div className="repo-content">
                  <p className="repo-name">Cloud Billing System</p>
                  <p className="repo-stack">Node.js - AWS - Docker</p>
                </div>
                <span className="repo-status">Analyzed</span>
              </div>
            </div>
            <button className="add-repo-btn">+ Add Repository</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
