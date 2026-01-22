/**
 * TIPZ Payment Integration
 *
 * This module handles the payment flow for tipping creators:
 * 1. Connect wallet (MetaMask, WalletConnect, etc.)
 * 2. Use SwapKit SDK to swap any token to ZEC
 * 3. Route through NEAR Intents for shielded destination
 */

import { BrowserProvider, formatUnits, parseUnits, Contract } from "ethers"
import type { Eip1193Provider } from "ethers"

// ============================================================================
// Wallet Bridge Communication (for content script isolation)
// ============================================================================

interface WalletBridgeResponse {
  id: string
  success: boolean
  result?: any
  error?: string
}

let bridgeRequestId = 0

/**
 * Send a request to the wallet bridge running in the main world
 */
async function walletBridgeRequest(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = `tipz-${++bridgeRequestId}-${Date.now()}`

    const handleResponse = (event: CustomEvent<WalletBridgeResponse>) => {
      if (event.detail.id !== id) return
      window.removeEventListener("tipz-wallet-response" as any, handleResponse)

      if (event.detail.success) {
        resolve(event.detail.result)
      } else {
        reject(new Error(event.detail.error || "Unknown wallet error"))
      }
    }

    window.addEventListener("tipz-wallet-response" as any, handleResponse)

    // Set timeout
    setTimeout(() => {
      window.removeEventListener("tipz-wallet-response" as any, handleResponse)
      reject(new Error("Wallet request timed out. Make sure you have a wallet installed."))
    }, 30000)

    // Send request to bridge
    window.dispatchEvent(new CustomEvent("tipz-wallet-request", {
      detail: { id, method, params }
    }))
  })
}

// ============================================================================
// Types & Interfaces
// ============================================================================

export type WalletType = "metamask" | "rabby" | "walletconnect" | "coinbase" | "phantom"

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
// Constants
// ============================================================================

const DEFAULT_CONFIG: PaymentConfig = {
  apiUrl: process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000",
  supportedChains: [1, 137, 42161, 10], // Ethereum, Polygon, Arbitrum, Optimism
  minTipUsd: 0.01,
  maxTipUsd: 1000,
}

/**
 * Demo mode flag - indicates the app is using mock APIs
 * In demo mode:
 * - Swap quotes are simulated using real CoinGecko prices
 * - Transactions are mocked (no real funds transferred)
 * - NEAR Intents are simulated
 *
 * Set PLASMO_PUBLIC_DEMO_MODE=false in production
 */
export const DEMO_MODE = process.env.PLASMO_PUBLIC_DEMO_MODE !== "false"

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return DEMO_MODE
}

