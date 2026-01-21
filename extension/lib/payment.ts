/**
 * TIPZ Payment Integration
 *
 * This module handles the payment flow for tipping creators:
 * 1. Connect wallet (MetaMask, WalletConnect, etc.)
 * 2. Use SwapKit SDK to swap any token to ZEC
 * 3. Route through NEAR Intents for shielded destination
 *
 * Current status: STUBBED - needs actual SwapKit integration
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type WalletType = "metamask" | "walletconnect" | "coinbase" | "phantom"

export type TransactionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "approving"
  | "swapping"
  | "routing"
  | "confirming"
  | "completed"
  | "failed"

export interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  walletType: WalletType | null
  balance: TokenBalance | null
}

export interface TokenBalance {
  symbol: string
  amount: string
  decimals: number
  usdValue: string | null
}

export interface SupportedToken {
  symbol: string
  name: string
  address: string
  chainId: number
  decimals: number
  logoUrl?: string
}

export interface SwapQuote {
  fromToken: SupportedToken
  toToken: "ZEC"
  fromAmount: string
  toAmount: string
  exchangeRate: string
  fees: {
    network: string
    protocol: string
    total: string
  }
  estimatedTime: number // seconds
  route: string[] // e.g., ["ETH", "USDC", "ZEC"]
  expiresAt: number
}

export interface TipTransaction {
  id: string
  status: TransactionStatus
  fromToken: string
  fromAmount: string
  toAmount: string // ZEC amount
  recipientHandle: string
  recipientAddress: string // shielded ZEC address
  txHash?: string
  swapTxHash?: string
  error?: string
  createdAt: number
  completedAt?: number
}

export interface PaymentConfig {
  apiUrl: string
  supportedChains: number[]
  minTipUsd: number
  maxTipUsd: number
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: PaymentConfig = {
  apiUrl: process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000",
  supportedChains: [1, 137, 42161, 10], // Ethereum, Polygon, Arbitrum, Optimism
  minTipUsd: 0.01,
  maxTipUsd: 1000,
}

// ============================================================================
// Wallet Connection
// ============================================================================

/**
 * Get list of available wallet providers in the browser
 */
export function getAvailableWallets(): WalletType[] {
  const wallets: WalletType[] = []

  // TODO: Implement actual wallet detection
  // Check for MetaMask
  if (typeof window !== "undefined" && (window as any).ethereum?.isMetaMask) {
    wallets.push("metamask")
  }

  // Check for Coinbase Wallet
  if (typeof window !== "undefined" && (window as any).ethereum?.isCoinbaseWallet) {
    wallets.push("coinbase")
  }

  // Check for Phantom (Solana)
  if (typeof window !== "undefined" && (window as any).phantom?.solana) {
    wallets.push("phantom")
  }

  // WalletConnect is always available as a fallback
  wallets.push("walletconnect")

  return wallets
}

/**
 * Connect to a wallet
 *
 * TODO: Implement actual wallet connection using:
 * - ethers.js or viem for EVM wallets
 * - @solana/web3.js for Phantom
 * - WalletConnect v2 for mobile wallets
 */
export async function connectWallet(
  walletType: WalletType
): Promise<WalletState> {
  console.log("TIPZ: Connecting wallet", { walletType })

  // TODO: Implement actual wallet connection
  // This is a stub that simulates connection

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful connection
      // In production, this would use the actual wallet SDK
      resolve({
        isConnected: true,
        address: "0x1234...5678", // Placeholder
        chainId: 1,
        walletType,
        balance: {
          symbol: "ETH",
          amount: "0.5",
          decimals: 18,
          usdValue: "1250.00",
        },
      })
    }, 1000)
  })
}

/**
 * Disconnect the current wallet
 */
export async function disconnectWallet(): Promise<void> {
  console.log("TIPZ: Disconnecting wallet")

  // TODO: Implement actual wallet disconnection
  // Clear any stored session data

  return Promise.resolve()
}

