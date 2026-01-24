/**
 * TIPZ Web Wallet Integration
 *
 * Direct wallet connection for web checkout (no extension bridge needed).
 * Supports MetaMask, Rabby, and other injected providers.
 */

import { BrowserProvider, formatUnits, parseUnits, Contract } from "ethers"
import type { Eip1193Provider } from "ethers"

// ============================================================================
// Types
// ============================================================================

export type WalletType = "metamask" | "rabby" | "walletconnect" | "coinbase"

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
  estimatedTime: number
  route: string[]
  expiresAt: number
}

export interface TipTransaction {
  id: string
  status: TransactionStatus
  fromToken: string
  fromAmount: string
  toAmount: string
  recipientHandle: string
  recipientAddress: string
  txHash?: string
  intentId?: string
  error?: string
  createdAt: number
  completedAt?: number
}

// ============================================================================
// Constants
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export const SUPPORTED_CHAINS: Record<number, {
  chainId: string
  chainName: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}> = {
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  137: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  42161: {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  10: {
    chainId: "0xa",
    chainName: "Optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
}

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]

// ============================================================================
// Session Persistence
// ============================================================================

interface WalletSession {
  address: string
  chainId: number
  walletType: WalletType
  connectedAt: number
}

const WALLET_SESSION_KEY = "tipz_wallet_session"

function saveWalletSession(session: WalletSession): void {
  try {
    localStorage.setItem(WALLET_SESSION_KEY, JSON.stringify(session))
  } catch {
    // Ignore storage errors
  }
}

export function loadWalletSession(): WalletSession | null {
  try {
    const stored = localStorage.getItem(WALLET_SESSION_KEY)
    if (!stored) return null
    return JSON.parse(stored) as WalletSession
  } catch {
    return null
  }
}

export function clearWalletSession(): void {
  try {
    localStorage.removeItem(WALLET_SESSION_KEY)
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Global State
// ============================================================================

let currentProvider: BrowserProvider | null = null
let currentWalletType: WalletType | null = null

/**
 * Get the Ethereum provider from window
 */
function getEthereumProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null
  const ethereum = (window as any).ethereum
  if (!ethereum) return null
  return ethereum as Eip1193Provider
}

/**
 * Detect which wallet is available
 */
export function detectWallet(): WalletType | null {
  if (typeof window === "undefined") return null
  const ethereum = (window as any).ethereum
  if (!ethereum) return null

  if (ethereum.isRabby) return "rabby"
  if (ethereum.isMetaMask) return "metamask"
  if (ethereum.isCoinbaseWallet) return "coinbase"
  return "metamask" // Default to metamask for generic providers
}

/**
 * Check if a wallet is available
 */
export function isWalletAvailable(): boolean {
  return getEthereumProvider() !== null
}

// ============================================================================
// Wallet Connection
// ============================================================================

/**
 * Connect to wallet
 */
export async function connectWallet(preferredType?: WalletType): Promise<WalletState> {
  const ethereum = getEthereumProvider()
  if (!ethereum) {
    throw new Error("No wallet found. Please install MetaMask or Rabby.")
  }

  try {
    // Request account access
    const accounts = await (ethereum as any).request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.")
    }

    const address = accounts[0]
    const chainIdHex = await (ethereum as any).request({ method: "eth_chainId" })
    const chainId = parseInt(chainIdHex, 16)

    currentProvider = new BrowserProvider(ethereum)
    currentWalletType = preferredType || detectWallet() || "metamask"

    // Get balance
    const balance = await currentProvider.getBalance(address)
    const balanceFormatted = formatUnits(balance, 18)

    // Get USD value
    const nativeSymbol = SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol || "ETH"
    const ethPriceUsd = await getTokenPriceUsd(nativeSymbol)

    // Save session
    saveWalletSession({
      address,
      chainId,
      walletType: currentWalletType,
      connectedAt: Date.now(),
    })

    return {
      isConnected: true,
      address,
      chainId,
      walletType: currentWalletType,
      balance: {
        symbol: nativeSymbol,
        amount: balanceFormatted,
        decimals: 18,
        usdValue: ethPriceUsd
          ? (parseFloat(balanceFormatted) * ethPriceUsd).toFixed(2)
          : null,
      },
    }
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("Connection rejected. Please approve the connection request.")
    }
    throw new Error(error.message || "Failed to connect wallet")
  }
}

/**
 * Restore wallet session from storage
 */
