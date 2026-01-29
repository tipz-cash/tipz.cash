/**
 * NEAR Intents 1Click API Integration
 *
 * This module wraps the NEAR Intents 1Click API for cross-chain swaps.
 * NEAR Intents enables ETH/USDC → ZEC swaps with privacy via shielded addresses.
 *
 * API Docs: https://docs.near-intents.org/near-intents/integration/distribution-channels/1click-api
 *
 * Flow:
 * 1. Get quote with deposit address
 * 2. User sends funds to deposit address
 * 3. Market makers compete to fulfill
 * 4. ZEC delivered to creator's shielded address
 */

// ============================================================================
// Configuration
// ============================================================================

const NEAR_INTENTS_BASE_URL = "https://1click.chaindefuser.com"

/**
 * Check if real swaps are enabled
 */
export function isRealSwapsEnabled(): boolean {
  return process.env.ENABLE_REAL_SWAPS === "true"
}

/**
 * Get the JWT token for authenticated requests (avoids 0.1% fee)
 */
function getAuthToken(): string | undefined {
  return process.env.NEAR_INTENTS_JWT
}

// ============================================================================
// Types
// ============================================================================

/**
 * Supported asset identifiers for NEAR Intents
 * Format: {chain}:{network}:{token}
 */
export type AssetId = string

/**
 * Map common token symbols to NEAR Intents asset IDs
 * Format: nep141:{blockchain}-{address}.omft.near or nep141:{blockchain}.omft.near for native
 */
export const ASSET_IDS: Record<string, Record<number, AssetId>> = {
  ETH: {
    1: "nep141:eth.omft.near", // Ethereum Mainnet native
    42161: "nep141:arb.omft.near", // Arbitrum native ETH
    10: "nep245:v2_1.omni.hot.tg:10_11111111111111111111", // Optimism native ETH
  },
  USDC: {
    1: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near", // Ethereum USDC
    42161: "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near", // Arbitrum USDC
    10: "nep245:v2_1.omni.hot.tg:10_A2ewyUyDp6qsue1jqZsGypkCxRJ", // Optimism USDC
    137: "nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L", // Polygon USDC
  },
  USDT: {
    1: "nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near", // Ethereum USDT
    42161: "nep141:arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near", // Arbitrum USDT
    10: "nep245:v2_1.omni.hot.tg:10_359RPSJVdTxwTJT9TyGssr2rFoWo", // Optimism USDT
    137: "nep245:v2_1.omni.hot.tg:137_3hpYoaLtt8MP1Z2GH1U473DMRKgr", // Polygon USDT
  },
  MATIC: {
    137: "nep245:v2_1.omni.hot.tg:137_11111111111111111111", // Polygon native (now POL)
  },
  SOL: {
    501: "nep141:sol.omft.near", // Solana Mainnet native
  },
  ZEC: {
    0: "nep141:zec.omft.near", // Zcash (chain ID doesn't apply)
  },
}

/**
 * ZEC destination asset ID
 */
export const ZEC_ASSET_ID = "nep141:zec.omft.near"

/**
 * USDC on Polygon asset ID (commonly used for Mesh transfers)
 */
export const USDC_POLYGON_ASSET_ID = "nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L"

/**
 * Swap status from NEAR Intents
 */
export type SwapStatus =
  | "PENDING_DEPOSIT"
  | "PROCESSING"
  | "SUCCESS"
  | "REFUNDED"
  | "FAILED"
  | "EXPIRED"

/**
 * Quote request parameters
 */
export interface QuoteRequest {
  /** Source asset ID (e.g., "eth:1:native") */
  originAsset: AssetId
  /** Destination asset ID (e.g., "zec:mainnet:native") */
  destinationAsset: AssetId
  /** Amount to swap in smallest units (wei for ETH) */
  depositAmount: string
  /** Recipient address for destination asset */
  recipient: string
  /** Address to refund if swap fails */
  refundTo: string
  /** Swap type: EXACT_INPUT or EXACT_OUTPUT */
  swapType?: "EXACT_INPUT" | "EXACT_OUTPUT"
  /** Slippage tolerance in basis points (100 = 1%) */
  slippageTolerance?: number
}

/**
 * Quote object nested inside the response
 */
export interface Quote {
  depositAddress: string
  depositMemo?: string
  amountIn: string
  amountInFormatted: string
  amountInUsd: string
  minAmountIn: string
  amountOut: string
  amountOutFormatted: string
  amountOutUsd: string
  minAmountOut: string
  deadline: string // ISO 8601 date-time
  timeWhenInactive: string
  timeEstimate: number
}

