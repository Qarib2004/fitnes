"use client";

import { motion } from "framer-motion";
import { CalendarDays, Dumbbell, Loader2, Package, Ticket } from "lucide-react";
import Link from "next/link";
import { formatDate, formatDateTimeRange } from "./format";
import { useClientProfile } from "./use-client-profile";

export function ClientOverview() {
  const profileQuery = useClientProfile();

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading overview" />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <EmptyState title="Could not load overview." />;
  }

  const profile = profileQuery.data;
  const totalLessonsLeft = profile.activePackages.reduce(
    (sum, item) => sum + item.lessonsLeft,
    0,
  );
  const nearestExpiry = profile.activePackages
    .map((item) => item.expiresAt)
    .sort()[0];
  const nextBooking = profile.upcomingBookings[0];

  return (
    <section>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
          Client
        </p>
        <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
          Welcome, {profile.user.name}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
          Track your packages, upcoming classes, and quick booking actions.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          icon={Package}
          label="Active Packages"
          value={profile.activePackages.length}
          helper="Packages available for booking"
        />
        <OverviewCard
          icon={Ticket}
          label="Lessons Left"
          value={totalLessonsLeft}
          helper="Across active packages"
        />
        <OverviewCard
          icon={CalendarDays}
          label="Upcoming Bookings"
          value={profile.upcomingBookings.length}
          helper="Scheduled future classes"
        />
        <OverviewCard
          icon={Dumbbell}
          label="Nearest Expiry"
          value={nearestExpiry ? formatDate(nearestExpiry) : "None"}
          helper="Closest active package expiry"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="chart-panel">
          <h3 className="text-lg font-semibold text-[#121a16]">Next Booking</h3>
          {nextBooking ? (
            <div className="mt-5 rounded-lg bg-[#f5f7f6] p-5">
              <p className="text-xl font-semibold text-[#121a16]">
                {nextBooking.classTitle}
              </p>
              <p className="mt-2 text-sm text-[#59645f]">
                {formatDateTimeRange(nextBooking.startsAt, nextBooking.endsAt)}
              </p>
              <p className="mt-1 text-sm text-[#59645f]">
                Trainer: {nextBooking.trainerName}
              </p>
              <Link className="secondary-icon-button mt-5" href="/client/bookings">
                View bookings
              </Link>
            </div>
          ) : (
            <EmptyState title="No upcoming booking yet." />
          )}
        </section>

        <section className="chart-panel">
          <h3 className="text-lg font-semibold text-[#121a16]">Quick Actions</h3>
          <div className="mt-5 space-y-3">
            <QuickAction href="/client/schedule" label="Book a class" />
            <QuickAction href="/client/bookings" label="My bookings" />
            <QuickAction href="/client/packages" label="My packages" />
          </div>
        </section>
      </div>

      <section className="chart-panel mt-6">
        <h3 className="text-lg font-semibold text-[#121a16]">
          Upcoming Preview
        </h3>
        {profile.upcomingBookings.length === 0 ? (
          <EmptyState title="No upcoming classes yet." />
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {profile.upcomingBookings.slice(0, 3).map((booking) => (
              <article className="info-card" key={booking.id}>
                <h4 className="font-semibold text-[#121a16]">
                  {booking.classTitle}
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#59645f]">
                  {formatDateTimeRange(booking.startsAt, booking.endsAt)}
                </p>
                <p className="mt-1 text-sm text-[#59645f]">
                  Trainer: {booking.trainerName}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
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
