"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CalendarCheck,
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminDashboard } from "./use-admin-dashboard";

const chartColors = ["#1f6b47", "#365f7d", "#c58a2b", "#96382d"];

export function AdminDashboard() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center gap-2 text-[#59645f]">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading dashboard
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="rounded-lg border border-[#dde4e0] bg-white p-8 text-center text-[#59645f]">
        Could not load dashboard.
      </div>
    );
  }

  const summary = dashboardQuery.data;
  const bookingData = [
    { name: "Active", value: summary.bookings.active },
    { name: "Attended", value: summary.bookings.attended },
    { name: "Missed", value: summary.bookings.missed },
    { name: "Canceled", value: summary.bookings.canceled },
  ];
  const userData = [
    { name: "Clients", value: summary.users.clients },
    { name: "Trainers", value: summary.users.trainers },
  ];

  return (
    <section>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
          Admin
        </p>
        <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
          Dashboard
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
          Monitor users, revenue, bookings, and occupancy across the club.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Total Users"
          value={summary.users.total}
          helper={`${summary.users.clients} clients, ${summary.users.trainers} trainers`}
        />
        <SummaryCard
          icon={DollarSign}
          label="Revenue"
          value={`$${summary.revenue.total.toFixed(2)}`}
          helper="Assigned package value"
        />
        <SummaryCard
          icon={CalendarCheck}
          label="Bookings"
          value={summary.bookings.total}
          helper={`${summary.bookings.active} active right now`}
        />
        <SummaryCard
          icon={Activity}
          label="Avg Occupancy"
          value={`${summary.occupancy.averagePercent.toFixed(1)}%`}
          helper="Across scheduled classes"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_420px]">
        <ChartPanel title="Bookings by Status">
          <ResponsiveContainer height={280} width="100%">
            <BarChart data={bookingData}>
              <CartesianGrid stroke="#e5ebe7" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7871" tickLine={false} />
              <YAxis allowDecimals={false} stroke="#6b7871" tickLine={false} />
              <Tooltip
                contentStyle={{
                  border: "1px solid #dde4e0",
                  borderRadius: 8,
                  boxShadow: "0 10px 30px rgba(20, 31, 26, 0.12)",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {bookingData.map((entry, index) => (
                  <Cell fill={chartColors[index]} key={entry.name} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Users by Role">
          <ResponsiveContainer height={280} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={userData}
                dataKey="value"
                innerRadius={64}
                outerRadius={98}
                paddingAngle={4}
              >
                {userData.map((entry, index) => (
                  <Cell fill={chartColors[index]} key={entry.name} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: "1px solid #dde4e0",
                  borderRadius: 8,
                  boxShadow: "0 10px 30px rgba(20, 31, 26, 0.12)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {userData.map((item, index) => (
              <div className="chart-legend-item" key={item.name}>
                <span style={{ background: chartColors[index] }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>
    </section>
  );
}

function SummaryCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number | string;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="summary-card"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <span className="info-icon">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-5 text-sm font-medium text-[#6b7871]">{label}</p>
      <h3 className="mt-2 text-3xl font-semibold text-[#121a16]">{value}</h3>
      <p className="mt-2 text-sm text-[#59645f]">{helper}</p>
    </motion.article>
  );
}

function ChartPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="chart-panel">
      <h3 className="text-lg font-semibold text-[#121a16]">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}
