"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import type { AdminDashboardSummary } from "./types";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data } =
        await clientApi.get<AdminDashboardSummary>("/admin/dashboard");

      return data;
    },
  });
}
