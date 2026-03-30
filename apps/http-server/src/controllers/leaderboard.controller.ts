import type { Request, Response } from "express";
import leaderboardService from "@services/leaderboard.service";

class LeaderboardController {

  getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string ?? "50", 10), 100);
      const offset = parseInt(req.query.offset as string ?? "0", 10);

      const data = await leaderboardService.getLeaderboard(limit, offset);
      res.status(200).json(data);
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to fetch leaderboard" });
    }
  };
}

export default new LeaderboardController();
