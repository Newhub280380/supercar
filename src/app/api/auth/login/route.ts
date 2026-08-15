import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/auth/cookies";
import { toAuthUser } from "@/lib/auth/serialize";
import { badRequest, unauthorized, withErrorHandling } from "@/lib/api/response";
import crypto from "crypto";

export const POST = withErrorHandling("Login error", async (request: NextRequest) => {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });

  if (!user) {
    return unauthorized("Invalid email or password");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return unauthorized("Invalid email or password");
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: crypto.randomUUID(),
  });

  await setAuthCookie(token);

  return NextResponse.json({ user: toAuthUser(user) });
});
