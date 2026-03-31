"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { GuestForm } from "./guest-form";

type View = "login" | "signup" | "guest";

export function AuthPage() {
  const [view, setView] = useState<View>("login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative">
      {/* Floating grid lines behind everything */}
      <div className="landing-grid" />

      {/* Hero Section */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-3 text-gradient-hero">
          Tic-Tac-Toe
        </h1>
        <p className="text-base sm:text-lg text-white/35 max-w-md mx-auto mb-6">
          Challenge players worldwide in real-time multiplayer matches with ELO rankings
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="feature-pill">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
            Live Multiplayer
          </span>
          <span className="feature-pill">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
            Ranked
          </span>
          <span className="feature-pill">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" />
            30s Timed Mode
          </span>
          <span className="feature-pill">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-2" />
            Matchmaking
          </span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm relative z-10">
        {/* Tab selector */}
        <div className="mb-4 flex rounded-2xl glass p-1.5 gap-1">
          {([
            { key: "login", label: "Sign In" },
            { key: "signup", label: "Sign Up" },
            { key: "guest", label: "Guest" },
          ] as { key: View; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
                view === key
                  ? "bg-white/[0.08] text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  : "text-white/25 hover:text-white/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl glass-strong p-6 auth-card-glow">
          {view === "login" && (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">Welcome back</h2>
                <p className="text-sm text-white/25 mt-0.5">Sign in to continue playing</p>
              </div>
              <LoginForm />
              <p className="mt-5 text-center text-sm text-white/20">
                Don&apos;t have an account?{" "}
                <button onClick={() => setView("signup")} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Sign up
                </button>
              </p>
            </>
          )}

          {view === "signup" && (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">Create account</h2>
                <p className="text-sm text-white/25 mt-0.5">Track your stats on the leaderboard</p>
              </div>
              <SignupForm />
              <p className="mt-5 text-center text-sm text-white/20">
                Already have an account?{" "}
                <button onClick={() => setView("login")} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </>
          )}

          {view === "guest" && (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">Play as guest</h2>
                <p className="text-sm text-white/25 mt-0.5">No account needed — just pick a name</p>
              </div>
              <GuestForm />
              <p className="mt-5 text-center text-sm text-white/20">
                Want to track progress?{" "}
                <button onClick={() => setView("signup")} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Create an account
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
