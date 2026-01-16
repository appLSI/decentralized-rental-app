import { create } from "zustand";
import { toast } from "@/shared/hooks/use-toast";
import { isAddress } from "viem";

import { walletService } from "@/features/auth/services/wallet.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { WalletState } from "@/features/auth/types/wallet.type";
import { useProfileStore } from "@/features/settings/store/profile.store";

export const useWalletStore = create<WalletState>((set, get) => ({
    walletAddress: null,
    isConnected: false,

    // ---------------- INITIALIZE ----------------
    initialize: () => {
        if (typeof window === "undefined") return;

        // Restore from localStorage (UI only, not backend sync)
        const savedAddress = localStorage.getItem("walletAddress");
        const walletConnected = localStorage.getItem("walletConnected") === "true";

        if (walletConnected && savedAddress && isAddress(savedAddress)) {
            set({ walletAddress: savedAddress, isConnected: true });
        }

        if (!window.ethereum) return;

        // MetaMask account change listener
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length === 0) {
                get().disconnect();
                return;
            }

            const address = accounts[0];
            if (!isAddress(address)) return;

            // ONLY update local state (no backend call)
            set({ walletAddress: address, isConnected: true });
            localStorage.setItem("walletAddress", address);
            localStorage.setItem("walletConnected", "true");
        });

        window.ethereum.on("disconnect", () => {
            get().disconnect();
        });
    },

    // ---------------- CONNECT ----------------
    connect: async () => {
        if (!window.ethereum) {
            toast({
                title: "MetaMask Missing",
                description: "Please install MetaMask to continue",
                variant: "destructive",
            });
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const address = accounts?.[0];
            if (!isAddress(address)) {
                throw new Error("Invalid wallet address");
            }

            const user = useAuthStore.getState().user;
            if (!user?.id) {
                throw new Error("User not authenticated");
            }

            // Backend sync (ONLY here)
            await walletService.connectWallet(user.id, address);

            // Persist locally
            localStorage.setItem("walletAddress", address);
            localStorage.setItem("walletConnected", "true");

            set({ walletAddress: address, isConnected: true });

            toast({
                title: "Wallet Connected",
                description: `${address.slice(0, 6)}...${address.slice(-4)}`,
            });
        } catch (error: any) {
            toast({
                title: "Wallet Connection Failed",
                description: error?.message || "Could not connect wallet",
                variant: "destructive",
            });
            throw error;
        }
    },

    // ---------------- DISCONNECT ----------------
    disconnect: async () => {
        try {
            const { user } = useAuthStore.getState();
            const { walletAddress } = get();

            if (user?.id && walletAddress) {
                const result = await walletService.disconnectWallet(user.id);

                // Handle blocked disconnect (union-safe)
                if ("canDisconnect" in result && result.canDisconnect === false) {
                    toast({
                        title: "Cannot Disconnect Wallet",
                        description: result.reasons.join(", "),
                        variant: "destructive",
                    });
                    return;
                }
            }

            // Clear storage
            localStorage.removeItem("walletAddress");
            localStorage.removeItem("walletConnected");

            // Clear Zustand state
            set({ walletAddress: null, isConnected: false });

            // Sync profile store
            useProfileStore.getState().updateUserWallet(null);

            toast({
                title: "Wallet Disconnected",
                description: "Your wallet has been disconnected",
            });
        } catch (error: any) {
            toast({
                title: "Disconnection Failed",
                description: error?.message || "Unable to disconnect wallet",
                variant: "destructive",
            });
        }
    },

    // ---------------- FETCH STATUS ----------------
    fetchWalletStatus: async () => {
        try {
            const user = useAuthStore.getState().user;
            if (!user?.id) return;

            const status = await walletService.getWalletStatus(user.id);

            if (status.hasWallet && status.walletAddress) {
                set({
                    walletAddress: status.walletAddress,
                    isConnected: true,
                });

                localStorage.setItem("walletAddress", status.walletAddress);
                localStorage.setItem("walletConnected", "true");
            }
        } catch (error) {
            console.error("[WalletStore] Failed to fetch wallet status", error);
        }
    },
}));

