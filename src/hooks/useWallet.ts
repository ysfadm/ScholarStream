/**
 * Custom hook for wallet operations
 */
import { useState, useEffect, useCallback } from "react";
import { connectWallet, disconnectWallet } from "@/utils/wallet";

interface UseWalletResult {
  publicKey: string | null;
  isConnected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = (): UseWalletResult => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const savedAddress = localStorage.getItem("walletAddress");
        if (savedAddress) {
          // Verify with Freighter
          if (typeof window !== "undefined" && (window as any).freighterApi) {
            const { address } = await (window as any).freighterApi.getAddress();
            if (address === savedAddress) {
              setPublicKey(address);
              setIsConnected(true);
            } else {
              // Address mismatch, clear storage
              localStorage.removeItem("walletAddress");
            }
          }
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    };

    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      const address = await connectWallet();
      if (address) {
        setPublicKey(address);
        setIsConnected(true);
        localStorage.setItem("walletAddress", address);
      } else {
        throw new Error("Failed to connect wallet");
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
      setPublicKey(null);
      setIsConnected(false);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setPublicKey(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    publicKey,
    isConnected,
    connecting,
    error,
    connect,
    disconnect,
  };
};
