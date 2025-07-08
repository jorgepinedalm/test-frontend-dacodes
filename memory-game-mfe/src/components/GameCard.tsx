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
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onFlip(card.id);
    }
  };

  return (
    <div
      className={`game-card ${card.isFlipped ? 'flipped' : ''} ${
        card.isMatched ? 'matched' : ''
      } ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
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
