import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ currentPage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/' },
    { id: 'repositories', label: 'Repositories', icon: '📦', path: '/repositories' },
    { id: 'learning-paths', label: 'Learning Paths', icon: '🛤️', path: '/learning-paths' },
    { id: 'modules', label: 'Modules', icon: '📚', path: '/modules' },
    { id: 'progress', label: 'Progress Tracker', icon: '📊', path: '/progress-tracker' },
    { id: 'mentor', label: 'Mentor Support', icon: '👨‍🏫', path: '/mentor-support' },
    { id: 'code-analysis', label: 'Code Analysis', icon: '🔍', path: '/code-analysis' },
    { id: 'documentation', label: 'Documentation', icon: '📖', path: '/documentation' },
    { id: 'discussions', label: 'Discussions', icon: '💬', path: '/discussions' },
    { id: 'devops', label: 'DevOps & CI/CD', icon: '🚀', path: '/devops' },
  ];

  const projectHealth = [
    { label: 'System Status', value: '98%', color: '#10b981' },
    { label: 'All Systems Operational', value: '', color: '' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">☁️</div>
        <h2>Developer Onboarding Cloud</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="project-health">
          <h4>PROJECT HEALTH</h4>
          <div className="health-circle">
            <div className="health-percentage">98%</div>
          </div>
          <p>All Systems Operational</p>
          <p className="powered-by">Powered by AWS</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
