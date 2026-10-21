import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PASSWORD_RESET_EXPIRES_MINUTES } from "@/lib/auth";
import { withRateLimit } from "@/lib/api/handlers";
import { isNonEmptyString } from "@/lib/api/request";
import { badRequest, withErrorHandling } from "@/lib/api/response";
import { getAppBaseUrl } from "@/lib/env";
import {
  emailProviderFromEnv,
  sendEmailViaProvider,
} from "@/lib/promotion-utils";
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

    const resetUrl = `${getAppBaseUrl()}/auth/reset-password?token=${token}`;
    const provider = emailProviderFromEnv();
    if (!provider) {
      console.warn(
        "Сброс пароля сохранён, но письмо не отправлено: нет SENDGRID_API_KEY или MAILGUN_API_KEY.",
      );
      if (process.env.NODE_ENV === "development") {
        console.log(`[Password Reset] ${resetUrl}`);
      }
    } else {
      const sent = await sendEmailViaProvider(provider, {
        to: [user.email],
        subject: "Сброс пароля",
        html: `<p>Ссылка для сброса пароля: <a href="${resetUrl}">${resetUrl}</a></p>`,
      });
      if (!sent.success) {
        console.error("Сброс пароля не отправлен:", sent.error);
      }
    }

    return NextResponse.json(GENERIC_RESPONSE);
  }),
);
