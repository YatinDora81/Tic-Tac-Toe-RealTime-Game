import type { Request, Response } from "express";
import { createGameSchema } from "@repo/common/schemas/game";
import { generateRoomCode } from "@repo/common/utils/room-code";
import gameService from "@services/game.service";

class GameController {
  getActive = async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await gameService.getActiveGame(req.user!.id, req.user!.isGuest);
      if (!game) {
        res.status(200).json(null);
        return;
      }
      res.status(200).json(game);
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to check active game" });
    }
  };

  createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = createGameSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
        return;
      }

      const roomCode = generateRoomCode();
      const game = await gameService.createRoom(roomCode, parsed.data.mode, req.user!.id, req.user!.isGuest);

      res.status(201).json({
        id: game.id,
        roomCode: game.roomCode,
        mode: game.mode,
        status: game.status,
      });
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to create game" });
    }
  };

  history = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string ?? "20", 10), 50);
      const offset = parseInt(req.query.offset as string ?? "0", 10);

      const data = await gameService.getHistory(req.user!.id, req.user!.isGuest, limit, offset);
      res.status(200).json(data);
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to fetch game history" });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!id) { res.status(400).json({ error: "Game ID required" }); return; }

      const game = await gameService.getDetails(id);
      if (!game) { res.status(404).json({ error: "Game not found" }); return; }

      res.status(200).json(game);
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to fetch game" });
    }
  };
}

export default new GameController();
