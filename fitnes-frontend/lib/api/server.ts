import axios from "axios";

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    return message ?? error.message;
  }

  return "Something went wrong";
}
