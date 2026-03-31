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
    return (
      <div className="text-center text-white/30 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-indigo-400 mx-auto mb-3" />
        Loading leaderboard...
      </div>
    );
  }

  if (entries.length === 0) {
    return <div className="text-center text-white/30 py-12">No players yet</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.06] text-sm text-white/30">
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
            <tr key={entry.userId} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
              <td className="py-3 px-4">
                <span className={`font-bold ${
                  entry.rank === 1 ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" :
                  entry.rank === 2 ? "text-gray-300" :
                  entry.rank === 3 ? "text-orange-400" :
                  "text-white/25"
                }`}>
                  {entry.rank}
                </span>
              </td>
              <td className="py-3 px-4 font-medium text-white">{entry.name}</td>
              <td className="py-3 px-4 text-right font-mono text-emerald-400">{entry.rating}</td>
              <td className="py-3 px-4 text-right text-sm text-white/60">
                <span className="text-emerald-400">{entry.wins}</span>
                {" / "}
                <span className="text-rose-400">{entry.losses}</span>
                {" / "}
                <span className="text-white/30">{entry.draws}</span>
              </td>
              <td className="py-3 px-4 text-right text-sm">
                <span className="text-amber-400">{entry.currentStreak}</span>
                <span className="text-white/15"> / {entry.maxStreak}</span>
              </td>
              <td className="py-3 px-4 text-right text-sm text-white/30">{entry.gamesPlayed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
