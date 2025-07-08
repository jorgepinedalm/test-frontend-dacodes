import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '1.5rem',
          fontSize: '2.5rem',
          fontWeight: '600'
        }}>
          Welcome to Modular People Portal
        </h1>
        
        <p style={{ 
          color: '#666', 
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          A React TypeScript microfrontend application with authentication, 
          user directory, and memory game functionality.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#495057', margin: '0 0 0.5rem 0' }}>🔐 Authentication</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.9rem' }}>
              Secure JWT-based login system
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#495057', margin: '0 0 0.5rem 0' }}>👥 Directory</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.9rem' }}>
              Browse and search user profiles
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ color: '#495057', margin: '0 0 0.5rem 0' }}>🎮 Memory Game</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.9rem' }}>
              Challenge your memory skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
