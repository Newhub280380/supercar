const LOCAL_APP_URL = "http://localhost:3000";
const PUBLIC_FALLBACK_URL = "https://example.com";

export function getAppBaseUrl(fallback = LOCAL_APP_URL): string {
  return process.env.NEXT_PUBLIC_APP_URL || fallback;
}

/** Base url for publicly crawlable output (sitemap, robots.txt). */
export function getPublicBaseUrl(): string {
  return getAppBaseUrl(PUBLIC_FALLBACK_URL);
}
