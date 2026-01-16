// src/lib/apiClient.ts
import axios from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store"; // import your store (adjust path)

export const privateApiClient = axios.create({
  baseURL: "http://localhost:8082/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- REQUEST INTERCEPTOR ----------------
privateApiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; // read from Zustand without hook

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
