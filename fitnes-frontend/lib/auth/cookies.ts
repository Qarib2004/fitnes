import { cookies } from "next/headers";
import type { AuthSession, AuthUser } from "./types";

export const AUTH_COOKIE_NAMES = {
  accessToken: "fitnes_access_token",
  refreshToken: "fitnes_refresh_token",
  role: "fitnes_user_role",
  name: "fitnes_user_name",
} as const;

const isProduction = process.env.NODE_ENV === "production";

export async function setAuthCookies(user: AuthUser, session: AuthSession) {
  await setSessionCookies(session);

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAMES.role, user.role, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  cookieStore.set(AUTH_COOKIE_NAMES.name, encodeURIComponent(user.name), {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function setSessionCookies(session: AuthSession) {
  const cookieStore = await cookies();
  const maxAge = session.expires_in ?? 60 * 60;

  cookieStore.set(AUTH_COOKIE_NAMES.accessToken, session.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, session.refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    cookieStore.delete(name);
  });
}
