import gameRepository from "@repository/game.repository";
import type { GameHistoryEntry } from "@repo/common/types/game";

class GameService {
  getActiveGame = async (userId: string, isGuest: boolean) => {
    return gameRepository.findActiveByUser(userId, isGuest);
  };

  createRoom = async (
    roomCode: string,
    mode: string,
    playerId: string,
    isGuest: boolean,
  ) => {
    return gameRepository.create({ roomCode, mode, playerId, isGuest });
  };

  getHistory = async (
    userId: string,
    isGuest: boolean,
    limit = 20,
    offset = 0,
  ): Promise<GameHistoryEntry[]> => {
    const games = await gameRepository.findByUser(
      userId,
      isGuest,
      limit,
      offset,
    );

    return games.map((game) => {
      const xEntry = game.players.find((p) => p.symbol === "X");
      const oEntry = game.players.find((p) => p.symbol === "O");

      const xPlayer = xEntry
        ? xEntry.user
          ? { userId: xEntry.user.id, name: xEntry.user.name, isGuest: false }
          : xEntry.guest
            ? {
                userId: xEntry.guest.id,
                name: xEntry.guest.name,
                isGuest: true,
              }
            : { userId: "", name: "Unknown", isGuest: false }
        : { userId: "", name: "Unknown", isGuest: false };

      const oPlayer = oEntry
        ? oEntry.user
          ? { userId: oEntry.user.id, name: oEntry.user.name, isGuest: false }
          : oEntry.guest
            ? {
                userId: oEntry.guest.id,
                name: oEntry.guest.name,
                isGuest: true,
              }
            : null
        : null;

      let winnerId: string | null = null;
      if (game.result === "X_WIN") winnerId = xPlayer.userId;
      else if (game.result === "O_WIN") winnerId = oPlayer?.userId ?? null;

      return {
        id: game.id,
        roomCode: game.roomCode,
        mode: game.mode,
        result: game.result,
        playerX: xPlayer,
        playerO: oPlayer,
        winnerId,
        completedAt: game.completedAt?.toISOString() ?? null,
        createdAt: game.createdAt.toISOString(),
      };
    });
  };

  getDetails = async (gameId: string) => {
    return gameRepository.findById(gameId);
  };
}

export default new GameService();
