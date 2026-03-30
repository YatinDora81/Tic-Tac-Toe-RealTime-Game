import type { LeaderboardEntry, GameHistoryEntry, GameMode } from "./game";
import type { PlayerStatsInfo } from "./game";

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string | null;
    isGuest: boolean;
  };
  token: string;
}

export interface MeResponseUser {
  id: string;
  name: string;
  email: string;
  isGuest: false;
  stats: PlayerStatsInfo | null;
}

export interface MeResponseGuest {
  id: string;
  name: string;
  email: null;
  isGuest: true;
}

export type MeResponse = MeResponseUser | MeResponseGuest;

export interface CreateGameResponse {
  id: string;
  roomCode: string;
  mode: GameMode;
  status: string;
}

export type LeaderboardResponse = LeaderboardEntry[];

export type GameHistoryResponse = GameHistoryEntry[];

export interface GameDetailResponse {
  id: string;
  roomCode: string;
  status: string;
  mode: GameMode;
  result: string | null;
  players: {
    symbol: string;
    user: { id: string; name: string } | null;
    guest: { id: string; name: string } | null;
  }[];
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  moves: {
    id: number;
    position: number;
    symbol: string;
    moveNumber: number;
    createdAt: string;
  }[];
}

export interface ErrorResponse {
  error: string;
}
