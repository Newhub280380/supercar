import type { NextRequest, NextResponse } from "next/server";
import {
  checkAuthRateLimit,
  getClientIp,
  requireRole,
  requireSession,
} from "@/lib/auth";
import type { TokenPayload } from "@/lib/auth";
import { tooManyRequests, withErrorHandling } from "./response";

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
      const { session, response } = await requireSession();
      if (response) return response;
      return handler(session, request);
    },
    message,
  );
}

/** Route handler that only needs the id of the signed-in user. */
export function withUserId(
  label: string,
  handler: (userId: string, request: NextRequest) => Promise<NextResponse>,
  message?: string,
) {
  return withSession(
    label,
    (session, request) => handler(session.sub, request),
    message,
  );
}

/** Route handler restricted to sessions holding one of `allowedRoles`. */
export function withRole(
  label: string,
  allowedRoles: readonly string[],
  handler: (
    session: TokenPayload,
    request: NextRequest,
  ) => Promise<NextResponse>,
  message?: string,
) {
  return withErrorHandling(
    label,
    async (request: NextRequest) => {
      const { session, response } = await requireRole(allowedRoles);
      if (response) return response;
      return handler(session, request);
    },
    message,
  );
}

/** Throttles a handler per client IP, keyed by `scope`. */
export function withRateLimit(
  scope: string,
  maxAttempts: number,
  handler: (request: NextRequest) => Promise<NextResponse>,
  message = "Too many requests. Please try again later.",
) {
  return async (request: NextRequest) => {
    if (!checkAuthRateLimit(`${scope}:${getClientIp(request)}`, maxAttempts)) {
      return tooManyRequests(message);
    }
    return handler(request);
  };
}
