// src/pages/Authentication/authService.ts
import { publicApiClient } from "@/lib/api/publicApiClient";
import {
  LoginData,
  LoginResponse,
  RegisterData,
  VerifyOtpData,
  ForgotPasswordData,
  ResetPasswordData,
} from "../types/auth.types";

const extractErrorMessage = (error: any, fallback: string) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
};

export const authService = {
  // ================= LOGIN =================
  login: async (
    data: LoginData
  ): Promise<LoginResponse> => {
    try {
      const response = await publicApiClient.post(
        "/auth/users/login",
        data
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Authentication data missing in response");
      }

      // Return only essential data for login
      return {
        token: token,
        user: {
          id: user.userId, // Use userId as id
          userId: user.userId,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          roles: user.roles || [],
          types: user.types || []
        }
      };
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = extractErrorMessage(error, "Login failed");

      if (status === 403) {
        throw new Error("Please verify your email before logging in");
      }

      if (status === 401) {
        throw new Error("VERIFICATION_REQUIRED");
      }

      throw new Error(msg);
    }
  },

  // ================= REGISTER =================
  register: async (data: RegisterData): Promise<void> => {
    try {
      await publicApiClient.post("/auth/users", data);
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = extractErrorMessage(error, "Registration failed");

      if (status === 400 || status === 409) {
        if (msg.toLowerCase().includes("email")) {
          throw new Error("Email already exists");
        }
        throw new Error("Invalid registration data");
      }

      throw new Error(msg);
    }
  },

  // ================= VERIFY OTP =================
  verifyOtp: async (data: VerifyOtpData): Promise<void> => {
    try {
      await publicApiClient.post("/auth/users/verify-otp", data);
    } catch (error: any) {
      const msg = extractErrorMessage(error, "Invalid or expired OTP code");
      throw new Error(msg);
    }
  },

  // ================= RESEND OTP =================
  resendOtp: async (email: string): Promise<void> => {
    try {
      await publicApiClient.post(
        "/auth/users/resend-otp",
        null,
        { params: { email } }
      );
    } catch (error: any) {
      const msg = extractErrorMessage(error, "Failed to resend OTP");
      throw new Error(msg);
    }
  },

  // ================= FORGOT PASSWORD =================
  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    try {
      await publicApiClient.post(
        "/auth/users/forgot-password",
        data
      );
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = extractErrorMessage(
        error,
        "Failed to send reset instructions"
      );

      if (status === 404) {
        throw new Error("No account found with this email");
      }

      throw new Error(msg);
    }
  },

  // ================= RESET PASSWORD =================
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    try {
      await publicApiClient.post(
        "/auth/users/reset-password",
        data
      );
    } catch (error: any) {
      const msg = extractErrorMessage(
        error,
        "Invalid or expired reset code"
      );
      throw new Error(msg);
    }
  },
};