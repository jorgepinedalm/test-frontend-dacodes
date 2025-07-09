import React from 'react';

interface MockMemoryGameAppProps {
  userId?: number;
  username?: string;
}

const MockMemoryGameApp: React.FC<MockMemoryGameAppProps> = ({ userId, username }) => {
  return (
    <div data-testid="mock-memory-game-app">
      <h1>Mock Memory Game Application</h1>
      <div data-testid="user-info">
        <span data-testid="user-id">{userId}</span>
        <span data-testid="username">{username}</span>
      </div>
      <div data-testid="game-grid">
        <div data-testid="game-card">Card 1</div>
        <div data-testid="game-card">Card 2</div>
        <div data-testid="game-card">Card 3</div>
        <div data-testid="game-card">Card 4</div>
      </div>
      <div data-testid="game-controls">
        <button data-testid="start-game">Start Game</button>
        <button data-testid="reset-game">Reset</button>
      </div>
    </div>
  );
};

export default MockMemoryGameApp;
