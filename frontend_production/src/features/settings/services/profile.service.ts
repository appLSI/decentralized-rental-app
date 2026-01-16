// src/pages/Settings/Profile/ProfileServices.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import { UserData } from "../types/profile.types";

export const ProfileServices = {
  // ---------------- FETCH USER PROFILE (PROTECTED) ----------------
  fetchUserProfile: async (userId: string): Promise<UserData> => {
    try {
      const response = await privateApiClient.get<UserData>(`auth/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("[ProfileServices] Fetch user profile failed:", error?.response?.data || error);
      throw new Error(
        error?.response?.data?.message || "Failed to fetch user profile"
      );
    }
  },

  // ---------------- UPDATE USER PROFILE (PROTECTED) ----------------
  updateUserProfile: async (
    userId: string,
    data: Partial<UserData>
  ): Promise<UserData> => {
    try {
      const response = await privateApiClient.put<UserData>(`auth/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      console.error("[ProfileServices] Update user profile failed:", error?.response?.data || error);
      throw new Error(
        error?.response?.data?.message || "Failed to update profile"
      );
    }
  },
};
