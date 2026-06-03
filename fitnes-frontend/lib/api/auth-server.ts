import { cookies } from "next/headers";
import axios, { type AxiosRequestConfig } from "axios";
import {
  AUTH_COOKIE_NAMES,
  clearAuthCookies,
  setSessionCookies,
} from "@/lib/auth/cookies";
import type { AuthSession } from "@/lib/auth/types";
import { backendApi } from "./server";

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null;
}

export async function backendAuthGet<T>(url: string, params?: unknown) {
  return backendAuthRequest<T>({ method: "get", url, params });
}

export async function backendAuthPost<T>(url: string, body?: unknown) {
  return backendAuthRequest<T>({ data: body, method: "post", url });
}

export async function backendAuthPatch<T>(url: string, body?: unknown) {
  return backendAuthRequest<T>({ data: body, method: "patch", url });
}

export async function backendAuthDelete<T>(url: string) {
  return backendAuthRequest<T>({ method: "delete", url });
}

async function backendAuthRequest<T>(config: AxiosRequestConfig) {
  const token = await getAuthToken();

  try {
    return await backendApi.request<T>({
      ...config,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();

    if (!refreshedToken) {
      throw error;
    }

    return backendApi.request<T>({
      ...config,
      headers: { Authorization: `Bearer ${refreshedToken}` },
    });
  }
}

export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    const { data } = await backendApi.post<{ session: AuthSession }>(
      "/auth/refresh",
      { refreshToken },
    );

    await setSessionCookies(data.session);

    return data.session.access_token;
  } catch {
    await clearAuthCookies();
    return null;
  }
}
