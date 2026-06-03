"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Shield, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { clientApi } from "@/lib/api/client";
import type { UserRole, UserStatus } from "@/lib/auth/types";
import type { AdminUser } from "./types";
import { useAdminUsers } from "./use-admin-users";

const roles: UserRole[] = ["client", "trainer", "admin"];

export function AdminUsers() {
  const queryClient = useQueryClient();
  const usersQuery = useAdminUsers();
  const [message, setMessage] = useState("");

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { data } = await clientApi.patch(`/admin/users/${id}/role`, {
        role,
      });

      return data;
    },
    onSuccess: async () => {
      setMessage("Role updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserStatus }) => {
      const { data } = await clientApi.patch(`/admin/users/${id}/status`, {
        status,
      });

      return data;
    },
    onSuccess: async () => {
      setMessage("Status updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => setMessage(getErrorMessage(error)),
  });

  const users = usersQuery.data ?? [];

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
            Admin
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">
            Users
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
            Manage account roles and access status.
          </p>
        </div>
        <div className="stats-pill">
          <Shield className="h-4 w-4" aria-hidden />
          {users.length} users
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-md border border-[#ccd6d0] bg-white px-4 py-3 text-sm text-[#28352f]">
          {message}
        </p>
      )}

      {usersQuery.isLoading ? (
        <LoadingState label="Loading users" />
      ) : usersQuery.isError ? (
        <EmptyState
          title="Could not load users"
          description="Try refreshing the page or checking your backend connection."
        />
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-[#dde4e0] bg-white">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    isRoleUpdating={
                      roleMutation.isPending &&
                      roleMutation.variables?.id === user.id
                    }
                    isStatusUpdating={
                      statusMutation.isPending &&
                      statusMutation.variables?.id === user.id
                    }
                    key={user.id}
                    onRoleChange={(role) => {
                      setMessage("");
                      roleMutation.mutate({ id: user.id, role });
                    }}
                    onStatusChange={(status) => {
                      setMessage("");
                      statusMutation.mutate({ id: user.id, status });
                    }}
                    user={user}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function UserRow({
  isRoleUpdating,
  isStatusUpdating,
  onRoleChange,
  onStatusChange,
  user,
}: {
  isRoleUpdating: boolean;
  isStatusUpdating: boolean;
  onRoleChange: (role: UserRole) => void;
  onStatusChange: (status: UserStatus) => void;
  user: AdminUser;
}) {
  const nextStatus: UserStatus = user.status === "active" ? "blocked" : "active";

  return (
    <tr>
      <td>
        <div>
          <p className="font-semibold text-[#121a16]">{user.name}</p>
          <p className="mt-1 text-sm text-[#6b7871]">{user.email}</p>
        </div>
      </td>
      <td>
        <div className="select-wrap">
          <select
            aria-label={`Change role for ${user.name}`}
            className="admin-select"
            disabled={isRoleUpdating}
            value={user.role}
            onChange={(event) => onRoleChange(event.target.value as UserRole)}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {isRoleUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </td>
      <td>
        <span
          className={
            user.status === "active"
              ? "status-badge status-active"
              : "status-badge status-blocked"
          }
        >
          {user.status}
        </span>
      </td>
      <td>{formatDate(user.createdAt)}</td>
      <td>
        <button
          className={user.status === "active" ? "danger-button" : "success-button"}
          disabled={isStatusUpdating}
          type="button"
          onClick={() => onStatusChange(nextStatus)}
        >
          {isStatusUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : user.status === "active" ? (
            <UserX className="h-4 w-4" aria-hidden />
          ) : (
            <UserCheck className="h-4 w-4" aria-hidden />
          )}
          {user.status === "active" ? "Block" : "Activate"}
        </button>
      </td>
    </tr>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return "Request failed.";
}
