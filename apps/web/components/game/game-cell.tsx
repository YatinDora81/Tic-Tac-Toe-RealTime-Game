"use client";

interface GameCellProps {
  value: number; // -1=empty, 1=X, 0=O
  position: number;
  onClick: (position: number) => void;
  disabled: boolean;
  isWinCell: boolean;
}

export function GameCell({ value, position, onClick, disabled, isWinCell }: GameCellProps) {
  return (
    <button
      onClick={() => onClick(position)}
      disabled={disabled || value !== -1}
      className={`aspect-square flex items-center justify-center rounded-xl text-4xl sm:text-5xl font-bold transition-all duration-200 ${
        value === -1
          ? "bg-gray-800 hover:bg-gray-700 cursor-pointer"
          : "bg-gray-800/50"
      } ${isWinCell ? "ring-2 ring-yellow-400 bg-yellow-400/10" : ""} ${
        disabled && value === -1 ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {value === 1 && <span className="text-blue-400">X</span>}
      {value === 0 && <span className="text-red-400">O</span>}
    </button>
  );
}