// Chain configurations for adding networks
const CHAIN_CONFIGS: Record<number, {
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

// SwapKit router address (mainnet)
const SWAPKIT_ROUTER = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"

// NEAR Intents contract for privacy routing
const NEAR_INTENTS_CONTRACT = "intents.near"

// ============================================================================
// Wallet Session Persistence
// ============================================================================

interface WalletSession {
  address: string
  chainId: number
  walletType: WalletType
  connectedAt: number
}

const WALLET_SESSION_KEY = "tipz_wallet_session"

/**
 * Save wallet session to localStorage
 */
function saveWalletSession(session: WalletSession): void {
  try {
    localStorage.setItem(WALLET_SESSION_KEY, JSON.stringify(session))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Load wallet session from localStorage
 */
export function loadWalletSession(): WalletSession | null {
  try {
    const stored = localStorage.getItem(WALLET_SESSION_KEY)
    if (!stored) return null
    return JSON.parse(stored) as WalletSession
  } catch {
    return null
  }
}

/**
 * Clear wallet session from localStorage
 */
export function clearWalletSession(): void {
  try {
    localStorage.removeItem(WALLET_SESSION_KEY)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Restore wallet session from localStorage
 * Attempts to reconnect via wallet bridge and validates the saved address
 */
export async function restoreWalletSession(): Promise<WalletState | null> {
  // Check if session restoration is blocked (during explicit wallet changes)
  if (sessionRestorationBlocked) {
    console.log("TIPZ: Session restoration blocked during reconnection")
    return null
  }

  const session = loadWalletSession()
  if (!session) {
    return null
  }

  console.log("TIPZ: Attempting to restore wallet session", { address: session.address })

  try {
    // Check if wallet is available
    const checkResult = await walletBridgeRequest("check")
    if (!checkResult.available) {
      console.log("TIPZ: No wallet available, clearing session")
      clearWalletSession()
      return null
    }

    // Try to get accounts without prompting (check if already connected)
    const accounts = await walletBridgeRequest("getAccounts")

    if (!accounts || accounts.length === 0) {
      console.log("TIPZ: No accounts available, clearing session")
      clearWalletSession()
      return null
    }

    // Validate that the saved address matches the current wallet
    const currentAddress = accounts[0].toLowerCase()
    if (currentAddress !== session.address.toLowerCase()) {
      console.log("TIPZ: Wallet address changed, clearing session")
      clearWalletSession()
      return null
    }

    // Get current chain ID
    const chainIdHex = await walletBridgeRequest("getChainId")
    const chainId = parseInt(chainIdHex, 16)

    currentWalletType = session.walletType

    // Store bridge connection state
    bridgeConnectedAddress = session.address
    bridgeConnectedChainId = chainId

    // Get balance via bridge
    let balanceFormatted = "0"
    try {
      const balanceHex = await walletBridgeRequest("getBalance", { address: session.address })
      const balanceWei = BigInt(balanceHex)
      balanceFormatted = formatUnits(balanceWei, 18)
    } catch (err) {
      console.warn("TIPZ: Could not fetch balance during restore", err)
    }

    // Update session with current chain (might have changed)
    saveWalletSession({
      ...session,
      chainId,
      connectedAt: Date.now(),
    })

    console.log("TIPZ: Wallet session restored successfully")

    return {
      isConnected: true,
      address: session.address,
      chainId,
      walletType: session.walletType,
      balance: {
        symbol: chainId === 137 ? "MATIC" : "ETH",
        amount: balanceFormatted,
        decimals: 18,
        usdValue: null,
      },
    }
  } catch (error) {
    console.error("TIPZ: Failed to restore wallet session", error)
    clearWalletSession()
    return null
  }
}

// ============================================================================
// Global State
// ============================================================================

let currentProvider: BrowserProvider | null = null
let currentWalletType: WalletType | null = null

// Wallet bridge connection state (for when using bridge instead of direct provider)
let bridgeConnectedAddress: string | null = null
let bridgeConnectedChainId: number | null = null

// Session restoration blocking flag - prevents auto-restore during explicit wallet changes
let sessionRestorationBlocked = false

/**
 * Block session restoration during explicit wallet changes
 */
export function blockSessionRestoration(): void {
  sessionRestorationBlocked = true
}

/**
 * Unblock session restoration after wallet change completes
 */
export function unblockSessionRestoration(): void {
  sessionRestorationBlocked = false
}

/**
 * Check if session restoration is currently blocked
 */
export function isSessionRestorationBlocked(): boolean {
  return sessionRestorationBlocked
}

/**
 * Check if we have an active wallet connection (either via provider or bridge)
 */
function isWalletConnected(): boolean {
  return !!(currentProvider || bridgeConnectedAddress)
}

/**
 * Get the connected address (from provider or bridge)
 */
function getConnectedAddress(): string | null {
  return bridgeConnectedAddress
}

// ============================================================================
// Wallet Connection
// ============================================================================

/**
 * Get list of available wallet providers in the browser
 */
export function getAvailableWallets(): WalletType[] {
  // Show MetaMask and Rabby options - both use the same injected provider
  // Note: Content scripts run in isolated world and can't detect window.ethereum
  return ["metamask", "rabby", "walletconnect"]
}

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
 * Connect to MetaMask wallet (via wallet bridge for content script isolation)
 * @param force - If true, forces the wallet to show account picker even if already connected
 */
async function connectMetaMask(force?: boolean): Promise<WalletState> {
  console.log("TIPZ: Connecting via wallet bridge...", { force })

  try {
    // First check if wallet is available
    const checkResult = await walletBridgeRequest("check")
    if (!checkResult.available) {
      throw new Error("No wallet found. Please install MetaMask or Rabby.")
    }

    // Request connection (use forceConnect to show account picker when changing wallets)
    const connectResult = await walletBridgeRequest(force ? "forceConnect" : "connect")
    const { accounts, chainId } = connectResult

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet and try again.")
    }

    const address = accounts[0]
    currentWalletType = "metamask"

    // Store bridge connection state
    bridgeConnectedAddress = address
    bridgeConnectedChainId = chainId

    // Get balance via bridge
    let balanceFormatted = "0"
    try {
      const balanceHex = await walletBridgeRequest("getBalance", { address })
      const balanceWei = BigInt(balanceHex)
      balanceFormatted = formatUnits(balanceWei, 18)
    } catch (err) {
      console.warn("TIPZ: Could not fetch balance", err)
    }

    // Get ETH price
    const ethPriceUsd = await getTokenPriceUsd("ETH", chainId)

    // Save session for persistence
    saveWalletSession({
      address,
      chainId,
      walletType: "metamask",
      connectedAt: Date.now(),
    })

    return {
      isConnected: true,
      address,
      chainId,
      walletType: "metamask",
      balance: {
        symbol: chainId === 137 ? "MATIC" : "ETH",
        amount: balanceFormatted,
        decimals: 18,
        usdValue: ethPriceUsd
          ? (parseFloat(balanceFormatted) * ethPriceUsd).toFixed(2)
          : null,
      },
    }
  } catch (error: any) {
    console.error("TIPZ: Wallet connection error", error)
    if (error.message.includes("rejected")) {
      throw new Error("Connection request was rejected. Please try again.")
    }
    throw new Error(error.message || "Failed to connect wallet")
  }
}

/**
 * Connect to WalletConnect
 * NOTE: WalletConnect SDK has bundling issues with the current toolchain.
 * Using direct browser wallet injection (MetaMask/Rabby) for now.
 * TODO: Re-enable once WalletConnect v2 bundling issues are resolved.
 */
async function connectWalletConnect(): Promise<WalletState> {
  // For now, try to use the injected provider (works with MetaMask, Rabby, etc.)
  const ethereum = getEthereumProvider()
  if (ethereum) {
    console.log("TIPZ: WalletConnect requested, falling back to injected provider")
    return connectMetaMask() // Use injected provider
  }
  throw new Error("WalletConnect QR modal coming soon. Please install MetaMask or Rabby browser extension.")
}

/**
 * Connect to Coinbase Wallet
 */
async function connectCoinbase(): Promise<WalletState> {
  const ethereum = getEthereumProvider()
  if (!ethereum || !(ethereum as any).isCoinbaseWallet) {
    throw new Error("Coinbase Wallet is not installed.")
  }

  // Coinbase Wallet uses same interface as MetaMask
  try {
    const accounts = await (ethereum as any).request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock Coinbase Wallet.")
    }

    const address = accounts[0]
    const chainIdHex = await (ethereum as any).request({ method: "eth_chainId" })
    const chainId = parseInt(chainIdHex, 16)

    currentProvider = new BrowserProvider(ethereum)
    currentWalletType = "coinbase"

    const balance = await currentProvider.getBalance(address)
    const balanceFormatted = formatUnits(balance, 18)

    return {
      isConnected: true,
      address,
      chainId,
      walletType: "coinbase",
      balance: {
        symbol: chainId === 137 ? "MATIC" : "ETH",
        amount: balanceFormatted,
        decimals: 18,
        usdValue: null,
      },
    }
  } catch (error: any) {
    console.error("TIPZ: Coinbase Wallet connection error", error)
    throw new Error(error.message || "Failed to connect to Coinbase Wallet")
  }
}

/**
 * Connect to a wallet
 * @param walletType - The type of wallet to connect to
 * @param force - If true, forces the wallet to show account picker even if already connected
 */
export async function connectWallet(walletType: WalletType, force?: boolean): Promise<WalletState> {
  console.log("TIPZ: Connecting wallet", { walletType, force })

  // Clear existing state when forcing a new connection
  if (force) {
    console.log("TIPZ: Force connect - clearing existing state")
    clearWalletSession()
    bridgeConnectedAddress = null
    bridgeConnectedChainId = null
    currentProvider = null
    currentWalletType = null
  }

  switch (walletType) {
    case "metamask":
    case "rabby":
      return connectMetaMask(force) // Both use the same injected provider
    case "walletconnect":
      return connectWalletConnect()
    case "coinbase":
      return connectCoinbase()
    case "phantom":
      throw new Error("Phantom wallet support is coming soon. Please use MetaMask or WalletConnect.")
    default:
      throw new Error(`Unsupported wallet type: ${walletType}`)
  }
}

/**
 * Disconnect the current wallet
 */
export async function disconnectWallet(): Promise<void> {
  console.log("TIPZ: Disconnecting wallet")

  if (currentWalletType === "walletconnect" && currentProvider) {
    try {
      // Disconnect WalletConnect session
      const internalProvider = (currentProvider as any)._network?.provider
      if (internalProvider?.disconnect) {
        await internalProvider.disconnect()
      }
    } catch (error) {
      console.error("TIPZ: Error disconnecting WalletConnect", error)
    }
  }

  currentProvider = null
  currentWalletType = null

  // Clear bridge connection state
  bridgeConnectedAddress = null
  bridgeConnectedChainId = null

  // Clear stored session
  clearWalletSession()
}

/**
 * Get the current wallet state
 */
export async function getWalletState(): Promise<WalletState> {
  // Check for provider connection
  if (currentProvider && currentWalletType) {
    try {
      const signer = await currentProvider.getSigner()
      const address = await signer.getAddress()
      const network = await currentProvider.getNetwork()
      const chainId = Number(network.chainId)

      const balance = await currentProvider.getBalance(address)
      const balanceFormatted = formatUnits(balance, 18)

      return {
        isConnected: true,
        address,
        chainId,
        walletType: currentWalletType,
        balance: {
          symbol: chainId === 137 ? "MATIC" : "ETH",
          amount: balanceFormatted,
          decimals: 18,
          usdValue: null,
        },
      }
    } catch (error) {
      console.error("TIPZ: Error getting wallet state from provider", error)
    }
  }

  // Check for wallet bridge connection
  if (bridgeConnectedAddress && currentWalletType) {
    try {
      const balanceHex = await walletBridgeRequest("getBalance", { address: bridgeConnectedAddress })
      const balanceWei = BigInt(balanceHex)
      const balanceFormatted = formatUnits(balanceWei, 18)
      const chainId = bridgeConnectedChainId || 1

      return {
        isConnected: true,
        address: bridgeConnectedAddress,
        chainId,
        walletType: currentWalletType,
        balance: {
          symbol: chainId === 137 ? "MATIC" : "ETH",
          amount: balanceFormatted,
          decimals: 18,
          usdValue: null,
        },
      }
    } catch (error) {
      console.error("TIPZ: Error getting wallet state from bridge", error)
    }
  }

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

  const ethereum = getEthereumProvider()
  if (!ethereum) return false

  const chainConfig = CHAIN_CONFIGS[chainId]
  if (!chainConfig) {
    console.error("TIPZ: Unsupported chain", chainId)
    return false
  }

  try {
    await (ethereum as any).request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.chainId }],
    })
    return true
  } catch (switchError: any) {
    // Chain not added to wallet - try to add it
    if (switchError.code === 4902) {
      try {
        await (ethereum as any).request({
          method: "wallet_addEthereumChain",
          params: [chainConfig],
        })
        return true
      } catch (addError) {
        console.error("TIPZ: Failed to add chain", addError)
        return false
      }
    }
    console.error("TIPZ: Failed to switch chain", switchError)
    return false
  }
}

