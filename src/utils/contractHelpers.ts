/**
 * Enhanced contract helper functions with better error handling
 */
import {
  validateStellarAddress,
  validateAmount,
  formatErrorMessage,
} from "./validation";

export interface ContractCallResult {
  success: boolean;
  hash?: string;
  result?: any;
  error?: string;
}

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
}

/**
 * Retry a contract call with exponential backoff
 */
export const retryContractCall = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxAttempts = 3, delayMs = 1000, backoff = true } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error);

      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Validate scholarship creation inputs
 */
export const validateScholarshipInputs = (
  studentAddress: string,
  totalAmount: number,
  milestones: any[]
): { valid: boolean; error?: string } => {
  if (!validateStellarAddress(studentAddress)) {
    return { valid: false, error: "Invalid student address" };
  }

  if (!validateAmount(totalAmount)) {
    return { valid: false, error: "Invalid total amount" };
  }

  if (!milestones || milestones.length === 0) {
    return { valid: false, error: "At least one milestone is required" };
  }

  if (milestones.length > 10) {
    return { valid: false, error: "Maximum 10 milestones allowed" };
  }

  // Validate milestone amounts sum to total
  const sum = milestones.reduce(
    (acc, m) => acc + parseFloat(m.rewardAmount || 0),
    0
  );
  if (Math.abs(sum - totalAmount) > 0.01) {
    return {
      valid: false,
      error: `Milestone rewards (${sum}) must equal total amount (${totalAmount})`,
    };
  }

  // Validate each milestone
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];

    if (!m.title || m.title.trim().length === 0) {
      return { valid: false, error: `Milestone ${i + 1}: Title is required` };
    }

    if (!m.rewardAmount || parseFloat(m.rewardAmount) <= 0) {
      return {
        valid: false,
        error: `Milestone ${i + 1}: Invalid reward amount`,
      };
    }

    if (
      !m.requiredProgress ||
      m.requiredProgress < 0 ||
      m.requiredProgress > 100
    ) {
      return {
        valid: false,
        error: `Milestone ${i + 1}: Progress must be 0-100%`,
      };
    }
  }

  return { valid: true };
};

/**
 * Debounce function for reducing API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
};

/**
 * Cache with TTL for contract queries
 */
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttlSeconds: number = 60) {
    this.ttl = ttlSeconds * 1000;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const queryCache = new QueryCache(30); // 30 seconds TTL

/**
 * Format transaction hash for display
 */
export const formatTxHash = (hash: string, length: number = 16): string => {
  if (!hash || hash.length <= length) return hash;
  const half = Math.floor(length / 2);
  return `${hash.slice(0, half)}...${hash.slice(-half)}`;
};

/**
 * Convert stroops to XLM
 */
export const stroopsToXLM = (stroops: number): number => {
  return stroops / 10000000;
};

/**
 * Convert XLM to stroops
 */
export const xlmToStroops = (xlm: number): number => {
  return Math.floor(xlm * 10000000);
};

/**
 * Format XLM amount for display
 */
export const formatXLM = (amount: number, decimals: number = 2): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Get Stellar Expert URL for transaction
 */
export const getStellarExpertUrl = (
  hash: string,
  network: "testnet" | "public" = "testnet"
): string => {
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
};

/**
 * Get Stellar Expert URL for account
 */
export const getStellarExpertAccountUrl = (
  address: string,
  network: "testnet" | "public" = "testnet"
): string => {
  return `https://stellar.expert/explorer/${network}/account/${address}`;
};

/**
 * Get Stellar Expert URL for contract
 */
export const getStellarExpertContractUrl = (
  contractId: string,
  network: "testnet" | "public" = "testnet"
): string => {
  return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
};