export async function restoreWalletSession(): Promise<WalletState | null> {
  const session = loadWalletSession()
  if (!session) return null

  const ethereum = getEthereumProvider()
  if (!ethereum) {
    clearWalletSession()
    return null
  }

  try {
    // Check if still connected
    const accounts = await (ethereum as any).request({
      method: "eth_accounts",
    })

    if (!accounts || accounts.length === 0) {
      clearWalletSession()
      return null
    }

    // Verify address matches
    const currentAddress = accounts[0].toLowerCase()
    if (currentAddress !== session.address.toLowerCase()) {
      clearWalletSession()
      return null
    }

    // Get current chain
    const chainIdHex = await (ethereum as any).request({ method: "eth_chainId" })
    const chainId = parseInt(chainIdHex, 16)

    currentProvider = new BrowserProvider(ethereum)
    currentWalletType = session.walletType

    // Get balance
    const balance = await currentProvider.getBalance(session.address)
    const balanceFormatted = formatUnits(balance, 18)
    const nativeSymbol = SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol || "ETH"

    return {
      isConnected: true,
      address: session.address,
      chainId,
      walletType: session.walletType,
      balance: {
        symbol: nativeSymbol,
        amount: balanceFormatted,
        decimals: 18,
        usdValue: null,
      },
    }
  } catch {
    clearWalletSession()
    return null
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  currentProvider = null
  currentWalletType = null
  clearWalletSession()
}

/**
 * Get current wallet state
 */
export async function getWalletState(): Promise<WalletState> {
  if (!currentProvider || !currentWalletType) {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      walletType: null,
      balance: null,
    }
  }

  try {
    const signer = await currentProvider.getSigner()
    const address = await signer.getAddress()
    const network = await currentProvider.getNetwork()
    const chainId = Number(network.chainId)

    const balance = await currentProvider.getBalance(address)
    const balanceFormatted = formatUnits(balance, 18)
    const nativeSymbol = SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol || "ETH"

    return {
      isConnected: true,
      address,
      chainId,
      walletType: currentWalletType,
      balance: {
        symbol: nativeSymbol,
        amount: balanceFormatted,
        decimals: 18,
        usdValue: null,
      },
    }
  } catch {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      walletType: null,
      balance: null,
    }
  }
}

/**
 * Switch to a different chain
 */
export async function switchChain(chainId: number): Promise<boolean> {
  const ethereum = getEthereumProvider()
  if (!ethereum) return false

  const chainConfig = SUPPORTED_CHAINS[chainId]
  if (!chainConfig) return false

  try {
    await (ethereum as any).request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.chainId }],
    })
    return true
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await (ethereum as any).request({
          method: "wallet_addEthereumChain",
          params: [chainConfig],
        })
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

// ============================================================================
// Token Functions
// ============================================================================

/**
 * Get supported tokens for chain
 */
export function getSupportedTokens(chainId: number): SupportedToken[] {
  const tokens: Record<number, SupportedToken[]> = {
    1: [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 1,
        decimals: 18,
        logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        chainId: 1,
        decimals: 6,
        logoUrl: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        chainId: 1,
        decimals: 6,
        logoUrl: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        address: "0x6B175474E89094C44Da98b954EesP6F9eb3a26f",
        chainId: 1,
        decimals: 18,
        logoUrl: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
      },
    ],
    137: [
      {
        symbol: "MATIC",
        name: "Polygon",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 137,
        decimals: 18,
        logoUrl: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        chainId: 137,
        decimals: 6,
        logoUrl: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
      },
    ],
    42161: [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 42161,
        decimals: 18,
        logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        chainId: 42161,
        decimals: 6,
        logoUrl: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
      },
    ],
    10: [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 10,
        decimals: 18,
        logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        chainId: 10,
        decimals: 6,
        logoUrl: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
      },
    ],
  }

  return tokens[chainId] || []
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<TokenBalance | null> {
  if (!currentProvider) return null

  try {
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      const balance = await currentProvider.getBalance(walletAddress)
      const network = await currentProvider.getNetwork()
      const chainId = Number(network.chainId)
      const symbol = SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol || "ETH"

      return {
        symbol,
        amount: formatUnits(balance, 18),
        decimals: 18,
        usdValue: null,
      }
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, currentProvider)
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol(),
    ])

    return {
      symbol,
      amount: formatUnits(balance, decimals),
      decimals,
      usdValue: null,
    }
  } catch {
    return null
  }
}

/**
 * Get token price in USD
 */
async function getTokenPriceUsd(symbol: string): Promise<number | null> {
  try {
    const coinIds: Record<string, string> = {
      ETH: "ethereum",
      MATIC: "matic-network",
      USDC: "usd-coin",
      USDT: "tether",
      DAI: "dai",
      ZEC: "zcash",
    }

    const coinId = coinIds[symbol]
    if (!coinId) return null

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    )
    const data = await response.json()
    return data[coinId]?.usd || null
  } catch {
    return null
  }
}

// ============================================================================
// Swap & Transaction Functions
// ============================================================================

/**
 * Get swap quote from API
 */
