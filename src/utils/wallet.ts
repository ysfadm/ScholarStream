import freighterApi from "@stellar/freighter-api";

export interface WalletConnection {
  publicKey: string | null;
  isConnected: boolean;
}

/**
 * Check if Freighter is installed
 */
export const checkFreighterInstalled = async (): Promise<boolean> => {
  try {
    const isConnected = await freighterApi.isConnected();
    return isConnected;
  } catch (err) {
    console.error("Error checking Freighter:", err);
    return false;
  }
};

/**
 * Connect to Freighter wallet using requestAccess()
 * Returns public key or throws error if connection fails
 */
export const connectWallet = async (): Promise<string> => {
  try {
    // requestAccess() - Prompt and get user's public key
    const address = await freighterApi.requestAccess();

    if (!address) {
      throw new Error("No address returned from Freighter");
    }

    // Save to localStorage
    localStorage.setItem("walletPublicKey", address);
    return address;
  } catch (err: any) {
    console.error("Failed to connect wallet:", err);
    throw err;
  }
};

/**
 * Get stored wallet public key
 */
export const getStoredWallet = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("walletPublicKey");
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = (): void => {
  localStorage.removeItem("walletPublicKey");
  localStorage.removeItem("userRole");
};

/**
 * Store user role
 */
export const setUserRole = (role: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userRole", role);
  }
};

/**
 * Get stored user role
 */
export const getUserRole = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userRole");
};

/**
 * Clear user role
 */
export const clearUserRole = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userRole");
  }
};

/**
 * Check if wallet is already connected
 */
export const checkWalletConnection = async (): Promise<string | null> => {
  try {
    const stored = getStoredWallet();
    if (!stored) return null;

    // Check if Freighter is still installed
    const installed = await checkFreighterInstalled();
    if (!installed) {
      disconnectWallet();
      return null;
    }

    // getPublicKey() - Get public key silently (only if previously allowed)
    const address = await freighterApi.getPublicKey();
    if (address && address === stored) {
      return address;
    }

    // Clear invalid stored key
    disconnectWallet();
    return null;
  } catch (err) {
    console.error("Failed to check wallet connection:", err);
    disconnectWallet();
    return null;
  }
};

/**
 * Get public key from Freighter (requires prior access)
 */
export const getPublicKey = async (): Promise<string | null> => {
  try {
    const publicKey = await freighterApi.getPublicKey();
    return publicKey;
  } catch (err) {
    console.error("Failed to get public key:", err);
    return null;
  }
};
