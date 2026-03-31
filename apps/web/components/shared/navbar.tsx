"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-3xl px-4">
      <div className="glass-strong rounded-2xl px-5 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_18px_rgba(99,102,241,0.4)] transition-shadow">
            <span className="text-xs font-black text-white leading-none">#</span>
          </div>
          <span className="text-base font-bold text-white hidden sm:block">Tic-Tac-Toe</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink href="/leaderboard" active={pathname === "/leaderboard"}>
            Leaderboard
          </NavLink>
          {user && (
            <NavLink href="/history" active={pathname === "/history"}>
              History
            </NavLink>
          )}
        </div>

        {/* User section */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white/70 uppercase">{user.name.charAt(0)}</span>
              </div>
              <span className="text-sm text-white/40 font-medium">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs font-medium text-white/30 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
        active
          ? "bg-white/[0.08] text-white"
          : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
      }`}
    >
      {children}
    </Link>
  );
}
