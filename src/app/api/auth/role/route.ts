import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { VALID_ROLES } from "@/lib/auth";
import { withSession } from "@/lib/api/handlers";
import { badRequest, notFound } from "@/lib/api/response";
import { toAuthUser } from "@/lib/auth/serialize";

export const PATCH = withSession("Role update error", async (session, request) => {
  const body = await request.json();
  const { role } = body;

  if (!role || !VALID_ROLES.includes(role)) {
    return badRequest("Invalid role. Must be: admin, cosmetologist, or client");
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

  return NextResponse.json(toAuthUser(updatedUser));
});
