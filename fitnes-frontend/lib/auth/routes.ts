import type { UserRole } from "./types";

export const roleHome: Record<UserRole, string> = {
  client: "/client",
  trainer: "/trainer",
  admin: "/admin",
};

export function getRoleHome(role?: string | null) {
  if (role === "admin" || role === "trainer" || role === "client") {
    return roleHome[role];
  }

  return "/login";
}
