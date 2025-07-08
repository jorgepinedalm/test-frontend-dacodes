import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types/game';
import GameService from '../services/gameService';
import { formatTime, getDifficultyLevel } from '../utils/gameUtils';
import './Leaderboard.css';

const gameService = GameService.getInstance();

interface LeaderboardProps {
  userId?: number;
  gridSize?: number;
  refreshTrigger?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  userId, 
  gridSize,
  refreshTrigger = 0
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedGridSize, setSelectedGridSize] = useState<number | undefined>(gridSize);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'turns'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedGridSize, refreshTrigger]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = gameService.getTopPlayers(10, selectedGridSize);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: 'score' | 'time' | 'turns') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'score' ? 'desc' : 'asc'); // Score: higher is better, time/turns: lower is better
    }
  };

  const getSortedLeaderboard = () => {
    const sorted = [...leaderboard];
    
    sorted.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'score':
          aValue = a.bestScore;
          bValue = b.bestScore;
          break;
        case 'time':
          aValue = a.bestTime;
          bValue = b.bestTime;
          break;
        case 'turns':
          aValue = a.bestTurns;
          bValue = b.bestTurns;
          break;
        default:
          aValue = a.bestScore;
          bValue = b.bestScore;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    return sorted;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getSortIcon = (column: 'score' | 'time' | 'turns') => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const sortedLeaderboard = getSortedLeaderboard();

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        <div className="leaderboard-filters">
          <label htmlFor="grid-filter">Grid Size:</label>
          <select
            id="grid-filter"
            value={selectedGridSize || ''}
            onChange={(e) => setSelectedGridSize(e.target.value ? parseInt(e.target.value) : undefined)}
            className="filter-select"
          >
            <option value="">All Sizes</option>
            <option value={3}>3×3 (Easy)</option>
            <option value={4}>4×4 (Medium)</option>
            <option value={5}>5×5 (Hard)</option>
            <option value={6}>6×6 (Expert)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : (
        <>
          {sortedLeaderboard.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎮</div>
              <h3>No Games Yet</h3>
              <p>
                {selectedGridSize 
                  ? `No games played on ${selectedGridSize}×${selectedGridSize} grid yet.`
                  : 'No games have been completed yet.'
                }
              </p>
              <p>Start playing to see your scores here!</p>
            </div>
          ) : (
            <div className="leaderboard-table">
              <div className="table-header">
                <div className="rank-column">Rank</div>
                <div className="player-column">Player</div>
                <div className="difficulty-column">Difficulty</div>
                <div 
                  className={`score-column sortable ${sortBy === 'score' ? 'active' : ''}`}
                  onClick={() => handleSort('score')}
                >
                  Score {getSortIcon('score')}
                </div>
                <div 
                  className={`time-column sortable ${sortBy === 'time' ? 'active' : ''}`}
                  onClick={() => handleSort('time')}
                >
                  Best Time {getSortIcon('time')}
                </div>
                <div 
                  className={`turns-column sortable ${sortBy === 'turns' ? 'active' : ''}`}
                  onClick={() => handleSort('turns')}
                >
                  Best Turns {getSortIcon('turns')}
                </div>
                <div className="games-column">Games</div>
              </div>

              <div className="table-body">
                {sortedLeaderboard.map((entry, index) => (
                  <div 
                    key={`${entry.userId}-${entry.gridSize}`}
                    className={`table-row ${entry.userId === userId ? 'current-user' : ''} ${
                      index < 3 ? 'top-three' : ''
                    }`}
                  >
                    <div className="rank-column">
                      <span className="rank-icon">{getRankIcon(entry.rank)}</span>
                    </div>
                    <div className="player-column">
                      <span className="player-name">{entry.username}</span>
                      {entry.userId === userId && (
                        <span className="you-indicator">You</span>
                      )}
                    </div>
                    <div className="difficulty-column">
                      <span className="difficulty-badge">
                        {getDifficultyLevel(entry.gridSize)}
                      </span>
                      <span className="grid-size">{entry.gridSize}×{entry.gridSize}</span>
                    </div>
                    <div className="score-column">
                      <span className="score-value">{entry.bestScore}</span>
                    </div>
                    <div className="time-column">
                      <span className="time-value">{formatTime(entry.bestTime)}</span>
                    </div>
                    <div className="turns-column">
                      <span className="turns-value">{entry.bestTurns}</span>
                    </div>
                    <div className="games-column">
                      <span className="games-count">{entry.gamesPlayed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedLeaderboard.length > 0 && (
            <div className="leaderboard-footer">
              <p>
                Showing top {sortedLeaderboard.length} players
                {selectedGridSize && ` for ${selectedGridSize}×${selectedGridSize} grid`}
              </p>
              <button 
                className="refresh-button"
                onClick={loadLeaderboard}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
