import React, { useState, useEffect } from 'react';
import { moduleAPI } from '../services/api';
import '../styles/Pages.css';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moduleAPI.list()
      .then(setModules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

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
              <h3>{module.title}</h3>
              <span className={`status ${module.status.toLowerCase()}`}>
                {module.status}
              </span>
            </div>
            <div className="module-meta">
              <span className="course-tag">{module.description || 'No description'}</span>
              <span className="date">{new Date(module.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
