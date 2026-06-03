import type { UserRole, UserStatus } from "@/lib/auth/types";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminPackage = {
  id: string;
  title: string;
  lessonsCount: number;
  price: string;
  validityDays: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientPackageAssignment = {
  id: string;
  userId: string;
  packageId: string;
  lessonsLeft: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminClass = {
  id: string;
  title: string;
  description: string | null;
  capacity: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminRoom = {
  id: string;
  title: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminDashboardSummary = {
  users: {
    total: number;
    trainers: number;
    clients: number;
  };
  revenue: {
    total: number;
  };
  bookings: {
    total: number;
    active: number;
    attended: number;
    missed: number;
    canceled: number;
  };
  occupancy: {
    averagePercent: number;
  };
};
