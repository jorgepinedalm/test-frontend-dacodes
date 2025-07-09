import React from 'react';

interface MockProfileAppProps {
  userId?: number;
  username?: string;
}

const MockProfileApp: React.FC<MockProfileAppProps> = ({ userId, username }) => {
  return (
    <div data-testid="mock-profile-app">
      <h1>Mock Profile Application</h1>
      <div data-testid="user-info">
        <span data-testid="user-id">{userId}</span>
        <span data-testid="username">{username}</span>
      </div>
      <div data-testid="profile-form">
        <input data-testid="first-name-input" placeholder="First Name" />
        <input data-testid="last-name-input" placeholder="Last Name" />
        <input data-testid="email-input" placeholder="Email" />
        <button data-testid="save-profile">Save Profile</button>
      </div>
    </div>
  );
};

export default MockProfileApp;
