import React, { useState, useEffect } from 'react';
import { mentorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const MentorSupport = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMentor = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorData = await mentorAPI.list();
        setMentors(mentorData);
        if (isMentor) {
          const devData = await mentorAPI.getDeveloperProgress();
          setDevelopers(devData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isMentor]);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👨‍🏫 Mentor Support</h1>
        <p>{isMentor ? 'Monitor developer progress and provide guidance' : 'Get help from experienced mentors'}</p>
      </div>

      {/* Mentor directory */}
      <div className="mentors-grid">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="mentor-card">
            <div className="mentor-avatar">👤</div>
            <h3>{mentor.full_name}</h3>
            <p className="mentor-role">{mentor.dev_role ? `${mentor.dev_role.charAt(0).toUpperCase() + mentor.dev_role.slice(1)} Expert` : mentor.role}</p>
            <div className="mentor-info">
              <span className="availability available">Available</span>
            </div>
            <button className="contact-btn">Schedule Session</button>
          </div>
        ))}
      </div>

      {/* Mentor dashboard - developer progress */}
      {isMentor && developers.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '16px' }}>Developer Progress</h2>
          <div className="analysis-table">
            <table>
              <thead>
                <tr>
                  <th>Developer</th>
                  <th>Role</th>
                  <th>Modules Completed</th>
                  <th>Completion Rate</th>
                  <th>Time Spent</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((dev) => (
                  <tr key={dev.id}>
                    <td>{dev.full_name}</td>
                    <td>{dev.dev_role || 'N/A'}</td>
                    <td>{dev.modules_completed}/{dev.total_modules}</td>
                    <td><span className="badge success">{dev.completion_rate}%</span></td>
                    <td>{dev.time_spent_hours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorSupport;
