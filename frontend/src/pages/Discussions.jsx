import React, { useState } from 'react';
import '../styles/Pages.css';

const Discussions = () => {
  const [discussions] = useState([
    { id: 1, title: 'Best practices for authentication', author: 'Arjun Mehta', replies: 12, views: 234, category: 'Backend' },
    { id: 2, title: 'React hooks optimization', author: 'Priya Sharma', replies: 8, views: 156, category: 'Frontend' },
    { id: 3, title: 'Database indexing strategies', author: 'Rohit Verma', replies: 15, views: 289, category: 'Database' },
    { id: 4, title: 'Docker deployment tips', author: 'Neha Gupta', replies: 6, views: 98, category: 'DevOps' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💬 Discussions</h1>
        <p>Join community discussions and share knowledge</p>
      </div>

      <div className="discussions-list">
        {discussions.map((discussion) => (
          <div key={discussion.id} className="discussion-item">
            <div className="discussion-content">
              <h3>{discussion.title}</h3>
              <p className="author">by {discussion.author}</p>
              <div className="discussion-meta">
                <span className="category">{discussion.category}</span>
                <span className="replies">💬 {discussion.replies} replies</span>
                <span className="views">👁️ {discussion.views} views</span>
              </div>
            </div>
            <button className="join-btn">Join Discussion →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discussions;
