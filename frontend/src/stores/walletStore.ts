// stores/walletStore.ts
import { create } from "zustand";

interface WalletState {
  walletAddress: string | null;
  isConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  walletAddress: null,
  isConnected: false,
  connectWallet: () => {
    // Mock wallet connection - replace with actual wallet connection logic
    const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
    set({
      walletAddress: mockAddress,
      isConnected: true,
    });
  },
  disconnectWallet: () => set({ walletAddress: null, isConnected: false }),
}));
