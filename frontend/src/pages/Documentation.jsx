import React, { useState } from 'react';
import '../styles/Pages.css';

const DOCS = [
  { title: 'FastAPI Documentation', category: 'Backend', url: 'https://fastapi.tiangolo.com/', description: 'Official FastAPI docs — endpoints, validation, async, deployment', icon: '⚡' },
  { title: 'React Documentation', category: 'Frontend', url: 'https://react.dev/', description: 'Official React docs — components, hooks, patterns', icon: '⚛️' },
  { title: 'PostgreSQL Documentation', category: 'Database', url: 'https://www.postgresql.org/docs/', description: 'PostgreSQL docs — SQL, administration, optimization', icon: '🐘' },
  { title: 'SQLAlchemy Documentation', category: 'Database', url: 'https://docs.sqlalchemy.org/', description: 'SQLAlchemy ORM — models, queries, relationships', icon: '🔗' },
  { title: 'Docker Documentation', category: 'DevOps', url: 'https://docs.docker.com/', description: 'Docker — containers, images, Compose, networking', icon: '🐳' },
  { title: 'Kubernetes Documentation', category: 'DevOps', url: 'https://kubernetes.io/docs/', description: 'Kubernetes — pods, deployments, services', icon: '☸️' },
  { title: 'AWS Documentation', category: 'Cloud', url: 'https://docs.aws.amazon.com/', description: 'AWS — EC2, S3, RDS, IAM, Lambda', icon: '☁️' },
  { title: 'GitHub Actions', category: 'DevOps', url: 'https://docs.github.com/en/actions', description: 'CI/CD workflows, runners, secrets', icon: '🔄' },
  { title: 'Pydantic Documentation', category: 'Backend', url: 'https://docs.pydantic.dev/', description: 'Data validation, models, settings', icon: '✅' },
  { title: 'Redis Documentation', category: 'Database', url: 'https://redis.io/docs/', description: 'Caching, pub/sub, data structures', icon: '🔴' },
  { title: 'Vite Documentation', category: 'Frontend', url: 'https://vite.dev/', description: 'Dev server, build, plugins', icon: '⚡' },
  { title: 'Prometheus & Grafana', category: 'Monitoring', url: 'https://prometheus.io/docs/', description: 'Metrics, alerting, dashboards', icon: '📊' },
];

const CATS = [...new Set(DOCS.map((d) => d.category))];

const Documentation = () => {
  const [filter, setFilter] = useState('');
  const filtered = filter ? DOCS.filter((d) => d.category === filter) : DOCS;

  return (
    <div className="page-container">
      <div className="page-header"><h1>📖 Documentation</h1><p>Quick access to official docs for all technologies</p></div>
      <div className="filter-bar">
        <button className={`filter-btn ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
        {CATS.map((c) => <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map((doc, i) => (
          <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div className="doc-link-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><span style={{ fontSize: '28px' }}>{doc.icon}</span><div><h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '15px' }}>{doc.title}</h3><span style={{ color: '#3b82f6', fontSize: '12px' }}>{doc.category}</span></div></div>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' }}>{doc.description}</p>
              <span style={{ color: '#3b82f6', fontSize: '13px' }}>Open docs →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
export default Documentation;
