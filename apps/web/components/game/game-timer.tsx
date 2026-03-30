"use client";

interface GameTimerProps {
  secondsLeft: number | null;
}

export function GameTimer({ secondsLeft }: GameTimerProps) {
  if (secondsLeft === null || secondsLeft < 0) return null;

  const isUrgent = secondsLeft <= 5;

  return (
    <div className={`flex items-center justify-center rounded-full w-16 h-16 border-4 ${
      isUrgent ? "border-red-500 text-red-400" : "border-gray-600 text-gray-300"
    } transition-colors`}>
      <span className={`text-xl font-bold ${isUrgent ? "animate-pulse" : ""}`}>
        {secondsLeft}
      </span>
    </div>
  );
}
