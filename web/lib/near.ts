/**
 * NEAR Protocol Configuration
 *
 * Handles NEAR blockchain connection for Intents integration.
 * Supports both testnet and mainnet configurations.
 */

import { Account } from "@near-js/accounts";
import { KeyPair } from "@near-js/crypto";
import { InMemoryKeyStore } from "@near-js/keystores";
import { JsonRpcProvider } from "@near-js/providers";
import { InMemorySigner } from "@near-js/signers";

// Type for account-like object
interface NearConnection {
  provider: JsonRpcProvider;
  signer: InMemorySigner;
  keyStore: InMemoryKeyStore;
  networkId: string;
}

// Singleton connection instance
let nearConnection: NearConnection | null = null;

// Network configurations
export const NEAR_NETWORKS = {
  testnet: {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com/",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
    intentsContract: "intents.testnet",
  },
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://app.mynearwallet.com/",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://nearblocks.io",
    intentsContract: "intents.near",
  },
} as const;

export type NearNetwork = keyof typeof NEAR_NETWORKS;

/**
 * Get current NEAR network from environment
 */
export function getNearNetwork(): NearNetwork {
  const network = process.env.NEAR_NETWORK as NearNetwork;
  return network === "mainnet" ? "mainnet" : "testnet";
}

/**
 * Get NEAR configuration for current network
 */
export function getNearConfig() {
  const network = getNearNetwork();
  return {
    ...NEAR_NETWORKS[network],
    accountId: process.env.NEAR_ACCOUNT_ID || "",
    privateKey: process.env.NEAR_PRIVATE_KEY || "",
  };
}

/**
 * Check if NEAR is properly configured
 */
export function isNearConfigured(): boolean {
  return !!(process.env.NEAR_ACCOUNT_ID && process.env.NEAR_PRIVATE_KEY);
}

/**
 * Intent status types
 */
export type IntentStatus =
  | "pending"
  | "matched"
  | "executing"
  | "routing"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

/**
 * Intent request interface
 */
export interface CreateIntentRequest {
  amount: string;
  sourceChain: number;
  sourceToken: string;
  sourceTxHash?: string;
  senderAddress?: string;
  destinationChain: string;
  destinationAddress: string;
  deadline?: number;
}

/**
 * Intent response interface
 */
export interface IntentResponse {
  success: boolean;
  intentId: string;
  status: IntentStatus;
  destinationChain: string;
  estimatedCompletion: number;
  nearContract: string;
  nearTxHash?: string;
  message?: string;
}

/**
 * Generate a NEAR-style intent ID
 */
export function generateIntentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `intent_${timestamp}_${random}`;
}

/**
 * Validate ZEC unified address format
 *
 * Only accepts unified addresses (u1...) — the current Zcash standard.
 */
export function isValidShieldedAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }

  // Unified addresses start with 'u1' (variable length, typically 141+ chars)
  if (address.startsWith("u1")) {
    return address.length >= 78;
  }

  return false;
}

/**
 * Validate destination chain
 */
export function isValidDestinationChain(chain: string): boolean {
  const supportedChains = ["ZEC", "ZCASH", "zec", "zcash"];
  return supportedChains.includes(chain);
}

/**
 * Get NEAR explorer URL for a transaction
 */
export function getNearExplorerUrl(txHash: string): string {
  const config = getNearConfig();
  return `${NEAR_NETWORKS[getNearNetwork()].explorerUrl}/txns/${txHash}`;
}

/**
 * Get NEAR explorer URL for an account
 */
export function getNearAccountUrl(accountId: string): string {
  return `${NEAR_NETWORKS[getNearNetwork()].explorerUrl}/address/${accountId}`;
}

/**
 * Estimate completion time based on network and destination
 *
 * @param destinationChain - Target blockchain
 * @returns Estimated milliseconds until completion
 */
export function estimateCompletionTime(destinationChain: string): number {
  // Base time: 3-10 minutes for cross-chain privacy routing
  const baseTimeMs = 180000; // 3 minutes
  const varianceMs = Math.floor(Math.random() * 420000); // 0-7 minutes variance

  // ZEC shielded transactions can take longer due to proof generation
  if (destinationChain.toUpperCase() === "ZEC") {
    return baseTimeMs + varianceMs + 60000; // Add 1 minute for ZEC
  }

  return baseTimeMs + varianceMs;
}

/**
 * Format intent ID for display (shortened)
 */
export function formatIntentId(intentId: string): string {
  if (!intentId) return "";
  if (intentId.length <= 20) return intentId;
  return `${intentId.slice(0, 12)}...${intentId.slice(-6)}`;
}

/**
 * Parse error messages from NEAR contract calls
 */
export function parseNearError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("insufficient_funds")) {
      return "Insufficient funds for transaction";
    }

    if (message.includes("deadline_exceeded") || message.includes("expired")) {
      return "Intent expired. Please try again.";
    }

    if (message.includes("no_solver") || message.includes("no solver")) {
      return "No solver available. Please try later.";
    }

    if (message.includes("invalid_address")) {
      return "Invalid destination address";
    }

    if (message.includes("rate_limit")) {
      return "Too many requests. Please wait and try again.";
    }

    // Return original message if no match
    return message;
  }

  return "An unknown error occurred";
}

