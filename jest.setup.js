/**
 * Jest setup file
 */
require("@testing-library/jest-dom");

// Mock Freighter API
global.window = global.window || {};
global.window.freighterApi = {
  isConnected: jest.fn().mockResolvedValue(true),
  getAddress: jest.fn().mockResolvedValue({ address: "GTEST...MOCK" }),
  getNetwork: jest.fn().mockResolvedValue({ network: "TESTNET" }),
  signTransaction: jest.fn().mockResolvedValue("signed_xdr"),
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
