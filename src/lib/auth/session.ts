import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";
import { verifyToken, type TokenPayload } from "./jwt";

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionOrThrow(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export function isRoleAuthorized(
  userRole: string,
  allowedRoles: string[],
): boolean {
  return allowedRoles.includes(userRole);
}
