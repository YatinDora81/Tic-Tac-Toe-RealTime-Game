"use client";

interface GameCellProps {
  value: number; // -1=empty, 1=X, 0=O
  position: number;
  onClick: (position: number) => void;
  disabled: boolean;
  isWinCell: boolean;
  iWon: boolean | null;
}

export function GameCell({ value, position, onClick, disabled, isWinCell, iWon }: GameCellProps) {
  let winStyle = "";
  if (isWinCell) {
    winStyle = iWon
      ? "ring-2 ring-emerald-400/70 bg-emerald-400/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
      : "ring-2 ring-rose-400/70 bg-rose-400/10 shadow-[0_0_20px_rgba(244,63,94,0.25)]";
  }

  return (
    <button
      onClick={() => onClick(position)}
      disabled={disabled || value !== -1}
      className={`aspect-square flex items-center justify-center rounded-xl text-4xl sm:text-5xl font-bold transition-all duration-200 ${
        value === -1
          ? "glass glass-hover cursor-pointer"
          : "glass"
      } ${winStyle} ${
        disabled && value === -1 ? "cursor-not-allowed opacity-40" : ""
      }`}
    >
      {value === 1 && <span className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">X</span>}
      {value === 0 && <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">O</span>}
    </button>
  );
}
