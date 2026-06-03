"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useSetAtom } from "jotai";
import Lenis from "lenis";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, LoadingState } from "@/components/ui/state";
import {
  addDays,
  formatDay,
  formatTime,
  getWeekStart,
  toDateInputValue,
} from "@/features/schedule/date-utils";
import type { ScheduleSlot } from "@/features/schedule/types";
import { clientApi } from "@/lib/api/client";
import { showToastAtom } from "@/store/ui";
import { useAdminUsers } from "./use-admin-users";
import {
  useAdminClasses,
  useAdminRooms,
  useAdminSchedule,
} from "./use-admin-schedule-data";

type ClassForm = {
  title: string;
  description: string;
  capacity: string;
};

type RoomForm = {
  title: string;
  capacity: string;
};

type SlotForm = {
  classId: string;
  trainerId: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
};

type DeleteTarget =
  | { id: string; kind: "class"; name: string }
  | { id: string; kind: "room"; name: string }
  | { id: string; kind: "slot"; name: string };

const emptyClassForm: ClassForm = {
  title: "",
  description: "",
  capacity: "",
};

const emptyRoomForm: RoomForm = {
  title: "",
  capacity: "",
};

const emptySlotForm: SlotForm = {
  classId: "",
  trainerId: "",
  roomId: "",
  startsAt: "",
  endsAt: "",
};

