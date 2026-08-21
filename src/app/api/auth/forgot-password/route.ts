import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PASSWORD_RESET_EXPIRES_MINUTES } from "@/lib/auth";
import { withRateLimit } from "@/lib/api/handlers";
import { isNonEmptyString } from "@/lib/api/request";
import { badRequest, withErrorHandling } from "@/lib/api/response";
import { getAppBaseUrl } from "@/lib/env";
import crypto from "crypto";

const GENERIC_RESPONSE = {
  message: "If the email exists, a reset link has been sent",
};

export const POST = withErrorHandling(
  "Forgot password error",
  withRateLimit("forgot-password", 5, async (request: NextRequest) => {
    const body = await request.json();
    const { email } = body;

    if (!isNonEmptyString(email)) {
      return badRequest("Email is required");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000,
    );

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // TODO: integrate email service (SendGrid/Mailgun) for production
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Password Reset] ${getAppBaseUrl()}/auth/reset-password?token=${token}`,
      );
    }

    return NextResponse.json(GENERIC_RESPONSE);
  }),
);
