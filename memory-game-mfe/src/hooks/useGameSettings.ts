import { useState, useEffect, useCallback } from 'react';
import { GameConfig } from '../types/game';
import { DEFAULT_CONFIGS } from '../utils/gameUtils';

const STORAGE_KEY = 'memory-game-settings';

interface UseGameSettingsReturn {
  gameSettings: GameConfig;
  updateGameSettings: (settings: Partial<GameConfig>) => void;
  resetGameSettings: () => void;
  saveGameSettings: (settings: GameConfig) => void;
}

export const useGameSettings = (): UseGameSettingsReturn => {
  const [gameSettings, setGameSettings] = useState<GameConfig>(DEFAULT_CONFIGS.medium);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Validate that the settings have the required structure
          if (parsedSettings && typeof parsedSettings.gridSize === 'number') {
            setGameSettings(parsedSettings);
          } else {
            // If invalid, use default and clear localStorage
            localStorage.removeItem(STORAGE_KEY);
            setGameSettings(DEFAULT_CONFIGS.medium);
          }
        }
      } catch (error) {
        console.warn('Failed to load game settings from localStorage:', error);
        // If there's an error, clear localStorage and use default
        localStorage.removeItem(STORAGE_KEY);
        setGameSettings(DEFAULT_CONFIGS.medium);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameSettings));
    } catch (error) {
      console.warn('Failed to save game settings to localStorage:', error);
    }
  }, [gameSettings]);

  const updateGameSettings = useCallback((newSettings: Partial<GameConfig>) => {
    setGameSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  const saveGameSettings = useCallback((settings: GameConfig) => {
    setGameSettings(settings);
  }, []);

  const resetGameSettings = useCallback(() => {
    setGameSettings(DEFAULT_CONFIGS.medium);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear game settings from localStorage:', error);
    }
  }, []);

  return {
    gameSettings,
    updateGameSettings,
    resetGameSettings,
    saveGameSettings
  };
};
