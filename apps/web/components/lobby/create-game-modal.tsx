"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGameRoom } from "../../lib/api";
import { useGame } from "../../hooks/use-game";

export function CreateGameModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { setRoomAndSymbol } = useGame();
  const [mode, setMode] = useState<"CLASSIC" | "TIMED">("CLASSIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const game = await createGameRoom(mode);
      setRoomAndSymbol(game.roomCode, "X");
      router.push(`/game/${game.roomCode}`);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl glass-strong p-6">
        <h2 className="text-lg font-bold text-white mb-4">Create Game</h2>

        <div className="space-y-3 mb-6">
          <label className="block text-sm text-white/40">Game Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("CLASSIC")}
              className={`rounded-xl py-3 text-sm font-medium transition-all ${
                mode === "CLASSIC"
                  ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "glass glass-hover text-white/40 hover:text-white/70"
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setMode("TIMED")}
              className={`rounded-xl py-3 text-sm font-medium transition-all ${
                mode === "TIMED"
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "glass glass-hover text-white/40 hover:text-white/70"
              }`}
            >
              Timed (30s)
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl glass glass-hover py-2.5 text-sm text-white/40 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 rounded-xl btn-glow-blue py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
