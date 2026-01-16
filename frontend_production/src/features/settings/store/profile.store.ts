import { create } from "zustand";
import { ProfileServices } from "../services/profile.service";
import { ProfileState, UserData } from "../types/profile.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { User } from "@/features/auth/types/auth.types";

/**
 * Helper to map UserData (from profile) to User (for auth store)
 */
const mapUserDataToUser = (userData: UserData): User => {
  return {
    id: userData.userId,
    userId: userData.userId,
    email: userData.email,
    firstname: userData.firstname || "",
    lastname: userData.lastname || "",
    // Map singular role/types from UserData to plural arrays for User
    roles: userData.roles || [],
    types: userData.types || [],
    phone: userData.phone,
    address: userData.address,
    createdAt: userData.createdAt,
  };
};

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  loading: false,
  error: null,

  // ---------------- FETCH USER PROFILE ----------------
  fetchUserProfile: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const userData = await ProfileServices.fetchUserProfile(userId);

      set({ user: userData, loading: false });

      // ✅ Sync with Auth Store
      if (userData) {
        useAuthStore.getState().setUser(mapUserDataToUser(userData));
      }

      return userData;
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch user profile",
        loading: false,
      });
      throw error;
    }
  },

  // ---------------- CLEAR ANY ERROR ----------------
  clearError: () => set({ error: null }),

  // ---------------- SET USER DATA (Manual update) ----------------
  setUser: (userData: UserData) => set({ user: userData }),

  // ---------------- UPDATE USER WALLET (Frontend only) ----------------
  updateUserWallet: (address: string | null) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, walletAddress: address }
        : null,
    })),

  // ---------------- UPDATE USER PROFILE ----------------
  updateUserProfile: async (userId: string, data: Partial<UserData>) => {
    try {
      set({ loading: true, error: null });
      const updatedUser = await ProfileServices.updateUserProfile(userId, data);
      set({ user: updatedUser, loading: false });

      // ✅ Sync with Auth Store
      if (updatedUser) {
        useAuthStore.getState().setUser(mapUserDataToUser(updatedUser));
      }

      return updatedUser;
    } catch (error: any) {
      set({
        error: error.message || "Failed to update profile",
        loading: false,
      });
      throw error;
    }
  },
}));
