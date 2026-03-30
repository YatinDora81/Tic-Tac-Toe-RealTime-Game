export type PlayerSymbol = "X" | "O";

export type CellValue = -1 | 0 | 1;

export type Board = CellValue[];

export type GameStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type GameMode = "CLASSIC" | "TIMED";

export type GameResult = "X_WIN" | "O_WIN" | "DRAW" | "FORFEIT" | "TIMEOUT";

export interface PlayerInfo {
  userId: string;
  name: string;
  symbol: PlayerSymbol;
  isGuest: boolean;
}

export interface GameState {
  roomCode: string;
  board: Board;
  currentTurn: PlayerSymbol;
  playerX: PlayerInfo | null;
  playerO: PlayerInfo | null;
  status: GameStatus;
  mode: GameMode;
  result: GameResult | null;
  moveCount: number;
}

export interface PlayerStatsInfo {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  maxStreak: number;
  rating: number;
  gamesPlayed: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
}

export interface GameHistoryEntry {
  id: string;
  roomCode: string;
  mode: GameMode;
  result: GameResult | null;
  playerX: { userId: string; name: string; isGuest: boolean };
  playerO: { userId: string; name: string; isGuest: boolean } | null;
  winnerId: string | null;
  completedAt: string | null;
  createdAt: string;
}