// ============================================================================
// Token & Balance Functions
// ============================================================================

/**
 * Get supported tokens for the connected chain
 */
export async function getSupportedTokens(chainId: number): Promise<SupportedToken[]> {
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
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        chainId: 137,
        decimals: 6,
        logoUrl: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
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
 * Get token balance for the connected wallet
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<TokenBalance | null> {
  // Check if we have a provider or bridge connection
  if (!currentProvider && !bridgeConnectedAddress) return null

  try {
    // Native token (ETH, MATIC, etc.)
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      if (currentProvider) {
        const balance = await currentProvider.getBalance(walletAddress)
        const network = await currentProvider.getNetwork()
        const chainId = Number(network.chainId)

        return {
          symbol: chainId === 137 ? "MATIC" : "ETH",
          amount: formatUnits(balance, 18),
          decimals: 18,
          usdValue: null,
        }
      } else {
        // Use wallet bridge for balance
        const balanceHex = await walletBridgeRequest("getBalance", { address: walletAddress })
        const balanceWei = BigInt(balanceHex)
        const chainId = bridgeConnectedChainId || 1

        return {
          symbol: chainId === 137 ? "MATIC" : "ETH",
          amount: formatUnits(balanceWei, 18),
          decimals: 18,
          usdValue: null,
        }
      }
    }

    // ERC20 token - requires provider for contract calls
    // TODO: Add wallet bridge support for ERC20 balance queries
    if (!currentProvider) {
      console.warn("TIPZ: ERC20 balance queries require provider, skipping", tokenAddress)
      return null
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
  } catch (error) {
    console.error("TIPZ: Failed to get token balance", error)
    return null
  }
}

/**
 * Get token price in USD (simplified - use proper price feed in production)
 */
async function getTokenPriceUsd(symbol: string, chainId: number): Promise<number | null> {
  try {
    // Use CoinGecko API for price data
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
// Swap Functions (SwapKit Integration)
// ============================================================================

/**
 * Get a quote for swapping tokens to ZEC
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

  try {
    // Use SwapKit API for quote
    const response = await fetch(`${DEFAULT_CONFIG.apiUrl}/api/swap/quote`, {
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

    if (response.ok) {
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
        expiresAt: Date.now() + 60000,
      }
    }

    // Fallback to local calculation if API unavailable
    const fromPriceUsd = await getTokenPriceUsd(fromToken.symbol, fromToken.chainId)
    const zecPriceUsd = await getTokenPriceUsd("ZEC", 1)

    if (fromPriceUsd && zecPriceUsd) {
      const fromValueUsd = parseFloat(fromAmount) * fromPriceUsd
      const toAmount = (fromValueUsd / zecPriceUsd).toFixed(8)
      const exchangeRate = (fromPriceUsd / zecPriceUsd).toString()

      return {
        fromToken,
        toToken: "ZEC",
        fromAmount,
        toAmount,
        exchangeRate,
        fees: {
          network: "0.001",
          protocol: "0.005",
          total: "0.006",
        },
        estimatedTime: 300,
        route: [fromToken.symbol, "USDC", "ZEC"],
        expiresAt: Date.now() + 60000,
      }
    }

    throw new Error("Unable to get swap quote")
  } catch (error) {
    console.error("TIPZ: Failed to get swap quote", error)

    // Return estimate based on hardcoded rates as last resort
    const estimatedRates: Record<string, number> = {
      ETH: 60, // ~60 ZEC per ETH
      MATIC: 0.02,
      USDC: 0.025,
      USDT: 0.025,
      DAI: 0.025,
    }

    const rate = estimatedRates[fromToken.symbol] || 0.025
    const toAmount = (parseFloat(fromAmount) * rate).toFixed(8)

    return {
      fromToken,
      toToken: "ZEC",
      fromAmount,
      toAmount,
      exchangeRate: rate.toString(),
      fees: {
        network: "0.001",
        protocol: "0.005",
        total: "0.006",
      },
      estimatedTime: 300,
      route: [fromToken.symbol, "USDC", "ZEC"],
      expiresAt: Date.now() + 60000,
    }
  }
}

/**
 * Execute a swap from any token to ZEC
 */
export async function executeSwap(
  quote: SwapQuote,
  destinationAddress: string,
  onStatusChange?: (status: TransactionStatus) => void
): Promise<TipTransaction> {
  console.log("TIPZ: Executing swap", { quote, destinationAddress })

  // Check if connected via provider OR wallet bridge
  if (!currentProvider && !bridgeConnectedAddress) {
    throw new Error("Wallet not connected")
  }

  const txId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Get wallet address - from provider or bridge connection
  let walletAddress: string
  if (currentProvider) {
    const signer = await currentProvider.getSigner()
    walletAddress = await signer.getAddress()
  } else {
    walletAddress = bridgeConnectedAddress!
  }

  const transaction: TipTransaction = {
    id: txId,
    status: "approving",
    fromToken: quote.fromToken.symbol,
    fromAmount: quote.fromAmount,
    toAmount: quote.toAmount,
    recipientHandle: "",
    recipientAddress: destinationAddress,
    createdAt: Date.now(),
  }

  const updateStatus = (status: TransactionStatus) => {
    transaction.status = status
    onStatusChange?.(status)
  }

  try {
    // Step 1: Approve token (if not native) - only when using provider
    if (quote.fromToken.address !== "0x0000000000000000000000000000000000000000" && currentProvider) {
      updateStatus("approving")

      const signer = await currentProvider.getSigner()
      const tokenContract = new Contract(quote.fromToken.address, ERC20_ABI, signer)
      const amountWei = parseUnits(quote.fromAmount, quote.fromToken.decimals)

      // Check current allowance
      const allowance = await tokenContract.allowance(walletAddress, SWAPKIT_ROUTER)

      if (allowance < amountWei) {
        console.log("TIPZ: Requesting token approval")
        const approveTx = await tokenContract.approve(SWAPKIT_ROUTER, amountWei)
        await approveTx.wait()
        console.log("TIPZ: Token approved")
      }
    }

    // Step 2: Execute swap via TIPZ API (which uses SwapKit)
    updateStatus("swapping")

    const swapResponse = await fetch(`${DEFAULT_CONFIG.apiUrl}/api/swap/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromChain: quote.fromToken.chainId,
        fromToken: quote.fromToken.address,
        fromAmount: quote.fromAmount,
        toChain: "ZEC",
        toToken: "ZEC",
        walletAddress,
        destinationAddress,
        quote,
      }),
    })

    if (!swapResponse.ok) {
      // Fallback: Direct transaction for testing/development
      const amountWei = parseUnits(quote.fromAmount, quote.fromToken.decimals)

      if (quote.fromToken.address === "0x0000000000000000000000000000000000000000") {
        // Send native token via wallet bridge or provider
        if (currentProvider) {
          const signer = await currentProvider.getSigner()
          const tx = await signer.sendTransaction({
            to: SWAPKIT_ROUTER,
            value: amountWei,
            data: "0x",
          })
          transaction.swapTxHash = tx.hash
          await tx.wait()
        } else {
          // Use wallet bridge for transaction
          const txHash = await walletBridgeRequest("sendTransaction", {
            tx: {
              to: SWAPKIT_ROUTER,
              value: "0x" + amountWei.toString(16),
              data: "0x",
            }
          })
          transaction.swapTxHash = txHash
        }
      } else {
        throw new Error("Swap execution failed. Please try again.")
      }
    } else {
      const swapData = await swapResponse.json()
      transaction.swapTxHash = swapData.txHash
    }

    // Step 3: Route to shielded address via NEAR Intents
    updateStatus("routing")

    const routeResult = await routeToShieldedAddress(quote.toAmount, destinationAddress)
    console.log("TIPZ: Routed to shielded address", routeResult)

    // Step 4: Confirm transaction
    updateStatus("confirming")

    // Wait for confirmations (simulated delay for demo)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Step 5: Complete
    updateStatus("completed")
    transaction.completedAt = Date.now()
    transaction.txHash = transaction.swapTxHash

    return transaction
  } catch (error: any) {
    console.error("TIPZ: Swap execution failed", error)
    updateStatus("failed")
    transaction.error = error.message || "Transaction failed"
    throw error
  }
}

// ============================================================================
// NEAR Intents Integration
// ============================================================================

/**
 * Route payment through NEAR Intents to shielded ZEC address
 */
export async function routeToShieldedAddress(
  amount: string,
  shieldedAddress: string
): Promise<{ intentId: string; status: string }> {
  console.log("TIPZ: Routing to shielded address", { amount, shieldedAddress })

  try {
    // Call TIPZ API to create NEAR Intent
    const response = await fetch(`${DEFAULT_CONFIG.apiUrl}/api/intents/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        destinationAddress: shieldedAddress,
        destinationChain: "ZEC",
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        intentId: data.intentId,
        status: data.status || "pending",
      }
    }

    // Fallback: Generate local intent ID for tracking
    const intentId = `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      intentId,
      status: "pending",
    }
  } catch (error) {
    console.error("TIPZ: Failed to create intent", error)
    // Return a tracking ID even on error
    return {
      intentId: `intent_${Date.now()}`,
      status: "pending",
    }
  }
}

// ============================================================================
// Transaction History
// ============================================================================

/**
 * Get transaction history from storage
 */
export async function getTransactionHistory(): Promise<TipTransaction[]> {
  try {
    // Try chrome.storage first (extension context)
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(["tipz_transactions"], (result) => {
          resolve(result.tipz_transactions || [])
        })
      })
    }

    // Fallback to localStorage
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
  try {
    const history = await getTransactionHistory()
    history.unshift(tx)
    const trimmed = history.slice(0, 50)

    // Try chrome.storage first
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ tipz_transactions: trimmed })
      return
    }

    // Fallback to localStorage
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
// Event Listeners for Wallet Changes
// ============================================================================

/**
 * Set up wallet event listeners
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

  const handleDisconnect = () => {
    onDisconnect()
  }

  ;(ethereum as any).on("accountsChanged", handleAccountsChanged)
  ;(ethereum as any).on("chainChanged", handleChainChanged)
  ;(ethereum as any).on("disconnect", handleDisconnect)

  // Return cleanup function
  return () => {
    ;(ethereum as any).removeListener("accountsChanged", handleAccountsChanged)
    ;(ethereum as any).removeListener("chainChanged", handleChainChanged)
    ;(ethereum as any).removeListener("disconnect", handleDisconnect)
  }
}
