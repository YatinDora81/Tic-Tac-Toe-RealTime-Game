"use client";

import { useMemo } from "react";
import { GameCell } from "./game-cell";
import { checkWinner } from "@repo/common/game-logic/board";
import type { Board } from "@repo/common/types/game";

interface GameBoardProps {
  board: number[];
  onMove: (position: number) => void;
  disabled: boolean;
  iWon: boolean | null; // true = won, false = lost, null = game not over
}

export function GameBoard({ board, onMove, disabled, iWon }: GameBoardProps) {
  const winResult = useMemo(() => checkWinner(board as Board), [board]);
  const winCells = new Set(winResult.winLine ?? []);

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {board.map((value, index) => (
        <GameCell
          key={index}
          value={value}
          position={index}
          onClick={onMove}
          disabled={disabled}
          isWinCell={winCells.has(index)}
          iWon={iWon}
        />
      ))}
    </div>
  );
}
