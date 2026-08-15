import type { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import type { TokenPayload } from "@/lib/auth";
import { getUserId } from "./request";
import { unauthorized, withErrorHandling } from "./response";

/** Route handler that requires a valid session cookie. */
export function withSession(
  label: string,
  handler: (
    session: TokenPayload,
    request: NextRequest,
  ) => Promise<NextResponse>,
  message?: string,
) {
  return withErrorHandling(
    label,
    async (request: NextRequest) => {
      const session = await getSession();
      if (!session) return unauthorized();
      return handler(session, request);
    },
    message,
  );
}

/** Route handler that requires the user id the proxy sets on authenticated requests. */
export function withUserId(
  label: string,
  handler: (userId: string, request: NextRequest) => Promise<NextResponse>,
  message?: string,
) {
  return withErrorHandling(
    label,
    async (request: NextRequest) => {
      const userId = getUserId(request);
      if (!userId) return unauthorized();
      return handler(userId, request);
    },
    message,
  );
}
