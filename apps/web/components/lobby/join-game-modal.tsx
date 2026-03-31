"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "../../hooks/use-game";

export function JoinGameModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { joinGame, error, gameState } = useGame();
  const [code, setCode] = useState("");
  const [waiting, setWaiting] = useState(false);

  // If we got a game_state back, the join succeeded — navigate
  useEffect(() => {
    if (waiting && gameState) {
      onClose();
      router.push(`/game/${gameState.roomCode}`);
    }
  }, [waiting, gameState, onClose, router]);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      setWaiting(true);
      joinGame(code.trim().toUpperCase());
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl glass-strong p-6">
        <h2 className="text-lg font-bold text-white mb-4">Join Game</h2>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm text-white/40 mb-1">Room Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setWaiting(false); }}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="w-full rounded-xl glass-input px-4 py-2.5 text-center text-lg font-mono tracking-widest text-white uppercase focus:outline-none placeholder:text-white/20"
            />
          </div>

          {waiting && error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl glass glass-hover py-2.5 text-sm text-white/40 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.trim().length < 1 || (waiting && !error)}
              className="flex-1 rounded-xl btn-glow-purple py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {waiting && !error ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
