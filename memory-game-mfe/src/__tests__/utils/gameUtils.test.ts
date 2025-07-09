// Tests for gameUtils.ts
import {
  generateCardSymbols,
  generateCards,
  shuffleArray,
  calculateScore,
  formatTime,
  formatGameStats,
  cardsMatch,
  getGridTemplate,
  generateSessionId,
  isValidGridSize,
  getDifficultyLevel,
  DEFAULT_CONFIGS
} from '../../utils/gameUtils';
import { GameConfig, Card, GameSession } from '../../types/game';

describe('gameUtils', () => {
  beforeEach(() => {
    // Mock Math.random to return predictable values
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateCardSymbols', () => {
    it('should generate correct number of unique symbols', () => {
      // Arrange
      const pairCount = 5;

      // Act
      const symbols = generateCardSymbols(pairCount);

      // Assert
      expect(symbols).toHaveLength(pairCount);
      expect(new Set(symbols).size).toBe(pairCount); // All symbols should be unique
    });

    it('should return first N emojis from predefined list', () => {
      // Arrange
      const pairCount = 3;
      const expectedSymbols = ['🎮', '🎯', '🎲'];

      // Act
      const symbols = generateCardSymbols(pairCount);

      // Assert
      expect(symbols).toEqual(expectedSymbols);
    });

    it('should throw error when requesting too many symbols', () => {
      // Arrange
      const pairCount = 100; // More than available emojis

      // Act & Assert
      expect(() => generateCardSymbols(pairCount)).toThrow('Not enough unique symbols for 100 pairs');
    });
  });

  describe('generateCards', () => {
    it('should generate cards for valid grid configuration', () => {
      // Arrange
      const config: GameConfig = { gridSize: 4, hasTimer: false };
      const expectedTotalCards = 16;
      const expectedPairs = 8;

      // Act
      const cards = generateCards(config);

      // Assert
      expect(cards).toHaveLength(expectedTotalCards);
      
      // Check that cards come in pairs
      const nonEmptyCards = cards.filter(card => card.value !== '');
      expect(nonEmptyCards).toHaveLength(expectedPairs * 2);
      
      // Verify each symbol appears exactly twice
      const symbolCounts = nonEmptyCards.reduce((acc, card) => {
        acc[card.value] = (acc[card.value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.values(symbolCounts).forEach(count => {
        expect(count).toBe(2);
      });
    });

    it('should handle odd grid sizes by adding empty cards', () => {
      // Arrange
      const config: GameConfig = { gridSize: 3, hasTimer: false };
      const expectedTotalCards = 9;

      // Act
      const cards = generateCards(config);

      // Assert
      expect(cards).toHaveLength(expectedTotalCards);
      
      const emptyCards = cards.filter(card => card.value === '');
      expect(emptyCards.length).toBeGreaterThan(0);
      
      // Empty cards should be marked as matched
      emptyCards.forEach(card => {
        expect(card.isMatched).toBe(true);
      });
    });

    it('should throw error for grid size too small', () => {
      // Arrange
      const config: GameConfig = { gridSize: 1, hasTimer: false };

      // Act & Assert
      expect(() => generateCards(config)).toThrow('Grid size too small to create pairs');
    });

    it('should set correct initial card properties', () => {
      // Arrange
      const config: GameConfig = { gridSize: 3, hasTimer: false };

      // Act
      const cards = generateCards(config);

      // Assert
      cards.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('value');
        expect(card.isFlipped).toBe(false);
        expect(typeof card.position).toBe('number');
        expect(card.position).toBeGreaterThanOrEqual(0);
        expect(card.position).toBeLessThan(cards.length);
      });
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      // Arrange
      const array = [1, 2, 3, 4, 5];

      // Act
      const shuffled = shuffleArray(array);

      // Assert
      expect(shuffled).toHaveLength(array.length);
    });

    it('should not modify original array', () => {
      // Arrange
      const array = [1, 2, 3, 4, 5];
      const originalArray = [...array];

      // Act
      shuffleArray(array);

      // Assert
      expect(array).toEqual(originalArray);
    });

    it('should contain all original elements', () => {
      // Arrange
      const array = [1, 2, 3, 4, 5];

      // Act
      const shuffled = shuffleArray(array);

      // Assert
      expect(shuffled.sort()).toEqual(array.sort());
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly for optimal performance', () => {
      // Arrange
      const timeElapsed = 10;
      const turns = 8;
      const gridSize = 4;

      // Act
      const score = calculateScore(timeElapsed, turns, gridSize);

      // Assert
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    it('should give higher score for faster completion', () => {
      // Arrange
      const fastTime = 10;
      const slowTime = 60;
      const turns = 8;
      const gridSize = 4;

      // Act
      const fastScore = calculateScore(fastTime, turns, gridSize);
      const slowScore = calculateScore(slowTime, turns, gridSize);

      // Assert
      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should give higher score for fewer turns', () => {
      // Arrange
      const timeElapsed = 30;
      const fewTurns = 8;
      const manyTurns = 20;
      const gridSize = 4;

      // Act
      const fewTurnsScore = calculateScore(timeElapsed, fewTurns, gridSize);
      const manyTurnsScore = calculateScore(timeElapsed, manyTurns, gridSize);

      // Assert
      expect(fewTurnsScore).toBeGreaterThan(manyTurnsScore);
    });

    it('should give bonus for larger grids', () => {
      // Arrange
      const timeElapsed = 30;
      const turns = 10;
      const smallGrid = 3;
      const largeGrid = 5;

      // Act
      const smallGridScore = calculateScore(timeElapsed, turns, smallGrid);
      const largeGridScore = calculateScore(timeElapsed, turns, largeGrid);

      // Assert
      expect(largeGridScore).toBeGreaterThan(smallGridScore);
    });

    it('should return rounded integer', () => {
      // Arrange
      const timeElapsed = 15;
      const turns = 10;
      const gridSize = 4;

      // Act
      const score = calculateScore(timeElapsed, turns, gridSize);

      // Assert
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly for minutes and seconds', () => {
      // Arrange & Act & Assert
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should pad single digits with zero', () => {
      // Arrange & Act & Assert
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(65)).toBe('01:05');
    });
  });

  describe('formatGameStats', () => {
    it('should return default stats for empty sessions array', () => {
      // Arrange
      const sessions: GameSession[] = [];

      // Act
      const stats = formatGameStats(sessions);

      // Assert
      expect(stats).toEqual({
        totalGames: 0,
        avgTime: 0,
        avgTurns: 0,
        bestTime: 0,
        bestTurns: 0,
        bestScore: 0
      });
    });

    it('should calculate stats correctly for multiple sessions', () => {
      // Arrange
      const sessions: GameSession[] = [
        {
          id: '1',
          userId: 1,
          username: 'user1',
          gridSize: 4,
          turns: 10,
          timeElapsed: 60,
          score: 80,
          completedAt: new Date()
        },
        {
          id: '2',
          userId: 1,
          username: 'user1',
          gridSize: 4,
          turns: 8,
          timeElapsed: 45,
          score: 90,
          completedAt: new Date()
        }
      ];

      // Act
      const stats = formatGameStats(sessions);

      // Assert
      expect(stats.totalGames).toBe(2);
      expect(stats.avgTime).toBe(53); // (60 + 45) / 2 = 52.5, rounded to 53
      expect(stats.avgTurns).toBe(9); // (10 + 8) / 2 = 9
      expect(stats.bestTime).toBe(45);
      expect(stats.bestTurns).toBe(8);
      expect(stats.bestScore).toBe(90);
    });
  });

  describe('cardsMatch', () => {
    it('should return true for cards with same value but different ids', () => {
      // Arrange
      const card1: Card = {
        id: 'card-1-a',
        value: '🎮',
        isFlipped: true,
        isMatched: false,
        position: 0
      };
      const card2: Card = {
        id: 'card-1-b',
        value: '🎮',
        isFlipped: true,
        isMatched: false,
        position: 1
      };

      // Act
      const result = cardsMatch(card1, card2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for cards with different values', () => {
      // Arrange
      const card1: Card = {
        id: 'card-1-a',
        value: '🎮',
        isFlipped: true,
        isMatched: false,
        position: 0
      };
      const card2: Card = {
        id: 'card-2-a',
        value: '🎯',
        isFlipped: true,
        isMatched: false,
        position: 1
      };

      // Act
      const result = cardsMatch(card1, card2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for same card (same id)', () => {
      // Arrange
      const card: Card = {
        id: 'card-1-a',
        value: '🎮',
        isFlipped: true,
        isMatched: false,
        position: 0
      };

      // Act
      const result = cardsMatch(card, card);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty cards', () => {
      // Arrange
      const card1: Card = {
        id: 'empty-1',
        value: '',
        isFlipped: false,
        isMatched: true,
        position: 0
      };
      const card2: Card = {
        id: 'empty-2',
        value: '',
        isFlipped: false,
        isMatched: true,
        position: 1
      };

      // Act
      const result = cardsMatch(card1, card2);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getGridTemplate', () => {
    it('should return correct CSS grid template', () => {
      // Arrange & Act & Assert
      expect(getGridTemplate(3)).toBe('repeat(3, 1fr)');
      expect(getGridTemplate(4)).toBe('repeat(4, 1fr)');
      expect(getGridTemplate(6)).toBe('repeat(6, 1fr)');
    });
  });

  describe('generateSessionId', () => {
    it('should generate unique session ids', () => {
      // Act
      const id1 = generateSessionId();
      const id2 = generateSessionId();

      // Assert
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^game-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^game-\d+-[a-z0-9]+$/);
    });

    it('should start with "game-" prefix', () => {
      // Act
      const id = generateSessionId();

      // Assert
      expect(id).toMatch(/^game-/);
    });
  });

  describe('isValidGridSize', () => {
    it('should return true for valid grid sizes', () => {
      // Arrange & Act & Assert
      expect(isValidGridSize(2)).toBe(true);
      expect(isValidGridSize(3)).toBe(true);
      expect(isValidGridSize(4)).toBe(true);
      expect(isValidGridSize(6)).toBe(true);
      expect(isValidGridSize(8)).toBe(true);
    });

    it('should return false for invalid grid sizes', () => {
      // Arrange & Act & Assert
      expect(isValidGridSize(1)).toBe(false);
      expect(isValidGridSize(9)).toBe(false);
      expect(isValidGridSize(0)).toBe(false);
      expect(isValidGridSize(-1)).toBe(false);
    });
  });

  describe('getDifficultyLevel', () => {
    it('should return correct difficulty levels', () => {
      // Arrange & Act & Assert
      expect(getDifficultyLevel(2)).toBe('Easy');
      expect(getDifficultyLevel(3)).toBe('Easy');
      expect(getDifficultyLevel(4)).toBe('Medium');
      expect(getDifficultyLevel(5)).toBe('Hard');
      expect(getDifficultyLevel(6)).toBe('Expert');
      expect(getDifficultyLevel(8)).toBe('Expert');
    });
  });

  describe('DEFAULT_CONFIGS', () => {
    it('should have correct default configurations', () => {
      // Assert
      expect(DEFAULT_CONFIGS.easy).toEqual({
        gridSize: 3,
        hasTimer: false
      });
      expect(DEFAULT_CONFIGS.medium).toEqual({
        gridSize: 4,
        hasTimer: true,
        timeLimit: 120
      });
      expect(DEFAULT_CONFIGS.hard).toEqual({
        gridSize: 5,
        hasTimer: true,
        timeLimit: 180
      });
      expect(DEFAULT_CONFIGS.expert).toEqual({
        gridSize: 6,
        hasTimer: true,
        timeLimit: 240
      });
    });

    it('should have increasing difficulty', () => {
      // Assert
      expect(DEFAULT_CONFIGS.easy.gridSize).toBeLessThan(DEFAULT_CONFIGS.medium.gridSize);
      expect(DEFAULT_CONFIGS.medium.gridSize).toBeLessThan(DEFAULT_CONFIGS.hard.gridSize);
      expect(DEFAULT_CONFIGS.hard.gridSize).toBeLessThan(DEFAULT_CONFIGS.expert.gridSize);
    });
  });
});
