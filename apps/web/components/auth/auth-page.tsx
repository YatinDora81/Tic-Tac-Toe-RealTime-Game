"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { GuestForm } from "./guest-form";

type View = "login" | "signup" | "guest";

export function AuthPage() {
  const [view, setView] = useState<View>("login");

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-12 relative overflow-hidden">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-3 gap-6 p-16 h-full w-full max-w-md mx-auto">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border-2 border-white/30 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="grid grid-cols-3 gap-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">X</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-white/40">O</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">X</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-white/40" />
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">O</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-white/40" />
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-white/40">O</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-white/40" />
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">X</span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Tic-Tac-Toe</h1>
          <p className="text-lg text-white/70 max-w-sm">
            Real-time multiplayer. Matchmaking. Leaderboards. Challenge players worldwide.
          </p>
          <div className="mt-10 flex gap-6 justify-center text-sm text-white/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-white/90">30s</p>
              <p>Timed Mode</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white/90">ELO</p>
              <p>Rating System</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white/90">Live</p>
              <p>Multiplayer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — forms */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 bg-gray-950">
        {/* Mobile branding */}
        <div className="lg:hidden mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-1">Tic-Tac-Toe</h1>
          <p className="text-sm text-gray-500">Real-time multiplayer</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Tab selector */}
          <div className="mb-8 flex rounded-xl bg-gray-900 p-1 border border-gray-800">
            {([
              { key: "login", label: "Sign In" },
              { key: "signup", label: "Sign Up" },
              { key: "guest", label: "Join as Guest" },
            ] as { key: View; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  view === key
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form content */}
          <div className="rounded-2xl bg-gray-900/50 border border-gray-800/50 p-6 backdrop-blur-sm">
            {view === "login" && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Welcome back</h2>
                  <p className="text-sm text-gray-500 mt-1">Sign in to continue playing</p>
                </div>
                <LoginForm />
                <p className="mt-5 text-center text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setView("signup")} className="text-blue-500 hover:text-blue-400 font-medium">
                    Sign up
                  </button>
                </p>
              </>
            )}

            {view === "signup" && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Create account</h2>
                  <p className="text-sm text-gray-500 mt-1">Join and track your stats on the leaderboard</p>
                </div>
                <SignupForm />
                <p className="mt-5 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button onClick={() => setView("login")} className="text-blue-500 hover:text-blue-400 font-medium">
                    Sign in
                  </button>
                </p>
              </>
            )}

            {view === "guest" && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Play as guest</h2>
                  <p className="text-sm text-gray-500 mt-1">No account needed — just pick a name and play</p>
                </div>
                <GuestForm />
                <p className="mt-5 text-center text-sm text-gray-600">
                  Want to track your progress?{" "}
                  <button onClick={() => setView("signup")} className="text-blue-500 hover:text-blue-400 font-medium">
                    Create an account
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
