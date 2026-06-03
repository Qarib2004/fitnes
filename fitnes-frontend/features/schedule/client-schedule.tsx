"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { clientApi } from "@/lib/api/client";
import { clientScheduleWeekAtom, showToastAtom } from "@/store/ui";
import {
  addDays,
  formatDay,
  formatTime,
  getWeekStart,
  toDateInputValue,
} from "./date-utils";
import type { ScheduleSlot } from "./types";

export function ClientSchedule() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useAtom(clientScheduleWeekAtom);
  const showToast = useSetAtom(showToastAtom);
  const weekStartValue = toDateInputValue(weekStart);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const scheduleQuery = useQuery({
    queryKey: ["schedule", weekStartValue],
    queryFn: async () => {
      const { data } = await clientApi.get<ScheduleSlot[]>("/schedule", {
        params: { weekStart: weekStartValue },
      });

      return data;
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data } = await clientApi.post("/bookings", { scheduleId });
      return data;
    },
    onSuccess: async () => {
      showToast({ text: "Class booked successfully.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
    onError: (error) => {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        showToast({
          text: error.response?.data?.message ?? error.message,
          tone: "error",
        });
        return;
      }

      showToast({ text: "Could not book this class.", tone: "error" });
    },
  });

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, ScheduleSlot[]>();

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
            Schedule
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
            Book a class
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
            Browse available sessions for the week and reserve a spot using your
            active package.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="week-button"
            type="button"
            onClick={() => {
              setWeekStart((value) => addDays(value, -7));
            }}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </button>
          <button
            className="week-button"
            type="button"
            onClick={() => {
              setWeekStart(getWeekStart());
            }}
          >
            Today
          </button>
          <button
            className="week-button"
            type="button"
            onClick={() => {
              setWeekStart((value) => addDays(value, 7));
            }}
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
                <AnimatePresence mode="popLayout">
                  <motion.div className="space-y-3" layout>
                    {slots.map((slot) => (
                    <ClassCard
                      key={slot.id}
                      slot={slot}
                      isBooking={
                        bookingMutation.isPending &&
                        bookingMutation.variables === slot.id
                      }
                      onBook={() => {
                        bookingMutation.mutate(slot.id);
                      }}
                    />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}

function ClassCard({
  isBooking,
  onBook,
  slot,
}: {
  isBooking: boolean;
  onBook: () => void;
  slot: ScheduleSlot;
}) {
  const isFull = slot.spotsLeft <= 0;

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="class-card"
      exit={{ opacity: 0, scale: 0.98 }}
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
        <span className={isFull ? "spots-badge spots-badge-full" : "spots-badge"}>
          {slot.spotsLeft} left
        </span>
      </div>

      {slot.classDescription && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#59645f]">
          {slot.classDescription}
        </p>
      )}

      <div className="mt-4 space-y-1 text-xs text-[#59645f]">
        <p>Trainer: {slot.trainerName}</p>
        <p>Room: {slot.roomTitle ?? "Not assigned"}</p>
        <p>
          Capacity: {slot.booked}/{slot.capacity}
        </p>
      </div>

      <button
        className="book-button"
        disabled={isFull || isBooking}
        type="button"
        onClick={onBook}
      >
        {isBooking ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {isFull ? "Full" : "Book"}
      </button>
    </motion.div>
  );
}
