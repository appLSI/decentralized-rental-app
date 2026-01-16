// src/features/wallet/services/walletService.ts
import { privateApiClient } from "@/lib/api/privateApiClient";
import {
  WalletConnectResponse,
  WalletDisconnectResponse,
  WalletStatusResponse,
} from "../types/wallet.type";

export const walletService = {
  // ---------------- CONNECT WALLET ----------------
  connectWallet: async (
    userId: string,
    walletAddress: string
  ): Promise<WalletConnectResponse> => {
    if (import.meta.env.DEV) {
      console.log("[WalletService] Connecting wallet...", { userId });
    }

    try {
      const response = await privateApiClient.post(
        `/auth/users/${userId}/wallet/connect`,
        { walletAddress }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to connect wallet"
      );
    }
  },

  // ---------------- DISCONNECT WALLET ----------------
  disconnectWallet: async (
    userId: string
  ): Promise<WalletDisconnectResponse> => {
    if (import.meta.env.DEV) {
      console.log("[WalletService] Disconnecting wallet...", { userId });
    }

    try {
      const response = await privateApiClient.delete(
        `/auth/users/${userId}/wallet/disconnect`
      );

      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 400) {
        throw new Error(
          error?.response?.data?.message || "Wallet already disconnected"
        );
      }

      throw new Error(
        error?.response?.data?.message || "Failed to disconnect wallet"
      );
    }
  },

  // ---------------- WALLET STATUS ----------------
  getWalletStatus: async (
    userId: string
  ): Promise<WalletStatusResponse> => {
    if (import.meta.env.DEV) {
      console.log("[WalletService] Fetching wallet status...", { userId });
    }

    try {
      const response = await privateApiClient.get(
        `/auth/users/${userId}/wallet/status`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to get wallet status"
      );
    }
  },
};
