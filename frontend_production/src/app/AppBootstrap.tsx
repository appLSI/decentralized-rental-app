import { useEffect } from "react";

import { useWalletStore } from "@/shared/stores/wallet.store";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * AppBootstrap handles all global side effects and initialization logic.
 * This includes theme, wallet, auth profile fetching, and geolocation.
 */
export const AppBootstrap = () => {
    const initializeWallet = useWalletStore((s) => s.initialize);
    const fetchWalletStatus = useWalletStore((s) => s.fetchWalletStatus);

    const { user: authUser, isAuthenticated } = useAuthStore();

    // Initialize theme and wallet on mount
    useEffect(() => {

        initializeWallet();
    }, [initializeWallet]);

    // Fetch user profile and wallet status when authenticated
    useEffect(() => {
        if (isAuthenticated && authUser?.userId) {

            fetchWalletStatus(authUser.userId);
        }
    }, [isAuthenticated, authUser?.userId, fetchWalletStatus]);


    return null;
};
