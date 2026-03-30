import { WIN_CONDITIONS, BOARD_SIZE, EMPTY_CELL, SYMBOL_X, SYMBOL_O } from "../constants/game";
import type { Board, CellValue, PlayerSymbol } from "../types/game";

export interface WinResult {
  winner: PlayerSymbol | null;
  winLine: [number, number, number] | null;
}

export function checkWinner(board: Board): WinResult {
  for (const [a, b, c] of WIN_CONDITIONS) {
    const cellA = board[a];
    if (cellA !== EMPTY_CELL && cellA === board[b] && cellA === board[c]) {
      return {
        winner: cellA === SYMBOL_X ? "X" : "O",
        winLine: [a, b, c],
      };
    }
  }
  return { winner: null, winLine: null };
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== EMPTY_CELL);
}

export function isValidMove(board: Board, position: number): boolean {
  if (position < 0 || position >= BOARD_SIZE) return false;
  return board[position] === EMPTY_CELL;
}

export function applyMove(board: Board, position: number, symbol: PlayerSymbol): Board {
  const newBoard = [...board] as Board;
  newBoard[position] = symbol === "X" ? SYMBOL_X : SYMBOL_O;
  return newBoard;
}

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(EMPTY_CELL) as Board;
}

export function getNextTurn(currentTurn: PlayerSymbol): PlayerSymbol {
  return currentTurn === "X" ? "O" : "X";
}

export function symbolToCellValue(symbol: PlayerSymbol): CellValue {
  return symbol === "X" ? SYMBOL_X : SYMBOL_O;
}