export function AdminSchedule() {
  const queryClient = useQueryClient();
  const showToast = useSetAtom(showToastAtom);
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [classForm, setClassForm] = useState<ClassForm>(emptyClassForm);
  const [roomForm, setRoomForm] = useState<RoomForm>(emptyRoomForm);
  const [slotForm, setSlotForm] = useState<SlotForm>(emptySlotForm);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const weekStartValue = toDateInputValue(weekStart);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const classesQuery = useAdminClasses();
  const roomsQuery = useAdminRooms();
  const usersQuery = useAdminUsers();
  const scheduleQuery = useAdminSchedule(weekStartValue);

  const trainers = useMemo(
    () => (usersQuery.data ?? []).filter((user) => user.role === "trainer"),
    [usersQuery.data],
  );

  const createClassMutation = useMutation({
    mutationFn: async (form: ClassForm) => {
      const { data } = await clientApi.post("/admin/classes", {
        title: form.title,
        description: form.description || undefined,
        capacity: Number(form.capacity),
      });
      return data;
    },
    onSuccess: async () => {
      setClassForm(emptyClassForm);
      showToast({ text: "Class created.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientApi.delete(`/admin/classes/${id}`);
      return data;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      showToast({ text: "Class deleted.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ form, id }: { form: ClassForm; id: string }) => {
      const { data } = await clientApi.patch(`/admin/classes/${id}`, {
        title: form.title,
        description: form.description || undefined,
        capacity: Number(form.capacity),
      });
      return data;
    },
    onSuccess: async () => {
      setEditingClassId(null);
      setClassForm(emptyClassForm);
      showToast({ text: "Class updated.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const createRoomMutation = useMutation({
    mutationFn: async (form: RoomForm) => {
      const { data } = await clientApi.post("/admin/rooms", {
        title: form.title,
        capacity: Number(form.capacity),
      });
      return data;
    },
    onSuccess: async () => {
      setRoomForm(emptyRoomForm);
      showToast({ text: "Room created.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientApi.delete(`/admin/rooms/${id}`);
      return data;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      showToast({ text: "Room deleted.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ form, id }: { form: RoomForm; id: string }) => {
      const { data } = await clientApi.patch(`/admin/rooms/${id}`, {
        title: form.title,
        capacity: Number(form.capacity),
      });
      return data;
    },
    onSuccess: async () => {
      setEditingRoomId(null);
      setRoomForm(emptyRoomForm);
      showToast({ text: "Room updated.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const createSlotMutation = useMutation({
    mutationFn: async (form: SlotForm) => {
      const { data } = await clientApi.post("/admin/schedule", {
        classId: form.classId,
        trainerId: form.trainerId,
        roomId: form.roomId || null,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      });
      return data;
    },
    onSuccess: async () => {
      setSlotForm(emptySlotForm);
      showToast({ text: "Schedule slot created.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
      await queryClient.invalidateQueries({ queryKey: ["schedule"] });
      await queryClient.invalidateQueries({ queryKey: ["trainer-schedule"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientApi.delete(`/admin/schedule/${id}`);
      return data;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      showToast({ text: "Schedule slot deleted.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
      await queryClient.invalidateQueries({ queryKey: ["schedule"] });
      await queryClient.invalidateQueries({ queryKey: ["trainer-schedule"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ form, id }: { form: SlotForm; id: string }) => {
      const { data } = await clientApi.patch(`/admin/schedule/${id}`, {
        classId: form.classId,
        trainerId: form.trainerId,
        roomId: form.roomId || null,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      });
      return data;
    },
    onSuccess: async () => {
      setEditingSlotId(null);
      setSlotForm(emptySlotForm);
      showToast({ text: "Schedule slot updated.", tone: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
      await queryClient.invalidateQueries({ queryKey: ["schedule"] });
      await queryClient.invalidateQueries({ queryKey: ["trainer-schedule"] });
    },
    onError: (error) => showToast({ text: getErrorMessage(error), tone: "error" }),
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
      <ConfirmDialog
        description={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.kind} "${deleteTarget.name}". This action cannot be undone.`
            : ""
        }
        isOpen={Boolean(deleteTarget)}
        isPending={
          deleteClassMutation.isPending ||
          deleteRoomMutation.isPending ||
          deleteSlotMutation.isPending
        }
        title={`Delete ${deleteTarget?.kind ?? "item"}?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }

          if (deleteTarget.kind === "class") {
            deleteClassMutation.mutate(deleteTarget.id);
          } else if (deleteTarget.kind === "room") {
            deleteRoomMutation.mutate(deleteTarget.id);
          } else {
            deleteSlotMutation.mutate(deleteTarget.id);
          }
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
            Admin
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
            Schedule
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
            Create classes, rooms, and weekly schedule slots.
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

      <div className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <Panel title={editingClassId ? "Edit Class" : "Create Class"}>
            <div className="space-y-3">
              <TextField
                label="Title"
                placeholder="Yoga"
                value={classForm.title}
                onChange={(title) => setClassForm((value) => ({ ...value, title }))}
              />
              <TextField
                label="Description"
                placeholder="Morning balance class"
                value={classForm.description}
                onChange={(description) =>
                  setClassForm((value) => ({ ...value, description }))
                }
              />
              <TextField
                label="Capacity"
                placeholder="12"
                type="number"
                value={classForm.capacity}
                onChange={(capacity) =>
                  setClassForm((value) => ({ ...value, capacity }))
                }
              />
              <SubmitButton
                icon={
                  editingClassId ? (
                    <Save className="h-4 w-4" aria-hidden />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden />
                  )
                }
                isLoading={
                  createClassMutation.isPending || updateClassMutation.isPending
                }
                label={editingClassId ? "Save class" : "Create class"}
                onClick={() => {
                  if (editingClassId) {
                    updateClassMutation.mutate({
                      form: classForm,
                      id: editingClassId,
                    });
                    return;
                  }

                  createClassMutation.mutate(classForm);
                }}
              />
              {editingClassId && (
                <button
                  className="secondary-icon-button w-full"
                  type="button"
                  onClick={() => {
                    setEditingClassId(null);
                    setClassForm(emptyClassForm);
                  }}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Cancel
                </button>
              )}
            </div>
            <CompactList
              emptyLabel="No classes yet."
              items={(classesQuery.data ?? []).map((item) => ({
                id: item.id,
                title: item.title,
                meta: `${item.capacity} capacity`,
                raw: item,
              }))}
              loading={classesQuery.isLoading}
              onDelete={(item) =>
                setDeleteTarget({
                  id: item.id,
                  kind: "class",
                  name: item.title,
                })
              }
              onEdit={(item) => {
                setEditingClassId(item.id);
                setClassForm({
                  capacity: String(item.raw.capacity),
                  description: item.raw.description ?? "",
                  title: item.raw.title,
                });
              }}
            />
          </Panel>

          <Panel title={editingRoomId ? "Edit Room" : "Create Room"}>
            <div className="space-y-3">
              <TextField
                label="Title"
                placeholder="Main Hall"
                value={roomForm.title}
                onChange={(title) => setRoomForm((value) => ({ ...value, title }))}
              />
              <TextField
                label="Capacity"
                placeholder="20"
                type="number"
                value={roomForm.capacity}
                onChange={(capacity) =>
                  setRoomForm((value) => ({ ...value, capacity }))
                }
              />
              <SubmitButton
                icon={
                  editingRoomId ? (
                    <Save className="h-4 w-4" aria-hidden />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden />
                  )
                }
                isLoading={
                  createRoomMutation.isPending || updateRoomMutation.isPending
                }
                label={editingRoomId ? "Save room" : "Create room"}
                onClick={() => {
                  if (editingRoomId) {
                    updateRoomMutation.mutate({
                      form: roomForm,
                      id: editingRoomId,
                    });
                    return;
                  }

                  createRoomMutation.mutate(roomForm);
                }}
              />
              {editingRoomId && (
                <button
                  className="secondary-icon-button w-full"
                  type="button"
                  onClick={() => {
                    setEditingRoomId(null);
                    setRoomForm(emptyRoomForm);
                  }}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Cancel
                </button>
              )}
            </div>
            <CompactList
              emptyLabel="No rooms yet."
              items={(roomsQuery.data ?? []).map((item) => ({
                id: item.id,
                title: item.title,
                meta: `${item.capacity} capacity`,
                raw: item,
              }))}
              loading={roomsQuery.isLoading}
              onDelete={(item) =>
                setDeleteTarget({
                  id: item.id,
                  kind: "room",
                  name: item.title,
                })
              }
              onEdit={(item) => {
                setEditingRoomId(item.id);
                setRoomForm({
                  capacity: String(item.raw.capacity),
                  title: item.raw.title,
                });
              }}
            />
          </Panel>
        </aside>

        <div className="space-y-5">
          <Panel title={editingSlotId ? "Edit Schedule Slot" : "Create Schedule Slot"}>
            <div className="grid gap-3 md:grid-cols-2">
              <SelectField
                label="Class"
                value={slotForm.classId}
                onChange={(classId) =>
                  setSlotForm((value) => ({ ...value, classId }))
                }
              >
                <option value="">Select class</option>
                {(classesQuery.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Trainer"
                value={slotForm.trainerId}
                onChange={(trainerId) =>
                  setSlotForm((value) => ({ ...value, trainerId }))
                }
              >
                <option value="">Select trainer</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Room"
                value={slotForm.roomId}
                onChange={(roomId) =>
                  setSlotForm((value) => ({ ...value, roomId }))
                }
              >
                <option value="">No room</option>
                {(roomsQuery.data ?? []).map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.title}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Starts at"
                type="datetime-local"
                value={slotForm.startsAt}
                onChange={(startsAt) =>
                  setSlotForm((value) => ({ ...value, startsAt }))
                }
              />
              <TextField
                label="Ends at"
                type="datetime-local"
                value={slotForm.endsAt}
                onChange={(endsAt) =>
                  setSlotForm((value) => ({ ...value, endsAt }))
                }
              />
            </div>
            <div className="mt-4">
              <SubmitButton
                icon={
                  editingSlotId ? (
                    <Save className="h-4 w-4" aria-hidden />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden />
                  )
                }
                isLoading={
                  createSlotMutation.isPending || updateSlotMutation.isPending
                }
                label={
                  editingSlotId ? "Save schedule slot" : "Create schedule slot"
                }
                onClick={() => {
                  if (editingSlotId) {
                    updateSlotMutation.mutate({
                      form: slotForm,
                      id: editingSlotId,
                    });
                    return;
                  }

                  createSlotMutation.mutate(slotForm);
                }}
              />
              {editingSlotId && (
                <button
                  className="secondary-icon-button mt-2 w-full"
                  type="button"
                  onClick={() => {
                    setEditingSlotId(null);
                    setSlotForm(emptySlotForm);
                  }}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Cancel
                </button>
              )}
            </div>
          </Panel>

          <motion.div layout className="schedule-grid admin-schedule-grid">
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
                    <h3 className="font-semibold text-[#18211d]">
                      {formatDay(day)}
                    </h3>
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
                      <SmoothCardsScroll>
                        <motion.div className="admin-slot-list-content" layout>
                          {slots.map((slot) => (
                            <AdminSlotCard
                              isDeleting={
                                deleteSlotMutation.isPending &&
                                deleteSlotMutation.variables === slot.id
                              }
                              key={slot.id}
                              onDelete={() =>
                                setDeleteTarget({
                                  id: slot.id,
                                  kind: "slot",
                                  name: slot.classTitle,
                                })
                              }
                              onEdit={() => {
                                setEditingSlotId(slot.id);
                                setSlotForm(slotToForm(slot));
                              }}
                              slot={slot}
                            />
                          ))}
                        </motion.div>
                      </SmoothCardsScroll>
                    </AnimatePresence>
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SmoothCardsScroll({ children }: { children: React.ReactNode }) {
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
    <div className="admin-slot-list-scroll" ref={wrapperRef}>
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

function AdminSlotCard({
  isDeleting,
  onDelete,
  onEdit,
  slot,
}: {
  isDeleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
  slot: ScheduleSlot;
}) {
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
        <span className="spots-badge">{slot.booked} booked</span>
      </div>

      <div className="mt-4 space-y-1 text-xs text-[#59645f]">
        <p>Trainer: {slot.trainerName}</p>
        <p>Room: {slot.roomTitle ?? "Not assigned"}</p>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          className="secondary-icon-button w-full"
          type="button"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Edit
        </button>
        <button
          className="danger-button w-full"
          disabled={isDeleting}
          type="button"
          onClick={onDelete}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden />
          )}
          Delete
        </button>
      </div>
    </motion.div>
  );
}

function Panel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[#dde4e0] bg-white p-5">
      <h3 className="text-lg font-semibold text-[#121a16]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CompactList({
  emptyLabel,
  items,
  loading,
  onDelete,
  onEdit,
}: {
  emptyLabel: string;
  items: Array<{
    id: string;
    meta: string;
    raw: { capacity: number; description?: string | null; title: string };
    title: string;
  }>;
  loading: boolean;
  onDelete: (item: {
    id: string;
    meta: string;
    raw: { capacity: number; description?: string | null; title: string };
    title: string;
  }) => void;
  onEdit: (item: {
    id: string;
    meta: string;
    raw: { capacity: number; description?: string | null; title: string };
    title: string;
  }) => void;
}) {
  if (loading) {
    return <LoadingState label="Loading" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState title={emptyLabel} />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => (
        <div className="compact-row" key={item.id}>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#121a16]">
              {item.title}
            </p>
            <p className="text-xs text-[#6b7871]">{item.meta}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              aria-label={`Edit ${item.title}`}
              className="icon-neutral-button"
              type="button"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            <button
              aria-label={`Delete ${item.title}`}
              className="icon-danger-button"
              type="button"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubmitButton({
  icon,
  isLoading,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  isLoading: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="primary-button" disabled={isLoading} type="button" onClick={onClick}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {label}
    </button>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "datetime-local" | "number" | "text";
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#28352f]">
        {label}
      </span>
      <input
        className="field-input"
        min={type === "number" ? 0 : undefined}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#28352f]">
        {label}
      </span>
      <select
        className="admin-select w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    return message ?? error.message;
  }

  return "Request failed.";
}

function slotToForm(slot: ScheduleSlot): SlotForm {
  return {
    classId: slot.classId,
    endsAt: toLocalDateTimeInputValue(slot.endsAt),
    roomId: slot.roomId ?? "",
    startsAt: toLocalDateTimeInputValue(slot.startsAt),
    trainerId: slot.trainerId,
  };
}

function toLocalDateTimeInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}
