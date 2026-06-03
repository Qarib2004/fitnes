"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import type { AdminPackage } from "./types";

export function useAdminPackages() {
  return useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const { data } = await clientApi.get<AdminPackage[]>("/admin/packages");
      return data;
    },
  });
}
