import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  validatePasswordStrength,
  signToken,
  checkAuthRateLimit,
  getClientIp,
} from "@/lib/auth";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import crypto from "crypto";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuthRateLimit(`register:${getClientIp(request)}`, 5)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors.join(". ") },
        { status: 400 },
      );
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const sessionId = crypto.randomUUID();

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
      sessionId,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          avatar: newUser.avatar,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
