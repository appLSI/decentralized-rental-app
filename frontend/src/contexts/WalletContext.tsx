import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const savedWallet = localStorage.getItem('rentchain_wallet');
    if (savedWallet && window.ethereum) {
      setWalletAddress(savedWallet);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);
        localStorage.setItem('rentchain_wallet', address);
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      } catch (error) {
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect to MetaMask',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to connect your wallet',
        variant: 'destructive',
      });
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('rentchain_wallet');
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet, isConnected: !!walletAddress }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
