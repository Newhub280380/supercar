import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, cosmetologistProfiles, clientPersonalInfos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.sub),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const responseData: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
