import { Router } from "express";
import gameController from "@controllers/game.controller";
import { requireAuth } from "@middleware/auth";

const router: Router = Router();

router.get("/active", requireAuth, gameController.getActive);
router.post("/create", requireAuth, gameController.createRoom);
router.get("/history", requireAuth, gameController.history);
router.get("/:id", requireAuth, gameController.getById);

export default router;
