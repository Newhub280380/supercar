import type { NextRequest } from "next/server";

export function getSearchParam(
  request: NextRequest,
  key: string,
): string | null {
  return new URL(request.url).searchParams.get(key);
}

/** Narrows a JSON body field to a non-empty string. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
