import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withSession } from "@/lib/api/handlers";
import { badRequest, notFound } from "@/lib/api/response";
import { setAuthCookie } from "@/lib/auth/cookies";
import { signToken } from "@/lib/auth/jwt";
import { toAuthUser } from "@/lib/auth/serialize";

const SELF_SELECTABLE_ROLES = ["cosmetologist", "client"];

export const PATCH = withSession(
  "Role update error",
  async (session, request) => {
    const body = await request.json();
    const { role } = body;

    if (!role || !SELF_SELECTABLE_ROLES.includes(role)) {
      return badRequest("Invalid role. Must be: cosmetologist or client");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.sub),
    });

    if (!user) {
      return notFound("User not found");
    }

    if (user.role !== "client") {
      return badRequest("Role can only be selected once during registration");
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, session.sub))
      .returning();

    // The session cookie still carries the pre-selection role, so role-gated pages
    // would stay closed until the next sign-in.
    await setAuthCookie(
      await signToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        sessionId: session.jti,
      }),
    );

    return NextResponse.json(toAuthUser(updatedUser));
  },
);
