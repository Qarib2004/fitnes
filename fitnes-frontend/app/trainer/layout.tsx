import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="trainer">{children}</DashboardShell>;
}
