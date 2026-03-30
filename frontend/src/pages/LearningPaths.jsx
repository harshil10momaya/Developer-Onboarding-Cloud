import React, { useState, useEffect } from 'react';
import { learningPathAPI, progressAPI } from '../services/api';
import '../styles/Pages.css';

const LearningPaths = () => {
  const [paths, setPaths] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([learningPathAPI.list(), progressAPI.getMyProgress()])
      .then(([pathData, progressData]) => {
        setPaths(pathData);
        setProgress(progressData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPathProgress = (path) => {
    if (!path.module_ids || path.module_ids.length === 0) return 0;
    const completed = path.module_ids.filter((mid) =>
      progress.find((p) => p.module_id === mid && p.status === 'completed')
    ).length;
    return Math.round((completed / path.module_ids.length) * 100);
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🛤️ Learning Paths</h1>
        <p>Choose your learning journey</p>
      </div>

      <div className="cards-grid">
        {paths.map((path) => {
          const prog = getPathProgress(path);
          return (
            <div key={path.id} className="card">
              <h3>{path.title}</h3>
              <p className="card-description">{path.description}</p>
              <div className="card-info">
                <span className="badge">{path.level}</span>
                <span className="modules">{(path.module_ids || []).length} Modules</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${prog}%` }}></div>
              </div>
              <p className="progress-text">{prog}% Complete</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPaths;
