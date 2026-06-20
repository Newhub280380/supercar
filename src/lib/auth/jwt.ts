import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { JWT_EXPIRES_IN, AUTH_COOKIE_NAME } from "./constants";
import type { Role } from "@/types";

interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: Role;
  jti: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
}): Promise<string> {
  return new SignJWT({
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
    jti: payload.sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export { AUTH_COOKIE_NAME };
export type { TokenPayload };
