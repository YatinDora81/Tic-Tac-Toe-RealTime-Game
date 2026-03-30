"use client";

interface PlayerInfoProps {
  name: string;
  symbol: "X" | "O";
  isCurrentTurn: boolean;
  isMe: boolean;
}

export function PlayerInfo({ name, symbol, isCurrentTurn, isMe }: PlayerInfoProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
      isCurrentTurn ? "bg-gray-800 ring-2 ring-emerald-500/50" : "bg-gray-900"
    }`}>
      <span className={`text-2xl font-bold ${symbol === "X" ? "text-blue-400" : "text-red-400"}`}>
        {symbol}
      </span>
      <div>
        <p className="text-sm font-medium text-white">
          {name} {isMe && <span className="text-gray-500">(you)</span>}
        </p>
        {isCurrentTurn && (
          <p className="text-xs text-emerald-400">Playing...</p>
        )}
      </div>
    </div>
  );
}
