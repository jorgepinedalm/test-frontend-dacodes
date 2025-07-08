import React from 'react';
import { GameConfig, GameStatus } from '../types/game';
import { DEFAULT_CONFIGS, formatTime, getDifficultyLevel } from '../utils/gameUtils';
import './GameControls.css';

interface GameControlsProps {
  gameStatus: GameStatus;
  gameState: {
    turns: number;
    elapsedTime: number;
    config: GameConfig;
    score: number;
  };
  onStartNewGame: (config: GameConfig) => void;
  onResetGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  remainingTime: number | null;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameStatus,
  gameState,
  onStartNewGame,
  onResetGame,
  onPauseGame,
  onResumeGame,
  remainingTime
}) => {
  const [selectedConfig, setSelectedConfig] = React.useState<GameConfig>(DEFAULT_CONFIGS.medium);
  const [showSettings, setShowSettings] = React.useState(false);

  const handleConfigChange = (key: keyof GameConfig, value: any) => {
    setSelectedConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStartGame = () => {
    onStartNewGame(selectedConfig);
    setShowSettings(false);
  };

  const difficultyLevel = getDifficultyLevel(gameState.config.gridSize);

  return (
    <div className="game-controls">
      <div className="game-stats">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Difficulty</span>
            <span className="stat-value">{difficultyLevel}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Grid Size</span>
            <span className="stat-value">{gameState.config.gridSize}×{gameState.config.gridSize}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Turns</span>
            <span className="stat-value">{gameState.turns}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time</span>
            <span className="stat-value">
              {formatTime(gameState.elapsedTime)}
              {remainingTime !== null && (
                <span className="remaining-time">
                  {' '}/ {formatTime(remainingTime)}
                </span>
              )}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value score">{gameState.score}</span>
          </div>
        </div>
      </div>

      <div className="control-buttons">
        {gameStatus === 'idle' && (
          <>
            <button
              className="btn btn-primary"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? 'Hide Settings' : 'Game Settings'}
            </button>
            <button
              className="btn btn-success"
              onClick={handleStartGame}
            >
              Start Game
            </button>
          </>
        )}

        {gameStatus === 'playing' && (
          <>
            <button
              className="btn btn-warning"
              onClick={onPauseGame}
            >
              Pause
            </button>
            <button
              className="btn btn-secondary"
              onClick={onResetGame}
            >
              Reset
            </button>
          </>
        )}

        {gameStatus === 'paused' && (
          <>
            <button
              className="btn btn-success"
              onClick={onResumeGame}
            >
              Resume
            </button>
            <button
              className="btn btn-secondary"
              onClick={onResetGame}
            >
              Reset
            </button>
          </>
        )}

        {(gameStatus === 'completed' || gameStatus === 'failed') && (
          <>
            <button
              className="btn btn-primary"
              onClick={() => setShowSettings(!showSettings)}
            >
              Game Settings
            </button>
            <button
              className="btn btn-success"
              onClick={handleStartGame}
            >
              Play Again
            </button>
          </>
        )}
      </div>

      {showSettings && (
        <div className="game-settings">
          <h3>Game Configuration</h3>
          
          <div className="setting-group">
            <label htmlFor="grid-size">Grid Size:</label>
            <select
              id="grid-size"
              value={selectedConfig.gridSize}
              onChange={(e) => handleConfigChange('gridSize', parseInt(e.target.value))}
              className="form-control"
            >
              <option value={3}>3×3 (Easy)</option>
              <option value={4}>4×4 (Medium)</option>
              <option value={5}>5×5 (Hard)</option>
              <option value={6}>6×6 (Expert)</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedConfig.hasTimer}
                onChange={(e) => handleConfigChange('hasTimer', e.target.checked)}
              />
              Enable Timer
            </label>
          </div>

          {selectedConfig.hasTimer && (
            <div className="setting-group">
              <label htmlFor="time-limit">Time Limit (seconds):</label>
              <input
                id="time-limit"
                type="number"
                min="30"
                max="600"
                value={selectedConfig.timeLimit || 120}
                onChange={(e) => handleConfigChange('timeLimit', parseInt(e.target.value))}
                className="form-control"
              />
            </div>
          )}

          <div className="preset-buttons">
            <h4>Quick Presets:</h4>
            <div className="preset-grid">
              {Object.entries(DEFAULT_CONFIGS).map(([name, config]) => (
                <button
                  key={name}
                  className={`btn btn-outline ${
                    JSON.stringify(selectedConfig) === JSON.stringify(config) ? 'active' : ''
                  }`}
                  onClick={() => setSelectedConfig(config)}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameStatus === 'failed' && (
        <div className="game-message failure">
          <h3>Time's Up!</h3>
          <p>Better luck next time! Try a larger time limit or smaller grid.</p>
        </div>
      )}

      {gameStatus === 'completed' && (
        <div className="game-message success">
          <h3>Congratulations!</h3>
          <p>You completed the {difficultyLevel} level in {gameState.turns} turns!</p>
          <p>Final Score: <strong>{gameState.score}</strong></p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
