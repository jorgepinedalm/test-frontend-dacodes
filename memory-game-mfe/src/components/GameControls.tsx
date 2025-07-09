import React from 'react';
import { createPortal } from 'react-dom';
import { GameConfig, GameStatus } from '../types/game';
import { DEFAULT_CONFIGS, formatTime, getDifficultyLevel } from '../utils/gameUtils';
import { useGameSettingsContext } from '../contexts/GameSettingsContext';
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
  onViewLeaderboard?: () => void;
  remainingTime: number | null;
}

// Modal Component outside main component to prevent re-creation
interface ResultModalProps {
  isVisible: boolean;
  gameStatus: GameStatus;
  difficultyLevel: string;
  turns: number;
  score: number;
  onClose: () => void;
  onShowSettings: () => void;
  onStartGame: () => void;
  onViewLeaderboard?: () => void;
}

const ResultModal: React.FC<ResultModalProps> = React.memo(({
  isVisible,
  gameStatus,
  difficultyLevel,
  turns,
  score,
  onClose,
  onShowSettings,
  onStartGame,
  onViewLeaderboard
}) => {
  // Early return to prevent unnecessary rendering
  if (!isVisible) {
    return null;
  }
  
  if (gameStatus !== 'completed' && gameStatus !== 'failed') {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        tabIndex={-1}
      >
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className={`modal-header ${gameStatus === 'completed' ? 'success' : 'failure'}`}>
          <h3 id="modal-title">
            {gameStatus === 'completed' ? '🎉 Congratulations!' : '⏰ Time\'s Up!'}
          </h3>
        </div>
        
        <div className="modal-body" id="modal-description">
          {gameStatus === 'completed' ? (
            <>
              <p>You completed the {difficultyLevel} level in {turns} turns!</p>
              <div className="score-highlight">
                Final Score: {score}
              </div>
              <p>Great job! Your memory skills are impressive!</p>
            </>
          ) : (
            <>
              <p>Better luck next time!</p>
              <p>Try a larger time limit or smaller grid size.</p>
            </>
          )}
        </div>
          <div className="modal-actions">
          <button
            className="btn btn-primary"
            onClick={onShowSettings}
          >
            Game Settings
          </button>          
          <button
            className="btn btn-success"
            onClick={onStartGame}
          >
            Play Again
          </button>
          {onViewLeaderboard && (
            <button
              className="btn btn-info"
              onClick={onViewLeaderboard}
            >
              🏆 Show Leaderboard
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
});

const GameControls: React.FC<GameControlsProps> = ({
  gameStatus,
  gameState,
  onStartNewGame,
  onResetGame,
  onPauseGame,
  onResumeGame,
  onViewLeaderboard,
  remainingTime
}) => {
  const { gameSettings, updateGameSettings, saveGameSettings } = useGameSettingsContext();
  const [selectedConfig, setSelectedConfig] = React.useState<GameConfig>(gameSettings);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showResultModal, setShowResultModal] = React.useState(false);

  // Sync selectedConfig with persisted settings when they change
  React.useEffect(() => {
    setSelectedConfig(gameSettings);
  }, [gameSettings]);// Show modal when game is completed or failed with small delay to prevent flickering
  React.useEffect(() => {
    if (gameStatus === 'completed' || gameStatus === 'failed') {
      // Small delay to ensure smooth transition
      const showTimeout = setTimeout(() => {
        setShowResultModal(true);
      }, 50);
      
      return () => clearTimeout(showTimeout);
    } else {
      setShowResultModal(false);
    }
  }, [gameStatus]);

  // Handle ESC key to close modal and focus management
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showResultModal) {
        setShowResultModal(false);
      }
    };

    if (showResultModal) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus the modal for screen readers with a small delay
      const focusTimeout = setTimeout(() => {
        const modal = document.querySelector('.modal-content');
        if (modal) {
          (modal as HTMLElement).focus();
        }
      }, 100);

      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
        clearTimeout(focusTimeout);
      };
    } else {
      // Cleanup when modal is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showResultModal]);
  const handleConfigChange = (key: keyof GameConfig, value: any) => {
    const newConfig = {
      ...selectedConfig,
      [key]: value
    };
    setSelectedConfig(newConfig);
    // Persist the changes immediately
    updateGameSettings({ [key]: value });
  };  const handleStartGame = React.useCallback(() => {
    // Save current config before starting game
    saveGameSettings(selectedConfig);
    onStartNewGame(selectedConfig);
    setShowSettings(false);
    setShowResultModal(false);
  }, [selectedConfig, onStartNewGame, saveGameSettings]);

  const handleCloseModal = React.useCallback(() => {
    setShowResultModal(false);
  }, []);

  const difficultyLevel = getDifficultyLevel(gameState.config.gridSize);
  // Memoized handlers to prevent unnecessary re-renders
  const handleShowSettings = React.useCallback(() => {
    setShowSettings(!showSettings);
    setShowResultModal(false);
  }, [showSettings]);
  const handleStartGameFromModal = React.useCallback(() => {
    // Save current config before starting game
    saveGameSettings(selectedConfig);
    onStartNewGame(selectedConfig);
    setShowSettings(false);
    setShowResultModal(false);
  }, [selectedConfig, onStartNewGame, saveGameSettings]);
  const handleViewLeaderboard = React.useCallback(() => {
    setShowResultModal(false);
    if (onViewLeaderboard) {
      onViewLeaderboard();
    }
  }, [onViewLeaderboard]);

  const handlePresetSelect = React.useCallback((config: GameConfig) => {
    setSelectedConfig(config);
    saveGameSettings(config);
  }, [saveGameSettings]);

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
            <div className="preset-grid">              {Object.entries(DEFAULT_CONFIGS).map(([name, config]) => (
                <button
                  key={name}
                  className={`btn btn-outline ${
                    JSON.stringify(selectedConfig) === JSON.stringify(config) ? 'active' : ''
                  }`}
                  onClick={() => handlePresetSelect(config)}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>      )}      <ResultModal 
        isVisible={showResultModal}
        gameStatus={gameStatus}
        difficultyLevel={difficultyLevel}
        turns={gameState.turns}
        score={gameState.score}
        onClose={handleCloseModal}
        onShowSettings={handleShowSettings}
        onStartGame={handleStartGameFromModal}
        onViewLeaderboard={handleViewLeaderboard}
      />
    </div>
  );
};

export default GameControls;
