// Tests for GameGrid component
import React from 'react';
import { render, screen } from '@testing-library/react';
import GameGrid from '../../components/GameGrid';
import { Card } from '../../types/game';

// Mock GameCard component
jest.mock('../../components/GameCard', () => {
  return function MockGameCard({ card, onFlip, disabled }: any) {
    return (
      <button
        data-testid={`game-card-${card.id}`}
        onClick={() => !disabled && onFlip(card.id)}
        disabled={disabled}
        className={`mock-game-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
      >
        {card.value}
      </button>
    );
  };
});

describe('GameGrid', () => {
  const mockOnCardFlip = jest.fn();
  
  const defaultCards: Card[] = [
    { id: 'card-1-a', value: '🎮', isFlipped: false, isMatched: false, position: 0 },
    { id: 'card-1-b', value: '🎮', isFlipped: false, isMatched: false, position: 1 },
    { id: 'card-2-a', value: '🎯', isFlipped: true, isMatched: false, position: 2 },
    { id: 'card-2-b', value: '🎯', isFlipped: false, isMatched: true, position: 3 }
  ];

  const defaultProps = {
    cards: defaultCards,
    gridSize: 2,
    onCardFlip: mockOnCardFlip,
    disabled: false,
    isGameComplete: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render game grid with correct structure', () => {
      // Act
      render(<GameGrid {...defaultProps} />);

      // Assert
      const grid = screen.getByRole('grid') || document.querySelector('.game-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('game-grid');
      expect(grid).toHaveClass('game-grid-2');
      expect(grid).not.toHaveClass('game-complete');
    });

    it('should render all cards', () => {
      // Act
      render(<GameGrid {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('game-card-card-1-a')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-card-1-b')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-card-2-a')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-card-2-b')).toBeInTheDocument();
    });

    it('should apply correct CSS grid template for different grid sizes', () => {
      // Test different grid sizes
      const testCases = [
        { gridSize: 3, expected: 'repeat(3, 1fr)' },
        { gridSize: 4, expected: 'repeat(4, 1fr)' },
        { gridSize: 5, expected: 'repeat(5, 1fr)' },
        { gridSize: 6, expected: 'repeat(6, 1fr)' }
      ];

      testCases.forEach(({ gridSize, expected }) => {
        // Act
        const { unmount } = render(
          <GameGrid {...defaultProps} gridSize={gridSize} />
        );

        // Assert
        const grid = document.querySelector('.game-grid');
        expect(grid).toHaveStyle({
          gridTemplateColumns: expected,
          gridTemplateRows: expected
        });
        expect(grid).toHaveClass(`game-grid-${gridSize}`);

        unmount();
      });
    });

    it('should add game-complete class when game is completed', () => {
      // Act
      render(<GameGrid {...defaultProps} isGameComplete={true} />);

      // Assert
      const grid = document.querySelector('.game-grid');
      expect(grid).toHaveClass('game-complete');
    });
  });

  describe('card interactions', () => {
    it('should pass onCardFlip to GameCard components', () => {
      // Act
      render(<GameGrid {...defaultProps} />);

      const card = screen.getByTestId('game-card-card-1-a');
      card.click();

      // Assert
      expect(mockOnCardFlip).toHaveBeenCalledWith('card-1-a');
    });

    it('should pass disabled state to all cards', () => {
      // Act
      render(<GameGrid {...defaultProps} disabled={true} />);

      // Assert
      const cards = screen.getAllByRole('button');
      cards.forEach(card => {
        expect(card).toBeDisabled();
      });
    });

    it('should not disable cards when disabled is false', () => {
      // Act
      render(<GameGrid {...defaultProps} disabled={false} />);

      // Assert
      const cards = screen.getAllByRole('button');
      cards.forEach(card => {
        expect(card).not.toBeDisabled();
      });
    });
  });

  describe('card states', () => {
    it('should render cards with correct states', () => {
      // Act
      render(<GameGrid {...defaultProps} />);

      // Assert
      const flippedCard = screen.getByTestId('game-card-card-2-a');
      expect(flippedCard).toHaveClass('flipped');

      const matchedCard = screen.getByTestId('game-card-card-2-b');
      expect(matchedCard).toHaveClass('matched');

      const normalCard = screen.getByTestId('game-card-card-1-a');
      expect(normalCard).not.toHaveClass('flipped');
      expect(normalCard).not.toHaveClass('matched');
    });

    it('should display card values correctly', () => {
      // Act
      render(<GameGrid {...defaultProps} />);

      // Assert
      expect(screen.getAllByText('🎮')).toHaveLength(2);
      expect(screen.getAllByText('🎯')).toHaveLength(2);
    });
  });

  describe('empty grid', () => {
    it('should render empty grid when no cards provided', () => {
      // Act
      render(<GameGrid {...defaultProps} cards={[]} />);

      // Assert
      const grid = document.querySelector('.game-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('game-grid');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('large grids', () => {
    it('should handle large number of cards efficiently', () => {
      // Arrange
      const largeCardSet: Card[] = [];
      for (let i = 0; i < 36; i++) { // 6x6 grid
        largeCardSet.push({
          id: `card-${i}`,
          value: `${i % 18}`, // 18 unique values, each appearing twice
          isFlipped: false,
          isMatched: false,
          position: i
        });
      }

      // Act
      render(<GameGrid {...defaultProps} cards={largeCardSet} gridSize={6} />);

      // Assert
      expect(screen.getAllByRole('button')).toHaveLength(36);
      const grid = document.querySelector('.game-grid');
      expect(grid).toHaveClass('game-grid-6');
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)'
      });
    });
  });

  describe('card ordering', () => {
    it('should render cards in position order', () => {
      // Arrange
      const shuffledCards: Card[] = [
        { id: 'card-3', value: '🎲', isFlipped: false, isMatched: false, position: 3 },
        { id: 'card-1', value: '🎮', isFlipped: false, isMatched: false, position: 1 },
        { id: 'card-0', value: '🎯', isFlipped: false, isMatched: false, position: 0 },
        { id: 'card-2', value: '🎨', isFlipped: false, isMatched: false, position: 2 }
      ];

      // Act
      render(<GameGrid {...defaultProps} cards={shuffledCards} />);

      // Assert
      const cards = screen.getAllByRole('button');
      expect(cards[0]).toHaveAttribute('data-testid', 'game-card-card-3');
      expect(cards[1]).toHaveAttribute('data-testid', 'game-card-card-1');
      expect(cards[2]).toHaveAttribute('data-testid', 'game-card-card-0');
      expect(cards[3]).toHaveAttribute('data-testid', 'game-card-card-2');
    });
  });

  describe('responsive behavior', () => {
    it('should maintain grid structure with different aspect ratios', () => {
      // Test rectangular grids (not common but should work)
      const rectangularCards: Card[] = [
        { id: 'card-1', value: '🎮', isFlipped: false, isMatched: false, position: 0 },
        { id: 'card-2', value: '🎯', isFlipped: false, isMatched: false, position: 1 }
      ];

      // Act
      render(<GameGrid {...defaultProps} cards={rectangularCards} gridSize={3} />);

      // Assert
      const grid = document.querySelector('.game-grid');
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)'
      });
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('should maintain proper semantic structure', () => {
      // Act
      render(<GameGrid {...defaultProps} />);

      // Assert
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('data-testid');
      });
    });

    it('should support keyboard navigation through cards', () => {
      // Act
      render(<GameGrid {...defaultProps} />);

      // Assert
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('performance considerations', () => {
    it('should render quickly with many cards', () => {
      // Arrange
      const startTime = performance.now();
      const manyCards: Card[] = Array.from({ length: 64 }, (_, i) => ({
        id: `card-${i}`,
        value: `emoji-${i % 32}`,
        isFlipped: false,
        isMatched: false,
        position: i
      }));

      // Act
      render(<GameGrid {...defaultProps} cards={manyCards} gridSize={8} />);
      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
      expect(screen.getAllByRole('button')).toHaveLength(64);
    });
  });
});
