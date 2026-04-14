import React, { useState } from 'react';
import '../styles/Pages.css';

const Modules = () => {
  const [modules] = useState([
    { id: 1, name: 'Project Architecture', course: 'Backend Developer', status: 'Completed', date: '2026-03-15' },
    { id: 2, name: 'Authentication Module', course: 'Backend Developer', status: 'In Progress', date: '2026-03-19' },
    { id: 3, name: 'Database Models', course: 'Backend Developer', status: 'Upcoming', date: '2026-03-25' },
    { id: 4, name: 'API Integration', course: 'Backend Developer', status: 'Upcoming', date: '2026-04-01' },
    { id: 5, name: 'React Basics', course: 'Frontend Developer', status: 'Completed', date: '2026-03-10' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Modules Generated</h1>
        <p>Total modules: {modules.length}</p>
      </div>

      <div className="modules-list">
        {modules.map((module) => (
          <div key={module.id} className="module-item">
            <div className="module-header">
              <h3>{module.name}</h3>
              <span className={`status ${module.status.toLowerCase().replace(' ', '-')}`}>
                {module.status}
              </span>
            </div>
            <div className="module-meta">
              <span className="course-tag">{module.course}</span>
              <span className="date">{new Date(module.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
