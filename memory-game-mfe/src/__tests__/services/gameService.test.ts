// Tests for GameService
import GameService from '../../services/gameService';
import { GameSession } from '../../types/game';

describe('GameService', () => {
  let gameService: GameService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Reset singleton instance
    (GameService as any).instance = undefined;
    gameService = GameService.getInstance();

    // Mock localStorage
    mockLocalStorage = {};
    Storage.prototype.getItem = jest.fn((key: string) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    Storage.prototype.removeItem = jest.fn((key: string) => {
      delete mockLocalStorage[key];
    });
    Storage.prototype.clear = jest.fn(() => {
      mockLocalStorage = {};
    });

    // Mock Date.now for consistent session IDs
    jest.spyOn(Date, 'now').mockReturnValue(1234567890000);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      // Act
      const instance1 = GameService.getInstance();
      const instance2 = GameService.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(GameService);
    });
  });

  describe('saveGameSession', () => {
    it('should save game session and return it', async () => {
      // Arrange
      const userId = 1;
      const username = 'testuser';
      const gridSize = 4;
      const turns = 10;
      const timeElapsed = 60;

      // Act
      const result = await gameService.saveGameSession(userId, username, gridSize, turns, timeElapsed);

      // Assert
      expect(result).toMatchObject({
        userId,
        username,
        gridSize,
        turns,
        timeElapsed,
        score: expect.any(Number)
      });
      expect(result.id).toMatch(/^game-/);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should save session to localStorage', async () => {
      // Arrange
      const userId = 1;
      const username = 'testuser';
      const gridSize = 4;
      const turns = 10;
      const timeElapsed = 60;

      // Act
      await gameService.saveGameSession(userId, username, gridSize, turns, timeElapsed);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'memory_game_sessions',
        expect.any(String)
      );

      const savedData = JSON.parse(mockLocalStorage['memory_game_sessions']);
      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toMatchObject({
        userId,
        username,
        gridSize,
        turns,
        timeElapsed
      });
    });

    it('should append to existing sessions', async () => {
      // Arrange
      const existingSessions = [{
        id: 'existing-session',
        userId: 2,
        username: 'otheruser',
        gridSize: 3,
        turns: 8,
        timeElapsed: 45,
        score: 75,
        completedAt: new Date().toISOString()
      }];
      mockLocalStorage['memory_game_sessions'] = JSON.stringify(existingSessions);

      // Act
      await gameService.saveGameSession(1, 'testuser', 4, 10, 60);

      // Assert
      const savedData = JSON.parse(mockLocalStorage['memory_game_sessions']);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].username).toBe('otheruser');
      expect(savedData[1].username).toBe('testuser');
    });
  });

  describe('getGameSessions', () => {
    it('should return empty array when no sessions exist', () => {
      // Act
      const sessions = gameService.getGameSessions();

      // Assert
      expect(sessions).toEqual([]);
    });

    it('should return stored sessions with parsed dates', () => {
      // Arrange
      const mockSessions = [{
        id: 'session-1',
        userId: 1,
        username: 'testuser',
        gridSize: 4,
        turns: 10,
        timeElapsed: 60,
        score: 80,
        completedAt: '2023-01-01T00:00:00.000Z'
      }];
      mockLocalStorage['memory_game_sessions'] = JSON.stringify(mockSessions);

      // Act
      const sessions = gameService.getGameSessions();

      // Assert
      expect(sessions).toHaveLength(1);
      expect(sessions[0].completedAt).toBeInstanceOf(Date);
      expect(sessions[0].username).toBe('testuser');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Arrange
      mockLocalStorage['memory_game_sessions'] = 'invalid json';

      // Act
      const sessions = gameService.getGameSessions();

      // Assert
      expect(sessions).toEqual([]);
    });
  });

  describe('getUserSessions', () => {
    it('should return sessions for specific user only', () => {
      // Arrange
      const mockSessions = [
        {
          id: 'session-1',
          userId: 1,
          username: 'user1',
          gridSize: 4,
          turns: 10,
          timeElapsed: 60,
          score: 80,
          completedAt: new Date().toISOString()
        },
        {
          id: 'session-2',
          userId: 2,
          username: 'user2',
          gridSize: 3,
          turns: 8,
          timeElapsed: 45,
          score: 75,
          completedAt: new Date().toISOString()
        },
        {
          id: 'session-3',
          userId: 1,
          username: 'user1',
          gridSize: 5,
          turns: 15,
          timeElapsed: 90,
          score: 70,
          completedAt: new Date().toISOString()
        }
      ];
      mockLocalStorage['memory_game_sessions'] = JSON.stringify(mockSessions);

      // Act
      const userSessions = gameService.getUserSessions(1);

      // Assert
      expect(userSessions).toHaveLength(2);
      expect(userSessions.every(session => session.userId === 1)).toBe(true);
      expect(userSessions[0].gridSize).toBe(4);
      expect(userSessions[1].gridSize).toBe(5);
    });

    it('should return empty array for user with no sessions', () => {
      // Arrange
      const mockSessions = [{
        id: 'session-1',
        userId: 1,
        username: 'user1',
        gridSize: 4,
        turns: 10,
        timeElapsed: 60,
        score: 80,
        completedAt: new Date().toISOString()
      }];
      mockLocalStorage['memory_game_sessions'] = JSON.stringify(mockSessions);

      // Act
      const userSessions = gameService.getUserSessions(999);

      // Assert
      expect(userSessions).toEqual([]);
    });
  });

  describe('getSessionsByGridSize', () => {
    it('should return sessions for specific grid size only', () => {
      // Arrange
      const mockSessions = [
        {
          id: 'session-1',
          userId: 1,
          username: 'user1',
          gridSize: 4,
          turns: 10,
          timeElapsed: 60,
          score: 80,
          completedAt: new Date().toISOString()
        },
        {
          id: 'session-2',
          userId: 2,
          username: 'user2',
          gridSize: 3,
          turns: 8,
          timeElapsed: 45,
          score: 75,
          completedAt: new Date().toISOString()
        },
        {
          id: 'session-3',
          userId: 1,
          username: 'user1',
          gridSize: 4,
          turns: 12,
          timeElapsed: 70,
          score: 85,
          completedAt: new Date().toISOString()
        }
      ];
      mockLocalStorage['memory_game_sessions'] = JSON.stringify(mockSessions);

      // Act
      const gridSessions = gameService.getSessionsByGridSize(4);

      // Assert
      expect(gridSessions).toHaveLength(2);
      expect(gridSessions.every(session => session.gridSize === 4)).toBe(true);
    });
  });

  describe('getLeaderboard', () => {
    it('should return empty array when no leaderboard exists', () => {
      // Act
      const leaderboard = gameService.getLeaderboard();

      // Assert
      expect(leaderboard).toEqual([]);
    });

    it('should return stored leaderboard data', () => {
      // Arrange
      const mockLeaderboard = [{
        userId: 1,
        username: 'testuser',
        gridSize: 4,
        bestTime: 60,
        bestTurns: 10,
        bestScore: 80,
        gamesPlayed: 5
      }];
      mockLocalStorage['memory_game_leaderboard'] = JSON.stringify(mockLeaderboard);

      // Act
      const leaderboard = gameService.getLeaderboard();

      // Assert
      expect(leaderboard).toEqual(mockLeaderboard);
    });

    it('should handle corrupted leaderboard data gracefully', () => {
      // Arrange
      mockLocalStorage['memory_game_leaderboard'] = 'invalid json';

      // Act
      const leaderboard = gameService.getLeaderboard();

      // Assert
      expect(leaderboard).toEqual([]);
    });
  });
  describe('getLeaderboard with gridSize filter', () => {
    it('should return leaderboard filtered by grid size', () => {
      // Arrange
      const mockLeaderboard = [
        {
          userId: 1,
          username: 'user1',
          gridSize: 4,
          bestTime: 60,
          bestTurns: 10,
          bestScore: 80,
          gamesPlayed: 5,
          rank: 1
        },
        {
          userId: 2,
          username: 'user2',
          gridSize: 3,
          bestTime: 45,
          bestTurns: 8,
          bestScore: 75,
          gamesPlayed: 3,
          rank: 1
        },
        {
          userId: 3,
          username: 'user3',
          gridSize: 4,
          bestTime: 55,
          bestTurns: 9,
          bestScore: 85,
          gamesPlayed: 7,
          rank: 2
        }
      ];
      mockLocalStorage['memory_game_leaderboard'] = JSON.stringify(mockLeaderboard);

      // Act
      const filteredLeaderboard = gameService.getLeaderboard(4);

      // Assert
      expect(filteredLeaderboard).toHaveLength(2);
      expect(filteredLeaderboard.every(entry => entry.gridSize === 4)).toBe(true);
    });
  });

  describe('clearAllData', () => {
    it('should clear all stored game data', () => {
      // Arrange
      mockLocalStorage['memory_game_sessions'] = JSON.stringify([{ id: 'test' }]);
      mockLocalStorage['memory_game_leaderboard'] = JSON.stringify([{ userId: 1 }]);

      // Act
      gameService.clearAllData();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('memory_game_sessions');
      expect(localStorage.removeItem).toHaveBeenCalledWith('memory_game_leaderboard');
    });
  });

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', () => {
      // Arrange
      const mockSessions = [
        {
          id: 'session-1',
          userId: 1,
          username: 'user1',
          gridSize: 4,
          turns: 10,
          timeElapsed: 60,
          score: 80,
          completedAt: new Date().toISOString()
        },
        {
          id: 'session-2',
          userId: 1,
          username: 'user1',
          gridSize: 4,
          turns: 8,
          timeElapsed: 45,
          score: 90,
          completedAt: new Date().toISOString()
        }
      ];
      mockLocalStorage['memory_game_sessions'] = JSON.stringify(mockSessions);

      // Act
      const stats = gameService.getUserStats(1);

      // Assert
      expect(stats.totalGames).toBe(2);
      expect(stats.averageTime).toBe(53); // (60 + 45) / 2 = 52.5, rounded to 53
      expect(stats.averageTurns).toBe(9); // (10 + 8) / 2 = 9
      expect(stats.bestTime).toBe(45);
      expect(stats.bestTurns).toBe(8);
      expect(stats.winRate).toBe(90);
    });

    it('should return default stats for user with no sessions', () => {
      // Act
      const stats = gameService.getUserStats(999);

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
  });
});
