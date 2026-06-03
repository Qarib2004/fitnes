"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, Loader2, Users } from "lucide-react";
import Link from "next/link";
import {
  formatDateTimeRange,
} from "@/features/profile/format";
import {
  getWeekStart,
  toDateInputValue,
} from "@/features/schedule/date-utils";
import { useTrainerSchedule } from "./use-trainer-schedule";

export function TrainerOverview() {
  const weekStartValue = toDateInputValue(getWeekStart());
  const scheduleQuery = useTrainerSchedule(weekStartValue);

  if (scheduleQuery.isLoading) {
    return <LoadingState label="Loading overview" />;
  }

  if (scheduleQuery.isError) {
    return <EmptyState title="Could not load overview." />;
  }

  const slots = scheduleQuery.data ?? [];
  const now = new Date();
  const todayKey = toDateInputValue(now);
  const todaySlots = slots.filter(
    (slot) => toDateInputValue(new Date(slot.startsAt)) === todayKey,
  );
  const nextClass = slots
    .filter((slot) => new Date(slot.startsAt) >= now)
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    )[0];
  const totalBooked = slots.reduce((sum, slot) => sum + slot.booked, 0);

  return (
    <section>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
          Trainer
        </p>
        <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
          Trainer Dashboard
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
          Review today&apos;s classes, your weekly load, and attendance actions.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          icon={CalendarDays}
          label="Today Classes"
          value={todaySlots.length}
          helper="Scheduled for today"
        />
        <OverviewCard
          icon={Clock}
          label="Week Classes"
          value={slots.length}
          helper="Current week schedule"
        />
        <OverviewCard
          icon={Users}
          label="Booked Clients"
          value={totalBooked}
          helper="Across this week"
        />
        <OverviewCard
          icon={CalendarDays}
          label="Next Class"
          value={nextClass ? nextClass.classTitle : "None"}
          helper={nextClass ? formatDateTimeRange(nextClass.startsAt, nextClass.endsAt) : "No upcoming class"}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="chart-panel">
          <h3 className="text-lg font-semibold text-[#121a16]">
            Today&apos;s Classes
          </h3>
          {todaySlots.length === 0 ? (
            <EmptyState title="No classes today." />
          ) : (
            <div className="mt-5 space-y-3">
              {todaySlots.map((slot) => (
                <article className="booking-row" key={slot.id}>
                  <div>
                    <h4 className="text-lg font-semibold text-[#121a16]">
                      {slot.classTitle}
                    </h4>
                    <p className="mt-1 text-sm text-[#59645f]">
                      {formatDateTimeRange(slot.startsAt, slot.endsAt)}
                    </p>
                    <p className="mt-1 text-sm text-[#59645f]">
                      Room: {slot.roomTitle ?? "Not assigned"}
                    </p>
                  </div>
                  <Link
                    className="secondary-icon-button"
                    href={`/trainer/attendance?slotId=${slot.id}`}
                  >
                    View attendees
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="chart-panel">
          <h3 className="text-lg font-semibold text-[#121a16]">Quick Actions</h3>
          <div className="mt-5 space-y-3">
            <QuickAction href="/trainer/schedule" label="My schedule" />
            <QuickAction href="/trainer/attendance" label="Attendance" />
          </div>
        </section>
      </div>
    </section>
  );
}

function OverviewCard({
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

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="flex min-h-12 items-center justify-between rounded-lg border border-[#dde4e0] bg-[#f5f7f6] px-4 text-sm font-semibold text-[#18211d] hover:bg-[#edf2ef]"
      href={href}
    >
      {label}
      <span aria-hidden>→</span>
    </Link>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="mt-5 rounded-lg bg-[#f5f7f6] p-6 text-center text-[#59645f]">
      {title}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-80 items-center justify-center gap-2 text-[#59645f]">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      {label}
    </div>
  );
}
