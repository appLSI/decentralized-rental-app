// src/features/auth/types/auth.types.ts

// Minimal User type for login
export interface User {
  id: string;
  userId: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
  types: string[];
  phone?: string;
  address?: string;
  createdAt?: string;
}

// Login response
export interface LoginResponse {
  token: string;
  user: User;
}

// Login input
export interface LoginData {
  email: string;
  password: string;
}

// Register input
export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
}

// Verify OTP input
export interface VerifyOtpData {
  email: string;
  code: string;
}

// Forgot Password input
export interface ForgotPasswordData {
  email: string;
}

// Reset Password input
export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}



// Zustand Auth State
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  token: string | null;

  login: (data: LoginData) => Promise<User>;
  register: (data: RegisterData) => Promise<boolean>;
  verifyOtp: (data: VerifyOtpData) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  forgotPassword: (data: ForgotPasswordData) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;

  logout: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
}