"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import type { TrainerScheduleSlot } from "./types";

export function useTrainerSchedule(weekStart: string) {
  return useQuery({
    queryKey: ["trainer-schedule", weekStart],
    queryFn: async () => {
      const { data } = await clientApi.get<TrainerScheduleSlot[]>(
        "/trainer/schedule",
        {
          params: { weekStart },
        },
      );

      return data;
    },
  });
}
