import React from 'react';
import { Card } from '../types/game';
import GameCard from './GameCard';
import { getGridTemplate } from '../utils/gameUtils';
import './GameGrid.css';

interface GameGridProps {
  cards: Card[];
  gridSize: number;
  onCardFlip: (cardId: string) => void;
  disabled: boolean;
  isGameComplete: boolean;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  cards, 
  gridSize, 
  onCardFlip, 
  disabled, 
  isGameComplete 
}) => {
  const gridTemplate = getGridTemplate(gridSize);

  return (
    <div 
      className={`game-grid game-grid-${gridSize} ${isGameComplete ? 'game-complete' : ''}`}
      style={{
        gridTemplateColumns: gridTemplate,
        gridTemplateRows: gridTemplate,
      }}
    >
      {cards.map((card) => (
        <GameCard
          key={card.id}
          card={card}
          onFlip={onCardFlip}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default GameGrid;
