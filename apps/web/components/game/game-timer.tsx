"use client";

interface GameTimerProps {
  secondsLeft: number | null;
}

export function GameTimer({ secondsLeft }: GameTimerProps) {
  if (secondsLeft === null || secondsLeft < 0) return null;

  const isUrgent = secondsLeft <= 5;

  return (
    <div className={`flex items-center justify-center rounded-full w-16 h-16 glass transition-all ${
      isUrgent
        ? "border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        : "text-white/60"
    }`}>
      <span className={`text-xl font-bold font-mono ${isUrgent ? "animate-pulse" : ""}`}>
        {secondsLeft}
      </span>
    </div>
  );
}
