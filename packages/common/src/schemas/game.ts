import { z } from "zod";

export const createGameSchema = z.object({
  mode: z.enum(["CLASSIC", "TIMED"]),
});

export const joinGameSchema = z.object({
  roomCode: z.string(),
});

export const findMatchSchema = z.object({
  mode: z.enum(["CLASSIC", "TIMED"]).optional(),
});

export const makeMoveSchema = z.object({
  position: z.number().int().min(0).max(8),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
export type FindMatchInput = z.infer<typeof findMatchSchema>;
export type MakeMoveInput = z.infer<typeof makeMoveSchema>;