/**
 * Quote response from NEAR Intents (full structure)
 */
export interface QuoteResponse {
  correlationId: string
  timestamp: string
  signature: string
  quoteRequest: any
  quote: Quote
}

/**
 * Swap status response
 */
export interface StatusResponse {
  /** Current status */
  status: SwapStatus
  /** Deposit address being monitored */
  depositAddress: string
  /** Source transaction hash (if deposit detected) */
  sourceTxHash?: string
  /** Destination transaction hash (if completed) */
  destinationTxHash?: string
  /** Amount received at deposit address */
  depositAmount?: string
  /** Amount sent to recipient */
  destinationAmount?: string
  /** Error message if failed */
  errorMessage?: string
  /** Refund transaction hash if refunded */
  refundTxHash?: string
  /** Timestamp of last update */
  updatedAt: string
}

/**
 * Supported token info
 */
export interface TokenInfo {
  assetId: AssetId
  symbol: string
  name: string
  decimals: number
  chainId: string
  address?: string
  logoUrl?: string
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Make an authenticated request to NEAR Intents API
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${NEAR_INTENTS_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`[near-intents] API error: ${response.status}`, error)
    throw new Error(`NEAR Intents API error: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Get supported tokens from NEAR Intents
 */
export async function getSupportedTokens(): Promise<TokenInfo[]> {
  return makeRequest<TokenInfo[]>("/v0/tokens")
}

/**
 * Get a swap quote with deposit address
 *
 * @param params - Quote parameters
 * @returns Quote with deposit address
 *
 * @example
 * ```typescript
 * const quote = await getSwapQuote({
 *   originAsset: "eth:1:native",
 *   destinationAsset: "zec:mainnet:native",
 *   depositAmount: "10000000000000000", // 0.01 ETH in wei
 *   recipient: "zs1...", // Creator's shielded address
 *   refundTo: "0x...", // Tipper's wallet address
 * })
 * ```
 */
export async function getSwapQuote(params: QuoteRequest): Promise<QuoteResponse> {
  // Generate deadline 10 minutes from now as ISO 8601 string
  const deadlineDate = new Date(Date.now() + 10 * 60 * 1000)
  const deadline = deadlineDate.toISOString()

  const body = {
    // Required fields per NEAR Intents 1Click API v0
    dry: false, // Execute real swap, not dry run
    originAsset: params.originAsset, // Source token asset ID
    depositType: "ORIGIN_CHAIN", // User deposits on origin chain
    amount: params.depositAmount, // Amount in smallest units
    destinationAsset: params.destinationAsset, // Destination token asset ID
    recipientType: "DESTINATION_CHAIN", // Recipient on destination chain
    recipient: params.recipient,
    refundType: "ORIGIN_CHAIN", // Refund to origin chain address
    refundTo: params.refundTo,
    deadline, // ISO 8601 format
    // Optional fields
    swapType: params.swapType || "EXACT_INPUT",
    slippageTolerance: params.slippageTolerance || 100, // 1% default in basis points
  }

  console.log("[near-intents] Requesting quote:", {
    from: params.originAsset,
    to: params.destinationAsset,
    amount: params.depositAmount,
    recipient: params.recipient.slice(0, 12) + "...",
    deadline,
  })

  const response = await makeRequest<QuoteResponse>("/v0/quote", {
    method: "POST",
    body: JSON.stringify(body),
  })

  console.log("[near-intents] Quote received:", {
    correlationId: response.correlationId,
    depositAddress: response.quote?.depositAddress,
    amountOut: response.quote?.amountOut,
    deadline: response.quote?.deadline,
  })

  return response
}

/**
 * Submit a deposit transaction hash (optional but speeds up processing)
 *
 * @param depositAddress - The deposit address from the quote
 * @param txHash - The transaction hash of the deposit
 */
export async function submitDeposit(
  depositAddress: string,
  txHash: string
): Promise<{ success: boolean }> {
  console.log("[near-intents] Submitting deposit:", {
    depositAddress,
    txHash: txHash.slice(0, 16) + "...",
  })

  return makeRequest<{ success: boolean }>("/v0/deposit/submit", {
    method: "POST",
    body: JSON.stringify({
      depositAddress,
      txHash,
    }),
  })
}

/**
 * Check the status of a swap
 *
 * @param depositAddress - The deposit address to check
 * @returns Current swap status
 */
export async function getSwapStatus(depositAddress: string): Promise<StatusResponse> {
  const response = await makeRequest<StatusResponse>(
    `/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`
  )

  console.log("[near-intents] Status check:", {
    address: depositAddress.slice(0, 12) + "...",
    status: response.status,
  })

  return response
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map a token symbol and chain to NEAR Intents asset ID
 *
 * @param symbol - Token symbol (ETH, USDC, etc.)
 * @param chainId - EVM chain ID (1, 137, 42161, 10)
 * @returns Asset ID or null if not supported
 */
export function mapTokenToAssetId(symbol: string, chainId: number): AssetId | null {
  const symbolMap = ASSET_IDS[symbol.toUpperCase()]
  if (!symbolMap) return null
  return symbolMap[chainId] || null
}

/**
 * Map an EVM token address to NEAR Intents asset ID
 *
 * @param address - Token contract address (or 0x0 for native)
 * @param chainId - EVM chain ID
 * @returns Asset ID or null if not supported
 */
export function mapAddressToAssetId(address: string, chainId: number): AssetId | null {
  const normalizedAddress = address.toLowerCase()

  // Solana native token (base58 addresses, not hex)
  if (chainId === 501) {
    // SOL native is indicated by special address or empty
    if (address === "So11111111111111111111111111111111111111112" || address === "" || address === "native") {
      return mapTokenToAssetId("SOL", chainId)
    }
    return null // SPL tokens not yet supported
  }

  const isNative = normalizedAddress === "0x0000000000000000000000000000000000000000"

  if (isNative) {
    // Native token based on chain
    if (chainId === 137) return mapTokenToAssetId("MATIC", chainId)
    return mapTokenToAssetId("ETH", chainId)
  }

  // Check known token addresses (all lowercase for comparison)
  const usdcAddresses: Record<string, number> = {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 1, // Ethereum
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": 137, // Polygon (new)
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": 137, // Polygon (bridged)
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831": 42161, // Arbitrum
    "0x0b2c639c533813f4aa9d7837caf62653d097ff85": 10, // Optimism
  }

  if (usdcAddresses[normalizedAddress] === chainId) {
    return mapTokenToAssetId("USDC", chainId)
  }

  const usdtAddresses: Record<string, number> = {
    "0xdac17f958d2ee523a2206206994597c13d831ec7": 1, // Ethereum
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": 42161, // Arbitrum
    "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58": 10, // Optimism
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": 137, // Polygon
  }

  if (usdtAddresses[normalizedAddress] === chainId) {
    return mapTokenToAssetId("USDT", chainId)
  }

  return null
}

/**
 * Parse amount to smallest units (wei)
 *
 * @param amount - Amount as string (e.g., "0.01")
 * @param decimals - Token decimals (18 for ETH, 6 for USDC)
 * @returns Amount in smallest units
 */
export function toSmallestUnits(amount: string, decimals: number): string {
  const parts = amount.split(".")
  const whole = parts[0] || "0"
  const frac = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals)
  return BigInt(whole + frac).toString()
}

/**
 * Parse amount from smallest units
 *
 * @param amount - Amount in smallest units
 * @param decimals - Token decimals
 * @returns Human-readable amount
 */
export function fromSmallestUnits(amount: string, decimals: number): string {
  const amountBigInt = BigInt(amount)
  const divisor = BigInt(10 ** decimals)
  const whole = amountBigInt / divisor
  const frac = amountBigInt % divisor
  const fracStr = frac.toString().padStart(decimals, "0")
  return `${whole}.${fracStr}`.replace(/\.?0+$/, "") || "0"
}

/**
 * Check if a swap status indicates completion
 */
export function isSwapComplete(status: SwapStatus): boolean {
  return status === "SUCCESS" || status === "REFUNDED" || status === "FAILED"
}

/**
 * Check if a swap status indicates success
 */
export function isSwapSuccessful(status: SwapStatus): boolean {
  return status === "SUCCESS"
}

/**
 * Get human-readable status message
 */
export function getStatusMessage(status: SwapStatus): string {
  switch (status) {
    case "PENDING_DEPOSIT":
      return "Waiting for deposit..."
    case "PROCESSING":
      return "Processing swap..."
    case "SUCCESS":
      return "Swap complete!"
    case "REFUNDED":
      return "Swap refunded"
    case "FAILED":
      return "Swap failed"
    case "EXPIRED":
      return "Quote expired"
    default:
      return "Unknown status"
  }
}
