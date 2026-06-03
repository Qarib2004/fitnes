"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Check, Loader2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { clientApi } from "@/lib/api/client";
import { formatDateTimeRange } from "@/features/profile/format";
import type { TrainerSlotBooking } from "./types";

type AttendanceStatus = "attended" | "missed";

export function TrainerAttendance() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const slotId = searchParams.get("slotId");

  const bookingsQuery = useQuery({
    queryKey: ["trainer-slot-bookings", slotId],
    enabled: Boolean(slotId),
    queryFn: async () => {
      const { data } = await clientApi.get<TrainerSlotBooking[]>(
        `/trainer/schedule/${slotId}/bookings`,
      );

      return data;
    },
  });

  const attendanceMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: AttendanceStatus;
    }) => {
      const { data } = await clientApi.patch(
        `/trainer/bookings/${bookingId}/attendance`,
        { status },
      );

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["trainer-slot-bookings", slotId],
      });
      await queryClient.invalidateQueries({ queryKey: ["trainer-schedule"] });
    },
  });

  const bookings = bookingsQuery.data ?? [];
  const firstBooking = bookings[0];

  return (
    <section>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
          Attendance
        </p>
        <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
          Mark Attendance
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
          Open a class from My Schedule, then mark each active booking as
          attended or missed.
        </p>
      </div>

      {!slotId ? (
        <div className="mt-6 rounded-lg border border-[#dde4e0] bg-white p-8 text-center text-[#59645f]">
          Select a class from My Schedule to view attendees.
        </div>
      ) : bookingsQuery.isLoading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 text-[#59645f]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading attendees
        </div>
      ) : bookingsQuery.isError ? (
        <div className="mt-6 rounded-lg border border-[#dde4e0] bg-white p-8 text-center text-[#59645f]">
          Could not load attendees.
        </div>
      ) : (
        <>
          {firstBooking && (
            <div className="mt-6 rounded-lg border border-[#dde4e0] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#121a16]">
                {firstBooking.classTitle}
              </h3>
              <p className="mt-1 text-sm text-[#59645f]">
                {formatDateTimeRange(firstBooking.startsAt, firstBooking.endsAt)}
              </p>
              <p className="mt-1 text-sm text-[#59645f]">
                Room: {firstBooking.roomTitle ?? "Not assigned"}
              </p>
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="mt-6 rounded-lg border border-[#dde4e0] bg-white p-8 text-center text-[#59645f]">
              No attendees for this class yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {bookings.map((booking) => (
                <AttendeeRow
                  booking={booking}
                  isUpdating={
                    attendanceMutation.isPending &&
                    attendanceMutation.variables?.bookingId === booking.id
                  }
                  key={booking.id}
                  onMark={(status) =>
                    attendanceMutation.mutate({
                      bookingId: booking.id,
                      status,
                    })
                  }
                />
              ))}
            </div>
          )}

          {attendanceMutation.isError && (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {axios.isAxiosError<{ message?: string }>(attendanceMutation.error)
                ? attendanceMutation.error.response?.data?.message
                : "Could not update attendance."}
            </p>
          )}
        </>
      )}
    </section>
  );
}

function AttendeeRow({
  booking,
  isUpdating,
  onMark,
}: {
  booking: TrainerSlotBooking;
  isUpdating: boolean;
  onMark: (status: AttendanceStatus) => void;
}) {
  const canMark = booking.status === "active";

  return (
    <article className="booking-row">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-[#121a16]">
          {booking.userName}
        </h3>
        <p className="mt-1 text-sm text-[#59645f]">{booking.userEmail}</p>
        <span className="mt-3 inline-flex rounded-full bg-[#edf2ef] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#53615a]">
          {booking.status}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          className="success-button"
          disabled={!canMark || isUpdating}
          type="button"
          onClick={() => onMark("attended")}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Check className="h-4 w-4" aria-hidden />
          )}
          Attended
        </button>
        <button
          className="danger-button"
          disabled={!canMark || isUpdating}
          type="button"
          onClick={() => onMark("missed")}
        >
          <X className="h-4 w-4" aria-hidden />
          Missed
        </button>
      </div>
    </article>
  );
}
