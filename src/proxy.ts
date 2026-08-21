import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, errors as joseErrors } from "jose";
import { AUTH_COOKIE_NAME, IDENTITY_HEADERS } from "@/lib/auth/constants";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/chat"];
const AUTH_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/role-selection",
];
const API_AUTH_PREFIX = "/api/auth";
const API_PROTECTED_PREFIXES = [
  "/api/chat",
  "/api/conversations",
  "/api/export-pdf",
];

const ROLE_PATH_MAP: Record<string, string[]> = {
  "/dashboard": ["cosmetologist", "admin"],
};

async function verifyToken(
  token: string,
): Promise<{ sub: string; role: string } | null> {
  const rawSecret = process.env.JWT_SECRET;
  if (!rawSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(rawSecret),
    );
    return { sub: payload.sub as string, role: payload.role as string };
  } catch (error) {
    if (error instanceof joseErrors.JOSEError) return null;
    throw error;
  }
}

// Drop client-supplied identity headers so route handlers can never read a spoofed
// identity; handlers derive the user from the verified session cookie instead.
function nextWithSanitizedHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  for (const header of IDENTITY_HEADERS) headers.delete(header);
  return NextResponse.next({ request: { headers } });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const prefix of API_PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return handleApiAuth(request);
    }
  }

  for (const prefix of PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return handleProtectedRoute(request);
    }
  }

  for (const prefix of AUTH_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return handleAuthPage(request);
    }
  }

  if (pathname.startsWith(API_AUTH_PREFIX)) {
    if (
      pathname === "/api/auth/me" ||
      pathname === "/api/auth/profile" ||
      pathname === "/api/auth/role"
    ) {
      return handleApiAuth(request);
    }
    return nextWithSanitizedHeaders(request);
  }

  return nextWithSanitizedHeaders(request);
}

async function handleProtectedRoute(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifyToken(token);
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  for (const [pathPrefix, allowedRoles] of Object.entries(ROLE_PATH_MAP)) {
    if (request.nextUrl.pathname.startsWith(pathPrefix)) {
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return nextWithSanitizedHeaders(request);
}

async function handleAuthPage(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return nextWithSanitizedHeaders(request);

  const session = await verifyToken(token);
  if (!session) return nextWithSanitizedHeaders(request);

  return NextResponse.redirect(new URL("/", request.url));
}

async function handleApiAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return nextWithSanitizedHeaders(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
