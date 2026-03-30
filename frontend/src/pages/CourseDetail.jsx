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

  useEffect(() => {
    courseAPI.get(courseId)
      .then((data) => {
        setCourse(data);
        if (data.lectures && data.lectures.length > 0) {
          // Auto-select first incomplete lecture, or first lecture
          const firstIncomplete = data.lectures.find((l) => !l.is_completed);
          setSelectedLecture(firstIncomplete || data.lectures[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSelectLecture = async (lecture) => {
    setSelectedLecture(lecture);
    // Mark as viewed (creates progress record on backend)
    try {
      await lectureAPI.get(lecture.id);
    } catch (err) { console.error(err); }
  };

  const handleMarkComplete = async (lectureId) => {
    try {
      await lectureAPI.updateProgress(lectureId, { is_completed: true, watched_seconds: 0 });
      // Refresh course data
      const updated = await courseAPI.get(courseId);
      setCourse(updated);
      const updatedLecture = updated.lectures.find((l) => l.id === lectureId);
      if (updatedLecture) setSelectedLecture(updatedLecture);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!course) return <div className="page-container"><p>Course not found.</p></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <button onClick={() => navigate('/learning-paths')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '8px' }}>
          ← Back to Learning Paths
        </button>
        <h1>🎓 {course.title}</h1>
        <p>{course.description}</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: '#94a3b8', fontSize: '14px' }}>
          <span>🎬 {course.total_lectures} lectures</span>
          <span>✓ {course.completed_lectures} completed</span>
          <span>📊 {course.progress_percent}% progress</span>
        </div>
        <div className="progress-bar" style={{ marginTop: '10px', maxWidth: '400px' }}>
          <div className="progress-fill" style={{ width: `${course.progress_percent}%` }}></div>
        </div>
      </div>

      <div className="course-layout">
        {/* Video Player */}
        <div className="video-section">
          {selectedLecture ? (
            <>
              <div className="video-player">
                {selectedLecture.youtube_id ? (
                  <iframe
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
                    <button className="action-btn" onClick={() => handleMarkComplete(selectedLecture.id)}>
                      ✓ Mark as Complete
                    </button>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>✓ Completed</span>
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
                        if (line.startsWith('```')) return <div key={i} style={{ background: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', color: '#10b981' }}>{line.replace(/```\w*/, '')}</div>;
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} style={{ color: '#94a3b8', lineHeight: '1.6' }}>{line}</p>;
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
          <h3 style={{ color: '#f1f5f9', marginBottom: '12px', fontSize: '15px' }}>Course Content</h3>
          <div className="lecture-list">
            {course.lectures.map((lecture, index) => (
              <div
                key={lecture.id}
                className={`lecture-item ${selectedLecture?.id === lecture.id ? 'active' : ''} ${lecture.is_completed ? 'completed' : ''}`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <div className="lecture-marker">
                  {lecture.is_completed ? (
                    <span style={{ color: '#10b981' }}>✓</span>
                  ) : selectedLecture?.id === lecture.id ? (
                    <span style={{ color: '#3b82f6' }}>▶</span>
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
