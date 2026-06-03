import type { ScheduleSlot } from "@/features/schedule/types";

export type TrainerSlotBooking = {
  id: string;
  status: "active" | "attended" | "missed" | "canceled";
  userId: string;
  userName: string;
  userEmail: string;
  startsAt: string;
  endsAt: string;
  classTitle: string;
  roomTitle: string | null;
};

export type TrainerScheduleSlot = ScheduleSlot;
