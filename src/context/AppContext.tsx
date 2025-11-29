/**
 * Global application context for wallet and user state
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = "student" | "donor" | "admin" | null;

export interface AppState {
  publicKey: string | null;
  role: UserRole;
  isConnected: boolean;
  brsBalance: number;
  xlmBalance: number;
  network: string;
  loading: boolean;
}

interface AppContextValue extends AppState {
  setPublicKey: (key: string | null) => void;
  setRole: (role: UserRole) => void;
  setIsConnected: (connected: boolean) => void;
  setBrsBalance: (balance: number) => void;
  setXlmBalance: (balance: number) => void;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "scholarstream_state";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    publicKey: null,
    role: null,
    isConnected: false,
    brsBalance: 0,
    xlmBalance: 0,
    network: "TESTNET",
    loading: true,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed, loading: false }));
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!state.loading) {
      try {
        const toSave = {
          publicKey: state.publicKey,
          role: state.role,
          isConnected: state.isConnected,
          network: state.network,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (error) {
        console.error("Failed to save state to localStorage:", error);
      }
    }
  }, [
    state.publicKey,
    state.role,
    state.isConnected,
    state.network,
    state.loading,
  ]);

  const setPublicKey = (key: string | null) => {
    setState((prev) => ({ ...prev, publicKey: key, isConnected: !!key }));
  };

  const setRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, role }));
  };

  const setIsConnected = (connected: boolean) => {
    setState((prev) => ({ ...prev, isConnected: connected }));
  };

  const setBrsBalance = (balance: number) => {
    setState((prev) => ({ ...prev, brsBalance: balance }));
  };

  const setXlmBalance = (balance: number) => {
    setState((prev) => ({ ...prev, xlmBalance: balance }));
  };

  const disconnect = () => {
    setState({
      publicKey: null,
      role: null,
      isConnected: false,
      brsBalance: 0,
      xlmBalance: 0,
      network: "TESTNET",
      loading: false,
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("userRole");
    localStorage.removeItem("walletAddress");
  };

  const refreshBalances = async () => {
    if (!state.publicKey) return;

    try {
      // TODO: Implement real balance fetching from Stellar network
      // For now, using mock data
      console.log("Refreshing balances for:", state.publicKey);

      // Mock implementation - replace with real Horizon/Soroban calls
      setBrsBalance(1000);
      setXlmBalance(500);
    } catch (error) {
      console.error("Failed to refresh balances:", error);
    }
  };

  const contextValue: AppContextValue = {
    ...state,
    setPublicKey,
    setRole,
    setIsConnected,
    setBrsBalance,
    setXlmBalance,
    disconnect,
    refreshBalances,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
