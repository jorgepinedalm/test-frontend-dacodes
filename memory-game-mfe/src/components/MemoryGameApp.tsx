import React, { useState } from 'react';
import { useMemoryGame } from '../hooks/useMemoryGame';
import GameControls from './GameControls';
import GameGrid from './GameGrid';
import Leaderboard from './Leaderboard';
import './MemoryGameApp.css';

interface MemoryGameAppProps {
  userId?: number;
  username?: string;
}

const MemoryGameApp: React.FC<MemoryGameAppProps> = ({ userId, username }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  const {
    gameState,
    gameStatus,
    flipCard,
    resetGame,
    startNewGame,
    pauseGame,
    resumeGame,
    remainingTime,
    isGameCompleted,
    isGameFailed
  } = useMemoryGame(userId, username);

  // Trigger leaderboard refresh when game is completed
  React.useEffect(() => {
    if (isGameCompleted) {
      setLeaderboardRefresh(prev => prev + 1);
    }
  }, [isGameCompleted]);

  return (
    <div className="memory-game-app">
      <div className="game-header">
        <h1>🧠 Memory Game</h1>
        <p className="game-description">
          Find all matching pairs by flipping cards. Test your memory and compete for the best score!
        </p>
      </div>

      <div className="game-layout">
        <div className="game-main">
          <GameControls
            gameStatus={gameStatus}
            gameState={{
              turns: gameState.turns,
              elapsedTime: gameState.elapsedTime,
              config: gameState.config,
              score: gameState.score || 0
            }}
            onStartNewGame={startNewGame}
            onResetGame={resetGame}
            onPauseGame={pauseGame}
            onResumeGame={resumeGame}
            remainingTime={remainingTime}
          />

          {gameState.cards.length > 0 && (
            <div className="game-area">
              <GameGrid
                cards={gameState.cards}
                gridSize={gameState.config.gridSize}
                onCardFlip={flipCard}
                disabled={gameStatus !== 'playing'}
                isGameComplete={isGameCompleted}
              />
            </div>
          )}

          {gameStatus === 'idle' && gameState.cards.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-icon">🎮</div>
              <h2>Welcome to Memory Game!</h2>
              <p>Configure your game settings above and click "Start Game" to begin.</p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">🧩</span>
                  <span>Multiple difficulty levels (3×3 to 6×6)</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⏱️</span>
                  <span>Optional timer challenges</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏆</span>
                  <span>Score tracking and leaderboard</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span>Responsive design for all devices</span>
                </div>
              </div>
            </div>
          )}

          {(gameStatus === 'completed' || gameStatus === 'failed') && (
            <div className="game-results">
              <div className={`result-card ${gameStatus}`}>
                <div className="result-icon">
                  {gameStatus === 'completed' ? '🎉' : '😞'}
                </div>
                <h3>
                  {gameStatus === 'completed' ? 'Congratulations!' : 'Game Over'}
                </h3>
                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">Final Score</span>
                    <span className="stat-value">{gameState.score || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Time Taken</span>
                    <span className="stat-value">{Math.floor(gameState.elapsedTime / 60)}:{(gameState.elapsedTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Turns</span>
                    <span className="stat-value">{gameState.turns}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Difficulty</span>
                    <span className="stat-value">{gameState.config.gridSize}×{gameState.config.gridSize}</span>
                  </div>
                </div>
                
                {gameStatus === 'completed' && userId && (
                  <p className="save-message">
                    Your score has been saved to the leaderboard! 🏆
                  </p>
                )}
                
                {gameStatus === 'failed' && (
                  <p className="failure-message">
                    Time's up! Try again with a larger time limit or smaller grid.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="game-sidebar">
          <div className="sidebar-header">
            <button
              className={`toggle-button ${showLeaderboard ? 'active' : ''}`}
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              {showLeaderboard ? '🎮 Hide Leaderboard' : '🏆 Show Leaderboard'}
            </button>
          </div>

          {showLeaderboard && (
            <div className="sidebar-content">
              <Leaderboard
                userId={userId}
                refreshTrigger={leaderboardRefresh}
              />
            </div>
          )}

          {!showLeaderboard && (
            <div className="sidebar-content">
              <div className="game-tips">
                <h3>💡 Tips & Strategies</h3>
                <ul>
                  <li>Start with easier grids (3×3) to practice</li>
                  <li>Focus on remembering card positions</li>
                  <li>Try to create mental patterns or stories</li>
                  <li>Work from corners and edges inward</li>
                  <li>Take your time - rushing leads to mistakes</li>
                </ul>
              </div>

              <div className="scoring-info">
                <h3>🎯 Scoring System</h3>
                <ul>
                  <li><strong>Time Score:</strong> Up to 50 points (faster = better)</li>
                  <li><strong>Turn Score:</strong> Up to 50 points (fewer turns = better)</li>
                  <li><strong>Difficulty Bonus:</strong> Up to 20 points (larger grids)</li>
                  <li><strong>Perfect Game:</strong> Match all pairs in minimum turns</li>
                </ul>
              </div>

              {!userId && (
                <div className="auth-prompt">
                  <h3>🔐 Login to Save Scores</h3>
                  <p>
                    Login to track your progress, save high scores, and compete on the leaderboard!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryGameApp;
