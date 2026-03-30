import type { Request, Response } from "express";
import { signUpSchema, signInSchema, anonymousSchema } from "@repo/common/schemas/auth";
import authService from "@services/auth.service";

class AuthController {
  private setCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = signUpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
        return;
      }

      const { name, email, password } = parsed.data;
      const { user, token } = await authService.register(name, email, password);

      this.setCookie(res, token);
      res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email, isGuest: false },
        token,
      });
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Signup failed" });
    }
  };

  signin = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = signInSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
        return;
      }

      const { email, password } = parsed.data;
      const { user, token } = await authService.authenticate(email, password);

      this.setCookie(res, token);
      res.status(200).json({
        user: { id: user.id, name: user.name, email: user.email, isGuest: false },
        token,
      });
    } catch (e: unknown) {
      res.status(401).json({ error: e instanceof Error ? e.message : "Sign in failed" });
    }
  };

  anonymous = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = anonymousSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
        return;
      }

      const { name } = parsed.data;
      const { guest, token } = await authService.createGuest(name);

      this.setCookie(res, token);
      res.status(201).json({
        user: { id: guest.id, name: guest.name, email: null, isGuest: true },
        token,
      });
    } catch (e: unknown) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Failed to create session" });
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, isGuest } = req.user!;

      if (isGuest) {
        const guest = await authService.getGuestById(id);
        if (!guest) { res.status(404).json({ error: "Guest not found" }); return; }
        res.status(200).json({ id: guest.id, name: guest.name, email: null, isGuest: true });
        return;
      }

      const user = await authService.getUserById(id);
      if (!user) { res.status(404).json({ error: "User not found" }); return; }
      res.status(200).json({ id: user.id, name: user.name, email: user.email, isGuest: false, stats: user.stats });
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to get user" });
    }
  };

  signout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("authToken", { path: "/" });
    res.status(200).json({ message: "Signed out" });
  };
}

export default new AuthController();
