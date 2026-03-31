"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useSocket } from "./use-socket";
import { useAuth } from "./use-auth";
import type { GameState, GameResult, PlayerStatsInfo } from "@repo/common/types/game";
import type { WSServerMessage } from "@repo/common/types/ws";

interface GameOverData {
  result: GameResult;
  winnerId: string | null;
  board: number[];
  stats: { playerX: PlayerStatsInfo | null; playerO: PlayerStatsInfo | null };
}

interface GameContextValue {
  gameState: GameState | null;
  roomCode: string | null;
  mySymbol: "X" | "O" | null;
  gameOver: GameOverData | null;
  matchmaking: boolean;
  secondsLeft: number | null;
  error: string | null;
  opponentLeft: boolean;
  isConnected: boolean;
  setRoomAndSymbol: (roomCode: string, symbol: "X" | "O") => void;
  joinGame: (code: string) => void;
  autoMatch: (mode?: "CLASSIC" | "TIMED") => void;
  makeMove: (position: number) => void;
  leaveGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { sendMessage, onMessage, isConnected } = useSocket();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [mySymbol, setMySymbol] = useState<"X" | "O" | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [matchmaking, setMatchmaking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const prevUserIdRef = useRef(user?.id);

  // Clear all game state when user changes (logout / switch account)
  useEffect(() => {
    if (prevUserIdRef.current !== user?.id) {
      prevUserIdRef.current = user?.id;
      setGameState(null);
      setRoomCode(null);
      setMySymbol(null);
      setGameOver(null);
      setMatchmaking(false);
      setSecondsLeft(null);
      setError(null);
      setOpponentLeft(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = onMessage((message: WSServerMessage) => {
      switch (message.type) {
        case "game_created":
          setRoomCode(message.data.roomCode);
          setMySymbol(message.data.symbol);
          setMatchmaking(false);
          setGameOver(null);
          setOpponentLeft(false);
          setError(null);
          break;

        case "game_state": {
          const state = message.data;
          setGameState(state);
          setRoomCode((prev) => prev ?? state.roomCode ?? null);
          // Derive mySymbol from game_state (always re-derive to avoid stale symbol from previous game)
          if (user) {
            setMySymbol((prev) => {
              if (state.playerX?.userId === user.id) return "X";
              if (state.playerO?.userId === user.id) return "O";
              return prev;
            });
          }
          setError(null);
          break;
        }

        case "player_joined":
          setOpponentLeft(false);
          break;

        case "player_left":
          setOpponentLeft(true);
          break;

        case "game_over":
          setGameOver(message.data);
          break;

        case "timer_update":
          setSecondsLeft(message.data.secondsLeft > 0 ? message.data.secondsLeft : 0);
          break;

        case "room_full":
          setError("Room is full");
          setMatchmaking(false);
          break;

        case "error":
          setError(message.data.message);
          setMatchmaking(false);
          break;
      }
    });

    return unsubscribe;
  }, [onMessage, user]);

  const setRoomAndSymbol = useCallback(
    (code: string, symbol: "X" | "O") => {
      setRoomCode(code);
      setMySymbol(symbol);
      setGameOver(null);
      setError(null);
    },
    [],
  );

  const joinGame = useCallback(
    (code: string) => {
      setGameOver(null);
      setError(null);
      sendMessage("join_game", { roomCode: code });
    },
    [sendMessage],
  );

  const autoMatch = useCallback(
    (mode: "CLASSIC" | "TIMED" = "CLASSIC") => {
      setGameOver(null);
      setError(null);
      setMatchmaking(true);
      sendMessage("find_match", { mode });
    },
    [sendMessage],
  );

  const makeMove = useCallback(
    (position: number) => {
      sendMessage("make_move", { position });
    },
    [sendMessage],
  );

  const leaveGame = useCallback(() => {
    sendMessage("leave_game", {});
    setGameState(null);
    setRoomCode(null);
    setMySymbol(null);
    setGameOver(null);
    setMatchmaking(false);
    setSecondsLeft(null);
    setError(null);
    setOpponentLeft(false);
  }, [sendMessage]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        roomCode,
        mySymbol,
        gameOver,
        matchmaking,
        secondsLeft,
        error,
        opponentLeft,
        isConnected,
        setRoomAndSymbol,
        joinGame,
        autoMatch,
        makeMove,
        leaveGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
