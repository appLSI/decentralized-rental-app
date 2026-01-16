// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  User,
  RegisterData,
  LoginData,
  VerifyOtpData,
  ResetPasswordData,
  ForgotPasswordData,
  AuthState,
} from "@/features/auth/types/auth.types";

import { authService } from "@/features/auth/services/auth.service";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),

      // ---------------- LOGIN ----------------
      login: async (data: LoginData) => {
        set({ isLoading: true });

        try {
          const { token, user } = await authService.login(data);

          set({
            token,
            user,
            isAuthenticated: true,
          });

          return user; // ✅ RETURN USER (KEY FIX)
        } catch (error: any) {
          throw new Error(error?.message || "Login failed");
        } finally {
          set({ isLoading: false });
        }
      },


      // ---------------- REGISTER ----------------
      register: async (data: RegisterData): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.register(data);
          return true;
        } catch (error: any) {
          throw new Error(error?.message || "Registration failed");
        } finally {
          set({ isLoading: false });
        }
      },

      // ---------------- VERIFY OTP ----------------
      verifyOtp: async (data: VerifyOtpData): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.verifyOtp(data);
          return true;
        } catch (error: any) {
          throw new Error(error?.message || "OTP verification failed");
        } finally {
          set({ isLoading: false });
        }
      },

      // ---------------- RESEND OTP ----------------
      resendOtp: async (email: string): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.resendOtp(email);
          return true;
        } catch (error: any) {
          throw new Error(error?.message || "Failed to resend OTP");
        } finally {
          set({ isLoading: false });
        }
      },

      // ---------------- FORGOT PASSWORD ----------------
      forgotPassword: async (
        data: ForgotPasswordData
      ): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.forgotPassword(data);
          return true;
        } catch (error: any) {
          throw new Error(error?.message || "Request failed");
        } finally {
          set({ isLoading: false });
        }
      },

      // ---------------- RESET PASSWORD ----------------
      resetPassword: async (
        data: ResetPasswordData
      ): Promise<boolean> => {
        set({ isLoading: true });
        try {
          await authService.resetPassword(data);
          return true;
        } catch (error: any) {
          throw new Error(error?.message || "Reset failed");
        } finally {
          set({ isLoading: false });
        }
      },

      // ---------------- LOGOUT ----------------
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });

        // Clear storage
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("walletConnected");


      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);