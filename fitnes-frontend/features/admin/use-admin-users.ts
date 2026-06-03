"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import type { AdminUser } from "./types";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await clientApi.get<AdminUser[]>("/admin/users");
      return data;
    },
  });
}
