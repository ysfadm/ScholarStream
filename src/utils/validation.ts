/**
 * Validation utilities for ScholarStream
 */

/**
 * Validates a Stellar public key format
 * @param address - The Stellar address to validate
 * @returns true if valid G-address format
 */
export const validateStellarAddress = (address: string): boolean => {
  if (!address || typeof address !== "string") return false;
  // Stellar public keys start with G and are 56 characters (base32 encoded)
  return /^G[A-Z2-7]{55}$/.test(address);
};

/**
 * Validates a Stellar contract ID format
 * @param contractId - The contract ID to validate
 * @returns true if valid C-address format
 */
export const validateContractId = (contractId: string): boolean => {
  if (!contractId || typeof contractId !== "string") return false;
  // Contract IDs start with C and are 56 characters
  return /^C[A-Z2-7]{55}$/.test(contractId);
};

/**
 * Validates progress percentage (0-100)
 * @param progress - The progress value to validate
 * @returns true if between 0 and 100
 */
export const validateProgress = (progress: number): boolean => {
  return typeof progress === "number" && progress >= 0 && progress <= 100;
};

/**
 * Validates an amount (positive number)
 * @param amount - The amount to validate
 * @returns true if positive number
 */
export const validateAmount = (amount: number): boolean => {
  return typeof amount === "number" && amount > 0 && isFinite(amount);
};

/**
 * Sanitizes user input to prevent XSS
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== "string") return "";

  // Remove HTML tags and dangerous characters
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
};

/**
 * Validates a URL format
 * @param url - The URL to validate
 * @returns true if valid URL
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;

  try {
    const urlObj = new URL(url);
    return ["http:", "https:", "ipfs:"].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Validates a SHA-256 hash format
 * @param hash - The hash to validate
 * @returns true if valid SHA-256 format
 */
export const validateHash = (hash: string): boolean => {
  if (!hash || typeof hash !== "string") return false;
  return /^[a-fA-F0-9]{64}$/.test(hash);
};

/**
 * Validates proof data (URL or hash)
 * @param proof - The proof data to validate
 * @returns true if valid URL or hash
 */
export const validateProof = (proof: string): boolean => {
  return validateUrl(proof) || validateHash(proof);
};

/**
 * Validates milestone count (1-10)
 * @param count - The milestone count
 * @returns true if between 1 and 10
 */
export const validateMilestoneCount = (count: number): boolean => {
  return (
    typeof count === "number" &&
    count >= 1 &&
    count <= 10 &&
    Number.isInteger(count)
  );
};

/**
 * Format error messages for user display
 * @param error - The error object or message
 * @returns User-friendly error message
 */
export const formatErrorMessage = (error: any): string => {
  if (!error) return "An unknown error occurred";

  if (typeof error === "string") return error;

  if (error.message) {
    // Common contract errors
    if (error.message.includes("insufficient")) return "Insufficient balance";
    if (error.message.includes("unauthorized"))
      return "You are not authorized for this action";
    if (error.message.includes("not found")) return "Resource not found";
    if (error.message.includes("network"))
      return "Network error - please check your connection";

    return error.message;
  }

  return "An unexpected error occurred";
};

/**
 * Truncate address for display
 * @param address - The address to truncate
 * @param prefixLength - Length of prefix (default: 8)
 * @param suffixLength - Length of suffix (default: 8)
 * @returns Truncated address
 */
export const truncateAddress = (
  address: string,
  prefixLength: number = 8,
  suffixLength: number = 8
): string => {
  if (!address || address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};
