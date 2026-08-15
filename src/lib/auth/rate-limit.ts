const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, number[]>();

export function checkAuthRateLimit(key: string, maxAttempts = 10): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= maxAttempts) {
    attempts.set(key, recent);
    return false;
  }
  recent.push(now);
  attempts.set(key, recent);
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
