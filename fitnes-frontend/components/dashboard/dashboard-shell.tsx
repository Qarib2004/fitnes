"use client";

import axios from "axios";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  LogOut,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import type { UserRole } from "@/lib/auth/types";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const roleLabels: Record<UserRole, string> = {
  client: "Client",
  trainer: "Trainer",
  admin: "Admin",
};

const navItems: Record<UserRole, NavItem[]> = {
  client: [
    { href: "/client", label: "Overview", icon: BarChart3 },
    { href: "/client/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/client/packages", label: "Packages", icon: Package },
    { href: "/client/bookings", label: "Bookings", icon: ClipboardCheck },
  ],
  trainer: [
    { href: "/trainer", label: "Overview", icon: BarChart3 },
    { href: "/trainer/schedule", label: "My Schedule", icon: CalendarDays },
    { href: "/trainer/attendance", label: "Attendance", icon: ClipboardCheck },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/packages", label: "Packages", icon: Package },
    { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  ],
};

export function DashboardShell({
  children,
  role,
}: {
  children: ReactNode;
  role: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = navItems[role];

  async function logout() {
    await axios.post("/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#18211d]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-b border-[#dde4e0] bg-white px-4 py-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-3 px-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#16251f] text-white">
              <Dumbbell className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-semibold leading-none">Fitnes</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#6b7871]">
                {roleLabels[role]}
              </p>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {links.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  className={
                    isActive
                      ? "dashboard-nav-link dashboard-nav-link-active"
                      : "dashboard-nav-link"
                  }
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-[#dde4e0] bg-white px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
                Dashboard
              </p>
              <h1 className="mt-1 text-xl font-semibold">{roleLabels[role]} Area</h1>
            </div>
            <button className="secondary-icon-button" type="button" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden />
              Logout
            </button>
          </header>

          <div className="flex-1 px-5 py-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
