import playerStatsRepository from "@repository/player-stats.repository";
import type { LeaderboardEntry } from "@repo/common/types/game";

class LeaderboardService {

  getLeaderboard = async (limit = 50, offset = 0): Promise<LeaderboardEntry[]> => {
    const stats = await playerStatsRepository.getTopPlayers(limit, offset);

    return stats.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.user.id,
      name: entry.user.name,
      rating: entry.rating,
      wins: entry.wins,
      losses: entry.losses,
      draws: entry.draws,
      currentStreak: entry.currentStreak,
      maxStreak: entry.maxStreak,
      gamesPlayed: entry.gamesPlayed,
    }));
  };
}

export default new LeaderboardService();
