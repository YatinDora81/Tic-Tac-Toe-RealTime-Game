"use client";

interface PlayerInfoProps {
  name: string;
  symbol: "X" | "O";
  isCurrentTurn: boolean;
  isMe: boolean;
}

export function PlayerInfo({ name, symbol, isCurrentTurn, isMe }: PlayerInfoProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
      isCurrentTurn
        ? "glass-strong ring-1 ring-emerald-500/30 animate-pulse-ring"
        : "glass"
    }`}>
      <span className={`text-2xl font-bold ${
        symbol === "X"
          ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.4)]"
          : "text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.4)]"
      }`}>
        {symbol}
      </span>
      <div>
        <p className="text-sm font-medium text-white">
          {name} {isMe && <span className="text-white/25">(you)</span>}
        </p>
        {isCurrentTurn && (
          <p className="text-xs text-emerald-400/80">Playing...</p>
        )}
      </div>
    </div>
  );
}
