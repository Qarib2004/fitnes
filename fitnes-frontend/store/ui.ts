import { atom } from "jotai";
import { getWeekStart } from "@/features/schedule/date-utils";

export type ToastMessage = {
  id: number;
  tone: "success" | "error" | "info";
  text: string;
};

export const clientScheduleWeekAtom = atom<Date>(getWeekStart());
export const trainerScheduleWeekAtom = atom<Date>(getWeekStart());
export const toastAtom = atom<ToastMessage | null>(null);

export const showToastAtom = atom(
  null,
  (_get, set, message: Omit<ToastMessage, "id">) => {
    set(toastAtom, {
      ...message,
      id: Date.now(),
    });
  },
);

export const clearToastAtom = atom(null, (_get, set) => {
  set(toastAtom, null);
});
