import React from 'react';

const MockAuthApp: React.FC = () => {
  return (
    <div data-testid="mock-auth-app">
      <h1>Mock Auth Application</h1>
      <form data-testid="login-form">
        <input data-testid="username-input" placeholder="Username" />
        <input data-testid="password-input" type="password" placeholder="Password" />
        <button data-testid="login-button" type="submit">Login</button>
      </form>
    </div>
  );
};

export default MockAuthApp;
