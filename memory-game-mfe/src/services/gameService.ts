import { GameSession, LeaderboardEntry, GameStats } from '../types/game';
import { calculateScore, generateSessionId } from '../utils/gameUtils';

class GameService {
  private static instance: GameService;
  private readonly STORAGE_KEY = 'memory_game_sessions';
  private readonly LEADERBOARD_KEY = 'memory_game_leaderboard';

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  /**
   * Save a completed game session
   */
  async saveGameSession(
    userId: number,
    username: string,
    gridSize: number,
    turns: number,
    timeElapsed: number
  ): Promise<GameSession> {
    const score = calculateScore(timeElapsed, turns, gridSize);
    
    const session: GameSession = {
      id: generateSessionId(),
      userId,
      username,
      gridSize,
      turns,
      timeElapsed,
      completedAt: new Date(),
      score
    };

    // Save to localStorage
    const sessions = this.getGameSessions();
    sessions.push(session);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));

    // Update leaderboard
    await this.updateLeaderboard(session);

    return session;
  }

  /**
   * Get all game sessions
   */
  getGameSessions(): GameSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((session: any) => ({
        ...session,
        completedAt: new Date(session.completedAt)
      }));
    } catch (error) {
      console.error('Error loading game sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions for a specific user
   */
  getUserSessions(userId: number): GameSession[] {
    return this.getGameSessions().filter(session => session.userId === userId);
  }

  /**
   * Get sessions for a specific grid size
   */
  getSessionsByGridSize(gridSize: number): GameSession[] {
    return this.getGameSessions().filter(session => session.gridSize === gridSize);
  }

  /**
   * Update leaderboard with new session
   */
  private async updateLeaderboard(session: GameSession): Promise<void> {
    const leaderboard = this.getLeaderboard();
    const existingEntry = leaderboard.find(entry => 
      entry.userId === session.userId && entry.gridSize === session.gridSize
    );

    if (existingEntry) {
      // Update existing entry
      existingEntry.gamesPlayed++;
      
      if (session.timeElapsed < existingEntry.bestTime) {
        existingEntry.bestTime = session.timeElapsed;
      }
      
      if (session.turns < existingEntry.bestTurns) {
        existingEntry.bestTurns = session.turns;
      }
      
      if (session.score > existingEntry.bestScore) {
        existingEntry.bestScore = session.score;
      }
    } else {
      // Create new entry
      const newEntry: LeaderboardEntry = {
        rank: 0, // Will be calculated when sorting
        userId: session.userId,
        username: session.username,
        bestTime: session.timeElapsed,
        bestTurns: session.turns,
        bestScore: session.score,
        gamesPlayed: 1,
        gridSize: session.gridSize
      };
      
      leaderboard.push(newEntry);
    }

    // Sort and assign ranks
    this.sortAndRankLeaderboard(leaderboard);
    
    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(gridSize?: number): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(this.LEADERBOARD_KEY);
      if (!stored) return [];
      
      let leaderboard: LeaderboardEntry[] = JSON.parse(stored);
      
      if (gridSize) {
        leaderboard = leaderboard.filter(entry => entry.gridSize === gridSize);
      }
      
      return this.sortAndRankLeaderboard(leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      return [];
    }
  }

  /**
   * Get top N players from leaderboard
   */
  getTopPlayers(limit: number = 10, gridSize?: number): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard(gridSize);
    return leaderboard.slice(0, limit);
  }

  /**
   * Sort leaderboard and assign ranks
   */
  private sortAndRankLeaderboard(leaderboard: LeaderboardEntry[]): LeaderboardEntry[] {
    // Sort by score (descending), then by time (ascending), then by turns (ascending)
    leaderboard.sort((a, b) => {
      if (a.bestScore !== b.bestScore) {
        return b.bestScore - a.bestScore; // Higher score first
      }
      if (a.bestTime !== b.bestTime) {
        return a.bestTime - b.bestTime; // Lower time first
      }
      return a.bestTurns - b.bestTurns; // Lower turns first
    });

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }

  /**
   * Get game statistics for a user
   */
  getUserStats(userId: number, gridSize?: number): GameStats {
    let sessions = this.getUserSessions(userId);
    
    if (gridSize) {
      sessions = sessions.filter(session => session.gridSize === gridSize);
    }

    if (sessions.length === 0) {
      return {
        totalGames: 0,
        totalTime: 0,
        averageTime: 0,
        bestTime: 0,
        totalTurns: 0,
        averageTurns: 0,
        bestTurns: 0,
        winRate: 0
      };
    }

    const totalTime = sessions.reduce((sum, session) => sum + session.timeElapsed, 0);
    const totalTurns = sessions.reduce((sum, session) => sum + session.turns, 0);
    const bestTime = Math.min(...sessions.map(s => s.timeElapsed));
    const bestTurns = Math.min(...sessions.map(s => s.turns));

    return {
      totalGames: sessions.length,
      totalTime,
      averageTime: Math.round(totalTime / sessions.length),
      bestTime,
      totalTurns,
      averageTurns: Math.round(totalTurns / sessions.length),
      bestTurns,
      winRate: 100 // All completed games are wins in memory game
    };
  }

  /**
   * Clear all game data (for testing/reset)
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LEADERBOARD_KEY);
  }

  /**
   * Export game data
   */
  exportGameData(): { sessions: GameSession[]; leaderboard: LeaderboardEntry[] } {
    return {
      sessions: this.getGameSessions(),
      leaderboard: this.getLeaderboard()
    };
  }

  /**
   * Import game data
   */
  importGameData(data: { sessions: GameSession[]; leaderboard: LeaderboardEntry[] }): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.sessions));
    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(data.leaderboard));
  }
}

export default GameService;
