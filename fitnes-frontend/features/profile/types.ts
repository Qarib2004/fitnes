import type { AuthUser } from "@/lib/auth/types";

export type ActivePackage = {
  id: string;
  packageId: string;
  lessonsLeft: number;
  expiresAt: string;
};

export type UpcomingBooking = {
  id: string;
  status: "active" | "attended" | "missed" | "canceled";
  startsAt: string;
  endsAt: string;
  classTitle: string;
  trainerName: string;
};

export type ClientProfile = {
  user: AuthUser;
  activePackages: ActivePackage[];
  upcomingBookings: UpcomingBooking[];
};
