import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI, dashboardAPI, courseAPI } from '../services/api';
import '../styles/Pages.css';

const ProgressTracker = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([progressAPI.getMyProgress(), dashboardAPI.getStats(), courseAPI.list()])
      .then(([progressData, statsData, courseData]) => {
        setProgress(progressData);
        setStats(statsData);
        setCourses(courseData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;

  const completed = progress.filter((p) => p.status === 'completed').length;
  const total = progress.length || stats?.total_modules || 0;
  const timeSpent = stats?.time_spent_hours || 0;
  const avgScore = stats?.average_score || 0;
  const totalCourseLectures = courses.reduce((s, c) => s + c.total_lectures, 0);
  const completedCourseLectures = courses.reduce((s, c) => s + c.completed_lectures, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Progress Tracker</h1>
        <p>Monitor your learning progress across all courses and modules</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Modules Completed</h4>
          <p className="stat-value">{completed}/{total}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h4>Lectures Completed</h4>
          <p className="stat-value">{completedCourseLectures}/{totalCourseLectures}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${totalCourseLectures > 0 ? (completedCourseLectures / totalCourseLectures) * 100 : 0}%` }}></div>
          </div>
        </div>
        <div className="stat-card">
          <h4>Time Spent</h4>
          <p className="stat-value">{timeSpent} hrs</p>
        </div>
        <div className="stat-card">
          <h4>Average Score</h4>
          <p className="stat-value">{avgScore}%</p>
        </div>
      </div>

      {/* Course Progress */}
      {courses.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '16px' }}>Course Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.map((course) => (
              <div key={course.id} className="module-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${course.id}`)}>
                <div className="module-header">
                  <h3>{course.title}</h3>
                  <span className={`status ${course.progress_percent === 100 ? 'completed' : course.progress_percent > 0 ? 'in-progress' : 'draft'}`}>
                    {course.progress_percent === 100 ? 'Completed' : course.progress_percent > 0 ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${course.progress_percent}%` }}></div>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {course.completed_lectures}/{course.total_lectures} lectures · {course.progress_percent}%
                  </span>
                </div>
                {/* Lecture breakdown */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {course.lectures.map((lec) => (
                    <div key={lec.id} title={lec.title} style={{
                      width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600',
                      background: lec.is_completed ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)',
                      border: `1px solid ${lec.is_completed ? 'rgba(16,185,129,0.4)' : 'rgba(100,116,139,0.2)'}`,
                      color: lec.is_completed ? '#10b981' : '#64748b',
                    }}>
                      {lec.is_completed ? '✓' : lec.order}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly chart */}
      <div className="chart-section" style={{ marginTop: '24px' }}>
        <h3 style={{ color: '#f1f5f9' }}>Weekly Activity</h3>
        <div className="weekly-chart">
          {[20, 35, 40, 50, 45, 55, 60].map((value, index) => (
            <div key={index} className="chart-bar">
              <div className="bar-fill" style={{ height: `${value}%` }}></div>
              <span className="day-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
