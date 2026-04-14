import React, { useState } from 'react';
import '../styles/Pages.css';

const LearningPaths = () => {
  const [paths] = useState([
    { id: 1, title: 'Backend Developer', level: 'Intermediate', modules: 4, progress: 75 },
    { id: 2, title: 'Frontend Developer', level: 'Beginner', modules: 5, progress: 40 },
    { id: 3, title: 'Full Stack Engineer', level: 'Advanced', modules: 8, progress: 30 },
    { id: 4, title: 'DevOps Engineer', level: 'Intermediate', modules: 6, progress: 50 },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🛤️ Learning Paths</h1>
        <p>Choose your learning journey</p>
      </div>

      <div className="cards-grid">
        {paths.map((path) => (
          <div key={path.id} className="card">
            <h3>{path.title}</h3>
            <div className="card-info">
              <span className="badge">{path.level}</span>
              <span className="modules">{path.modules} Modules</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${path.progress}%` }}></div>
            </div>
            <p className="progress-text">{path.progress}% Complete</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPaths;
