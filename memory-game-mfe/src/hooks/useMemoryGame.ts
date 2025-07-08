import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameConfig, Card, GameStatus } from '../types/game';
import { generateCards, cardsMatch, calculateScore } from '../utils/gameUtils';
import GameService from '../services/gameService';

const gameService = GameService.getInstance();

const initialGameState: GameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 0,
  turns: 0,
  isGameActive: false,
  isGameComplete: false,
  elapsedTime: 0,
  config: { gridSize: 4, hasTimer: false }
};

export const useMemoryGame = (userId?: number, username?: string) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (gameStatus === 'playing' && gameState.config.hasTimer) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStatus, gameState.config.hasTimer]);

  // Check for game completion
  useEffect(() => {
    if (gameState.matchedPairs === gameState.totalPairs && gameState.totalPairs > 0) {
      completeGame();
    }
  }, [gameState.matchedPairs, gameState.totalPairs]);

  // Check for time limit exceeded
  useEffect(() => {
    if (
      gameState.config.hasTimer &&
      gameState.config.timeLimit &&
      gameState.elapsedTime >= gameState.config.timeLimit &&
      gameStatus === 'playing'
    ) {
      setGameStatus('failed');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [gameState.elapsedTime, gameState.config.hasTimer, gameState.config.timeLimit, gameStatus]);

  const startNewGame = useCallback((config: GameConfig) => {
    const cards = generateCards(config);
    // Count only non-empty cards and divide by 2 for pairs
    const nonEmptyCards = cards.filter(card => card.value !== '');
    const totalPairs = Math.floor(nonEmptyCards.length / 2);

    setGameState({
      cards,
      flippedCards: [],
      matchedPairs: 0,
      totalPairs,
      turns: 0,
      isGameActive: true,
      isGameComplete: false,
      startTime: Date.now(),
      elapsedTime: 0,
      config
    });

    setGameStatus('playing');
    startTimeRef.current = Date.now();
  }, []);

  const flipCard = useCallback((cardId: string) => {
    if (gameStatus !== 'playing') return;

    setGameState(prev => {
      const card = prev.cards.find(c => c.id === cardId);
      
      // Can't flip if card is already flipped, matched, empty, or if 2 cards are already flipped
      if (!card || card.isFlipped || card.isMatched || card.value === '' || prev.flippedCards.length >= 2) {
        return prev;
      }

      const updatedCards = prev.cards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );

      const newFlippedCards = [...prev.flippedCards, { ...card, isFlipped: true }];

      // If this is the second card flipped, check for match
      if (newFlippedCards.length === 2) {
        const [firstCard, secondCard] = newFlippedCards;
        
        if (cardsMatch(firstCard, secondCard)) {
          // Match found - only mark the two specific cards as matched
          const matchedCards = updatedCards.map(c =>
            c.id === firstCard.id || c.id === secondCard.id ? { ...c, isMatched: true } : c
          );

          return {
            ...prev,
            cards: matchedCards,
            flippedCards: [],
            matchedPairs: prev.matchedPairs + 1,
            turns: prev.turns + 1
          };
        } else {
          // No match - flip cards back after delay
          setTimeout(() => {
            setGameState(current => ({
              ...current,
              cards: current.cards.map(c =>
                c.id === firstCard.id || c.id === secondCard.id
                  ? { ...c, isFlipped: false }
                  : c
              ),
              flippedCards: []
            }));
          }, 1000);

          return {
            ...prev,
            cards: updatedCards,
            flippedCards: newFlippedCards,
            turns: prev.turns + 1
          };
        }
      }

      return {
        ...prev,
        cards: updatedCards,
        flippedCards: newFlippedCards
      };
    });
  }, [gameStatus]);

  const completeGame = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const endTime = Date.now();
    setGameState(prev => ({
      ...prev,
      isGameComplete: true,
      isGameActive: false,
      endTime
    }));

    setGameStatus('completed');

    // Save game session if user is authenticated
    if (userId && username) {
      try {
        await gameService.saveGameSession(
          userId,
          username,
          gameState.config.gridSize,
          gameState.turns,
          gameState.elapsedTime
        );
      } catch (error) {
        console.error('Failed to save game session:', error);
      }
    }
  }, [userId, username, gameState.config.gridSize, gameState.turns, gameState.elapsedTime]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState(initialGameState);
    setGameStatus('idle');
    startTimeRef.current = null;
  }, []);

  const pauseGame = useCallback(() => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [gameStatus]);

  const resumeGame = useCallback(() => {
    if (gameStatus === 'paused') {
      setGameStatus('playing');
    }
  }, [gameStatus]);

  const saveGameSession = useCallback(async () => {
    if (userId && username && gameState.isGameComplete) {
      return await gameService.saveGameSession(
        userId,
        username,
        gameState.config.gridSize,
        gameState.turns,
        gameState.elapsedTime
      );
    }
  }, [userId, username, gameState]);

  // Calculate current score
  const currentScore = calculateScore(
    gameState.elapsedTime,
    gameState.turns,
    gameState.config.gridSize
  );

  return {
    gameState: {
      ...gameState,
      score: currentScore
    },
    gameStatus,
    flipCard,
    resetGame,
    startNewGame,
    pauseGame,
    resumeGame,
    saveGameSession,
    
    // Computed values
    isGameInProgress: gameStatus === 'playing',
    isGamePaused: gameStatus === 'paused',
    isGameCompleted: gameStatus === 'completed',
    isGameFailed: gameStatus === 'failed',
    remainingTime: gameState.config.hasTimer && gameState.config.timeLimit
      ? Math.max(0, gameState.config.timeLimit - gameState.elapsedTime)
      : null
  };
};
