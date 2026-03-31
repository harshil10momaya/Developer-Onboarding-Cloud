import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleAPI, courseAPI } from '../services/api';
import '../styles/Pages.css';

const Modules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    Promise.all([moduleAPI.list(), courseAPI.list()])
      .then(([moduleData, courseData]) => {
        setModules(moduleData);
        setCourses(courseData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCourseName = (moduleRepoId) => {
    // Find matching course or return repo-based name
    for (const course of courses) {
      for (const lec of course.lectures || []) {
        if (lec.id === moduleRepoId) return course.title;
      }
    }
    return null;
  };

  const filteredModules = filterStatus
    ? modules.filter((m) => m.status.toLowerCase() === filterStatus)
    : modules;

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Modules</h1>
        <p>Total modules: {modules.length} · Browse all available learning modules</p>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <button className={`filter-btn ${filterStatus === '' ? 'active' : ''}`} onClick={() => setFilterStatus('')}>All ({modules.length})</button>
        <button className={`filter-btn ${filterStatus === 'published' ? 'active' : ''}`} onClick={() => setFilterStatus('published')}>Published ({modules.filter(m => m.status === 'published').length})</button>
        <button className={`filter-btn ${filterStatus === 'draft' ? 'active' : ''}`} onClick={() => setFilterStatus('draft')}>Draft ({modules.filter(m => m.status === 'draft').length})</button>
      </div>

      {/* Courses overview */}
      {courses.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '12px' }}>Available Courses</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {courses.map((course) => (
              <div key={course.id} className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <div className="course-meta">
                    <span>🎬 {course.total_lectures} lectures</span>
                    <span>📊 {course.progress_percent}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: '8px' }}>
                    <div className="progress-fill" style={{ width: `${course.progress_percent}%` }}></div>
                  </div>
                </div>
                <span className="course-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module list */}
      <h3 style={{ color: '#f1f5f9', marginBottom: '12px' }}>All Modules</h3>
      <div className="modules-list">
        {filteredModules.map((module) => (
          <div key={module.id} className="module-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/learning-paths')}>
            <div className="module-header">
              <h3>{module.title}</h3>
              <span className={`status ${module.status.toLowerCase()}`}>{module.status}</span>
            </div>
            <div className="module-meta">
              <span className="course-tag">{module.description || 'No description'}</span>
              <span className="date">{new Date(module.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {filteredModules.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No modules found.</p>}
      </div>
    </div>
  );
};

export default Modules;
