import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, validatePasswordStrength, signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/auth/cookies";
import { toAuthUser } from "@/lib/auth/serialize";
import { badRequest, conflict, withErrorHandling } from "@/lib/api/response";
import crypto from "crypto";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST = withErrorHandling("Registration error", async (request: NextRequest) => {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  if (!isValidEmail(email)) {
    return badRequest("Invalid email format");
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return badRequest(passwordCheck.errors.join(". "));
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });

  if (existing) {
    return conflict("User with this email already exists");
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name?.trim() || null,
      role: "client",
    })
    .returning();

  const token = await signToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    sessionId: crypto.randomUUID(),
  });

  await setAuthCookie(token);

  return NextResponse.json({ user: toAuthUser(newUser) }, { status: 201 });
});
