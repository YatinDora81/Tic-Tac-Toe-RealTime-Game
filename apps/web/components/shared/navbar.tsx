"use client";

import Link from "next/link";
import { useAuth } from "../../hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-white">
          Tic-Tac-Toe
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            Leaderboard
          </Link>
          {user && (
            <>
              <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">
                History
              </Link>
              <span className="text-sm text-gray-500">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
