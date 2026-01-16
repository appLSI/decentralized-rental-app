// src/features/wallet/types/wallet.types.ts

// ---------------- RESPONSES ----------------

export interface WalletConnectResponse {
  message: string;
  walletAddress: string;
}

export interface WalletDisconnectSuccess {
  message: string;
}

export interface WalletDisconnectBlocked {
  message: string;
  canDisconnect: false;
  reasons: string[];
  activePropertiesCount: number;
}

export type WalletDisconnectResponse =
  | WalletDisconnectSuccess
  | WalletDisconnectBlocked;

export interface WalletStatusResponse {
  hasWallet: boolean;
  walletAddress?: string;
  canDisconnect: boolean;
  activePropertiesCount: number;
}

// ---------------- REQUESTS ----------------

export interface WalletConnectRequest {
  walletAddress: string;
}


export interface WalletState {
  walletAddress: string | null;
  isConnected: boolean;
  initialize: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchWalletStatus: (userId: string) => Promise<void>;
}
