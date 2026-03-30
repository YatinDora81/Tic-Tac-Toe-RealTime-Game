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
  const { connect, isConnected } = useSocket();
  const { autoMatch, roomCode, matchmaking, leaveGame, setRoomAndSymbol } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [loadingActive, setLoadingActive] = useState(true);
  const pendingAction = useRef<(() => void) | null>(null);

  // Check for active game on mount
  useEffect(() => {
    getActiveGame()
      .then((game) => setActiveGame(game))
      .catch(() => {})
      .finally(() => setLoadingActive(false));
  }, []);

  // Execute pending action once connected
  useEffect(() => {
    if (isConnected && pendingAction.current) {
      pendingAction.current();
      pendingAction.current = null;
    }
  }, [isConnected]);

  function doWhenConnected(action: () => void) {
    if (isConnected) {
      action();
    } else {
      pendingAction.current = action;
      connect();
    }
  }

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

  return (
    <div className="space-y-4">
      {/* Resume Game Banner */}
      {!loadingActive && activeGame && (
        <div className="rounded-xl border border-yellow-600/30 bg-yellow-600/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">You have an active game</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Room {activeGame.roomCode} &middot; {activeGame.mode} &middot; {activeGame.status === "WAITING" ? "Waiting for opponent" : "In progress"}
              </p>
            </div>
            <button
              onClick={handleResume}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500 transition-all"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => doWhenConnected(() => setShowCreate(true))}
          className="rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Create Room
        </button>
        <button
          onClick={() => doWhenConnected(() => setShowJoin(true))}
          className="rounded-xl bg-purple-600 py-4 font-semibold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
        >
          Join Room
        </button>
      </div>

      <button
        onClick={() => doWhenConnected(() => autoMatch("CLASSIC"))}
        className="w-full rounded-xl border border-gray-700 bg-gray-900 py-4 font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
      >
        Play Random Opponent
      </button>

      {showCreate && <CreateGameModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinGameModal onClose={() => setShowJoin(false)} />}
      {matchmaking && <MatchmakingOverlay onCancel={leaveGame} />}
    </div>
  );
}
