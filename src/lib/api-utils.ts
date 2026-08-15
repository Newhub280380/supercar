import { NextResponse } from "next/server";

/**
 * Parses a JSON request body, returning a 400 response instead of throwing
 * when the payload is missing or malformed.
 */
export async function parseJsonBody(
  request: Request,
): Promise<
  | { data: Record<string, unknown>; error?: undefined }
  | { data?: undefined; error: NextResponse }
> {
  try {
    const data = await request.json();
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Body must be a JSON object");
    }
    return { data: data as Record<string, unknown> };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}
