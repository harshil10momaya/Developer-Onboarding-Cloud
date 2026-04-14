import React, { useState } from 'react';
import '../styles/Pages.css';

const DevOps = () => {
  const [pipelines] = useState([
    { 
      id: 1, 
      name: 'E-Commerce CI/CD', 
      status: 'Active', 
      lastRun: '2026-03-19 14:32', 
      success: 92,
      tools: 'GitHub Actions, Docker, Kubernetes' 
    },
    { 
      id: 2, 
      name: 'API Deployment Pipeline', 
      status: 'Active', 
      lastRun: '2026-03-19 10:15', 
      success: 98,
      tools: 'Jenkins, Docker, AWS' 
    },
    { 
      id: 3, 
      name: 'Billing Service Pipeline', 
      status: 'Maintenance', 
      lastRun: '2026-03-18 16:45', 
      success: 85,
      tools: 'GitLab CI, Docker' 
    },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🚀 DevOps & CI/CD</h1>
        <p>Manage your deployment pipelines and infrastructure</p>
      </div>

      <div className="pipelines-list">
        {pipelines.map((pipeline) => (
          <div key={pipeline.id} className="pipeline-card">
            <div className="pipeline-header">
              <h3>{pipeline.name}</h3>
              <span className={`status ${pipeline.status.toLowerCase().replace(' ', '-')}`}>
                {pipeline.status}
              </span>
            </div>
            <div className="pipeline-content">
              <div className="info-row">
                <span className="label">Last Run:</span>
                <span>{pipeline.lastRun}</span>
              </div>
              <div className="info-row">
                <span className="label">Success Rate:</span>
                <span className="success-rate">{pipeline.success}%</span>
              </div>
              <div className="info-row">
                <span className="label">Tools:</span>
                <span>{pipeline.tools}</span>
              </div>
            </div>
            <button className="manage-btn">Configure Pipeline →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevOps;
