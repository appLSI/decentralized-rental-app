// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  userId: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  date_of_birth?: string;
  address?: string;
  profile_image?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    city?: string;
    state?: string;
    date_of_birth?: string;
    address?: string;
  }) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  fetchUserProfile: (userId: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
}

const API_BASE = "http://localhost:8080";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,

      setUser: (user) => set({ user }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          // Always try to parse the response body first to get the actual error message
          let errorData = null;
          try {
            errorData = await response.json();
          } catch {
            // If response is not JSON, use default error
            errorData = { error: "Login failed" };
          }

          // Handle 403 Forbidden - this could be either unverified email OR wrong credentials
          if (response.status === 403) {
            const errorMessage =
              errorData.error || errorData.message || "Login failed";

            // Check the error message to determine the actual cause
            if (
              errorMessage.toLowerCase().includes("verify") ||
              errorMessage.toLowerCase().includes("email") ||
              errorMessage.toLowerCase().includes("vérifier")
            ) {
              throw new Error("Please verify your email before logging in");
            } else {
              // If it's not a verification error, assume it's wrong credentials
              throw new Error("Invalid email or password");
            }
          }

          // Handle other error statuses
          if (!response.ok) {
            throw new Error(
              errorData.error ||
                errorData.message ||
                `Login failed: ${response.status}`
            );
          }

          const authHeader = response.headers.get("Authorization");
          const userId = response.headers.get("user_id");

          if (!authHeader || !userId) {
            throw new Error("Missing authentication data");
          }

          const token = authHeader.replace("Bearer ", "");
          set({
            token,
            user: { userId, email },
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchUserProfile(userId);

          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || "Login failed");
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          // Always try to parse response for error messages
          let errorData = null;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: "Registration failed" };
          }

          if (response.status === 400 || response.status === 409) {
            throw new Error(
              errorData.error || errorData.message || "Email already exists"
            );
          }

          if (response.status === 201) {
            set({ isLoading: false });
            return true;
          }

          throw new Error(
            errorData.error ||
              errorData.message ||
              `Registration failed: ${response.status}`
          );
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
      },

      verifyOtp: async (email, code) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/users/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
          });

          let errorData = null;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: "Verification failed" };
          }

          if (!response.ok) {
            throw new Error(
              errorData.message || errorData.error || "Invalid OTP code"
            );
          }

          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
      },

      resendOtp: async (email) => {
        set({ isLoading: true });
        try {
          const response = await fetch(
            `${API_BASE}/users/resend-otp?email=${encodeURIComponent(email)}`,
            {
              method: "POST",
            }
          );

          let errorData = null;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: "Failed to resend OTP" };
          }

          if (!response.ok) {
            throw new Error(
              errorData.error || errorData.message || "Failed to resend OTP"
            );
          }

          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
      },

      fetchUserProfile: async (userId: string) => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE}/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Failed to fetch profile");

          const data = await response.json();
          set((state) => ({
            user: { ...state.user, ...data.data },
          }));
        } catch (error: any) {
          console.error("Fetch profile error:", error);
        }
      },

      logout: () => {
        localStorage.removeItem("auth-storage");
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user
          ? { userId: state.user.userId, email: state.user.email }
          : null,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log("Rehydrating auth storage...");
        return async (state, error) => {
          if (error) console.error("Rehydration error:", error);
          else if (state?.user?.userId)
            await state.fetchUserProfile(state.user.userId);
        };
      },
    }
  )
);
