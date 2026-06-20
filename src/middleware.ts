import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "auth_token";

const PROTECTED_PREFIXES = ["/dashboard", "/profile"];
const AUTH_PREFIXES = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/role-selection"];
const API_AUTH_PREFIX = "/api/auth";
const PUBLIC_PREFIXES = ["/", "/about", "/pricing", "/contact"];

const ROLE_PATH_MAP: Record<string, string[]> = {
  "/dashboard": ["cosmetologist", "admin"],
};

async function verifyToken(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload } = await jwtVerify(token, secret);
    return { sub: payload.sub as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    if (pathname === "/api/auth/me" || pathname === "/api/auth/profile" || pathname === "/api/auth/role") {
      return handleApiAuth(request);
    }
    return NextResponse.next();
  }

  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
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

  const response = NextResponse.next();
  response.headers.set("x-user-id", session.sub);
  response.headers.set("x-user-role", session.role);
  return response;
}

async function handleAuthPage(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.next();

  const session = await verifyToken(token);
  if (!session) return NextResponse.next();

  if (session.role === "client" && !session.role) {
    return NextResponse.next();
  }

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

  const response = NextResponse.next();
  response.headers.set("x-user-id", session.sub);
  response.headers.set("x-user-role", session.role);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
