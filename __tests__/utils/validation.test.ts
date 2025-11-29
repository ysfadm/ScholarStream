/**
 * Unit tests for validation utilities
 */
import {
  validateStellarAddress,
  validateContractId,
  validateProgress,
  validateAmount,
  validateUrl,
  validateHash,
  sanitizeInput,
  truncateAddress,
  formatErrorMessage,
} from "@/utils/validation";

describe("Validation Utils", () => {
  describe("validateStellarAddress", () => {
    it("should validate correct Stellar addresses", () => {
      expect(
        validateStellarAddress(
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
        )
      ).toBe(true);
      expect(
        validateStellarAddress(
          "GBPXYVHMXAQBPOVSHVX474KX4W5KPKYLC4YPCTQJ4F4OVI2DGPBPBARS"
        )
      ).toBe(true);
    });

    it("should reject invalid addresses", () => {
      expect(validateStellarAddress("invalid")).toBe(false);
      expect(validateStellarAddress("G123")).toBe(false);
      expect(validateStellarAddress("")).toBe(false);
      expect(
        validateStellarAddress(
          "XAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
        )
      ).toBe(false);
    });

    it("should handle null/undefined", () => {
      expect(validateStellarAddress(null as any)).toBe(false);
      expect(validateStellarAddress(undefined as any)).toBe(false);
    });
  });

  describe("validateContractId", () => {
    it("should validate correct contract IDs", () => {
      expect(
        validateContractId(
          "CAWTQVPJ36C42TXI2MPVNYIM3UUGMRPIFNQAIMM42SKTQNDWUQDSPTFF"
        )
      ).toBe(true);
    });

    it("should reject invalid contract IDs", () => {
      expect(
        validateContractId(
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
        )
      ).toBe(false);
      expect(validateContractId("invalid")).toBe(false);
    });
  });

  describe("validateProgress", () => {
    it("should validate valid progress values", () => {
      expect(validateProgress(0)).toBe(true);
      expect(validateProgress(50)).toBe(true);
      expect(validateProgress(100)).toBe(true);
    });

    it("should reject invalid progress values", () => {
      expect(validateProgress(-1)).toBe(false);
      expect(validateProgress(101)).toBe(false);
      expect(validateProgress(NaN)).toBe(false);
    });
  });

  describe("validateAmount", () => {
    it("should validate positive amounts", () => {
      expect(validateAmount(1)).toBe(true);
      expect(validateAmount(1000.5)).toBe(true);
    });

    it("should reject invalid amounts", () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-10)).toBe(false);
      expect(validateAmount(Infinity)).toBe(false);
    });
  });

  describe("validateUrl", () => {
    it("should validate valid URLs", () => {
      expect(validateUrl("https://example.com")).toBe(true);
      expect(validateUrl("http://test.io/file.pdf")).toBe(true);
      expect(validateUrl("ipfs://QmHash")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(validateUrl("not a url")).toBe(false);
      expect(validateUrl("ftp://invalid")).toBe(false);
      expect(validateUrl("")).toBe(false);
    });
  });

  describe("validateHash", () => {
    it("should validate SHA-256 hashes", () => {
      expect(validateHash("a".repeat(64))).toBe(true);
      expect(validateHash("0123456789abcdef".repeat(4))).toBe(true);
    });

    it("should reject invalid hashes", () => {
      expect(validateHash("short")).toBe(false);
      expect(validateHash("g".repeat(64))).toBe(false);
      expect(validateHash("a".repeat(63))).toBe(false);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove HTML tags", () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
      expect(sanitizeInput("Hello <b>World</b>")).toBe("Hello bWorld/b");
    });

    it("should remove javascript: protocol", () => {
      expect(sanitizeInput("javascript:alert(1)")).toBe("alert(1)");
    });

    it("should handle empty input", () => {
      expect(sanitizeInput("")).toBe("");
      expect(sanitizeInput(null as any)).toBe("");
    });
  });

  describe("truncateAddress", () => {
    it("should truncate long addresses", () => {
      const addr = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
      expect(truncateAddress(addr)).toBe("GAAAAAAA...AAAAAWHF");
      expect(truncateAddress(addr, 4, 4)).toBe("GAAA...AWHF");
    });

    it("should not truncate short addresses", () => {
      expect(truncateAddress("SHORT")).toBe("SHORT");
    });
  });

  describe("formatErrorMessage", () => {
    it("should format error objects", () => {
      expect(formatErrorMessage(new Error("Test error"))).toBe("Test error");
    });

    it("should format string errors", () => {
      expect(formatErrorMessage("Simple error")).toBe("Simple error");
    });

    it("should handle null/undefined", () => {
      expect(formatErrorMessage(null)).toBe("An unknown error occurred");
      expect(formatErrorMessage(undefined)).toBe("An unknown error occurred");
    });

    it("should detect common error patterns", () => {
      expect(formatErrorMessage(new Error("insufficient balance"))).toBe(
        "Insufficient balance"
      );
      expect(formatErrorMessage(new Error("unauthorized access"))).toBe(
        "You are not authorized for this action"
      );
      expect(formatErrorMessage(new Error("not found"))).toBe(
        "Resource not found"
      );
    });
  });
});
