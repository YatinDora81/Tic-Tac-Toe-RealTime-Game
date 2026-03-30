import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "@config/jwt";
import type { AuthTokenPayload } from "@repo/common/types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyJwt(authHeader.slice(7));
    if (payload) { req.user = payload; next(); return; }
  }

  const token = req.cookies?.authToken;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload) { req.user = payload; next(); return; }
  }

  res.status(401).json({ error: "Unauthorized" });
}
