export interface Card {
  id: string;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
}

export interface GameConfig {
  gridSize: number; // NxN grid (3, 4, 5, etc.)
  hasTimer: boolean;
  timeLimit?: number; // in seconds
}

export interface GameState {
  cards: Card[];
  flippedCards: Card[];
  matchedPairs: number;
  totalPairs: number;
  turns: number;
  isGameActive: boolean;
  isGameComplete: boolean;
  startTime?: number;
  endTime?: number;
  elapsedTime: number;
  config: GameConfig;
}

export interface GameSession {
  id: string;
  userId: number;
  username: string;
  gridSize: number;
  turns: number;
  timeElapsed: number; // in seconds
  completedAt: Date;
  score: number; // calculated based on turns and time
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  bestTime: number;
  bestTurns: number;
  bestScore: number;
  gamesPlayed: number;
  gridSize: number;
}

export interface GameStats {
  totalGames: number;
  totalTime: number;
  averageTime: number;
  bestTime: number;
  totalTurns: number;
  averageTurns: number;
  bestTurns: number;
  winRate: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

export interface MemoryGameContextType {
  gameState: GameState;
  gameStatus: GameStatus;
  flipCard: (cardId: string) => void;
  resetGame: () => void;
  startNewGame: (config: GameConfig) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  saveGameSession: () => Promise<void>;
}
