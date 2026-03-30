import { prisma } from "db";
import type { GameMode, GameResult, GameStatus } from "@repo/common/types/game";

export async function createGameInDb(data: { roomCode: string; mode: GameMode; playerId: string; isGuest: boolean }) {
  return prisma.game.create({
    data: {
      roomCode: data.roomCode,
      mode: data.mode,
      status: "WAITING",
      players: {
        create: {
          symbol: "X",
          ...(data.isGuest ? { guestId: data.playerId } : { userId: data.playerId }),
        },
      },
    },
  });
}

export async function findGameByRoomCode(roomCode: string) {
  return prisma.game.findUnique({
    where: { roomCode },
    include: {
      players: {
        include: {
          user: { select: { id: true, name: true } },
          guest: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function addPlayerO(gameId: string, playerId: string, isGuest: boolean) {
  return prisma.$transaction([
    prisma.gamePlayer.create({
      data: {
        gameId,
        symbol: "O",
        ...(isGuest ? { guestId: playerId } : { userId: playerId }),
      },
    }),
    prisma.game.update({
      where: { id: gameId },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    }),
  ]);
}

export async function updateGameEnd(gameId: string, data: { result: GameResult; status: GameStatus }) {
  return prisma.game.update({
    where: { id: gameId },
    data: { result: data.result, status: data.status, completedAt: new Date() },
  });
}

export async function createMove(data: { gameId: string; playerId: string; isGuest: boolean; position: number; symbol: "X" | "O"; moveNumber: number }) {
  return prisma.move.create({
    data: {
      gameId: data.gameId,
      position: data.position,
      symbol: data.symbol,
      moveNumber: data.moveNumber,
      ...(data.isGuest ? { playerGuestId: data.playerId } : { playerId: data.playerId }),
    },
  });
}

export async function getPlayerStats(userId: string) {
  return prisma.playerStats.findUnique({ where: { userId } });
}

export async function updateWinStats(userId: string, newRating: number) {
  return prisma.playerStats.update({
    where: { userId },
    data: { wins: { increment: 1 }, gamesPlayed: { increment: 1 }, currentStreak: { increment: 1 }, rating: newRating, maxStreak: { increment: 0 } },
  });
}

export async function updateLossStats(userId: string, newRating: number) {
  return prisma.playerStats.update({
    where: { userId },
    data: { losses: { increment: 1 }, gamesPlayed: { increment: 1 }, currentStreak: 0, rating: newRating },
  });
}

export async function updateDrawStats(userId: string, newRating: number) {
  return prisma.playerStats.update({
    where: { userId },
    data: { draws: { increment: 1 }, gamesPlayed: { increment: 1 }, rating: newRating },
  });
}

export async function updateMaxStreak(userId: string) {
  await prisma.$executeRaw`
    UPDATE "PlayerStats"
    SET "maxStreak" = GREATEST("maxStreak", "currentStreak")
    WHERE "userId" = ${userId}
  `;
}
