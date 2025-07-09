// Tests for Leaderboard component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Leaderboard from '../../components/Leaderboard';
import GameService from '../../services/gameService';
import { LeaderboardEntry } from '../../types/game';

// Mock GameService
jest.mock('../../services/gameService');
const mockGameService = {
  getInstance: jest.fn().mockReturnThis(),
  getTopPlayers: jest.fn()
};
(GameService.getInstance as jest.Mock).mockReturnValue(mockGameService);

describe('Leaderboard', () => {
  const mockLeaderboardData: LeaderboardEntry[] = [
    {
      userId: 1,
      username: 'player1',
      gridSize: 4,
      bestTime: 120,
      bestTurns: 15,
      bestScore: 85,
      gamesPlayed: 5,
      rank: 1
    },
    {
      userId: 2,
      username: 'player2',
      gridSize: 4,
      bestTime: 150,
      bestTurns: 18,
      bestScore: 75,
      gamesPlayed: 3,
      rank: 2
    },
    {
      userId: 3,
      username: 'player3',
      gridSize: 4,
      bestTime: 180,
      bestTurns: 20,
      bestScore: 65,
      gamesPlayed: 8,
      rank: 3
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGameService.getTopPlayers.mockResolvedValue(mockLeaderboardData);
  });

  describe('rendering', () => {
    it('should render leaderboard header and filters', () => {
      // Act
      render(<Leaderboard />);

      // Assert
      expect(screen.getByText('🏆 Leaderboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Grid Size:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Sizes')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      // Arrange
      mockGameService.getTopPlayers.mockImplementation(() => new Promise(() => {})); // Never resolves

      // Act
      render(<Leaderboard />);

      // Assert
      expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /loading/i }) || screen.getByText('Loading leaderboard...')).toBeInTheDocument();
    });

    it('should render leaderboard table when data is loaded', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('player1')).toBeInTheDocument();
        expect(screen.getByText('player2')).toBeInTheDocument();
        expect(screen.getByText('player3')).toBeInTheDocument();
      });

      expect(screen.getByText('🥇')).toBeInTheDocument(); // First place
      expect(screen.getByText('🥈')).toBeInTheDocument(); // Second place
      expect(screen.getByText('🥉')).toBeInTheDocument(); // Third place
    });

    it('should show empty state when no data', async () => {
      // Arrange
      mockGameService.getTopPlayers.mockResolvedValue([]);

      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No Games Yet')).toBeInTheDocument();
        expect(screen.getByText('No games have been completed yet.')).toBeInTheDocument();
        expect(screen.getByText('Start playing to see your scores here!')).toBeInTheDocument();
      });
    });

    it('should show empty state message for specific grid size', async () => {
      // Arrange
      mockGameService.getTopPlayers.mockResolvedValue([]);

      // Act
      render(<Leaderboard gridSize={5} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No games played on 5×5 grid yet.')).toBeInTheDocument();
      });
    });
  });

  describe('grid size filtering', () => {
    it('should call getTopPlayers with correct grid size filter', async () => {
      // Act
      render(<Leaderboard gridSize={4} />);

      // Assert
      await waitFor(() => {
        expect(mockGameService.getTopPlayers).toHaveBeenCalledWith(10, 4);
      });
    });

    it('should call getTopPlayers without grid size when not specified', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(mockGameService.getTopPlayers).toHaveBeenCalledWith(10, undefined);
      });
    });

    it('should update filter when grid size selector changes', async () => {
      // Act
      render(<Leaderboard />);

      // Wait for initial load
      await waitFor(() => {
        expect(mockGameService.getTopPlayers).toHaveBeenCalledWith(10, undefined);
      });

      // Change filter
      fireEvent.change(screen.getByLabelText('Grid Size:'), { target: { value: '5' } });

      // Assert
      await waitFor(() => {
        expect(mockGameService.getTopPlayers).toHaveBeenCalledWith(10, 5);
      });
    });

    it('should display correct filter options', () => {
      // Act
      render(<Leaderboard />);

      // Assert
      expect(screen.getByText('All Sizes')).toBeInTheDocument();
      expect(screen.getByText('3×3 (Easy)')).toBeInTheDocument();
      expect(screen.getByText('4×4 (Medium)')).toBeInTheDocument();
      expect(screen.getByText('5×5 (Hard)')).toBeInTheDocument();
      expect(screen.getByText('6×6 (Expert)')).toBeInTheDocument();
    });
  });

  describe('sorting functionality', () => {
    it('should sort by score by default (descending)', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        const scores = screen.getAllByText(/\d+/).filter(el => 
          el.closest('.score-column')
        );
        expect(scores[0]).toHaveTextContent('85'); // Highest score first
        expect(scores[1]).toHaveTextContent('75');
        expect(scores[2]).toHaveTextContent('65');
      });
    });

    it('should toggle sort order when clicking same column', async () => {
      // Act
      render(<Leaderboard />);

      await waitFor(() => {
        expect(screen.getByText('player1')).toBeInTheDocument();
      });

      // Click score column to reverse order
      fireEvent.click(screen.getByText(/Score/));

      // Assert - should now be ascending (lowest score first)
      await waitFor(() => {
        const rows = screen.getAllByText(/player\d+/);
        expect(rows[0]).toHaveTextContent('player3'); // Lowest score (65)
        expect(rows[1]).toHaveTextContent('player2');
        expect(rows[2]).toHaveTextContent('player1');
      });
    });

    it('should sort by time when time column is clicked', async () => {
      // Act
      render(<Leaderboard />);

      await waitFor(() => {
        expect(screen.getByText('player1')).toBeInTheDocument();
      });

      // Click time column
      fireEvent.click(screen.getByText(/Best Time/));

      // Assert - should sort by time ascending (fastest first)
      await waitFor(() => {
        const rows = screen.getAllByText(/player\d+/);
        expect(rows[0]).toHaveTextContent('player1'); // 120 seconds (fastest)
        expect(rows[1]).toHaveTextContent('player2'); // 150 seconds
        expect(rows[2]).toHaveTextContent('player3'); // 180 seconds
      });
    });

    it('should sort by turns when turns column is clicked', async () => {
      // Act
      render(<Leaderboard />);

      await waitFor(() => {
        expect(screen.getByText('player1')).toBeInTheDocument();
      });

      // Click turns column
      fireEvent.click(screen.getByText(/Best Turns/));

      // Assert - should sort by turns ascending (fewest first)
      await waitFor(() => {
        const rows = screen.getAllByText(/player\d+/);
        expect(rows[0]).toHaveTextContent('player1'); // 15 turns (fewest)
        expect(rows[1]).toHaveTextContent('player2'); // 18 turns
        expect(rows[2]).toHaveTextContent('player3'); // 20 turns
      });
    });

    it('should show correct sort indicators', async () => {
      // Act
      render(<Leaderboard />);

      await waitFor(() => {
        expect(screen.getByText('player1')).toBeInTheDocument();
      });

      // Assert - score column should show descending indicator
      expect(screen.getByText(/Score ↓/)).toBeInTheDocument();
      expect(screen.getByText(/Best Time ↕️/)).toBeInTheDocument();
      expect(screen.getByText(/Best Turns ↕️/)).toBeInTheDocument();

      // Click time column
      fireEvent.click(screen.getByText(/Best Time/));

      // Assert - time column should now show ascending indicator
      await waitFor(() => {
        expect(screen.getByText(/Best Time ↑/)).toBeInTheDocument();
        expect(screen.getByText(/Score ↕️/)).toBeInTheDocument();
      });
    });
  });

  describe('user highlighting', () => {
    it('should highlight current user row', async () => {
      // Act
      render(<Leaderboard userId={2} />);

      // Assert
      await waitFor(() => {
        const userRow = screen.getByText('player2').closest('.table-row');
        expect(userRow).toHaveClass('current-user');
        expect(screen.getByText('You')).toBeInTheDocument();
      });
    });

    it('should not highlight any row when user is not in leaderboard', async () => {
      // Act
      render(<Leaderboard userId={999} />);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('You')).not.toBeInTheDocument();
        expect(screen.queryByRole('row', { name: /current-user/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('rank display', () => {
    it('should display medal icons for top 3 positions', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('🥇')).toBeInTheDocument(); // 1st place
        expect(screen.getByText('🥈')).toBeInTheDocument(); // 2nd place
        expect(screen.getByText('🥉')).toBeInTheDocument(); // 3rd place
      });
    });

    it('should display numeric rank for positions beyond 3rd', async () => {
      // Arrange
      const extendedData = [
        ...mockLeaderboardData,
        {
          userId: 4,
          username: 'player4',
          gridSize: 4,
          bestTime: 200,
          bestTurns: 25,
          bestScore: 55,
          gamesPlayed: 2,
          rank: 4
        }
      ];
      mockGameService.getTopPlayers.mockResolvedValue(extendedData);

      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('#4')).toBeInTheDocument();
      });
    });

    it('should apply top-three class to first three rows', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        const rows = screen.getAllByText(/player\d+/).map(el => el.closest('.table-row'));
        expect(rows[0]).toHaveClass('top-three');
        expect(rows[1]).toHaveClass('top-three');
        expect(rows[2]).toHaveClass('top-three');
      });
    });
  });

  describe('data formatting', () => {
    it('should format time correctly', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('02:00')).toBeInTheDocument(); // 120 seconds
        expect(screen.getByText('02:30')).toBeInTheDocument(); // 150 seconds
        expect(screen.getByText('03:00')).toBeInTheDocument(); // 180 seconds
      });
    });

    it('should display difficulty levels correctly', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getAllByText('Medium')).toHaveLength(3); // All entries are 4x4 (Medium)
        expect(screen.getAllByText('4×4')).toHaveLength(3);
      });
    });

    it('should display all game statistics', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        // Check that all columns are displayed
        expect(screen.getByText('85')).toBeInTheDocument(); // Score
        expect(screen.getByText('15')).toBeInTheDocument(); // Turns
        expect(screen.getByText('5')).toBeInTheDocument(); // Games played
      });
    });
  });

  describe('refresh functionality', () => {
    it('should reload data when refresh button is clicked', async () => {
      // Act
      render(<Leaderboard />);

      await waitFor(() => {
        expect(screen.getByText('player1')).toBeInTheDocument();
      });

      // Clear previous calls
      mockGameService.getTopPlayers.mockClear();

      // Click refresh
      fireEvent.click(screen.getByText('🔄 Refresh'));

      // Assert
      expect(mockGameService.getTopPlayers).toHaveBeenCalledWith(10, undefined);
    });

    it('should refresh data when refreshTrigger prop changes', async () => {
      // Act
      const { rerender } = render(<Leaderboard refreshTrigger={0} />);

      await waitFor(() => {
        expect(mockGameService.getTopPlayers).toHaveBeenCalledTimes(1);
      });

      // Change refreshTrigger
      rerender(<Leaderboard refreshTrigger={1} />);

      // Assert
      await waitFor(() => {
        expect(mockGameService.getTopPlayers).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('footer information', () => {
    it('should show count of displayed players', async () => {
      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Showing top 3 players')).toBeInTheDocument();
      });
    });

    it('should show grid size filter in footer when applied', async () => {
      // Act
      render(<Leaderboard gridSize={4} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Showing top 3 players for 4×4 grid')).toBeInTheDocument();
      });
    });

    it('should not show footer when no data', async () => {
      // Arrange
      mockGameService.getTopPlayers.mockResolvedValue([]);

      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/Showing top/)).not.toBeInTheDocument();
        expect(screen.queryByText('🔄 Refresh')).not.toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should handle getTopPlayers error gracefully', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGameService.getTopPlayers.mockRejectedValue(new Error('API Error'));

      // Act
      render(<Leaderboard />);

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load leaderboard:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});
