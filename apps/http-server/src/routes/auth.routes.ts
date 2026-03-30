import { Router } from "express";
import authController from "@controllers/auth.controller";
import { requireAuth } from "@middleware/auth";

const router: Router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/anonymous", authController.anonymous);
router.get("/me", requireAuth, authController.me);
router.post("/signout", authController.signout);

export default router;
