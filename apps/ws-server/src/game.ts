import type WebSocket from "ws";
import type {
  GameMode,
  GameResult,
  PlayerSymbol,
  Board,
} from "@repo/common/types/game";
import type { WSServerMessage } from "@repo/common/types/ws";
import {
  checkWinner,
  isBoardFull,
  isValidMove,
  applyMove,
  createEmptyBoard,
  getNextTurn,
} from "@repo/common/game-logic/board";
import {
  calculateEloWin,
  calculateEloDraw,
} from "@repo/common/game-logic/rating";
import {
  TURN_DURATION_SECONDS,
  DISCONNECT_GRACE_PERIOD_MS,
} from "@repo/common/constants/game";
import { generateRoomCode } from "@repo/common/utils/room-code";
import {
  joinGameSchema,
  findMatchSchema,
  makeMoveSchema,
} from "@repo/common/schemas/game";
import * as db from "./db";

interface Player {
  id: string;
  name: string;
  isGuest: boolean;
}

interface UserSession {
  id: string;
  name: string;
  isGuest: boolean;
  sockets: Set<WebSocket>;
  roomCode: string | null;
  waitingForMode: GameMode | null;
}

interface GameOverPayload {
  result: GameResult;
  winnerId: string | null;
  board: number[];
  stats: { playerX: any; playerO: any };
}

interface Room {
  roomCode: string;
  gameId: string;
  board: Board;
  currentTurn: PlayerSymbol;
  playerX: Player;
  playerO: Player | null;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  mode: GameMode;
  moveCount: number;
  turnTimer: {
    interval: ReturnType<typeof setInterval>;
    timeout: ReturnType<typeof setTimeout>;
  } | null;
  forfeitTimers: Map<string, ReturnType<typeof setTimeout>>;
  gameOverData: GameOverPayload | null;
}

class Game {
  private users = new Map<string, UserSession>();
  private rooms = new Map<string, Room>();

  private sessionKey(userId: string, isGuest: boolean): string {
    return `${userId}__${isGuest ? "guest" : "user"}`;
  }

  private playerKey(player: Player): string {
    return this.sessionKey(player.id, player.isGuest);
  }

  private getOrCreateUser(
    userId: string,
    playerName: string,
    isGuest: boolean,
  ): UserSession {
    const key = this.sessionKey(userId, isGuest);
    let session = this.users.get(key);
    if (!session) {
      session = {
        id: userId,
        name: playerName,
        isGuest,
        sockets: new Set(),
        roomCode: null,
        waitingForMode: null,
      };
      this.users.set(key, session);
    }
    return session;
  }

