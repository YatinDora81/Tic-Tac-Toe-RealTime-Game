"use client";

import { Navbar } from "../../components/shared/navbar";
import { LeaderboardTable } from "../../components/leaderboard/leaderboard-table";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <LeaderboardTable />
        </div>
      </main>
    </div>
  );
}
