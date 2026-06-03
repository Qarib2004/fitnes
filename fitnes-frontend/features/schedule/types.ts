export type ScheduleSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  classId: string;
  classTitle: string;
  classDescription: string | null;
  trainerId: string;
  trainerName: string;
  roomId: string | null;
  roomTitle: string | null;
  capacity: number;
  booked: number;
  spotsLeft: number;
};