/**
 * Get the current wallet state
 */
export async function getWalletState(): Promise<WalletState> {
  // TODO: Implement actual wallet state retrieval
  // Check if wallet is still connected, get current balance, etc.

  return {
    isConnected: false,
    address: null,
    chainId: null,
    walletType: null,
    balance: null,
  }
}

/**
 * Switch to a different chain
 */
export async function switchChain(chainId: number): Promise<boolean> {
  console.log("TIPZ: Switching chain", { chainId })

  // TODO: Implement actual chain switching
  // Use wallet_switchEthereumChain or wallet_addEthereumChain

  return true
}

// ============================================================================
// Token & Balance Functions
// ============================================================================

/**
 * Get supported tokens for the connected chain
 */
export async function getSupportedTokens(
  chainId: number
): Promise<SupportedToken[]> {
  // TODO: Fetch from SwapKit or maintain a curated list
  // For now, return common tokens

  const tokens: Record<number, SupportedToken[]> = {
    1: [
      // Ethereum Mainnet
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 1,
        decimals: 18,
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        chainId: 1,
        decimals: 6,
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        chainId: 1,
        decimals: 6,
      },
    ],
    137: [
      // Polygon
      {
        symbol: "MATIC",
        name: "Polygon",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 137,
        decimals: 18,
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        chainId: 137,
        decimals: 6,
      },
    ],
  }

  return tokens[chainId] || []
}

/**
 * Get token balance for the connected wallet
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<TokenBalance | null> {
  console.log("TIPZ: Getting token balance", { tokenAddress, walletAddress })

  // TODO: Implement actual balance fetching using ethers.js or viem

  return null
}

// ============================================================================
// Swap Functions (SwapKit Integration)
// ============================================================================

/**
 * Get a quote for swapping tokens to ZEC
 *
 * TODO: Integrate with SwapKit SDK
 * - https://docs.swapkit.dev/
 * - Use their quote API to get best rate
 * - Consider multiple routes (direct, through stablecoins, etc.)
 */
export async function getSwapQuote(
  fromToken: SupportedToken,
  fromAmount: string,
  destinationAddress: string
): Promise<SwapQuote> {
  console.log("TIPZ: Getting swap quote", {
    fromToken: fromToken.symbol,
    fromAmount,
    destinationAddress,
  })

  // TODO: Implement actual SwapKit quote fetching
  // const swapKit = new SwapKit({ ... })
  // const quote = await swapKit.getQuote({ ... })

  // Stub response
  const mockRate = fromToken.symbol === "ETH" ? 25.5 : 1.0 // ETH/ZEC or stablecoin/ZEC
  const toAmount = (parseFloat(fromAmount) * mockRate).toFixed(8)

  return {
    fromToken,
    toToken: "ZEC",
    fromAmount,
    toAmount,
    exchangeRate: mockRate.toString(),
    fees: {
      network: "0.001",
      protocol: "0.0005",
      total: "0.0015",
    },
    estimatedTime: 300, // 5 minutes
    route: [fromToken.symbol, "USDC", "ZEC"],
    expiresAt: Date.now() + 60000, // 1 minute
  }
}

/**
 * Execute a swap from any token to ZEC
 *
 * TODO: Implement with SwapKit SDK
 * - Handle token approvals if needed
 * - Execute the swap transaction
 * - Monitor transaction status
 */
