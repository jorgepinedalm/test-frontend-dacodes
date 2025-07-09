import React, { createContext, useContext, ReactNode } from 'react';
import { GameConfig } from '../types/game';
import { useGameSettings } from '../hooks/useGameSettings';

interface GameSettingsContextType {
  gameSettings: GameConfig;
  updateGameSettings: (settings: Partial<GameConfig>) => void;
  resetGameSettings: () => void;
  saveGameSettings: (settings: GameConfig) => void;
}

const GameSettingsContext = createContext<GameSettingsContextType | undefined>(undefined);

interface GameSettingsProviderProps {
  children: ReactNode;
}

export const GameSettingsProvider: React.FC<GameSettingsProviderProps> = ({ children }) => {
  const gameSettingsHook = useGameSettings();

  return (
    <GameSettingsContext.Provider value={gameSettingsHook}>
      {children}
    </GameSettingsContext.Provider>
  );
};

export const useGameSettingsContext = (): GameSettingsContextType => {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error('useGameSettingsContext must be used within a GameSettingsProvider');
  }
  return context;
};
