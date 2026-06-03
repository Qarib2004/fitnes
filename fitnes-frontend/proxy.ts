import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { getRoleHome } from "@/lib/auth/routes";
import type { UserRole } from "@/lib/auth/types";

const protectedRoutes: Record<UserRole, string> = {
  client: "/client",
  trainer: "/trainer",
  admin: "/admin",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
  const role = request.cookies.get(AUTH_COOKIE_NAMES.role)?.value;
  const hasSession = Boolean(accessToken || refreshToken);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  const requiredRole = getRequiredRole(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role !== requiredRole) {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  return NextResponse.next();
}

function getRequiredRole(pathname: string) {
  return Object.entries(protectedRoutes).find(([, path]) =>
    pathname.startsWith(path),
  )?.[0] as UserRole | undefined;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/client/:path*",
    "/trainer/:path*",
    "/admin/:path*",
  ],
};