export async function executeSwap(
  quote: SwapQuote,
  destinationAddress: string,
  onStatusChange?: (status: TransactionStatus) => void
): Promise<TipTransaction> {
  console.log("TIPZ: Executing swap", { quote, destinationAddress })

  const txId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const transaction: TipTransaction = {
    id: txId,
    status: "approving",
    fromToken: quote.fromToken.symbol,
    fromAmount: quote.fromAmount,
    toAmount: quote.toAmount,
    recipientHandle: "", // Will be set by caller
    recipientAddress: destinationAddress,
    createdAt: Date.now(),
  }

  // TODO: Implement actual swap execution
  // 1. Check if token approval is needed
  // 2. If needed, request approval transaction
  // 3. Execute swap transaction
  // 4. Wait for confirmation
  // 5. Route to shielded address via NEAR Intents

  // Simulate the flow
  const updateStatus = (status: TransactionStatus) => {
    transaction.status = status
    onStatusChange?.(status)
  }

  return new Promise((resolve) => {
    // Simulate approval
    setTimeout(() => updateStatus("swapping"), 1500)

    // Simulate swap
    setTimeout(() => updateStatus("routing"), 3000)

    // Simulate routing through NEAR
    setTimeout(() => updateStatus("confirming"), 4500)

    // Complete
    setTimeout(() => {
      updateStatus("completed")
      transaction.completedAt = Date.now()
      transaction.txHash = "0xmock..." // Would be actual tx hash
      resolve(transaction)
    }, 6000)
  })
}

// ============================================================================
// NEAR Intents Integration
// ============================================================================

/**
 * Route payment through NEAR Intents to shielded ZEC address
 *
 * TODO: Implement NEAR Intents integration
 * - Use NEAR's intent system for privacy-preserving routing
 * - Ensure destination address remains hidden
 */
export async function routeToShieldedAddress(
  amount: string,
  shieldedAddress: string
): Promise<{ intentId: string; status: string }> {
  console.log("TIPZ: Routing to shielded address", { amount, shieldedAddress })

  // TODO: Implement NEAR Intents routing
  // This is the key privacy component - ensures the sender
  // doesn't see the actual destination address

  return {
    intentId: `intent_${Date.now()}`,
    status: "pending",
  }
}

// ============================================================================
// Transaction History
// ============================================================================

/**
 * Get transaction history from local storage
 */
export async function getTransactionHistory(): Promise<TipTransaction[]> {
  // TODO: Implement using chrome.storage.local

  try {
    const stored = localStorage.getItem("tipz_transactions")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save a transaction to history
 */
export async function saveTransaction(tx: TipTransaction): Promise<void> {
  // TODO: Implement using chrome.storage.local

  try {
    const history = await getTransactionHistory()
    history.unshift(tx)
    // Keep only last 50 transactions
    const trimmed = history.slice(0, 50)
    localStorage.setItem("tipz_transactions", JSON.stringify(trimmed))
  } catch (error) {
    console.error("TIPZ: Failed to save transaction", error)
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format token amount for display
 */
export function formatTokenAmount(
  amount: string,
  decimals: number,
  maxDecimals: number = 6
): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return "0"

  if (num < 0.000001) return "<0.000001"
  if (num < 1) return num.toFixed(Math.min(decimals, maxDecimals))
  if (num < 1000) return num.toFixed(Math.min(4, maxDecimals))
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`
  return `${(num / 1000000).toFixed(2)}M`
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "$0.00"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Shorten wallet address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return ""
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Validate ZEC shielded address
 */
export function isValidShieldedAddress(address: string): boolean {
  // ZEC unified addresses start with 'u1'
  // Sapling addresses start with 'zs1'
  return address.startsWith("u1") || address.startsWith("zs1")
}

// ============================================================================
// React Hook for Payment State
// ============================================================================

/**
 * Custom hook for managing payment state in React components
 *
 * Usage:
 * const { wallet, connect, disconnect, tip } = usePayment()
 */
export interface UsePaymentReturn {
  wallet: WalletState
  isLoading: boolean
  error: string | null
  transaction: TipTransaction | null
  connect: (walletType: WalletType) => Promise<void>
  disconnect: () => Promise<void>
  tip: (
    amount: string,
    token: SupportedToken,
    recipientAddress: string,
    recipientHandle: string
  ) => Promise<TipTransaction>
  clearError: () => void
}

// Note: The actual hook implementation should be in a separate file
// that imports React, to avoid issues with non-React contexts.
// See: components/hooks/usePayment.ts (to be created)
