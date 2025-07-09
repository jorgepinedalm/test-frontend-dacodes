// Tests for GameControls component
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameControls from '../../components/GameControls';
import { GameConfig, GameStatus } from '../../types/game';

describe('GameControls', () => {
  const defaultProps = {
    gameStatus: 'idle' as GameStatus,
    gameState: {
      turns: 0,
      elapsedTime: 0,
      config: { gridSize: 4, hasTimer: false },
      score: 0
    },
    onStartNewGame: jest.fn(),
    onResetGame: jest.fn(),
    onPauseGame: jest.fn(),
    onResumeGame: jest.fn(),
    remainingTime: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('game stats display', () => {
    it('should display current game statistics', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameState: {
          turns: 15,
          elapsedTime: 120,
          config: { gridSize: 5, hasTimer: true },
          score: 85
        }
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('Hard')).toBeInTheDocument(); // Difficulty
      expect(screen.getByText('5×5')).toBeInTheDocument(); // Grid Size
      expect(screen.getByText('15')).toBeInTheDocument(); // Turns
      expect(screen.getByText('02:00')).toBeInTheDocument(); // Formatted time
      expect(screen.getByText('85')).toBeInTheDocument(); // Score
    });

    it('should display remaining time when timer is active', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameState: {
          ...defaultProps.gameState,
          elapsedTime: 60
        },
        remainingTime: 60
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('01:00 / 01:00')).toBeInTheDocument();
    });

    it('should not display remaining time when timer is not active', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameState: {
          ...defaultProps.gameState,
          elapsedTime: 60
        },
        remainingTime: null
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('01:00')).toBeInTheDocument();
      expect(screen.queryByText('/ 01:00')).not.toBeInTheDocument();
    });

    it('should display correct difficulty levels', () => {
      // Arrange
      const testCases = [
        { gridSize: 3, expected: 'Easy' },
        { gridSize: 4, expected: 'Medium' },
        { gridSize: 5, expected: 'Hard' },
        { gridSize: 6, expected: 'Expert' }
      ];

      testCases.forEach(({ gridSize, expected }) => {
        const props = {
          ...defaultProps,
          gameState: {
            ...defaultProps.gameState,
            config: { gridSize, hasTimer: false }
          }
        };

        // Act
        const { unmount } = render(<GameControls {...props} />);

        // Assert
        expect(screen.getByText(expected)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('button states by game status', () => {
    it('should show settings and start buttons when idle', () => {
      // Act
      render(<GameControls {...defaultProps} />);

      // Assert
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
    });

    it('should show pause and reset buttons when playing', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'playing' as GameStatus
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
      expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
    });

    it('should show resume and reset buttons when paused', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'paused' as GameStatus
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('Resume')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
      expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
    });

    it('should show settings and play again buttons when completed', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'completed' as GameStatus,
        gameState: {
          ...defaultProps.gameState,
          turns: 12,
          score: 95
        }
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
      expect(screen.getByText('Play Again')).toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
    });

    it('should show settings and play again buttons when failed', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'failed' as GameStatus
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
      expect(screen.getByText('Play Again')).toBeInTheDocument();
    });
  });

  describe('game settings panel', () => {
    it('should toggle settings panel visibility', () => {
      // Act
      render(<GameControls {...defaultProps} />);

      // Assert - settings hidden by default
      expect(screen.queryByText('Game Configuration')).not.toBeInTheDocument();

      // Act - show settings
      fireEvent.click(screen.getByText('Game Settings'));

      // Assert
      expect(screen.getByText('Game Configuration')).toBeInTheDocument();
      expect(screen.getByText('Hide Settings')).toBeInTheDocument();

      // Act - hide settings
      fireEvent.click(screen.getByText('Hide Settings'));

      // Assert
      expect(screen.queryByText('Game Configuration')).not.toBeInTheDocument();
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
    });

    it('should display grid size options', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));

      // Assert
      expect(screen.getByDisplayValue('4')).toBeInTheDocument(); // Default grid size
      expect(screen.getByText('3×3 (Easy)')).toBeInTheDocument();
      expect(screen.getByText('4×4 (Medium)')).toBeInTheDocument();
      expect(screen.getByText('5×5 (Hard)')).toBeInTheDocument();
      expect(screen.getByText('6×6 (Expert)')).toBeInTheDocument();
    });

    it('should handle grid size change', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));
      
      const gridSizeSelect = screen.getByDisplayValue('4');
      fireEvent.change(gridSizeSelect, { target: { value: '5' } });

      // Assert
      expect(gridSizeSelect).toHaveValue('5');
    });

    it('should toggle timer setting', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));
      
      const timerCheckbox = screen.getByLabelText('Enable Timer');
      
      // Assert - timer disabled by default
      expect(timerCheckbox).not.toBeChecked();
      expect(screen.queryByText('Time Limit (seconds):')).not.toBeInTheDocument();

      // Act - enable timer
      fireEvent.click(timerCheckbox);

      // Assert
      expect(timerCheckbox).toBeChecked();
      expect(screen.getByText('Time Limit (seconds):')).toBeInTheDocument();
      expect(screen.getByDisplayValue('120')).toBeInTheDocument(); // Default time limit
    });

    it('should handle time limit change when timer is enabled', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));
      
      // Enable timer first
      fireEvent.click(screen.getByLabelText('Enable Timer'));
      
      const timeLimitInput = screen.getByDisplayValue('120');
      fireEvent.change(timeLimitInput, { target: { value: '180' } });

      // Assert
      expect(timeLimitInput).toHaveValue(180);
    });

    it('should display and handle preset configurations', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));

      // Assert
      expect(screen.getByText('Quick Presets:')).toBeInTheDocument();
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();

      // Act - select Easy preset
      fireEvent.click(screen.getByText('Easy'));

      // Assert
      expect(screen.getByDisplayValue('3')).toBeInTheDocument(); // Grid size changed to 3
      expect(screen.getByLabelText('Enable Timer')).not.toBeChecked(); // Timer disabled for easy
    });

    it('should highlight active preset', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));
      
      const mediumButton = screen.getByText('Medium');
      fireEvent.click(mediumButton);

      // Assert
      expect(mediumButton).toHaveClass('active');
    });
  });

  describe('button interactions', () => {
    it('should call onStartNewGame when Start Game is clicked', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Start Game'));

      // Assert
      expect(defaultProps.onStartNewGame).toHaveBeenCalledWith({
        gridSize: 4,
        hasTimer: true,
        timeLimit: 120
      }); // Default medium config
    });

    it('should call onPauseGame when Pause is clicked', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'playing' as GameStatus
      };

      // Act
      render(<GameControls {...props} />);
      fireEvent.click(screen.getByText('Pause'));

      // Assert
      expect(defaultProps.onPauseGame).toHaveBeenCalled();
    });

    it('should call onResumeGame when Resume is clicked', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'paused' as GameStatus
      };

      // Act
      render(<GameControls {...props} />);
      fireEvent.click(screen.getByText('Resume'));

      // Assert
      expect(defaultProps.onResumeGame).toHaveBeenCalled();
    });

    it('should call onResetGame when Reset is clicked', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'playing' as GameStatus
      };

      // Act
      render(<GameControls {...props} />);
      fireEvent.click(screen.getByText('Reset'));

      // Assert
      expect(defaultProps.onResetGame).toHaveBeenCalled();
    });

    it('should start game with custom configuration', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));
      
      // Configure custom settings
      fireEvent.change(screen.getByDisplayValue('4'), { target: { value: '6' } });
      fireEvent.click(screen.getByLabelText('Enable Timer'));
      fireEvent.change(screen.getByDisplayValue('120'), { target: { value: '300' } });
      
      fireEvent.click(screen.getByText('Start Game'));

      // Assert
      expect(defaultProps.onStartNewGame).toHaveBeenCalledWith({
        gridSize: 6,
        hasTimer: true,
        timeLimit: 300
      });
    });

    it('should hide settings when game starts', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));
      
      expect(screen.getByText('Game Configuration')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Start Game'));

      // Assert
      expect(screen.queryByText('Game Configuration')).not.toBeInTheDocument();
    });
  });

  describe('game completion messages', () => {
    it('should show success message when game is completed', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'completed' as GameStatus,
        gameState: {
          ...defaultProps.gameState,
          turns: 12,
          score: 95,
          config: { gridSize: 4, hasTimer: false }
        }
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.getByText(/You completed the Medium level in 12 turns/)).toBeInTheDocument();
      expect(screen.getByText(/Final Score: 95/)).toBeInTheDocument();
    });

    it('should show failure message when game failed', () => {
      // Arrange
      const props = {
        ...defaultProps,
        gameStatus: 'failed' as GameStatus
      };

      // Act
      render(<GameControls {...props} />);

      // Assert
      expect(screen.getByText('Time\'s Up!')).toBeInTheDocument();
      expect(screen.getByText(/Better luck next time/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for form controls', () => {
      // Act
      render(<GameControls {...defaultProps} />);
      fireEvent.click(screen.getByText('Game Settings'));

      // Assert
      expect(screen.getByLabelText('Grid Size:')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable Timer')).toBeInTheDocument();
      
      // Enable timer to show time limit input
      fireEvent.click(screen.getByLabelText('Enable Timer'));
      expect(screen.getByLabelText('Time Limit (seconds):')).toBeInTheDocument();
    });

    it('should have proper button roles and types', () => {
      // Act
      render(<GameControls {...defaultProps} />);

      // Assert
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });
});
