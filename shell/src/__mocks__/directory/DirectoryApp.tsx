import React from 'react';

const MockDirectoryApp: React.FC = () => {
  return (
    <div data-testid="mock-directory-app">
      <h1>Mock Directory Application</h1>
      <div data-testid="search-bar">
        <input data-testid="search-input" placeholder="Search users..." />
      </div>
      <div data-testid="user-table">
        <div data-testid="user-item">John Doe</div>
        <div data-testid="user-item">Jane Smith</div>
      </div>
    </div>
  );
};

export default MockDirectoryApp;
