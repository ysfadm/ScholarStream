import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import freighterApi from "@stellar/freighter-api";

// Testnet configuration
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Deployed contract ID on Stellar Testnet
export const CONTRACT_ID =
  "CAWTQVPJ36C42TXI2MPVNYIM3UUGMRPIFNQAIMM42SKTQNDWUQDSPTFF";

const server = new SorobanRpc.Server(RPC_URL);

/**
 * Update student milestone progress
 */
export const updateProgress = async (
  studentAddress: string,
  progress: number,
  userPublicKey: string
): Promise<string> => {
  try {
    // Load account
    const sourceAccount = await server.getAccount(userPublicKey);

    // Build contract call
    const contract = new Contract(CONTRACT_ID);

    const operation = contract.call(
      "update_progress",
      nativeToScVal(Address.fromString(studentAddress), { type: "address" }),
      nativeToScVal(progress, { type: "u32" })
    );

    // Build transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Prepare transaction
    const preparedTx = await server.prepareTransaction(transaction);

    // Sign with Freighter - using signTransaction from freighterApi
    const signedXdr = await freighterApi.signTransaction(preparedTx.toXDR(), {
      network: "TESTNET",
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Submit transaction
    const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const response = await server.sendTransaction(tx);

    console.log("Transaction sent:", response);

    // Wait for confirmation
    let status = await server.getTransaction(response.hash);
    let attempts = 0;
    while (status.status === "NOT_FOUND" && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      status = await server.getTransaction(response.hash);
      attempts++;
    }

    if (status.status === "SUCCESS") {
      console.log("Transaction successful!");
      return response.hash;
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};

/**
 * Get total progress from contract
 */
export const getTotalProgress = async (): Promise<number> => {
  try {
    const contract = new Contract(CONTRACT_ID);

    // Create a dummy account for read operations
    const account = await server
      .getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")
      .catch(() => null);

    if (!account) {
      // Return 0 if contract hasn't been deployed or interacted with yet
      return 0;
    }

    const operation = contract.call("get_total_progress");

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const response = await server.simulateTransaction(transaction);

    if (SorobanRpc.Api.isSimulationSuccess(response)) {
      const result = response.result?.retval;
      if (result) {
        return scValToNative(result);
      }
    }

    return 0;
  } catch (error) {
    console.error("Error getting total progress:", error);
    return 0;
  }
};

/**
 * Get last student address from contract
 */
export const getLastStudent = async (): Promise<string | null> => {
  try {
    const contract = new Contract(CONTRACT_ID);

    const account = await server
      .getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")
      .catch(() => null);

    if (!account) {
      return null;
    }

    const operation = contract.call("get_last_student");

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const response = await server.simulateTransaction(transaction);

    if (SorobanRpc.Api.isSimulationSuccess(response)) {
      const result = response.result?.retval;
      if (result) {
        const nativeResult = scValToNative(result);
        return nativeResult || null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting last student:", error);
    return null;
  }
};
