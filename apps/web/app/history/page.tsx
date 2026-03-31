"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";
import { Navbar } from "../../components/shared/navbar";
import { getGameHistory } from "../../lib/api";
import type { GameHistoryEntry } from "@repo/common/types/game";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }
    if (user) {
      getGameHistory()
        .then(setGames)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gradient">Game History</h1>

        {loading ? (
          <div className="text-center text-white/30 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-indigo-400 mx-auto mb-3" />
            Loading...
          </div>
        ) : games.length === 0 ? (
          <div className="text-center text-white/30 py-12 glass rounded-xl">No games played yet</div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => {
              const isX = game.playerX.userId === user.id;
              const opponent = isX ? game.playerO : game.playerX;
              const won = game.winnerId === user.id;
              const drew = game.result === "DRAW";

              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-xl glass glass-hover px-4 py-3 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      vs {opponent?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-white/25">
                      {game.mode} &middot; {new Date(game.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      drew ? "text-amber-400" : won ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {drew ? "Draw" : won ? "Won" : "Lost"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
