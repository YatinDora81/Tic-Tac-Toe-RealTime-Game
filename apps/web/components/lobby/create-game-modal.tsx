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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 border border-gray-800">
        <h2 className="text-lg font-bold text-white mb-4">Create Game</h2>

        <div className="space-y-3 mb-6">
          <label className="block text-sm text-gray-400">Game Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("CLASSIC")}
              className={`rounded-lg py-3 text-sm font-medium transition-colors border ${
                mode === "CLASSIC"
                  ? "border-blue-500 bg-blue-600/20 text-blue-400"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setMode("TIMED")}
              className={`rounded-lg py-3 text-sm font-medium transition-colors border ${
                mode === "TIMED"
                  ? "border-orange-500 bg-orange-600/20 text-orange-400"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
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
            className="flex-1 rounded-lg bg-gray-800 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
