import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";
import { withRateLimit } from "@/lib/api/handlers";
import { isNonEmptyString } from "@/lib/api/request";
import { badRequest, withErrorHandling } from "@/lib/api/response";

export const POST = withErrorHandling(
  "Reset password error",
  withRateLimit("reset-password", 10, async (request: NextRequest) => {
    const body = await request.json();
    const { token, password } = body;

    if (!isNonEmptyString(token) || !isNonEmptyString(password)) {
      return badRequest("Token and password are required");
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return badRequest(passwordCheck.errors.join(". "));
    }

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
      ),
    });

    if (!resetToken) {
      return badRequest("Invalid or expired reset token");
    }

    if (new Date() > resetToken.expiresAt) {
      return badRequest("Reset token has expired");
    }

    const newHash = await hashPassword(password);

    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, resetToken.userId));

    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  }),
);
