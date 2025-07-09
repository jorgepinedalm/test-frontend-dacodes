import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">
          Welcome to Modular People Portal
        </h1>
        <p className="dashboard-subtitle">By Jorge Pineda Montagut</p>
        
        <p className="dashboard-description">
          A React TypeScript microfrontend application with authentication, 
          user directory, and memory game functionality.
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">🔐 Authentication</h3>
            <p className="feature-description">
              Secure JWT-based login system
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="feature-title">👥 Directory</h3>
            <p className="feature-description">
              Browse and search user profiles
            </p>
          </div>
          
          <div className="feature-card">
            <h3 className="feature-title">🎮 Memory Game</h3>
            <p className="feature-description">
              Challenge your memory skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
