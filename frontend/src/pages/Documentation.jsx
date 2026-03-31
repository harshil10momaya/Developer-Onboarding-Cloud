import React from 'react';
import '../styles/Pages.css';

const DOC_LINKS = [
  { title: 'FastAPI Documentation', category: 'Backend', url: 'https://fastapi.tiangolo.com/', description: 'Official FastAPI docs — endpoints, validation, async, deployment', icon: '⚡' },
  { title: 'React Documentation', category: 'Frontend', url: 'https://react.dev/', description: 'Official React docs — components, hooks, patterns, API reference', icon: '⚛️' },
  { title: 'PostgreSQL Documentation', category: 'Database', url: 'https://www.postgresql.org/docs/', description: 'PostgreSQL official docs — SQL, administration, optimization', icon: '🐘' },
  { title: 'SQLAlchemy Documentation', category: 'Database', url: 'https://docs.sqlalchemy.org/', description: 'SQLAlchemy ORM docs — models, queries, relationships, migrations', icon: '🔗' },
  { title: 'Docker Documentation', category: 'DevOps', url: 'https://docs.docker.com/', description: 'Docker docs — containers, images, Compose, networking', icon: '🐳' },
  { title: 'Kubernetes Documentation', category: 'DevOps', url: 'https://kubernetes.io/docs/', description: 'Kubernetes docs — pods, deployments, services, config', icon: '☸️' },
  { title: 'AWS Documentation', category: 'Cloud', url: 'https://docs.aws.amazon.com/', description: 'AWS docs — EC2, S3, RDS, IAM, Lambda, CloudWatch', icon: '☁️' },
  { title: 'GitHub Actions', category: 'DevOps', url: 'https://docs.github.com/en/actions', description: 'GitHub Actions docs — CI/CD workflows, runners, secrets', icon: '🔄' },
  { title: 'Pydantic Documentation', category: 'Backend', url: 'https://docs.pydantic.dev/', description: 'Pydantic docs — data validation, models, settings', icon: '✅' },
  { title: 'Redis Documentation', category: 'Database', url: 'https://redis.io/docs/', description: 'Redis docs — caching, pub/sub, data structures', icon: '🔴' },
  { title: 'Vite Documentation', category: 'Frontend', url: 'https://vite.dev/', description: 'Vite docs — dev server, build, plugins, config', icon: '⚡' },
  { title: 'Prometheus & Grafana', category: 'Monitoring', url: 'https://prometheus.io/docs/', description: 'Monitoring stack — metrics, alerting, dashboards', icon: '📊' },
];

const CATEGORIES = [...new Set(DOC_LINKS.map((d) => d.category))];

const Documentation = () => {
  const [filter, setFilter] = React.useState('');

  const filtered = filter ? DOC_LINKS.filter((d) => d.category === filter) : DOC_LINKS;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📖 Documentation</h1>
        <p>Quick access to official documentation for all technologies in this project</p>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map((doc, i) => (
          <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div className="doc-link-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px' }}>{doc.icon}</span>
                <div>
                  <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '15px' }}>{doc.title}</h3>
                  <span style={{ color: '#3b82f6', fontSize: '12px' }}>{doc.category}</span>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px 0' }}>{doc.description}</p>
              <span style={{ color: '#3b82f6', fontSize: '13px' }}>Open docs →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Documentation;
