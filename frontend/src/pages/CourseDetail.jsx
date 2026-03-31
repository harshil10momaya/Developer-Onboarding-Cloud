import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, lectureAPI } from '../services/api';
import '../styles/Pages.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchCourse = async () => {
    try {
      const data = await courseAPI.get(courseId);
      setCourse(data);
      return data;
    } catch (err) {
      console.error('Failed to load course:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchCourse().then((data) => {
      if (data && data.lectures && data.lectures.length > 0) {
        const firstIncomplete = data.lectures.find((l) => !l.is_completed);
        setSelectedLecture(firstIncomplete || data.lectures[0]);
      }
      setLoading(false);
    });
  }, [courseId]);

  const handleSelectLecture = (lecture) => {
    setSelectedLecture(lecture);
    setNotification('');
  };

  const handleMarkComplete = async () => {
    if (!selectedLecture || marking) return;
    setMarking(true);
    setNotification('');
    try {
      await lectureAPI.updateProgress(selectedLecture.id, {
        is_completed: true,
        watched_seconds: selectedLecture.duration_minutes * 60,
      });

      // Refresh course to get updated progress
      const updated = await fetchCourse();
      if (updated) {
        const updatedLecture = updated.lectures.find((l) => l.id === selectedLecture.id);
        if (updatedLecture) setSelectedLecture(updatedLecture);

        // Auto-advance to next lecture
        const currentIndex = updated.lectures.findIndex((l) => l.id === selectedLecture.id);
        const nextLecture = updated.lectures[currentIndex + 1];
        if (nextLecture && !nextLecture.is_completed) {
          setNotification(`✓ Completed! Moving to: ${nextLecture.title}`);
          setTimeout(() => {
            setSelectedLecture(nextLecture);
            setNotification('');
          }, 1500);
        } else {
          setNotification('✓ Lecture marked as complete!');
          setTimeout(() => setNotification(''), 3000);
        }
      }
    } catch (err) {
      console.error('Mark complete failed:', err);
      setNotification('Failed to mark as complete. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="page-container"><div className="loading-message">Loading course...</div></div>;
  if (!course) return <div className="page-container"><p style={{ color: '#fca5a5' }}>Course not found. <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/learning-paths')}>Back to Learning Paths</span></p></div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <button onClick={() => navigate('/learning-paths')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '8px' }}>
          ← Back to Learning Paths
        </button>
        <h1>🎓 {course.title}</h1>
        <p style={{ color: '#94a3b8' }}>{course.description}</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: '#94a3b8', fontSize: '14px' }}>
          <span>🎬 {course.total_lectures} lectures</span>
          <span>✓ {course.completed_lectures} completed</span>
          <span>📊 {course.progress_percent}% progress</span>
        </div>
        <div className="progress-bar" style={{ marginTop: '10px', maxWidth: '400px' }}>
          <div className="progress-fill" style={{ width: `${course.progress_percent}%` }}></div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
          background: notification.startsWith('✓') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${notification.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: notification.startsWith('✓') ? '#6ee7b7' : '#fca5a5',
        }}>
          {notification}
        </div>
      )}

      <div className="course-layout">
        {/* Video + Content */}
        <div className="video-section">
          {selectedLecture ? (
            <>
              <div className="video-player">
                {selectedLecture.youtube_id ? (
                  <iframe
                    key={selectedLecture.id}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedLecture.youtube_id}?rel=0`}
                    title={selectedLecture.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="no-video">
                    <span style={{ fontSize: '48px' }}>🎬</span>
                    <p>No video available for this lecture</p>
                  </div>
                )}
              </div>

              <div className="lecture-detail">
                <div className="lecture-detail-header">
                  <div>
                    <h2>{selectedLecture.title}</h2>
                    <p className="lecture-desc">{selectedLecture.description}</p>
                  </div>
                  {!selectedLecture.is_completed ? (
                    <button
                      className="action-btn"
                      onClick={handleMarkComplete}
                      disabled={marking}
                      style={{ minWidth: '160px', opacity: marking ? 0.6 : 1 }}
                    >
                      {marking ? 'Saving...' : '✓ Mark as Complete'}
                    </button>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}>✓ Completed</span>
                  )}
                </div>

                {selectedLecture.content && (
                  <div className="lecture-content">
                    <h3>Lecture Notes</h3>
                    <div className="content-body">
                      {selectedLecture.content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h2 key={i} style={{ color: '#f1f5f9', marginTop: '16px' }}>{line.slice(2)}</h2>;
                        if (line.startsWith('## ')) return <h3 key={i} style={{ color: '#cbd5e1', marginTop: '12px' }}>{line.slice(3)}</h3>;
                        if (line.startsWith('- ')) return <li key={i} style={{ color: '#94a3b8', marginLeft: '20px' }}>{line.slice(2)}</li>;
                        if (line.startsWith('```')) return <div key={i} style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', color: '#10b981', margin: '4px 0' }}>{line.replace(/```\w*/, '')}</div>;
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} style={{ color: '#94a3b8', lineHeight: '1.6', margin: '4px 0' }}>{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-video"><p>Select a lecture to start learning</p></div>
          )}
        </div>

        {/* Lecture Sidebar */}
        <div className="lecture-sidebar">
          <h3 style={{ color: '#f1f5f9', marginBottom: '12px', fontSize: '15px' }}>
            Course Content ({course.completed_lectures}/{course.total_lectures})
          </h3>
          <div className="lecture-list">
            {course.lectures.map((lecture, index) => (
              <div
                key={lecture.id}
                className={`lecture-item ${selectedLecture?.id === lecture.id ? 'active' : ''} ${lecture.is_completed ? 'completed' : ''}`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <div className="lecture-marker">
                  {lecture.is_completed ? (
                    <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  ) : selectedLecture?.id === lecture.id ? (
                    <span style={{ color: '#3b82f6', fontSize: '14px' }}>▶</span>
                  ) : (
                    <span style={{ color: '#64748b' }}>{index + 1}</span>
                  )}
                </div>
                <div className="lecture-info">
                  <p className="lecture-title">{lecture.title}</p>
                  <p className="lecture-duration">{lecture.duration_minutes} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
