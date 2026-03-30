"use client";

import { useState, useEffect } from "react";
import { getLeaderboard } from "../../lib/api";
import type { LeaderboardEntry } from "@repo/common/types/game";

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading leaderboard...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center text-gray-400 py-12">No players yet</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-800 text-sm text-gray-400">
            <th className="py-3 px-4">#</th>
            <th className="py-3 px-4">Player</th>
            <th className="py-3 px-4 text-right">Rating</th>
            <th className="py-3 px-4 text-right">W/L/D</th>
            <th className="py-3 px-4 text-right">Streak</th>
            <th className="py-3 px-4 text-right">Games</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.userId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
              <td className="py-3 px-4">
                <span className={`font-bold ${
                  entry.rank === 1 ? "text-yellow-400" :
                  entry.rank === 2 ? "text-gray-300" :
                  entry.rank === 3 ? "text-orange-400" :
                  "text-gray-500"
                }`}>
                  {entry.rank}
                </span>
              </td>
              <td className="py-3 px-4 font-medium text-white">{entry.name}</td>
              <td className="py-3 px-4 text-right font-mono text-emerald-400">{entry.rating}</td>
              <td className="py-3 px-4 text-right text-sm text-gray-300">
                <span className="text-emerald-400">{entry.wins}</span>
                {" / "}
                <span className="text-red-400">{entry.losses}</span>
                {" / "}
                <span className="text-gray-400">{entry.draws}</span>
              </td>
              <td className="py-3 px-4 text-right text-sm">
                <span className="text-orange-400">{entry.currentStreak}</span>
                <span className="text-gray-600"> / {entry.maxStreak}</span>
              </td>
              <td className="py-3 px-4 text-right text-sm text-gray-400">{entry.gamesPlayed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
