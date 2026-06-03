"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import type { ScheduleSlot } from "@/features/schedule/types";
import type { AdminClass, AdminRoom } from "./types";

export function useAdminClasses() {
  return useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => {
      const { data } = await clientApi.get<AdminClass[]>("/admin/classes");
      return data;
    },
  });
}

export function useAdminRooms() {
  return useQuery({
    queryKey: ["admin-rooms"],
    queryFn: async () => {
      const { data } = await clientApi.get<AdminRoom[]>("/admin/rooms");
      return data;
    },
  });
}

export function useAdminSchedule(weekStart: string) {
  return useQuery({
    queryKey: ["admin-schedule", weekStart],
    queryFn: async () => {
      const { data } = await clientApi.get<ScheduleSlot[]>("/schedule", {
        params: { weekStart },
      });
      return data;
    },
  });
}
