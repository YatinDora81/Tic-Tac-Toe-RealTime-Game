import { prisma } from "db";

class PlayerStatsRepository {

  getTopPlayers = async (limit: number, offset: number) => {
    return prisma.playerStats.findMany({
      take: limit,
      skip: offset,
      orderBy: { rating: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  };
}

export default new PlayerStatsRepository();
