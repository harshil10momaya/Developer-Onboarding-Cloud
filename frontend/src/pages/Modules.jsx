import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleAPI, courseAPI } from '../services/api';
import '../styles/Pages.css';

const Modules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { Promise.all([moduleAPI.list(), courseAPI.list()]).then(([m, c]) => { setModules(m); setCourses(c); }).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;
  return (
    <div className="page-container">
      <div className="page-header"><h1>📚 Modules</h1><p>Total modules: {modules.length}</p></div>
      {courses.length > 0 && (<div style={{ marginBottom: '24px' }}><h3 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Available Courses</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>{courses.map((c) => (<div key={c.id} className="course-card" onClick={() => navigate(`/courses/${c.id}`)}><div className="course-info"><h3>{c.title}</h3><div className="course-meta"><span>🎬 {c.total_lectures} lectures</span><span>📊 {c.progress_percent}%</span></div><div className="progress-bar" style={{ marginTop: '8px' }}><div className="progress-fill" style={{ width: `${c.progress_percent}%` }}></div></div></div><span className="course-arrow">→</span></div>))}</div></div>)}
      <h3 style={{ color: '#f1f5f9', marginBottom: '12px' }}>All Modules</h3>
      <div className="modules-list">{modules.map((m) => (<div key={m.id} className="module-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/learning-paths')}><div className="module-header"><h3>{m.title}</h3><span className={`status ${m.status.toLowerCase()}`}>{m.status}</span></div><div className="module-meta"><span className="course-tag">{m.description || 'No description'}</span><span className="date">{new Date(m.created_at).toLocaleDateString()}</span></div></div>))}</div>
    </div>
  );
};
export default Modules;
