// Tests for MemoryGameApp component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemoryGameApp from '../../components/MemoryGameApp';
import { useMemoryGame } from '../../hooks/useMemoryGame';

// Mock the useMemoryGame hook
jest.mock('../../hooks/useMemoryGame');
const mockUseMemoryGame = useMemoryGame as jest.MockedFunction<typeof useMemoryGame>;

// Mock child components
jest.mock('../../components/GameControls', () => {
  return function MockGameControls({ onStartNewGame, onResetGame, onPauseGame, onResumeGame }: any) {
    return (
      <div data-testid="game-controls">
        <button onClick={() => onStartNewGame({ gridSize: 4, hasTimer: false })}>Start Game</button>
        <button onClick={onResetGame}>Reset Game</button>
        <button onClick={onPauseGame}>Pause Game</button>
        <button onClick={onResumeGame}>Resume Game</button>
      </div>
    );
  };
});

jest.mock('../../components/GameGrid', () => {
  return function MockGameGrid({ cards, onCardFlip, disabled }: any) {
    return (
      <div data-testid="game-grid">
        {cards.map((card: any) => (
          <button
            key={card.id}
            onClick={() => !disabled && onCardFlip(card.id)}
            disabled={disabled}
          >
            {card.value}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock('../../components/Leaderboard', () => {
  return function MockLeaderboard({ userId }: any) {
    return <div data-testid="leaderboard">Leaderboard for user {userId}</div>;
  };
});

describe('MemoryGameApp', () => {
  const mockGameHook = {
    gameState: {
      cards: [],
      flippedCards: [],
      matchedPairs: 0,
      totalPairs: 0,
      turns: 0,
      isGameActive: false,
      isGameComplete: false,
      elapsedTime: 0,
      config: { gridSize: 4, hasTimer: false },
      score: 0
    },
    gameStatus: 'idle' as const,
    flipCard: jest.fn(),
    resetGame: jest.fn(),
    startNewGame: jest.fn(),
    pauseGame: jest.fn(),
    resumeGame: jest.fn(),
    remainingTime: null,
    isGameCompleted: false,
    isGameFailed: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMemoryGame.mockReturnValue(mockGameHook);
  });

  describe('rendering', () => {
    it('should render main components', () => {
      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('🧠 Memory Game')).toBeInTheDocument();
      expect(screen.getByText(/Find all matching pairs by flipping cards/)).toBeInTheDocument();
      expect(screen.getByTestId('game-controls')).toBeInTheDocument();
    });

    it('should render welcome message when game is idle and no cards', () => {
      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('Welcome to Memory Game!')).toBeInTheDocument();
      expect(screen.getByText('Configure your game settings above and click "Start Game" to begin.')).toBeInTheDocument();
      
      // Feature list
      expect(screen.getByText(/Multiple difficulty levels/)).toBeInTheDocument();
      expect(screen.getByText(/Optional timer challenges/)).toBeInTheDocument();
      expect(screen.getByText(/Score tracking and leaderboard/)).toBeInTheDocument();
      expect(screen.getByText(/Responsive design for all devices/)).toBeInTheDocument();
    });

    it('should render game grid when cards are available', () => {
      // Arrange
      const gameStateWithCards = {
        ...mockGameHook,
        gameState: {
          ...mockGameHook.gameState,
          cards: [
            { id: 'card-1', value: '🎮', isFlipped: false, isMatched: false, position: 0 },
            { id: 'card-2', value: '🎯', isFlipped: false, isMatched: false, position: 1 }
          ]
        }
      };
      mockUseMemoryGame.mockReturnValue(gameStateWithCards);

      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      expect(screen.getByText('🎮')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('should show/hide leaderboard on toggle', () => {
      // Act
      render(<MemoryGameApp userId={1} />);

      // Assert - leaderboard hidden by default
      expect(screen.queryByTestId('leaderboard')).not.toBeInTheDocument();
      expect(screen.getByText('🏆 Show Leaderboard')).toBeInTheDocument();

      // Act - show leaderboard
      fireEvent.click(screen.getByText('🏆 Show Leaderboard'));

      // Assert
      expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
      expect(screen.getByText('🎮 Hide Leaderboard')).toBeInTheDocument();
    });
  });

  describe('game status handling', () => {
    it('should render completion message when game is completed', () => {
      // Arrange
      const completedGameState = {
        ...mockGameHook,
        gameStatus: 'completed' as const,
        isGameCompleted: true,
        gameState: {
          ...mockGameHook.gameState,
          score: 85,
          elapsedTime: 120,
          turns: 15
        }
      };
      mockUseMemoryGame.mockReturnValue(completedGameState);

      // Act
      render(<MemoryGameApp userId={1} />);

      // Assert
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument(); // Final Score
      expect(screen.getByText('2:00')).toBeInTheDocument(); // Time Taken (120 seconds = 2:00)
      expect(screen.getByText('15')).toBeInTheDocument(); // Total Turns
      expect(screen.getByText('4×4')).toBeInTheDocument(); // Difficulty
      expect(screen.getByText(/Your score has been saved to the leaderboard/)).toBeInTheDocument();
    });

    it('should render failure message when game failed', () => {
      // Arrange
      const failedGameState = {
        ...mockGameHook,
        gameStatus: 'failed' as const,
        isGameFailed: true,
        gameState: {
          ...mockGameHook.gameState,
          score: 45,
          elapsedTime: 180,
          turns: 20
        }
      };
      mockUseMemoryGame.mockReturnValue(failedGameState);

      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('Game Over')).toBeInTheDocument();
      expect(screen.getByText(/Time's up! Try again/)).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument(); // Final Score
    });

    it('should not show save message when user is not authenticated', () => {
      // Arrange
      const completedGameState = {
        ...mockGameHook,
        gameStatus: 'completed' as const,
        isGameCompleted: true
      };
      mockUseMemoryGame.mockReturnValue(completedGameState);

      // Act
      render(<MemoryGameApp />); // No userId prop

      // Assert
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.queryByText(/Your score has been saved to the leaderboard/)).not.toBeInTheDocument();
    });
  });

  describe('user authentication states', () => {
    it('should pass userId and username to useMemoryGame hook', () => {
      // Act
      render(<MemoryGameApp userId={123} username="testuser" />);

      // Assert
      expect(mockUseMemoryGame).toHaveBeenCalledWith(123, 'testuser');
    });

    it('should show auth prompt when user is not authenticated', () => {
      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('🔐 Login to Save Scores')).toBeInTheDocument();
      expect(screen.getByText(/Login to track your progress, save high scores/)).toBeInTheDocument();
    });

    it('should not show auth prompt when user is authenticated', () => {
      // Act
      render(<MemoryGameApp userId={1} username="testuser" />);

      // Click to hide leaderboard and show sidebar content
      fireEvent.click(screen.getByText('🏆 Show Leaderboard'));
      fireEvent.click(screen.getByText('🎮 Hide Leaderboard'));

      // Assert
      expect(screen.queryByText('🔐 Login to Save Scores')).not.toBeInTheDocument();
    });
  });

  describe('game interactions', () => {
    it('should call startNewGame when start button is clicked', () => {
      // Act
      render(<MemoryGameApp />);
      fireEvent.click(screen.getByText('Start Game'));

      // Assert
      expect(mockGameHook.startNewGame).toHaveBeenCalledWith({ gridSize: 4, hasTimer: false });
    });

    it('should call resetGame when reset button is clicked', () => {
      // Act
      render(<MemoryGameApp />);
      fireEvent.click(screen.getByText('Reset Game'));

      // Assert
      expect(mockGameHook.resetGame).toHaveBeenCalled();
    });

    it('should call pauseGame when pause button is clicked', () => {
      // Act
      render(<MemoryGameApp />);
      fireEvent.click(screen.getByText('Pause Game'));

      // Assert
      expect(mockGameHook.pauseGame).toHaveBeenCalled();
    });

    it('should call resumeGame when resume button is clicked', () => {
      // Act
      render(<MemoryGameApp />);
      fireEvent.click(screen.getByText('Resume Game'));

      // Assert
      expect(mockGameHook.resumeGame).toHaveBeenCalled();
    });

    it('should call flipCard when card is clicked', () => {
      // Arrange
      const gameStateWithCards = {
        ...mockGameHook,
        gameStatus: 'playing' as const,
        gameState: {
          ...mockGameHook.gameState,
          cards: [
            { id: 'card-1', value: '🎮', isFlipped: false, isMatched: false, position: 0 }
          ]
        }
      };
      mockUseMemoryGame.mockReturnValue(gameStateWithCards);

      // Act
      render(<MemoryGameApp />);
      fireEvent.click(screen.getByText('🎮'));

      // Assert
      expect(mockGameHook.flipCard).toHaveBeenCalledWith('card-1');
    });

    it('should disable card interactions when game is not playing', () => {
      // Arrange
      const gameStateWithCards = {
        ...mockGameHook,
        gameStatus: 'paused' as const,
        gameState: {
          ...mockGameHook.gameState,
          cards: [
            { id: 'card-1', value: '🎮', isFlipped: false, isMatched: false, position: 0 }
          ]
        }
      };
      mockUseMemoryGame.mockReturnValue(gameStateWithCards);

      // Act
      render(<MemoryGameApp />);
      const cardButton = screen.getByText('🎮');
      fireEvent.click(cardButton);

      // Assert
      expect(mockGameHook.flipCard).not.toHaveBeenCalled();
      expect(cardButton).toBeDisabled();
    });
  });

  describe('leaderboard refresh', () => {
    it('should trigger leaderboard refresh when game is completed', () => {
      // Arrange
      const { rerender } = render(<MemoryGameApp userId={1} />);
      
      // Show leaderboard first
      fireEvent.click(screen.getByText('🏆 Show Leaderboard'));
      expect(screen.getByText('Leaderboard for user 1')).toBeInTheDocument();

      // Act - complete game
      const completedGameState = {
        ...mockGameHook,
        gameStatus: 'completed' as const,
        isGameCompleted: true
      };
      mockUseMemoryGame.mockReturnValue(completedGameState);

      rerender(<MemoryGameApp userId={1} />);

      // Assert - leaderboard should still be visible and refreshed
      expect(screen.getByText('Leaderboard for user 1')).toBeInTheDocument();
    });
  });

  describe('sidebar content', () => {
    it('should show tips and strategies when leaderboard is hidden', () => {
      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('💡 Tips & Strategies')).toBeInTheDocument();
      expect(screen.getByText(/Start with easier grids/)).toBeInTheDocument();
      expect(screen.getByText(/Focus on remembering card positions/)).toBeInTheDocument();
    });

    it('should show scoring information', () => {
      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('🎯 Scoring System')).toBeInTheDocument();
      expect(screen.getByText(/Time Score.*Up to 50 points/)).toBeInTheDocument();
      expect(screen.getByText(/Turn Score.*Up to 50 points/)).toBeInTheDocument();
      expect(screen.getByText(/Difficulty Bonus.*Up to 20 points/)).toBeInTheDocument();
    });

    it('should hide tips when leaderboard is shown', () => {
      // Act
      render(<MemoryGameApp />);
      fireEvent.click(screen.getByText('🏆 Show Leaderboard'));

      // Assert
      expect(screen.queryByText('💡 Tips & Strategies')).not.toBeInTheDocument();
      expect(screen.queryByText('🎯 Scoring System')).not.toBeInTheDocument();
    });
  });

  describe('time formatting', () => {
    it('should format elapsed time correctly in game results', () => {
      // Arrange
      const completedGameState = {
        ...mockGameHook,
        gameStatus: 'completed' as const,
        isGameCompleted: true,
        gameState: {
          ...mockGameHook.gameState,
          elapsedTime: 125 // 2 minutes and 5 seconds
        }
      };
      mockUseMemoryGame.mockReturnValue(completedGameState);

      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('2:05')).toBeInTheDocument();
    });

    it('should format single digit seconds with leading zero', () => {
      // Arrange
      const completedGameState = {
        ...mockGameHook,
        gameStatus: 'completed' as const,
        isGameCompleted: true,
        gameState: {
          ...mockGameHook.gameState,
          elapsedTime: 65 // 1 minute and 5 seconds
        }
      };
      mockUseMemoryGame.mockReturnValue(completedGameState);

      // Act
      render(<MemoryGameApp />);

      // Assert
      expect(screen.getByText('1:05')).toBeInTheDocument();
    });
  });
});
