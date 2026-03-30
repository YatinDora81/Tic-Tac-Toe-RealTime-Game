"use client";

import { useState } from "react";
import { useGame } from "../../hooks/use-game";

export function JoinGameModal({ onClose }: { onClose: () => void }) {
  const { joinGame } = useGame();
  const [code, setCode] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      joinGame(code.trim().toUpperCase());
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 border border-gray-800">
        <h2 className="text-lg font-bold text-white mb-4">Join Game</h2>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Room Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-center text-lg font-mono tracking-widest text-white uppercase border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-800 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.trim().length < 1}
              className="flex-1 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
