import axios from "axios";

export const clientApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});
