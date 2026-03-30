"use client";

import type { GameState, GameResult } from "@repo/common/types/game";

interface GameStatusProps {
  gameState: GameState | null;
  mySymbol: "X" | "O" | null;
  gameOver: { result: GameResult; winnerId: string | null } | null;
  userId: string;
  opponentLeft: boolean;
}

function resultLabel(result: GameResult, iWon: boolean): string {
  if (result === "DRAW") return "It's a Draw!";
  if (result === "FORFEIT") return iWon ? "Opponent left — You Win!" : "You left — You Lose!";
  if (result === "TIMEOUT") return iWon ? "Opponent ran out of time — You Win!" : "Time's up — You Lose!";
  return iWon ? "You Won!" : "You Lost!";
}

export function GameStatus({ gameState, mySymbol, gameOver, userId, opponentLeft }: GameStatusProps) {
  if (gameOver) {
    const { result, winnerId } = gameOver;
    const iWon = winnerId === userId;
    const label = resultLabel(result, iWon);
    const color = result === "DRAW" ? "text-yellow-400" : iWon ? "text-emerald-400" : "text-red-400";
    return <p className={`text-xl font-bold ${color}`}>{label}</p>;
  }

  if (opponentLeft) {
    return <p className="text-lg text-orange-400">Opponent disconnected, waiting...</p>;
  }

  if (!gameState) {
    return <p className="text-lg text-gray-400">Waiting for opponent...</p>;
  }

  if (gameState.status === "WAITING") {
    return <p className="text-lg text-gray-400">Waiting for opponent to join...</p>;
  }

  if (!mySymbol) {
    return <p className="text-lg text-gray-400">Joining game...</p>;
  }

  const isMyTurn = gameState.currentTurn === mySymbol;
  return (
    <p className={`text-lg font-medium ${isMyTurn ? "text-emerald-400" : "text-gray-400"}`}>
      {isMyTurn ? "Your turn" : "Opponent's turn"}
    </p>
  );
}
