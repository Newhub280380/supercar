import { NextResponse } from "next/server";

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function badRequest(message: string): NextResponse {
  return apiError(message, 400);
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return apiError(message, 401);
}

export function notFound(message = "Not found"): NextResponse {
  return apiError(message, 404);
}

export function conflict(message: string): NextResponse {
  return apiError(message, 409);
}

export function tooManyRequests(
  message = "Слишком много запросов. Подождите минуту.",
): NextResponse {
  return apiError(message, 429);
}

export function serverError(message = "Internal server error"): NextResponse {
  return apiError(message, 500);
}

/**
 * Wraps a route handler so unexpected errors are logged and answered with a 500.
 */
export function withErrorHandling<Args extends unknown[]>(
  label: string,
  handler: (...args: Args) => Promise<NextResponse>,
  message?: string,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`${label}:`, error);
      return serverError(message);
    }
  };
}
