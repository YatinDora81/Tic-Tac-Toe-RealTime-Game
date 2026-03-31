"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../../hooks/use-socket";
import { useGame } from "../../hooks/use-game";
import { getActiveGame } from "../../lib/api";
import { CreateGameModal } from "./create-game-modal";
import { JoinGameModal } from "./join-game-modal";
import { MatchmakingOverlay } from "./matchmaking-overlay";

interface ActiveGame {
  id: string;
  roomCode: string;
  mode: string;
  status: string;
}

export function PlayOptions() {
  const router = useRouter();
  const { isConnected } = useSocket();
  const { autoMatch, roomCode, matchmaking, leaveGame, setRoomAndSymbol } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [loadingActive, setLoadingActive] = useState(true);

  // Check for active game on mount
  useEffect(() => {
    getActiveGame()
      .then((game) => setActiveGame(game))
      .catch(() => {})
      .finally(() => setLoadingActive(false));
  }, []);

  // Navigate to game when room code is set (from matchmaking)
  useEffect(() => {
    if (roomCode && !matchmaking) {
      router.push(`/game/${roomCode}`);
    }
  }, [roomCode, matchmaking, router]);

  function handleResume() {
    if (!activeGame) return;
    router.push(`/game/${activeGame.roomCode}`);
  }

  const disabled = !isConnected;

  return (
    <div className="space-y-4">
      {/* Connection status */}
      {!isConnected && (
        <div className="glass rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />
            <p className="text-sm text-white/40">Connecting to server...</p>
          </div>
        </div>
      )}

      {/* Resume Game Banner */}
      {!loadingActive && activeGame && (
        <div className="rounded-xl glass border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-400">You have an active game</p>
              <p className="text-xs text-amber-500/60 mt-0.5">
                Room {activeGame.roomCode} &middot; {activeGame.mode} &middot; {activeGame.status === "WAITING" ? "Waiting for opponent" : "In progress"}
              </p>
            </div>
            <button
              onClick={handleResume}
              className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/30 transition-all"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowCreate(true)}
          disabled={disabled}
          className="rounded-xl btn-glow-blue py-4 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          Create Room
        </button>
        <button
          onClick={() => setShowJoin(true)}
          disabled={disabled}
          className="rounded-xl btn-glow-purple py-4 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          Join Room
        </button>
      </div>

      <button
        onClick={() => autoMatch("CLASSIC")}
        disabled={disabled}
        className="w-full rounded-xl glass glass-hover py-4 font-medium text-white/70 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Play Random Opponent
      </button>

      {showCreate && <CreateGameModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinGameModal onClose={() => setShowJoin(false)} />}
      {matchmaking && <MatchmakingOverlay onCancel={leaveGame} />}
    </div>
  );
}
