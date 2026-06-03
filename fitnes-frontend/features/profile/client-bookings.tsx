"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSetAtom } from "jotai";
import { CalendarCheck, Loader2, X } from "lucide-react";
import { clientApi } from "@/lib/api/client";
import { showToastAtom } from "@/store/ui";
import { formatDateTimeRange } from "./format";
import { useClientProfile } from "./use-client-profile";

export function ClientBookings() {
  const queryClient = useQueryClient();
  const profileQuery = useClientProfile();
  const showToast = useSetAtom(showToastAtom);

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await clientApi.patch(`/bookings/${bookingId}/cancel`);
      return data;
    },
    onSuccess: async () => {
      showToast({ text: "Booking canceled.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["client-profile"] });
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

      showToast({ text: "Could not cancel booking.", tone: "error" });
    },
  });

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading bookings" />;
  }

  if (profileQuery.isError) {
    return <EmptyState title="Could not load bookings" />;
  }

  const bookings = profileQuery.data?.upcomingBookings ?? [];

  return (
    <section>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
          Bookings
        </p>
        <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
          Upcoming Bookings
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
          View your upcoming classes and cancel when your plans change.
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState title="No upcoming bookings yet" />
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <article className="booking-row" key={booking.id}>
              <div className="flex min-w-0 items-start gap-4">
                <span className="info-icon shrink-0">
                  <CalendarCheck className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[#121a16]">
                    {booking.classTitle}
                  </h3>
                  <p className="mt-1 text-sm text-[#59645f]">
                    {formatDateTimeRange(booking.startsAt, booking.endsAt)}
                  </p>
                  <p className="mt-1 text-sm text-[#59645f]">
                    Trainer: {booking.trainerName}
                  </p>
                </div>
              </div>

              <button
                className="danger-button"
                disabled={
                  cancelMutation.isPending &&
                  cancelMutation.variables === booking.id
                }
                type="button"
                onClick={() => {
                  cancelMutation.mutate(booking.id);
                }}
              >
                {cancelMutation.isPending &&
                cancelMutation.variables === booking.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <X className="h-4 w-4" aria-hidden />
                )}
                Cancel
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="mt-6 rounded-lg border border-[#dde4e0] bg-white p-8 text-center text-[#59645f]">
      {title}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center gap-2 text-[#59645f]">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      {label}
    </div>
  );
}