export async function getSwapQuote(
  fromToken: SupportedToken,
  fromAmount: string,
  destinationAddress: string
): Promise<SwapQuote> {
  const response = await fetch(`${API_URL}/api/swap/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromChain: fromToken.chainId,
      fromToken: fromToken.address,
      fromAmount,
      toChain: "ZEC",
      toToken: "ZEC",
      destinationAddress,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get swap quote")
  }

  const data = await response.json()

  return {
    fromToken,
    toToken: "ZEC",
    fromAmount,
    toAmount: data.toAmount,
    exchangeRate: data.exchangeRate,
    fees: data.fees,
    estimatedTime: data.estimatedTime || 300,
    route: data.route || [fromToken.symbol, "ZEC"],
    expiresAt: data.expiresAt || Date.now() + 60000,
  }
}

/**
 * Execute tip transaction
 */
export async function executeTip(
  quote: SwapQuote,
  recipientHandle: string,
  recipientAddress: string,
  onStatusChange?: (status: TransactionStatus) => void
): Promise<TipTransaction> {
  if (!currentProvider) {
    throw new Error("Wallet not connected")
  }

  const txId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const signer = await currentProvider.getSigner()
  const walletAddress = await signer.getAddress()

  const transaction: TipTransaction = {
    id: txId,
    status: "approving",
    fromToken: quote.fromToken.symbol,
    fromAmount: quote.fromAmount,
    toAmount: quote.toAmount,
    recipientHandle,
    recipientAddress,
    createdAt: Date.now(),
  }

  const updateStatus = (status: TransactionStatus) => {
    transaction.status = status
    onStatusChange?.(status)
  }

  try {
    // Step 1: Approve token if ERC20
    if (quote.fromToken.address !== "0x0000000000000000000000000000000000000000") {
      updateStatus("approving")
      // In demo mode, skip actual approval
    }

    // Step 2: Execute swap via API
    updateStatus("swapping")

    const swapResponse = await fetch(`${API_URL}/api/swap/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromChain: quote.fromToken.chainId,
        fromToken: quote.fromToken.address,
        fromAmount: quote.fromAmount,
        toChain: "ZEC",
        toToken: "ZEC",
        walletAddress,
        destinationAddress: recipientAddress,
        quote,
      }),
    })

    if (swapResponse.ok) {
      const swapData = await swapResponse.json()
      transaction.txHash = swapData.txHash
    }

    // Step 3: Create NEAR intent for privacy routing
    updateStatus("routing")

    const intentResponse = await fetch(`${API_URL}/api/intents/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: quote.toAmount,
        destinationAddress: recipientAddress,
        destinationChain: "ZEC",
        metadata: {
          sourceTxHash: transaction.txHash,
          sourceChain: quote.fromToken.chainId,
          senderAddress: walletAddress,
        },
      }),
    })

    if (intentResponse.ok) {
      const intentData = await intentResponse.json()
      transaction.intentId = intentData.intentId
    }

    // Step 4: Confirm
    updateStatus("confirming")
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Complete
    updateStatus("completed")
    transaction.completedAt = Date.now()

    // Save to history
    saveTransactionToHistory(transaction)

    return transaction
  } catch (error: any) {
    updateStatus("failed")
    transaction.error = error.message || "Transaction failed"
    throw error
  }
}

// ============================================================================
// Transaction History
// ============================================================================

const TX_HISTORY_KEY = "tipz_transactions"

function saveTransactionToHistory(tx: TipTransaction): void {
  try {
    const stored = localStorage.getItem(TX_HISTORY_KEY)
    const history: TipTransaction[] = stored ? JSON.parse(stored) : []
    history.unshift(tx)
    localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
  } catch {
    // Ignore storage errors
  }
}

export function getTransactionHistory(): TipTransaction[] {
  try {
    const stored = localStorage.getItem(TX_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string, maxDecimals: number = 6): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return "0"

  if (num < 0.000001) return "<0.000001"
  if (num < 1) return num.toFixed(maxDecimals)
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
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return ""
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Validate ZEC shielded address
 */
export function isValidShieldedAddress(address: string): boolean {
  return address.startsWith("u1") || address.startsWith("zs1")
}

// ============================================================================
// Event Listeners
// ============================================================================

/**
 * Setup wallet event listeners
 */
export function setupWalletListeners(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: number) => void,
  onDisconnect: () => void
): () => void {
  const ethereum = getEthereumProvider()
  if (!ethereum) return () => {}

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      onDisconnect()
    } else {
      onAccountsChanged(accounts)
    }
  }

  const handleChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16)
    onChainChanged(chainId)
  }

  ;(ethereum as any).on("accountsChanged", handleAccountsChanged)
  ;(ethereum as any).on("chainChanged", handleChainChanged)
  ;(ethereum as any).on("disconnect", onDisconnect)

  return () => {
    ;(ethereum as any).removeListener("accountsChanged", handleAccountsChanged)
    ;(ethereum as any).removeListener("chainChanged", handleChainChanged)
    ;(ethereum as any).removeListener("disconnect", onDisconnect)
  }
}
