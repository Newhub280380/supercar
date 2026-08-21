import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, cosmetologistProfiles, clientPersonalInfos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withSession } from "@/lib/api/handlers";
import { notFound } from "@/lib/api/response";
import { toUserProfile } from "@/lib/auth/serialize";

export const GET = withSession("Fetch current user error", async (session) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.sub),
  });

  if (!user) {
    return notFound("User not found");
  }

  const responseData: Record<string, unknown> = toUserProfile(user);

  if (user.role === "cosmetologist") {
    const profile = await db.query.cosmetologistProfiles.findFirst({
      where: eq(cosmetologistProfiles.userId, user.id),
    });
    responseData.cosmetologistProfile = profile || null;
  }

  if (user.role === "client") {
    const personalInfo = await db.query.clientPersonalInfos.findFirst({
      where: eq(clientPersonalInfos.userId, user.id),
    });
    responseData.clientPersonalInfo = personalInfo || null;
  }

  return NextResponse.json(responseData);
});
