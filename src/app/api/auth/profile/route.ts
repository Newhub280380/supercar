import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, cosmetologistProfiles, clientPersonalInfos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withSession } from "@/lib/api/handlers";
import { toUserAccount } from "@/lib/auth/serialize";
import { pickDefined } from "@/lib/object";

const PROFILE_FIELDS = ["specializations", "experienceYears", "bio", "workingHours", "isPublic"] as const;
const PERSONAL_INFO_FIELDS = ["skinType", "allergies", "preferences", "medicalConditions"] as const;

export const PATCH = withSession("Profile update error", async (session, request) => {
  const body = await request.json();

  const { name, phone, avatar, settings } = body;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name?.trim() || null;
  if (phone !== undefined) updateData.phone = phone?.trim() || null;
  if (avatar !== undefined) updateData.avatar = avatar || null;
  if (settings !== undefined) updateData.settings = settings;

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.sub))
    .returning();

  const response: Record<string, unknown> = toUserAccount(updatedUser);

  if (session.role === "cosmetologist" && body.cosmetologistProfile) {
    const profileData = pickDefined(body.cosmetologistProfile, PROFILE_FIELDS);
    const [profile] = await db
      .insert(cosmetologistProfiles)
      .values({ userId: session.sub, ...profileData })
      .onConflictDoUpdate({
        target: cosmetologistProfiles.userId,
        set: { ...profileData, updatedAt: new Date() },
      })
      .returning();
    response.cosmetologistProfile = profile;
  }

  if (session.role === "client" && body.clientPersonalInfo) {
    const infoData = pickDefined(body.clientPersonalInfo, PERSONAL_INFO_FIELDS);
    const [info] = await db
      .insert(clientPersonalInfos)
      .values({ userId: session.sub, ...infoData })
      .onConflictDoUpdate({
        target: clientPersonalInfos.userId,
        set: { ...infoData, updatedAt: new Date() },
      })
      .returning();
    response.clientPersonalInfo = info;
  }

  return NextResponse.json(response);
});