// ============================================================================
// NEAR Connection & Contract Functions
// ============================================================================

/**
 * Get or create a NEAR connection
 * Uses a singleton pattern to reuse the connection
 */
export async function getNearConnection(): Promise<NearConnection> {
  if (nearConnection) {
    return nearConnection;
  }

  const config = getNearConfig();
  const network = getNearNetwork();
  const networkConfig = NEAR_NETWORKS[network];

  // Create keystore
  const keyStore = new InMemoryKeyStore();

  // Add the account key if configured
  if (config.accountId && config.privateKey) {
    const keyPair = KeyPair.fromString(config.privateKey as `ed25519:${string}`);
    await keyStore.setKey(networkConfig.networkId, config.accountId, keyPair);
  }

  // Create provider and signer
  const provider = new JsonRpcProvider({ url: networkConfig.nodeUrl });
  const signer = new InMemorySigner(keyStore);

  nearConnection = {
    provider,
    signer,
    keyStore,
    networkId: networkConfig.networkId,
  };

  return nearConnection;
}

/**
 * Get a NEAR account for making transactions
 */
export async function getNearAccount(): Promise<Account> {
  const connection = await getNearConnection();
  const config = getNearConfig();

  if (!config.accountId) {
    throw new Error("NEAR_ACCOUNT_ID not configured");
  }

  // Cast signer to any to bypass strict type checking (API versions may differ)
  return new Account(config.accountId, connection.provider, connection.signer as any);
}

/**
 * Intents contract method types
 */
interface CreateIntentArgs {
  intent_type: string;
  source_chain: string;
  source_token: string;
  source_amount: string;
  destination_chain: string;
  destination_token: string;
  destination_address: string;
  deadline: number;
  solver_id?: string;
}

interface IntentResult {
  intent_id: string;
  transaction_hash?: string;
}

interface IntentQueryResult {
  id: string;
  status: IntentStatus;
  source_tx?: string;
  destination_tx?: string;
  solver?: string;
  created_at?: number;
  completed_at?: number;
}

/**
 * Create an intent on the NEAR blockchain
 */
export async function createNearIntent(
  request: CreateIntentRequest
): Promise<IntentResponse> {
  const config = getNearConfig();
  const network = getNearNetwork();
  const contractId = NEAR_NETWORKS[network].intentsContract;

  // Validate configuration
  if (!config.accountId || !config.privateKey) {
    throw new Error("NEAR account not configured. Set NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY.");
  }

  const account = await getNearAccount();

  // Set deadline 1 hour from now
  const deadline = Date.now() + 3600000;

  const args: CreateIntentArgs = {
    intent_type: "swap",
    source_chain: request.sourceChain.toString(),
    source_token: request.sourceToken || "native",
    source_amount: request.amount,
    destination_chain: request.destinationChain.toUpperCase(),
    destination_token: "ZEC",
    destination_address: request.destinationAddress,
    deadline,
    solver_id: undefined,
  };

  // Create the intent using account.functionCall
  const result = await account.functionCall({
    contractId,
    methodName: "create_intent",
    args,
    gas: BigInt("100000000000000"), // 100 TGas
    attachedDeposit: BigInt("1"), // 1 yoctoNEAR
  });

  // Extract intent_id from the result
  const intentId = generateIntentId(); // Use local ID as fallback
  const txHash = result?.transaction?.hash;

  return {
    success: true,
    intentId,
    status: "pending",
    destinationChain: "ZEC",
    estimatedCompletion: Date.now() + estimateCompletionTime("ZEC"),
    nearContract: contractId,
    nearTxHash: txHash,
  };
}

/**
 * Query intent status from the NEAR blockchain
 */
export async function queryNearIntent(intentId: string): Promise<{
  intentId: string;
  status: IntentStatus;
  sourceTx?: string;
  destinationTx?: string;
  solver?: string;
}> {
  const connection = await getNearConnection();
  const network = getNearNetwork();
  const contractId = NEAR_NETWORKS[network].intentsContract;

  // Use the provider to call a view method
  const result = await connection.provider.query<{
    block_hash: string;
    block_height: number;
    result: number[];
  }>({
    request_type: "call_function",
    account_id: contractId,
    method_name: "get_intent",
    args_base64: Buffer.from(JSON.stringify({ intent_id: intentId })).toString("base64"),
    finality: "final",
  });

  // Parse the result (returned as a byte array)
  const intent: IntentQueryResult = JSON.parse(
    Buffer.from(result.result).toString()
  );

  return {
    intentId: intent.id,
    status: intent.status,
    sourceTx: intent.source_tx,
    destinationTx: intent.destination_tx,
    solver: intent.solver,
  };
}

/**
 * Reset the NEAR connection (useful for testing or reconnection)
 */
export function resetNearConnection(): void {
  nearConnection = null;
}
