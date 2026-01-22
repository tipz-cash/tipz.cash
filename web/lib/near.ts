/**
 * NEAR Protocol Configuration
 *
 * Handles NEAR blockchain connection for Intents integration.
 * Supports both testnet and mainnet configurations.
 */

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
 * Check if running in demo/mock mode
 */
export function isDemoMode(): boolean {
  return process.env.NEAR_DEMO_MODE === "true" || !isNearConfigured();
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
  demo: boolean;
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
 * Validate ZEC shielded address format
 *
 * Supports:
 * - Unified addresses (u1...) - preferred for new wallets
 * - Sapling addresses (zs1...) - legacy but still valid
 */
export function isValidShieldedAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }

  // Unified addresses start with 'u1' (variable length, typically 141+ chars)
  if (address.startsWith("u1")) {
    return address.length >= 78;
  }

  // Sapling shielded addresses start with 'zs1' (exactly 78 characters)
  if (address.startsWith("zs1")) {
    return address.length === 78;
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
