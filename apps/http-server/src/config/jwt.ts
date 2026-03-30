import { SignJWT, jwtVerify } from "jose";
import type { AuthTokenPayload } from "@repo/common/types/auth";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me");

export async function signJwt(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJwt(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}
