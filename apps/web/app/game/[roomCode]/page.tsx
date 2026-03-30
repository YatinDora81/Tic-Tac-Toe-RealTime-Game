"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/use-auth";
import { useSocket } from "../../../hooks/use-socket";
import { useGame } from "../../../hooks/use-game";
import { Navbar } from "../../../components/shared/navbar";
import { GameBoard } from "../../../components/game/game-board";
import { GameStatus } from "../../../components/game/game-status";
import { GameTimer } from "../../../components/game/game-timer";
import { PlayerInfo } from "../../../components/game/player-info";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { connect, isConnected } = useSocket();
  const {
    gameState,
    roomCode,
    mySymbol,
    gameOver,
    secondsLeft,
    error,
    opponentLeft,
    makeMove,
    leaveGame,
    joinGame,
  } = useGame();

  const pageRoomCode = params.roomCode as string;
  const joinSentRef = useRef(false);

  // Connect if not already connected
  useEffect(() => {
    if (!isConnected && user) {
      connect();
    }
  }, [isConnected, user, connect]);

  // Send join_game when connected — this handles all flows:
  // - Create Room: creator joins their own room for the first time via WS
  // - Join Room: second player joins with the room code
  // - Play Random: both players navigate here after match, each sends join_game
  // - Page refresh / URL paste: reconnect to existing game
  // The server handles duplicates gracefully (creator rejoining just gets game state back)
  useEffect(() => {
    if (isConnected && pageRoomCode && !joinSentRef.current) {
      joinSentRef.current = true;
      joinGame(pageRoomCode);
    }
  }, [isConnected, pageRoomCode, joinGame]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (!user) {
    return null;
  }

  const isMyTurn = mySymbol ? gameState?.currentTurn === mySymbol : false;
  const isGameActive = gameState?.status === "IN_PROGRESS";
  const boardData = gameOver?.board ?? gameState?.board ?? [-1, -1, -1, -1, -1, -1, -1, -1, -1];
  const myStats = mySymbol === "X" ? gameOver?.stats.playerX : mySymbol === "O" ? gameOver?.stats.playerO : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-8">
        {/* Room code display */}
        <div className="mb-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Room Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest text-gray-300">{pageRoomCode}</p>
        </div>

        {/* Player info */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {gameState?.playerX && (
            <PlayerInfo
              name={gameState.playerX.name}
              symbol="X"
              isCurrentTurn={gameState.currentTurn === "X" && isGameActive}
              isMe={gameState.playerX.userId === user.id}
            />
          )}
          {gameState?.playerO && (
            <PlayerInfo
              name={gameState.playerO.name}
              symbol="O"
              isCurrentTurn={gameState.currentTurn === "O" && isGameActive}
              isMe={gameState.playerO.userId === user.id}
            />
          )}
        </div>

        {/* Timer */}
        {gameState?.mode === "TIMED" && isGameActive && (
          <div className="mb-4 flex justify-center">
            <GameTimer secondsLeft={secondsLeft} />
          </div>
        )}

        {/* Game status */}
        <div className="mb-6 text-center">
          <GameStatus
            gameState={gameState}
            mySymbol={mySymbol}
            gameOver={gameOver ? { result: gameOver.result, winnerId: gameOver.winnerId } : null}
            userId={user.id}
            opponentLeft={opponentLeft}
          />
        </div>

        {/* Board */}
        <div className="mb-6">
          <GameBoard
            board={boardData}
            onMove={makeMove}
            disabled={!isMyTurn || !isGameActive || !!gameOver}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="mb-4 text-center text-sm text-red-400">{error}</p>
        )}

        {/* Game over stats */}
        {gameOver && myStats && (
          <div className="mb-6 rounded-xl bg-gray-900 p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Updated Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Your Rating</p>
                <p className="font-mono text-lg text-emerald-400">{myStats.rating}</p>
              </div>
              <div>
                <p className="text-gray-500">Win Streak</p>
                <p className="font-mono text-lg text-orange-400">{myStats.currentStreak}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              leaveGame();
              router.push("/");
            }}
            className="flex-1 rounded-lg bg-gray-800 py-3 font-medium text-gray-300 hover:text-white transition-colors"
          >
            {gameOver ? "Back to Lobby" : "Leave Game"}
          </button>
        </div>
      </main>
    </div>
  );
}
