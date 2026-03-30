import { prisma } from "db";

class GameRepository {
  create = async (data: {
    roomCode: string;
    mode: string;
    playerId: string;
    isGuest: boolean;
  }) => {
    return prisma.game.create({
      data: {
        roomCode: data.roomCode,
        mode: data.mode as any,
        status: "WAITING",
        players: {
          create: {
            symbol: "X",
            ...(data.isGuest
              ? { guestId: data.playerId }
              : { userId: data.playerId }),
          },
        },
      },
    });
  };

  findByUser = async (
    userId: string,
    isGuest: boolean,
    limit: number,
    offset: number,
  ) => {
    const playerFilter = isGuest
      ? { players: { some: { guestId: userId } } }
      : { players: { some: { userId } } };

    return prisma.game.findMany({
      where: {
        ...playerFilter,
        status: { in: ["COMPLETED", "ABANDONED"] },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        players: {
          include: {
            user: { select: { id: true, name: true } },
            guest: { select: { id: true, name: true } },
          },
        },
      },
    });
  };

  findActiveByUser = async (userId: string, isGuest: boolean) => {
    const playerFilter = isGuest
      ? { players: { some: { guestId: userId } } }
      : { players: { some: { userId } } };

    return prisma.game.findFirst({
      where: {
        ...playerFilter,
        status: { in: ["WAITING", "IN_PROGRESS"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        roomCode: true,
        mode: true,
        status: true,
        createdAt: true,
      },
    });
  };

  findById = async (gameId: string) => {
    return prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            user: { select: { id: true, name: true } },
            guest: { select: { id: true, name: true } },
          },
        },
        moves: { orderBy: { moveNumber: "asc" } },
      },
    });
  };
}

export default new GameRepository();
