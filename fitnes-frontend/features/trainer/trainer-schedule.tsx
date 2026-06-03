"use client";

import { motion } from "framer-motion";
import { useAtom } from "jotai";
import Lenis from "lenis";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import {
  addDays,
  formatDay,
  formatTime,
  getWeekStart,
  toDateInputValue,
} from "@/features/schedule/date-utils";
import { trainerScheduleWeekAtom } from "@/store/ui";
import type { TrainerScheduleSlot } from "./types";
import { useTrainerSchedule } from "./use-trainer-schedule";

export function TrainerSchedule() {
  const [weekStart, setWeekStart] = useAtom(trainerScheduleWeekAtom);
  const weekStartValue = toDateInputValue(weekStart);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const scheduleQuery = useTrainerSchedule(weekStartValue);

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, TrainerScheduleSlot[]>();

    for (const day of days) {
      grouped.set(toDateInputValue(day), []);
    }

    for (const slot of scheduleQuery.data ?? []) {
      const key = toDateInputValue(new Date(slot.startsAt));
      grouped.get(key)?.push(slot);
    }

    return grouped;
  }, [days, scheduleQuery.data]);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
            Trainer Schedule
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
            My Classes
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
            Review your weekly sessions and open the attendee list for each
            class.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="week-button"
            type="button"
            onClick={() => setWeekStart((value) => addDays(value, -7))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </button>
          <button
            className="week-button"
            type="button"
            onClick={() => setWeekStart(getWeekStart())}
          >
            Today
          </button>
          <button
            className="week-button"
            type="button"
            onClick={() => setWeekStart((value) => addDays(value, 7))}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <motion.div layout className="schedule-grid mt-6">
        {days.map((day) => {
          const key = toDateInputValue(day);
          const slots = slotsByDay.get(key) ?? [];

          return (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="schedule-day"
              initial={{ opacity: 0, y: 8 }}
              key={key}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[#18211d]">{formatDay(day)}</h3>
                <span className="text-xs font-medium text-[#6b7871]">
                  {slots.length} classes
                </span>
              </div>

              {scheduleQuery.isLoading ? (
                <div className="flex h-28 items-center justify-center text-[#6b7871]">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                </div>
              ) : slots.length === 0 ? (
                <div className="empty-day">
                  <CalendarDays className="h-5 w-5" aria-hidden />
                  No classes
                </div>
              ) : (
                <SmoothTrainerCardsScroll>
                  <motion.div className="trainer-slot-list-content" layout>
                    {slots.map((slot) => (
                      <TrainerClassCard key={slot.id} slot={slot} />
                    ))}
                  </motion.div>
                </SmoothTrainerCardsScroll>
              )}
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}

function SmoothTrainerCardsScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      content: contentRef.current,
      duration: 0.8,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.2,
      wheelMultiplier: 0.85,
      wrapper: wrapperRef.current,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="trainer-slot-list-scroll" ref={wrapperRef}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

function TrainerClassCard({ slot }: { slot: TrainerScheduleSlot }) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="class-card"
      initial={{ opacity: 0, scale: 0.98 }}
      layout
      transition={{ duration: 0.16 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#121a16]">
            {slot.classTitle}
          </p>
          <p className="mt-1 text-xs font-medium text-[#6b7871]">
            {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)}
          </p>
        </div>
        <span className="spots-badge">{slot.booked} booked</span>
      </div>

      <div className="mt-4 space-y-1 text-xs text-[#59645f]">
        <p>Room: {slot.roomTitle ?? "Not assigned"}</p>
        <p>
          Capacity: {slot.booked}/{slot.capacity}
        </p>
      </div>

      <Link className="book-button" href={`/trainer/attendance?slotId=${slot.id}`}>
        <Users className="h-4 w-4" aria-hidden />
        View attendees
      </Link>
    </motion.div>
  );
}
