import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningPathAPI, courseAPI } from '../services/api';
import '../styles/Pages.css';

const LearningPaths = () => {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedPath, setExpandedPath] = useState(null);

  useEffect(() => {
    learningPathAPI.list()
      .then(setPaths)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const togglePath = async (pathId) => {
    if (expandedPath === pathId) {
      setExpandedPath(null);
      return;
    }
    setExpandedPath(pathId);
    if (!courses[pathId]) {
      try {
        const data = await courseAPI.list(pathId);
        setCourses((prev) => ({ ...prev, [pathId]: data }));
      } catch (err) { console.error(err); }
    }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🛤️ Learning Paths</h1>
        <p>Choose your learning journey — each path contains courses with video lectures</p>
      </div>

      <div className="paths-list">
        {paths.map((path) => {
          const pathCourses = courses[path.id] || [];
          const isExpanded = expandedPath === path.id;
          const totalLectures = pathCourses.reduce((sum, c) => sum + c.total_lectures, 0);
          const completedLectures = pathCourses.reduce((sum, c) => sum + c.completed_lectures, 0);
          const overallProgress = totalLectures > 0 ? Math.round(completedLectures / totalLectures * 100) : 0;

          return (
            <div key={path.id} className="path-card">
              <div className="path-header" onClick={() => togglePath(path.id)}>
                <div className="path-info">
                  <h2>{path.title}</h2>
                  <p className="path-desc">{path.description}</p>
                  <div className="path-meta">
                    <span className="badge">{path.level}</span>
                    <span className="meta-item">📚 {(path.module_ids || []).length} modules</span>
                    {pathCourses.length > 0 && <span className="meta-item">🎓 {pathCourses.length} courses · {totalLectures} lectures</span>}
                  </div>
                  {pathCourses.length > 0 && (
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                      <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                  )}
                </div>
                <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="path-courses">
                  {pathCourses.length === 0 ? (
                    <p style={{ color: '#94a3b8', padding: '16px' }}>No courses available for this path yet.</p>
                  ) : (
                    pathCourses.map((course) => (
                      <div key={course.id} className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                        <div className="course-info">
                          <h3>{course.title}</h3>
                          <p className="course-desc">{course.description}</p>
                          <div className="course-meta">
                            <span>🎬 {course.total_lectures} lectures</span>
                            <span>✓ {course.completed_lectures}/{course.total_lectures} completed</span>
                          </div>
                          <div className="progress-bar" style={{ marginTop: '8px' }}>
                            <div className="progress-fill" style={{ width: `${course.progress_percent}%` }}></div>
                          </div>
                          <p className="progress-text">{course.progress_percent}% Complete</p>
                        </div>
                        <span className="course-arrow">→</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPaths;
