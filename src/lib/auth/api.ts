import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { TokenPayload } from "./jwt";

export async function requireSession(): Promise<
  | { session: TokenPayload; response?: never }
  | { session?: never; response: NextResponse }
> {
  const session = await getSession();
  if (!session?.sub) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}

export async function requireRole(
  allowedRoles: readonly string[],
): Promise<
  | { session: TokenPayload; response?: never }
  | { session?: never; response: NextResponse }
> {
  const result = await requireSession();
  if (result.response) return result;
  if (!allowedRoles.includes(result.session.role)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}
