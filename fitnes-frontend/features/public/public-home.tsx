"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  Dumbbell,
  Loader2,
  ShieldCheck,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { clientApi } from "@/lib/api/client";
import type { AdminPackage } from "@/features/admin/types";

const highlights = [
  {
    icon: CalendarCheck,
    title: "Weekly Class Schedule",
    description: "Browse upcoming classes, trainers, rooms, and free spots.",
  },
  {
    icon: Ticket,
    title: "Flexible Packages",
    description: "Choose packages by lessons, price, and validity period.",
  },
  {
    icon: Users,
    title: "Trainer Attendance",
    description: "Trainers manage attendee lists and mark visits accurately.",
  },
];

const steps = [
  "Create a client account",
  "Pick an active package",
  "Book classes from the schedule",
  "Track bookings and visits",
];

export function PublicHome() {
  const packagesQuery = useQuery({
    queryKey: ["public-packages"],
    queryFn: async () => {
      const { data } = await clientApi.get<AdminPackage[]>("/public/packages");
      return data;
    },
  });

  const packages = packagesQuery.data ?? [];

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#18211d]">
      <header className="border-b border-[#dde4e0] bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-5">
          <Link className="flex items-center gap-3" href="/">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#16251f] text-white">
              <Dumbbell className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold">Fitnes</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link className="secondary-icon-button" href="/login">
              Login
            </Link>
            <Link className="secondary-icon-button" href="/register">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#ccd6d0] bg-white px-4 py-2 text-sm font-semibold text-[#53615a]"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <Star className="h-4 w-4 text-[#c58a2b]" aria-hidden />
            Fitness club management and booking
          </motion.div>
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-[#121a16] sm:text-6xl"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.05, duration: 0.2 }}
          >
            See classes, packages, and your fitness flow before you join.
          </motion.h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#59645f]">
            Explore how the club works: packages, weekly classes, trainers,
            bookings, and attendance tracking. Register when you are ready to
            book your first class.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="home-primary-link min-h-12 px-6" href="/register">
              Create account
            </Link>
            <Link className="secondary-icon-button min-h-12 px-6" href="/login">
              Login
            </Link>
          </div>
        </div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="home-preview"
          initial={{ opacity: 0, scale: 0.98 }}
          transition={{ delay: 0.08, duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b7871]">
                Today
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Club Overview</h2>
            </div>
            <span className="info-icon">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {highlights.map((item) => (
              <article className="home-mini-card" key={item.title}>
                <span className="info-icon shrink-0">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold text-[#121a16]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#59645f]">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
              Packages
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
              Choose a package that fits your rhythm
            </h2>
          </div>
          <Link className="secondary-icon-button" href="/register">
            Register to book
          </Link>
        </div>

        {packagesQuery.isLoading ? (
          <div className="state-panel mt-6">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading packages
          </div>
        ) : packages.length === 0 ? (
          <div className="empty-state-panel mt-6">
            <span className="info-icon">
              <Ticket className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold text-[#121a16]">
              Packages will appear here soon
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#59645f]">
              The club has not published packages yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => (
              <motion.article
                animate={{ opacity: 1, y: 0 }}
                className="public-package-card"
                initial={{ opacity: 0, y: 8 }}
                key={pkg.id}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#121a16]">
                      {pkg.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#59645f]">
                      Valid for {pkg.validityDays} days
                    </p>
                  </div>
                  <span className="spots-badge">{pkg.lessonsCount} lessons</span>
                </div>
                <p className="mt-6 text-4xl font-semibold text-[#121a16]">
                  ${Number(pkg.price).toFixed(2)}
                </p>
                <Link className="home-primary-link mt-6 min-h-11 w-full" href="/register">
                  Start with this
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 pb-16">
        <div className="rounded-lg border border-[#dde4e0] bg-white p-6">
          <div className="flex items-start gap-4">
            <span className="info-icon shrink-0">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-[#121a16]">
                How it works
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {steps.map((step, index) => (
                  <div className="home-step" key={step}>
                    <span>{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
