import React from 'react';
import { Card as CardType } from '../types/game';
import './GameCard.css';

interface GameCardProps {
  card: CardType;
  onFlip: (cardId: string) => void;
  disabled: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, onFlip, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched && card.value !== '') {
      onFlip(card.id);
    }
  };

  // Empty cards (for odd grids) should be invisible/disabled
  if (card.value === '') {
    return (
      <div 
        className="game-card empty matched"
        data-testid={`game-card-${card.id}`}
      >
        <div className="card-inner">
          <div className="card-front"></div>
          <div className="card-back"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`game-card ${card.isFlipped ? 'flipped' : ''} ${
        card.isMatched ? 'matched' : ''
      } ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      data-testid={`game-card-${card.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="card-pattern">❓</div>
        </div>
        <div className="card-back">
          <div className="card-symbol">{card.value}</div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
