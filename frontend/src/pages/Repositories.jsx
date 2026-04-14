import React, { useState } from 'react';
import '../styles/Pages.css';

const Repositories = () => {
  const [repositories] = useState([
    { id: 1, name: 'E-Commerce Platform', stack: 'React - Django - PostgreSQL', status: 'Active', analyzed: true },
    { id: 2, name: 'Microservices API', stack: 'Spring Boot - Kubernetes', status: 'Active', analyzed: true },
    { id: 3, name: 'Cloud Billing System', stack: 'Node.js - AWS - Docker', status: 'Active', analyzed: true },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📦 Repositories</h1>
        <p>Manage and view all your repositories</p>
      </div>

      <div className="repositories-list">
        <table className="repositories-table">
          <thead>
            <tr>
              <th>Repository Name</th>
              <th>Tech Stack</th>
              <th>Status</th>
              <th>Analyzed</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.id}>
                <td>{repo.name}</td>
                <td>{repo.stack}</td>
                <td><span className="badge active">{repo.status}</span></td>
                <td>{repo.analyzed ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Repositories;
