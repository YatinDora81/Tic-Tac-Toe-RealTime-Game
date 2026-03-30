import type { GameMode, GameResult, GameState, PlayerInfo, PlayerStatsInfo } from "./game";

export type WSClientMessage =
  | { type: "join_game"; payload: { roomCode: string } }
  | { type: "find_match"; payload: { mode?: GameMode } }
  | { type: "make_move"; payload: { position: number } }
  | { type: "leave_game"; payload: Record<string, never> };

export type WSServerMessage =
  | { type: "game_created"; data: { roomCode: string; mode: GameMode; symbol: "X" | "O" } }
  | { type: "game_state"; data: GameState }
  | { type: "player_joined"; data: { name: string; symbol: string } }
  | { type: "player_left"; data: { name: string; reason: string } }
  | { type: "game_over"; data: { result: GameResult; winnerId: string | null; board: number[]; stats: { playerX: PlayerStatsInfo | null; playerO: PlayerStatsInfo | null } } }
  | { type: "timer_update"; data: { secondsLeft: number } }
  | { type: "room_full"; data: { roomCode: string } }
  | { type: "error"; data: { message: string } };