  private sendToSocket(socket: WebSocket, msg: WSServerMessage) {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(msg));
  }

  private sendToUser(key: string, msg: WSServerMessage) {
    const session = this.users.get(key);
    if (!session) return;
    const data = JSON.stringify(msg);
    for (const socket of session.sockets) {
      if (socket.readyState === socket.OPEN) socket.send(data);
    }
  }

  private broadcastToRoom(room: Room, msg: WSServerMessage) {
    this.sendToUser(this.playerKey(room.playerX), msg);
    if (room.playerO) this.sendToUser(this.playerKey(room.playerO), msg);
  }

  private buildGameState(room: Room): WSServerMessage {
    return {
      type: "game_state",
      data: {
        roomCode: room.roomCode,
        board: [...room.board],
        currentTurn: room.currentTurn,
        playerX: {
          userId: room.playerX.id,
          name: room.playerX.name,
          symbol: "X",
          isGuest: room.playerX.isGuest,
        },
        playerO: room.playerO
          ? {
              userId: room.playerO.id,
              name: room.playerO.name,
              symbol: "O",
              isGuest: room.playerO.isGuest,
            }
          : null,
        status: room.status,
        mode: room.mode,
        result: null,
        moveCount: room.moveCount,
      },
    };
  }

  private newRoom(
    roomCode: string,
    gameId: string,
    mode: GameMode,
    playerX: Player,
  ): Room {
    return {
      roomCode,
      gameId,
      board: createEmptyBoard(),
      currentTurn: "X",
      playerX,
      playerO: null,
      status: "WAITING",
      mode,
      moveCount: 0,
      turnTimer: null,
      forfeitTimers: new Map(),
      gameOverData: null,
    };
  }

  private clearTurnTimer(room: Room) {
    if (!room.turnTimer) return;
    clearInterval(room.turnTimer.interval);
    clearTimeout(room.turnTimer.timeout);
    room.turnTimer = null;
  }

  private startTurnTimer(room: Room) {
    this.clearTurnTimer(room);
    let secondsLeft = TURN_DURATION_SECONDS;

    const interval = setInterval(() => {
      secondsLeft--;
      this.broadcastToRoom(room, {
        type: "timer_update",
        data: { secondsLeft },
      });
      if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);

    const timeout = setTimeout(async () => {
      this.clearTurnTimer(room);
      if (room.status === "IN_PROGRESS") await this.endGame(room, "TIMEOUT");
    }, TURN_DURATION_SECONDS * 1000);

    room.turnTimer = { interval, timeout };
  }

  private cleanup(room: Room) {
    const xSession = this.users.get(this.playerKey(room.playerX));
    if (xSession) xSession.roomCode = null;
    if (room.playerO) {
      const oSession = this.users.get(this.playerKey(room.playerO));
      if (oSession) oSession.roomCode = null;
    }
    this.clearTurnTimer(room);
    for (const timer of room.forfeitTimers.values()) clearTimeout(timer);
    room.forfeitTimers.clear();
    this.rooms.delete(room.roomCode);
  }

  private async findMatch(
    userId: string,
    playerName: string,
    isGuest: boolean,
    gameMode: GameMode,
  ) {
    const myKey = this.sessionKey(userId, isGuest);

    for (const [opponentKey, opponent] of this.users) {
      if (opponentKey === myKey) continue;
      if (opponent.waitingForMode !== gameMode) continue;
      if (opponent.roomCode) continue;

      opponent.waitingForMode = null;
      this.getOrCreateUser(userId, playerName, isGuest).waitingForMode = null;

      try {
        const roomCode = generateRoomCode();
        await db.createGameInDb({
          roomCode,
          mode: gameMode,
          playerId: opponent.id,
          isGuest: opponent.isGuest,
        });

        this.sendToUser(opponentKey, {
          type: "game_created",
          data: { roomCode, mode: gameMode, symbol: "X" },
        });
        this.sendToUser(myKey, {
          type: "game_created",
          data: { roomCode, mode: gameMode, symbol: "O" },
        });

      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : "Matchmaking failed";
        this.sendToUser(opponentKey, {
          type: "error",
          data: { message: errorMsg },
        });
        this.sendToUser(myKey, { type: "error", data: { message: errorMsg } });
      }
      return;
    }

    const session = this.getOrCreateUser(userId, playerName, isGuest);
    session.waitingForMode = gameMode;
  }

  private cancelMatchmaking(userId: string, isGuest: boolean) {
    const session = this.users.get(this.sessionKey(userId, isGuest));
    if (session) session.waitingForMode = null;
  }

  private async joinGame(
    userId: string,
    playerName: string,
    isGuest: boolean,
    roomCode: string,
  ) {
    const key = this.sessionKey(userId, isGuest);
    let room = this.rooms.get(roomCode);

    if (!room) {
      const dbGame = await db.findGameByRoomCode(roomCode);

      if (!dbGame) {
        this.sendToUser(key, { type: "error", data: { message: "Game not found" } });
        return;
      }

      if (dbGame.status === "COMPLETED" || dbGame.status === "ABANDONED") {
        this.sendToUser(key, { type: "error", data: { message: "Game already ended" } });
        return;
      }

      const xEntry = dbGame.players.find((p) => p.symbol === "X");
      if (!xEntry) { this.sendToUser(key, { type: "error", data: { message: "Game data corrupted" } }); return; }
      const xIsGuest = !!xEntry.guestId;
      const xId = xIsGuest ? xEntry.guestId! : xEntry.userId!;
      const xName = xIsGuest ? xEntry.guest!.name : xEntry.user!.name;

      room = this.newRoom(roomCode, dbGame.id, dbGame.mode as GameMode, {
        id: xId, name: xName, isGuest: xIsGuest,
      });

      const oEntry = dbGame.players.find((p) => p.symbol === "O");
      if (oEntry) {
        const oIsGuest = !!oEntry.guestId;
        const oId = oIsGuest ? oEntry.guestId! : oEntry.userId!;
        const oName = oIsGuest ? oEntry.guest!.name : oEntry.user!.name;
        room.playerO = { id: oId, name: oName, isGuest: oIsGuest };
        room.status = dbGame.status as any;
      }

      this.rooms.set(roomCode, room);

      this.getOrCreateUser(xId, xName, xIsGuest).roomCode = roomCode;
      if (room.playerO) {
        this.getOrCreateUser(room.playerO.id, room.playerO.name, room.playerO.isGuest).roomCode = roomCode;
      }
    }

    const isPlayerX = room.playerX.id === userId && room.playerX.isGuest === isGuest;
    const isPlayerO = room.playerO?.id === userId && room.playerO?.isGuest === isGuest;
    // Also match by ID only (covers edge cases where isGuest flag differs on reconnect)
    const isPlayerXById = room.playerX.id === userId;
    const isPlayerOById = room.playerO?.id === userId;
    if (isPlayerX || isPlayerO || isPlayerXById || isPlayerOById) {
      const session = this.getOrCreateUser(userId, playerName, isGuest);
      session.roomCode = roomCode;
      // Cancel any pending forfeit timer for this player
      const forfeitTimer = room.forfeitTimers.get(key);
      if (forfeitTimer) {
        clearTimeout(forfeitTimer);
        room.forfeitTimers.delete(key);
      }
      // Notify opponent that player reconnected
      const reconnectedSymbol = (isPlayerX || isPlayerXById) ? "X" : "O";
      const opponentKey = reconnectedSymbol === "X"
        ? room.playerO ? this.playerKey(room.playerO) : null
        : this.playerKey(room.playerX);
      if (opponentKey) {
        this.sendToUser(opponentKey, {
          type: "player_joined",
          data: { name: playerName, symbol: reconnectedSymbol },
        });
      }
      this.sendToUser(key, this.buildGameState(room));
      if (room.status === "COMPLETED" && room.gameOverData) {
        this.sendToUser(key, { type: "game_over", data: room.gameOverData });
      }
      return;
    }

    if (room.status !== "WAITING" || room.playerO !== null) {
      this.sendToUser(key, { type: "room_full", data: { roomCode } });
      return;
    }

    room.playerO = { id: userId, name: playerName, isGuest };
    room.status = "IN_PROGRESS";
    this.getOrCreateUser(userId, playerName, isGuest).roomCode = roomCode;

    await db.addPlayerO(room.gameId, userId, isGuest);
    this.broadcastToRoom(room, {
      type: "player_joined",
      data: { name: playerName, symbol: "O" },
    });
    this.broadcastToRoom(room, this.buildGameState(room));

    if (room.mode === "TIMED") this.startTurnTimer(room);
  }

  private async makeMove(userId: string, isGuest: boolean, position: number) {
    const key = this.sessionKey(userId, isGuest);
    const session = this.users.get(key);
    if (!session?.roomCode) return;

    const room = this.rooms.get(session.roomCode);
    if (!room || room.status !== "IN_PROGRESS") return;

    const isX = room.playerX.id === userId && room.playerX.isGuest === isGuest;
    const isO =
      room.playerO?.id === userId && room.playerO?.isGuest === isGuest;
    if (!isX && !isO) return;

    const symbol: PlayerSymbol = isX ? "X" : "O";
    if (room.currentTurn !== symbol) {
      this.sendToUser(key, {
        type: "error",
        data: { message: "Not your turn" },
      });
      return;
    }
    if (!isValidMove(room.board, position)) {
      this.sendToUser(key, {
        type: "error",
        data: { message: "Invalid move" },
      });
      return;
    }

    room.board = applyMove(room.board, position, symbol);
    room.moveCount++;

    const mover = isX ? room.playerX : room.playerO!;
    try {
      await db.createMove({
        gameId: room.gameId,
        playerId: mover.id,
        isGuest: mover.isGuest,
        position,
        symbol,
        moveNumber: room.moveCount,
      });
    } catch (err) {
      console.error("Failed to persist move:", err);
    }

    const win = checkWinner(room.board);
    if (win.winner) {
      await this.endGame(room, win.winner === "X" ? "X_WIN" : "O_WIN");
      return;
    }
    if (isBoardFull(room.board)) {
      await this.endGame(room, "DRAW");
      return;
    }

    room.currentTurn = getNextTurn(room.currentTurn);
    this.broadcastToRoom(room, this.buildGameState(room));
    if (room.mode === "TIMED") this.startTurnTimer(room);
  }

  private async endGame(room: Room, result: GameResult, forfeitedById?: string) {
    if (!room.playerO) return;

    room.status = "COMPLETED";
    this.clearTurnTimer(room);

    let xStats: any = null;
    let oStats: any = null;
    let resolvedWinnerId: string | null = null;

    try {
      await db.updateGameEnd(room.gameId, { result, status: "COMPLETED" });

      const xReg = !room.playerX.isGuest;
      const oReg = !room.playerO.isGuest;

      if (result === "DRAW") {
        if (xReg && oReg) {
          const xS = await db.getPlayerStats(room.playerX.id);
          const oS = await db.getPlayerStats(room.playerO.id);
          if (xS && oS) {
            const elo = calculateEloDraw(xS.rating, oS.rating);
            await db.updateDrawStats(room.playerX.id, elo.newRatingA);
            await db.updateDrawStats(room.playerO.id, elo.newRatingB);
          }
        } else {
          if (xReg)
            await db.updateDrawStats(
              room.playerX.id,
              (await db.getPlayerStats(room.playerX.id))?.rating ?? 1000,
            );
          if (oReg)
            await db.updateDrawStats(
              room.playerO.id,
              (await db.getPlayerStats(room.playerO.id))?.rating ?? 1000,
            );
        }
      } else {
        let xWins: boolean;
        if (result === "FORFEIT" && forfeitedById) {
          // The player who forfeited loses — the other wins
          xWins = room.playerX.id !== forfeitedById;
        } else {
          xWins =
            result === "X_WIN" ||
            ((result === "FORFEIT" || result === "TIMEOUT") &&
              room.currentTurn === "O");
        }
        resolvedWinnerId = xWins ? room.playerX.id : room.playerO.id;
        const winnerId = resolvedWinnerId;
        const loserId = xWins ? room.playerO.id : room.playerX.id;
        const winReg = xWins ? xReg : oReg;
        const loseReg = xWins ? oReg : xReg;

        if (winReg && loseReg) {
          const winnerStats = await db.getPlayerStats(winnerId);
          const loserStats = await db.getPlayerStats(loserId);
          if (winnerStats && loserStats) {
            const elo = calculateEloWin(winnerStats.rating, loserStats.rating);
            await db.updateWinStats(winnerId, elo.newWinnerRating);
            await db.updateMaxStreak(winnerId);
            await db.updateLossStats(loserId, elo.newLoserRating);
          }
        } else {
          if (winReg) {
            await db.updateWinStats(
              winnerId,
              ((await db.getPlayerStats(winnerId))?.rating ?? 1000) + 16,
            );
            await db.updateMaxStreak(winnerId);
          }
          if (loseReg) {
            await db.updateLossStats(
              loserId,
              ((await db.getPlayerStats(loserId))?.rating ?? 1000) - 16,
            );
          }
        }
      }

      if (xReg) xStats = await db.getPlayerStats(room.playerX.id);
      if (oReg) oStats = await db.getPlayerStats(room.playerO.id);
    } catch (err) {
      console.error("Failed to persist game end:", err);
    }

    const fmt = (s: any) =>
      s
        ? {
            wins: s.wins,
            losses: s.losses,
            draws: s.draws,
            currentStreak: s.currentStreak,
            maxStreak: s.maxStreak,
            rating: s.rating,
            gamesPlayed: s.gamesPlayed,
          }
        : null;

    room.gameOverData = {
      result,
      winnerId: resolvedWinnerId,
      board: [...room.board] as number[],
      stats: { playerX: fmt(xStats), playerO: fmt(oStats) },
    };

    this.broadcastToRoom(room, {
      type: "game_over",
      data: room.gameOverData,
    });

    setTimeout(() => this.cleanup(room), 5000);
  }

  onConnect(
    userId: string,
    socket: WebSocket,
    playerName: string,
    isGuest: boolean,
  ) {
    const key = this.sessionKey(userId, isGuest);
    const session = this.getOrCreateUser(userId, playerName, isGuest);
    session.sockets.add(socket);

    if (!session.roomCode) return;
    const room = this.rooms.get(session.roomCode);
    if (!room) return;

    const forfeitTimer = room.forfeitTimers.get(key);
    if (forfeitTimer) {
      clearTimeout(forfeitTimer);
      room.forfeitTimers.delete(key);
    }

    this.sendToSocket(socket, this.buildGameState(room));
    if (room.status === "COMPLETED" && room.gameOverData) {
      this.sendToSocket(socket, { type: "game_over", data: room.gameOverData });
    }
    const isX = this.playerKey(room.playerX) === key;
    const opponentKey = isX
      ? room.playerO
        ? this.playerKey(room.playerO)
        : null
      : this.playerKey(room.playerX);
    if (opponentKey)
      this.sendToUser(opponentKey, {
        type: "player_joined",
        data: { name: playerName, symbol: isX ? "X" : "O" },
      });
  }

  onDisconnect(userId: string, socket: WebSocket, isGuest: boolean) {
    const key = this.sessionKey(userId, isGuest);
    const session = this.users.get(key);
    if (!session) return;

    session.sockets.delete(socket);
    if (session.sockets.size > 0) return;

    this.cancelMatchmaking(userId, isGuest);

    if (!session.roomCode) {
      this.users.delete(key);
      return;
    }
    const room = this.rooms.get(session.roomCode);
    if (!room) {
      this.users.delete(key);
      return;
    }

    if (room.status === "WAITING") {
      this.cleanup(room);
      this.users.delete(key);
      return;
    }
    if (room.status !== "IN_PROGRESS") return;

    const isX = this.playerKey(room.playerX) === key;
    const opponentKey = isX
      ? room.playerO
        ? this.playerKey(room.playerO)
        : null
      : this.playerKey(room.playerX);
    if (opponentKey)
      this.sendToUser(opponentKey, {
        type: "player_left",
        data: {
          name: isX ? room.playerX.name : room.playerO!.name,
          reason: "disconnected",
        },
      });

    const forfeitTimer = setTimeout(async () => {
      room.forfeitTimers.delete(key);
      if (room.status === "IN_PROGRESS") await this.endGame(room, "FORFEIT", userId);
    }, DISCONNECT_GRACE_PERIOD_MS);
    room.forfeitTimers.set(key, forfeitTimer);
  }

  async handleJoinGame(
    socket: WebSocket,
    userId: string,
    playerName: string,
    isGuest: boolean,
    payload: unknown,
  ) {
    const parsed = joinGameSchema.safeParse(payload);
    if (!parsed.success) {
      this.sendToSocket(socket, {
        type: "error",
        data: { message: "Invalid join_game payload" },
      });
      return;
    }

    try {
      await this.joinGame(userId, playerName, isGuest, parsed.data.roomCode);
    } catch (e: unknown) {
      this.sendToSocket(socket, {
        type: "error",
        data: {
          message: e instanceof Error ? e.message : "Failed to join game",
        },
      });
    }
  }

  async handleFindMatch(
    socket: WebSocket,
    userId: string,
    playerName: string,
    isGuest: boolean,
    payload: unknown,
  ) {
    const parsed = findMatchSchema.safeParse(payload);
    if (!parsed.success) {
      this.sendToSocket(socket, {
        type: "error",
        data: { message: "Invalid find_match payload" },
      });
      return;
    }

    try {
      await this.findMatch(
        userId,
        playerName,
        isGuest,
        parsed.data.mode ?? "CLASSIC",
      );
    } catch (e: unknown) {
      this.sendToSocket(socket, {
        type: "error",
        data: {
          message: e instanceof Error ? e.message : "Matchmaking failed",
        },
      });
    }
  }

  async handleMakeMove(
    socket: WebSocket,
    userId: string,
    isGuest: boolean,
    payload: unknown,
  ) {
    const parsed = makeMoveSchema.safeParse(payload);
    if (!parsed.success) {
      this.sendToSocket(socket, {
        type: "error",
        data: { message: "Invalid make_move payload" },
      });
      return;
    }

    try {
      await this.makeMove(userId, isGuest, parsed.data.position);
    } catch (e: unknown) {
      this.sendToSocket(socket, {
        type: "error",
        data: {
          message: e instanceof Error ? e.message : "Failed to make move",
        },
      });
    }
  }

  async handleLeaveGame(userId: string, isGuest: boolean) {
    this.cancelMatchmaking(userId, isGuest);

    const session = this.users.get(this.sessionKey(userId, isGuest));
    if (!session?.roomCode) return;
    const room = this.rooms.get(session.roomCode);
    if (!room) return;

    if (room.status === "IN_PROGRESS") await this.endGame(room, "FORFEIT", userId);
    else this.cleanup(room);
  }
}

export default new Game();
