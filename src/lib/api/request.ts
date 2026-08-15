import type { NextRequest } from "next/server";
import { USER_ID_HEADER, USER_ROLE_HEADER } from "@/lib/auth/constants";

/** Reads the user id the proxy attaches to authenticated requests. */
export function getUserId(request: NextRequest): string | null {
  return request.headers.get(USER_ID_HEADER);
}

export function getUserRole(request: NextRequest): string | null {
  return request.headers.get(USER_ROLE_HEADER);
}

export function getSearchParam(
  request: NextRequest,
  key: string,
): string | null {
  return new URL(request.url).searchParams.get(key);
}
