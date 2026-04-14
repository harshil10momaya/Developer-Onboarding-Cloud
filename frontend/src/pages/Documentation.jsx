import React, { useState } from 'react';
import '../styles/Pages.css';

const Documentation = () => {
  const [docs] = useState([
    { id: 1, title: 'Getting Started', category: 'Basics', views: 2543, lastUpdated: '2026-03-15' },
    { id: 2, title: 'API Reference', category: 'API', views: 1856, lastUpdated: '2026-03-18' },
    { id: 3, title: 'Database Guide', category: 'Database', views: 945, lastUpdated: '2026-03-10' },
    { id: 4, title: 'Deployment Guide', category: 'DevOps', views: 567, lastUpdated: '2026-03-12' },
    { id: 5, title: 'Best Practices', category: 'Guidelines', views: 1234, lastUpdated: '2026-03-19' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📖 Documentation</h1>
        <p>Access complete documentation and guides</p>
      </div>

      <div className="docs-list">
        {docs.map((doc) => (
          <div key={doc.id} className="doc-item">
            <div className="doc-content">
              <h3>{doc.title}</h3>
              <div className="doc-meta">
                <span className="category">{doc.category}</span>
                <span className="views">👁️ {doc.views} views</span>
                <span className="updated">Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
            <button className="read-btn">Read →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documentation;
