// Updated WalletConnectButton.tsx
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWalletStore } from "@/shared/stores/wallet.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface WalletConnectButtonProps {
  className?: string;
  children?: ReactNode;
  onUnauthenticatedClick?: () => void;
}

export function WalletConnectButton({
  className = "",
  children,
  onUnauthenticatedClick
}: WalletConnectButtonProps) {
  // REAL wallet state
  const { isConnected, walletAddress, connect, disconnect } = useWalletStore();

  // BACKEND wallet state
  const profileWallet = useProfileStore((s) => s.user?.walletAddress);
  const { isAuthenticated } = useAuthStore();

  // Debug logging
  useEffect(() => {
    console.log("[WalletConnectButton]", {
      walletAddress,
      isConnected,
      profileWallet,
      isAuthenticated,
    });
  }, [walletAddress, isConnected, profileWallet, isAuthenticated]);

  // Determine connection using combined logic
  const finalIsConnected = isConnected || !!profileWallet;

  const finalAddress = walletAddress || profileWallet || null;

  const formatWalletAddress = (addr: string | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletConnect = async () => {
    try {
      // If not authenticated, show sign in popup
      if (!isAuthenticated && onUnauthenticatedClick) {
        onUnauthenticatedClick();
        return;
      }

      if (finalIsConnected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const label =
    finalIsConnected && finalAddress
      ? `Connected: ${formatWalletAddress(finalAddress)}`
      : "Connect Wallet";

  return (
    <Button
      onClick={handleWalletConnect}
      className={`
    font-medium text-sm px-5 py-2.5 h-auto
    bg-white text-black font-bold
    hover:bg-white/90
    rounded-full
    ${className}
  `}
    >
      {children || (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>


  );
}