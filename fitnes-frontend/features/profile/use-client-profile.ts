"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import type { ClientProfile } from "./types";

export function useClientProfile() {
  return useQuery({
    queryKey: ["client-profile"],
    queryFn: async () => {
      const { data } = await clientApi.get<ClientProfile>("/profile");
      return data;
    },
  });
}
