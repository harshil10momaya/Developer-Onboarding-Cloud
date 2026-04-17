import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import '../styles/Sidebar.css';

const Sidebar = ({ currentPage }) => {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  useEffect(() => { notificationAPI.list().then((n) => setUnread(n.filter((x) => !x.is_read).length)).catch(() => {}); }, [currentPage]);
  const role = user?.role;
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: '', path: '/', roles: ['developer','mentor','admin'] },
    { id: 'repositories', label: 'Repositories', icon: '', path: '/repositories', roles: ['developer','mentor','admin'] },
    { id: 'learning-paths', label: 'Learning Paths', icon: '', path: '/learning-paths', roles: ['developer'] },
    { id: 'modules', label: 'Modules', icon: '', path: '/modules', roles: ['developer'] },
    { id: 'progress', label: 'Progress Tracker', icon: '', path: '/progress-tracker', roles: ['developer','mentor','admin'] },
    { id: 'mentor', label: 'Mentor Support', icon: '', path: '/mentor-support', roles: ['developer','mentor','admin'] },
    { id: 'code-analysis', label: 'Code Analysis', icon: '', path: '/code-analysis', roles: ['developer','mentor','admin'] },
    { id: 'documentation', label: 'Documentation', icon: '', path: '/documentation', roles: ['developer','mentor','admin'] },
    { id: 'discussions', label: 'Discussions', icon: '', path: '/discussions', roles: ['developer','mentor','admin'] },
    { id: 'devops', label: 'DevOps & CI/CD', icon: '', path: '/devops', roles: ['admin','mentor'] },
    { id: 'admin', label: 'Admin Panel', icon: '', path: '/admin', roles: ['admin'] },
  ].filter((i) => i.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header"><div className="logo-text">COC</div><h2>Developer Onboarding Cloud</h2></div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link key={item.id} to={item.path} className={`nav-item ${currentPage === item.id ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span><span className="nav-label">{item.label}</span>
            {item.id === 'mentor' && unread > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 7px', fontSize: '11px', marginLeft: 'auto' }}>{unread}</span>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        {user && (<div className="sidebar-user"><div className="sidebar-user-info"><div className="sidebar-user-avatar">👤</div><div><p className="sidebar-user-name">{user.full_name}</p><p className="sidebar-user-role">{user.role}</p></div></div><button className="sidebar-logout-btn" onClick={logout}>Logout</button></div>)}
        <div className="project-health"><h4>PROJECT HEALTH</h4><div className="health-circle"><div className="health-percentage">98%</div></div><p>All Systems Operational</p><p className="powered-by">Powered by AWS</p></div>
      </div>
    </aside>
  );
};
export default Sidebar;
