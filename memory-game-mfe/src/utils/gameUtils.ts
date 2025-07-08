import { Card, GameConfig, GameSession } from '../types/game';

/**
 * Generate card symbols for the memory game
 */
export const generateCardSymbols = (pairCount: number): string[] => {
  const emojis = [
    '🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🎨', '🎧',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸',
    '🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🥭',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🌟', '⭐', '✨', '🌙', '☀️', '🌈', '🔥', '💎',
    '🎈', '🎁', '🎉', '🎊', '🎆', '🎇', '🎀', '🎗️',
    '🚀', '✈️', '🚁', '🚂', '🚗', '🚕', '🚙', '🚌',
    '📱', '💻', '⌚', '📷', '🎥', '📺', '📻', '⏰'
  ];

  // Ensure we have enough unique emojis
  if (pairCount > emojis.length) {
    throw new Error(`Not enough unique symbols for ${pairCount} pairs`);
  }

  // Return first N emojis for the pairs
  return emojis.slice(0, pairCount);
};

/**
 * Generate cards for the memory game
 */
export const generateCards = (config: GameConfig): Card[] => {
  const totalCards = config.gridSize * config.gridSize;
  const pairCount = Math.floor(totalCards / 2);
  
  // For odd number of cards, we'll use one less card to make pairs
  const cardsToUse = pairCount * 2;
  
  if (pairCount === 0) {
    throw new Error('Grid size too small to create pairs');
  }

  const symbols = generateCardSymbols(pairCount);
  const cards: Card[] = [];

  // Create pairs of cards
  symbols.forEach((symbol, index) => {
    // First card of the pair
    cards.push({
      id: `card-${index}-a`,
      value: symbol,
      isFlipped: false,
      isMatched: false,
      position: index * 2
    });

    // Second card of the pair
    cards.push({
      id: `card-${index}-b`,
      value: symbol,
      isFlipped: false,
      isMatched: false,
      position: index * 2 + 1
    });
  });

  // Add empty cards if we need to fill the grid (for odd-sized grids)
  while (cards.length < totalCards) {
    cards.push({
      id: `empty-${cards.length}`,
      value: '',
      isFlipped: false,
      isMatched: true, // Empty cards are always "matched" (disabled)
      position: cards.length
    });
  }

  // Shuffle the cards
  return shuffleArray(cards).map((card, index) => ({
    ...card,
    position: index
  }));
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calculate game score based on time and turns
 */
export const calculateScore = (
  timeElapsed: number, 
  turns: number, 
  gridSize: number
): number => {
  const maxTime = gridSize * gridSize * 2; // 2 seconds per card max
  const maxTurns = gridSize * gridSize; // 1 turn per card max
  
  // Time score (0-50 points)
  const timeScore = Math.max(0, 50 - (timeElapsed / maxTime) * 50);
  
  // Turn score (0-50 points)
  const turnScore = Math.max(0, 50 - (turns / maxTurns) * 50);
  
  // Bonus for smaller grids (more difficult)
  const gridBonus = gridSize >= 5 ? 20 : gridSize >= 4 ? 10 : 0;
  
  return Math.round(timeScore + turnScore + gridBonus);
};

/**
 * Format time duration
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format game statistics for display
 */
export const formatGameStats = (sessions: GameSession[]) => {
  if (sessions.length === 0) {
    return {
      totalGames: 0,
      avgTime: 0,
      avgTurns: 0,
      bestTime: 0,
      bestTurns: 0,
      bestScore: 0
    };
  }

  const totalTime = sessions.reduce((sum, session) => sum + session.timeElapsed, 0);
  const totalTurns = sessions.reduce((sum, session) => sum + session.turns, 0);
  const bestTime = Math.min(...sessions.map(s => s.timeElapsed));
  const bestTurns = Math.min(...sessions.map(s => s.turns));
  const bestScore = Math.max(...sessions.map(s => s.score));

  return {
    totalGames: sessions.length,
    avgTime: Math.round(totalTime / sessions.length),
    avgTurns: Math.round(totalTurns / sessions.length),
    bestTime,
    bestTurns,
    bestScore
  };
};

/**
 * Check if two cards match
 */
export const cardsMatch = (card1: Card, card2: Card): boolean => {
  return card1.value === card2.value && 
         card1.id !== card2.id && 
         card1.value !== '' && 
         card2.value !== '';
};

/**
 * Get grid CSS template based on grid size
 */
export const getGridTemplate = (gridSize: number): string => {
  return `repeat(${gridSize}, 1fr)`;
};

/**
 * Generate unique game session ID
 */
export const generateSessionId = (): string => {
  return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate grid size
 */
export const isValidGridSize = (size: number): boolean => {
  return size >= 2 && size <= 8 && Math.floor((size * size) / 2) >= 1;
};

/**
 * Get difficulty level based on grid size
 */
export const getDifficultyLevel = (gridSize: number): string => {
  if (gridSize <= 3) return 'Easy';
  if (gridSize <= 4) return 'Medium';
  if (gridSize <= 5) return 'Hard';
  return 'Expert';
};

/**
 * Default game configurations
 */
export const DEFAULT_CONFIGS: Record<string, GameConfig> = {
  easy: { gridSize: 3, hasTimer: false },
  medium: { gridSize: 4, hasTimer: true, timeLimit: 120 },
  hard: { gridSize: 5, hasTimer: true, timeLimit: 180 },
  expert: { gridSize: 6, hasTimer: true, timeLimit: 240 }
};
