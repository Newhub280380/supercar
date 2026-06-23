import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, cosmetologistProfiles, clientPersonalInfos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const response: Record<string, unknown> = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      phone: updatedUser.phone,
      settings: updatedUser.settings,
    };

    if (session.role === "cosmetologist" && body.cosmetologistProfile) {
      const { specializations, experienceYears, bio, workingHours, isPublic } =
        body.cosmetologistProfile;

      const existing = await db.query.cosmetologistProfiles.findFirst({
        where: eq(cosmetologistProfiles.userId, session.sub),
      });

      const profileData: Record<string, unknown> = { updatedAt: new Date() };
      if (specializations !== undefined) profileData.specializations = specializations;
      if (experienceYears !== undefined) profileData.experienceYears = experienceYears;
      if (bio !== undefined) profileData.bio = bio;
      if (workingHours !== undefined) profileData.workingHours = workingHours;
      if (isPublic !== undefined) profileData.isPublic = isPublic;

      let profile;
      if (existing) {
        [profile] = await db
          .update(cosmetologistProfiles)
          .set(profileData)
          .where(eq(cosmetologistProfiles.userId, session.sub))
          .returning();
      } else {
        [profile] = await db
          .insert(cosmetologistProfiles)
          .values({ userId: session.sub, ...profileData })
          .returning();
      }
      response.cosmetologistProfile = profile;
    }

    if (session.role === "client" && body.clientPersonalInfo) {
      const { skinType, allergies, preferences, medicalConditions } =
        body.clientPersonalInfo;

      const existing = await db.query.clientPersonalInfos.findFirst({
        where: eq(clientPersonalInfos.userId, session.sub),
      });

      const infoData: Record<string, unknown> = { updatedAt: new Date() };
      if (skinType !== undefined) infoData.skinType = skinType;
      if (allergies !== undefined) infoData.allergies = allergies;
      if (preferences !== undefined) infoData.preferences = preferences;
      if (medicalConditions !== undefined) infoData.medicalConditions = medicalConditions;

      let info;
      if (existing) {
        [info] = await db
          .update(clientPersonalInfos)
          .set(infoData)
          .where(eq(clientPersonalInfos.userId, session.sub))
          .returning();
      } else {
        [info] = await db
          .insert(clientPersonalInfos)
          .values({ userId: session.sub, ...infoData })
          .returning();
      }
      response.clientPersonalInfo = info;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
