import React, { useState } from 'react';
import '../styles/Pages.css';

const MentorSupport = () => {
  const [mentors] = useState([
    { id: 1, name: 'Arjun Mehta', role: 'Backend Developer', availability: 'Available', rating: 4.8 },
    { id: 2, name: 'Priya Sharma', role: 'API Specialist', availability: 'Available', rating: 4.9 },
    { id: 3, name: 'Rohit Verma', role: 'DevOps Engineer', availability: 'Busy', rating: 4.7 },
    { id: 4, name: 'Neha Gupta', role: 'Database Expert', availability: 'Available', rating: 4.6 },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👨‍🏫 Mentor Support</h1>
        <p>Get help from experienced mentors</p>
      </div>

      <div className="mentors-grid">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="mentor-card">
            <div className="mentor-avatar">👤</div>
            <h3>{mentor.name}</h3>
            <p className="mentor-role">{mentor.role}</p>
            <div className="mentor-info">
              <span className={`availability ${mentor.availability.toLowerCase()}`}>
                {mentor.availability}
              </span>
              <span className="rating">⭐ {mentor.rating}</span>
            </div>
            <button className="contact-btn">Schedule Session</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorSupport;
