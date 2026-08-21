import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

async function writeAuthCookie(token: string, maxAge: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export async function setAuthCookie(token: string): Promise<void> {
  await writeAuthCookie(token, SESSION_MAX_AGE_SECONDS);
}

export async function clearAuthCookie(): Promise<void> {
  await writeAuthCookie("", 0);
}
