"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Package, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { clientApi } from "@/lib/api/client";
import type { AdminPackage } from "./types";
import { useAdminPackages } from "./use-admin-packages";
import { useAdminUsers } from "./use-admin-users";

type PackageForm = {
  title: string;
  lessonsCount: string;
  price: string;
  validityDays: string;
};

const emptyPackageForm: PackageForm = {
  title: "",
  lessonsCount: "",
  price: "",
  validityDays: "",
};

export function AdminPackages() {
  const queryClient = useQueryClient();
  const packagesQuery = useAdminPackages();
  const usersQuery = useAdminUsers();
  const [message, setMessage] = useState("");
  const [createForm, setCreateForm] = useState<PackageForm>(emptyPackageForm);
  const [editing, setEditing] = useState<Record<string, PackageForm>>({});
  const [assignment, setAssignment] = useState({ userId: "", packageId: "" });
  const [deleteTarget, setDeleteTarget] = useState<AdminPackage | null>(null);

  const clients = useMemo(
    () => (usersQuery.data ?? []).filter((user) => user.role === "client"),
    [usersQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: async (form: PackageForm) => {
      const { data } = await clientApi.post("/admin/packages", toPayload(form));
      return data;
    },
    onSuccess: async () => {
      setMessage("Package created.");
      setCreateForm(emptyPackageForm);
      await queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ form, id }: { form: PackageForm; id: string }) => {
      const { data } = await clientApi.patch(
        `/admin/packages/${id}`,
        toPayload(form),
      );
      return data;
    },
    onSuccess: async () => {
      setMessage("Package updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientApi.delete(`/admin/packages/${id}`);
      return data;
    },
    onSuccess: async () => {
      setMessage("Package deleted.");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const assignMutation = useMutation({
    mutationFn: async (payload: { userId: string; packageId: string }) => {
      const { data } = await clientApi.post("/admin/client-packages", payload);
      return data;
    },
    onSuccess: () => {
      setMessage("Package assigned.");
      setAssignment({ userId: "", packageId: "" });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const packages = packagesQuery.data ?? [];

  return (
    <section>
      <ConfirmDialog
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}". This action cannot be undone.`
            : ""
        }
        isOpen={Boolean(deleteTarget)}
        isPending={deleteMutation.isPending}
        title="Delete package?"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            setMessage("");
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
            Admin
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
            Packages
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
            Create, edit, delete, and assign client packages.
          </p>
        </div>
        <div className="stats-pill">
          <Package className="h-4 w-4" aria-hidden />
          {packages.length} packages
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-md border border-[#ccd6d0] bg-white px-4 py-3 text-sm text-[#28352f]">
          {message}
        </p>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <PackageFormCard
            buttonLabel="Create package"
            form={createForm}
            isSubmitting={createMutation.isPending}
            title="New Package"
            onChange={setCreateForm}
            onSubmit={() => {
              setMessage("");
              createMutation.mutate(createForm);
            }}
          />

          <div className="rounded-lg border border-[#dde4e0] bg-white p-5">
            <h3 className="text-lg font-semibold text-[#121a16]">
              Existing Packages
            </h3>

            {packagesQuery.isLoading ? (
              <LoadingState label="Loading packages" />
            ) : packagesQuery.isError ? (
              <EmptyState
                title="Could not load packages"
                description="Try refreshing the page or checking your backend connection."
              />
            ) : packages.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No packages yet"
                description="Create the first package so clients can book classes."
              />
            ) : (
              <div className="mt-4 space-y-4">
                {packages.map((pkg) => {
                  const form = editing[pkg.id] ?? packageToForm(pkg);

                  return (
                    <article className="admin-edit-card" key={pkg.id}>
                      <PackageFields
                        form={form}
                        onChange={(next) =>
                          setEditing((value) => ({ ...value, [pkg.id]: next }))
                        }
                      />
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          className="success-button"
                          disabled={
                            updateMutation.isPending &&
                            updateMutation.variables?.id === pkg.id
                          }
                          type="button"
                          onClick={() => {
                            setMessage("");
                            updateMutation.mutate({ id: pkg.id, form });
                          }}
                        >
                          {updateMutation.isPending &&
                          updateMutation.variables?.id === pkg.id ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Save className="h-4 w-4" aria-hidden />
                          )}
                          Save
                        </button>
                        <button
                          className="danger-button"
                          disabled={
                            deleteMutation.isPending &&
                            deleteMutation.variables === pkg.id
                          }
                          type="button"
                          onClick={() => {
                            setDeleteTarget(pkg);
                          }}
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === pkg.id ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          )}
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-lg border border-[#dde4e0] bg-white p-5">
          <h3 className="text-lg font-semibold text-[#121a16]">
            Assign Package
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#59645f]">
            Give a selected package to a client.
          </p>

          <div className="mt-5 space-y-4">
            <SelectField
              label="Client"
              value={assignment.userId}
              onChange={(userId) =>
                setAssignment((value) => ({ ...value, userId }))
              }
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Package"
              value={assignment.packageId}
              onChange={(packageId) =>
                setAssignment((value) => ({ ...value, packageId }))
              }
            >
              <option value="">Select package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))}
            </SelectField>

            <button
              className="primary-button"
              disabled={
                !assignment.userId ||
                !assignment.packageId ||
                assignMutation.isPending
              }
              type="button"
              onClick={() => {
                setMessage("");
                assignMutation.mutate(assignment);
              }}
            >
              {assignMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-4 w-4" aria-hidden />
              )}
              Assign package
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PackageFormCard({
  buttonLabel,
  form,
  isSubmitting,
  onChange,
  onSubmit,
  title,
}: {
  buttonLabel: string;
  form: PackageForm;
  isSubmitting: boolean;
  onChange: (form: PackageForm) => void;
  onSubmit: () => void;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-[#dde4e0] bg-white p-5">
      <h3 className="text-lg font-semibold text-[#121a16]">{title}</h3>
      <div className="mt-4">
        <PackageFields form={form} onChange={onChange} />
      </div>
      <button
        className="primary-button mt-4"
        disabled={isSubmitting}
        type="button"
        onClick={onSubmit}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="h-4 w-4" aria-hidden />
        )}
        {buttonLabel}
      </button>
    </div>
  );
}

function PackageFields({
  form,
  onChange,
}: {
  form: PackageForm;
  onChange: (form: PackageForm) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextField
        label="Title"
        placeholder="Monthly plan"
        value={form.title}
        onChange={(title) => onChange({ ...form, title })}
      />
      <TextField
        label="Lessons"
        placeholder="12"
        type="number"
        value={form.lessonsCount}
        onChange={(lessonsCount) => onChange({ ...form, lessonsCount })}
      />
      <TextField
        label="Price"
        placeholder="99.90"
        type="number"
        value={form.price}
        onChange={(price) => onChange({ ...form, price })}
      />
      <TextField
        label="Validity days"
        placeholder="30"
        type="number"
        value={form.validityDays}
        onChange={(validityDays) => onChange({ ...form, validityDays })}
      />
    </div>
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
  placeholder: string;
  type?: "number" | "text";
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

function packageToForm(pkg: AdminPackage): PackageForm {
  return {
    title: pkg.title,
    lessonsCount: String(pkg.lessonsCount),
    price: String(pkg.price),
    validityDays: String(pkg.validityDays),
  };
}

function toPayload(form: PackageForm) {
  return {
    title: form.title,
    lessonsCount: Number(form.lessonsCount),
    price: Number(form.price),
    validityDays: Number(form.validityDays),
  };
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
