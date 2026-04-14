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
    try { const data = await courseAPI.get(courseId); setCourse(data); return data; }
    catch (err) { console.error(err); return null; }
  };

  useEffect(() => {
    fetchCourse().then((data) => {
      if (data?.lectures?.length > 0) { const first = data.lectures.find((l) => !l.is_completed) || data.lectures[0]; setSelectedLecture(first); }
      setLoading(false);
    });
  }, [courseId]);

  const handleMarkComplete = async () => {
    if (!selectedLecture || marking) return;
    setMarking(true);
    try {
      await lectureAPI.updateProgress(selectedLecture.id, { is_completed: true, watched_seconds: selectedLecture.duration_minutes * 60 });
      const updated = await fetchCourse();
      if (updated) {
        const updatedLec = updated.lectures.find((l) => l.id === selectedLecture.id);
        if (updatedLec) setSelectedLecture(updatedLec);
        const nextIndex = updated.lectures.findIndex((l) => l.id === selectedLecture.id) + 1;
        const next = updated.lectures[nextIndex];
        if (next && !next.is_completed) { setNotification(`✓ Done! Next: ${next.title}`); setTimeout(() => { setSelectedLecture(next); setNotification(''); }, 1500); }
        else { setNotification('✓ Lecture completed!'); setTimeout(() => setNotification(''), 3000); }
      }
    } catch (err) { setNotification('Failed. Try again.'); }
    finally { setMarking(false); }
  };

  if (loading) return <div className="page-container"><div className="loading-message">Loading course...</div></div>;
  if (!course) return <div className="page-container"><p>Course not found.</p></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <button onClick={() => navigate('/learning-paths')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '8px' }}>← Back to Learning Paths</button>
        <h1>🎓 {course.title}</h1>
        <p style={{ color: '#94a3b8' }}>{course.description}</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: '#94a3b8', fontSize: '14px' }}>
          <span>🎬 {course.total_lectures} lectures</span><span>✓ {course.completed_lectures} completed</span><span>📊 {course.progress_percent}%</span>
        </div>
        <div className="progress-bar" style={{ marginTop: '10px', maxWidth: '400px' }}><div className="progress-fill" style={{ width: `${course.progress_percent}%` }}></div></div>
      </div>
      {notification && <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', background: notification.startsWith('✓') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${notification.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: notification.startsWith('✓') ? '#6ee7b7' : '#fca5a5' }}>{notification}</div>}
      <div className="course-layout">
        <div className="video-section">
          {selectedLecture ? (<>
            <div className="video-player">
              {selectedLecture.youtube_id ? (<iframe key={selectedLecture.id} width="100%" height="100%" src={`https://www.youtube.com/embed/${selectedLecture.youtube_id}?rel=0`} title={selectedLecture.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />) : (<div className="no-video"><span style={{ fontSize: '48px' }}>🎬</span><p>No video</p></div>)}
            </div>
            <div className="lecture-detail">
              <div className="lecture-detail-header">
                <div><h2>{selectedLecture.title}</h2><p className="lecture-desc">{selectedLecture.description}</p></div>
                {!selectedLecture.is_completed ? (<button className="action-btn" onClick={handleMarkComplete} disabled={marking} style={{ minWidth: '160px' }}>{marking ? 'Saving...' : '✓ Mark Complete'}</button>) : (<span style={{ color: '#10b981', fontWeight: '600' }}>✓ Completed</span>)}
              </div>
              {selectedLecture.content && <div className="lecture-content"><h3>Lecture Notes</h3><pre style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.7' }}>{selectedLecture.content}</pre></div>}
            </div>
          </>) : (<div className="no-video"><p>Select a lecture</p></div>)}
        </div>
        <div className="lecture-sidebar">
          <h3 style={{ color: '#f1f5f9', marginBottom: '12px', fontSize: '15px' }}>Course Content ({course.completed_lectures}/{course.total_lectures})</h3>
          <div className="lecture-list">
            {course.lectures.map((lec, i) => (
              <div key={lec.id} className={`lecture-item ${selectedLecture?.id === lec.id ? 'active' : ''} ${lec.is_completed ? 'completed' : ''}`} onClick={() => setSelectedLecture(lec)}>
                <div className="lecture-marker">{lec.is_completed ? <span style={{ color: '#10b981' }}>✓</span> : selectedLecture?.id === lec.id ? <span style={{ color: '#3b82f6' }}>▶</span> : <span style={{ color: '#64748b' }}>{i + 1}</span>}</div>
                <div className="lecture-info"><p className="lecture-title">{lec.title}</p><p className="lecture-duration">{lec.duration_minutes} min</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
