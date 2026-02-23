/**
 * TIPZ Web Wallet Integration
 *
 * Direct wallet connection for web checkout (no extension bridge needed).
 * Supports MetaMask, Rabby, and other injected providers.
 *
 * Uses viem for EVM interactions and @solana/web3.js for Solana.
 */

import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  formatUnits,
  parseUnits,
  erc20Abi,
  type WalletClient,
  type PublicClient,
  type Address,
  type Chain,
} from "viem"
import { mainnet, polygon, arbitrum, optimism } from "viem/chains"

// ============================================================================
// Types
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
  estimatedTime: number
  route: string[]
  expiresAt: number
  // Real swap fields (from NEAR Intents)
  depositAddress?: string
  quoteId?: string
  minDestinationAmount?: string
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
  // Fire-and-forget: preserve amounts for receipt display
  usdAmount?: number
  networkFee?: string
}

// ============================================================================
// Constants
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

const VIEM_CHAINS: Record<number, Chain> = {
  1: mainnet,
  137: polygon,
  42161: arbitrum,
  10: optimism,
}

export const SUPPORTED_CHAINS: Record<
  number,
  {
    chainId: string
    chainName: string
    nativeCurrency: { name: string; symbol: string; decimals: number }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
> = {
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
  501: {
    chainId: "501", // Solana uses numeric chain ID, not hex
    chainName: "Solana",
    nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
    rpcUrls: ["https://api.mainnet-beta.solana.com"],
    blockExplorerUrls: ["https://solscan.io"],
  },
}

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

let currentWalletClient: WalletClient | null = null
let currentPublicClient: PublicClient | null = null
let currentWalletType: WalletType | null = null
let currentSolanaPublicKey: string | null = null

/**
 * Create a public client for the given chain
 */
function getPublicClientForChain(chainId: number): PublicClient {
  const chain = VIEM_CHAINS[chainId]
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`)

  const rpcUrl = SUPPORTED_CHAINS[chainId]?.rpcUrls[0]
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  })
}

/**
 * Get the Ethereum provider from window
 * @param preferredType - Optional: specific wallet type to look for
 */
function getEthereumProvider(preferredType?: WalletType): any | null {
  if (typeof window === "undefined") return null
  const ethereum = (window as any).ethereum
  if (!ethereum) return null

  // If a specific wallet type is requested, try to find it
  if (preferredType && preferredType !== "phantom") {
    // Check for providers array (EIP-6963 / multiple wallets installed)
    const providers = (ethereum as any).providers as any[] | undefined
    if (providers && Array.isArray(providers)) {
      for (const provider of providers) {
        if (preferredType === "rabby" && provider.isRabby) {
          return provider
        }
        if (preferredType === "metamask" && provider.isMetaMask && !provider.isRabby) {
          return provider
        }
      }
    }

    // Check the main ethereum object
    if (preferredType === "rabby" && (ethereum as any).isRabby) {
      return ethereum
    }
    if (preferredType === "metamask" && (ethereum as any).isMetaMask) {
      return ethereum
    }
  }

  return ethereum
}

/**
 * Get Phantom Solana provider if available
 */
function getPhantomProvider(): any | null {
  if (typeof window === "undefined") return null
  const phantom = (window as any).phantom?.solana
  if (phantom?.isPhantom) return phantom
  return null
}

/**
 * Detect which wallet is available
 * Prioritizes EVM wallets (Rabby, MetaMask) over Solana (Phantom)
 */
export function detectWallet(): WalletType | null {
  if (typeof window === "undefined") return null

  // Check EVM wallets first (more commonly used for tipping)
  const ethereum = (window as any).ethereum
  if (ethereum) {
    if (ethereum.isRabby) return "rabby"
    if (ethereum.isMetaMask) return "metamask"
    if (ethereum.isCoinbaseWallet) return "coinbase"
    return "metamask" // Default to metamask for generic EVM providers
  }

  // Fall back to Phantom only if no EVM wallet is available
  const phantom = getPhantomProvider()
  if (phantom) return "phantom"

  return null
}

/**
 * Check if a wallet is available
 */
export function isWalletAvailable(): boolean {
  return getEthereumProvider() !== null || getPhantomProvider() !== null
}

// ============================================================================
// Wallet Connection
// ============================================================================

/**
 * Connect to Phantom wallet (Solana)
 */
export async function connectPhantomWallet(): Promise<WalletState> {
  const phantom = getPhantomProvider()
  if (!phantom) {
    throw new Error("Phantom wallet not found. Please install Phantom.")
  }

  try {
    // Request connection
    const response = await phantom.connect()
    const publicKey = response.publicKey.toString()

    currentSolanaPublicKey = publicKey
    currentWalletType = "phantom"
    currentWalletClient = null
    currentPublicClient = null

    // Get SOL balance via RPC
    let balanceFormatted = "0"
    let usdValue: string | null = null
    try {
      const rpcResponse = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [publicKey],
        }),
      })
      const rpcData = await rpcResponse.json()
      if (rpcData.result?.value !== undefined) {
        // Convert lamports to SOL (9 decimals)
        balanceFormatted = (rpcData.result.value / 1e9).toFixed(9)
      }

      // Get SOL price
      const solPrice = await getTokenPriceUsd("SOL")
      if (solPrice) {
        usdValue = (parseFloat(balanceFormatted) * solPrice).toFixed(2)
      }
    } catch {
      // Ignore balance fetch errors
    }

    // Save session
    saveWalletSession({
      address: publicKey,
      chainId: 501,
      walletType: "phantom",
      connectedAt: Date.now(),
    })

    return {
      isConnected: true,
      address: publicKey,
      chainId: 501, // Solana mainnet
      walletType: "phantom",
      balance: {
        symbol: "SOL",
        amount: balanceFormatted,
        decimals: 9,
        usdValue,
      },
    }
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("Connection rejected. Please approve the connection request.")
    }
    throw new Error(error.message || "Failed to connect Phantom wallet")
  }
}

/**
 * Connect to wallet
 */
export async function connectWallet(preferredType?: WalletType): Promise<WalletState> {
  // If Phantom is preferred or detected, use Phantom connection
  const detected = detectWallet()
  if (preferredType === "phantom" || (!preferredType && detected === "phantom")) {
    return connectPhantomWallet()
  }

  // Get the ethereum provider, preferring the user's selection
  const ethereum = getEthereumProvider(preferredType)
  if (!ethereum) {
    // Fallback to Phantom if no EVM wallet but Phantom is available
    const phantom = getPhantomProvider()
    if (phantom) {
      return connectPhantomWallet()
    }
    throw new Error("No wallet found. Please install MetaMask, Rabby, or Phantom.")
  }

  try {
    // Request account access
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.")
    }

    const address = accounts[0] as Address
    const chainIdHex = await ethereum.request({ method: "eth_chainId" })
    const chainId = parseInt(chainIdHex, 16)

    const chain = VIEM_CHAINS[chainId] || mainnet

    currentWalletClient = createWalletClient({
      account: address,
      chain,
      transport: custom(ethereum),
    })

    currentPublicClient = createPublicClient({
      chain,
      transport: custom(ethereum),
    })

    currentWalletType = preferredType || detected || "metamask"

    // Get balance
    const balance = await currentPublicClient.getBalance({ address })
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
        usdValue: ethPriceUsd ? (parseFloat(balanceFormatted) * ethPriceUsd).toFixed(2) : null,
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

  // Handle Phantom session restoration
  if (session.walletType === "phantom") {
    const phantom = getPhantomProvider()
    if (!phantom) {
      clearWalletSession()
      return null
    }

    try {
      // Check if Phantom is still connected (silent connect)
      const response = await phantom.connect({ onlyIfTrusted: true })
      const publicKey = response.publicKey.toString()

      if (publicKey.toLowerCase() !== session.address.toLowerCase()) {
        clearWalletSession()
        return null
      }

      currentSolanaPublicKey = publicKey
      currentWalletType = "phantom"
      currentWalletClient = null
      currentPublicClient = null

      return {
        isConnected: true,
        address: publicKey,
        chainId: 501,
        walletType: "phantom",
        balance: {
          symbol: "SOL",
          amount: "0",
          decimals: 9,
          usdValue: null,
        },
      }
    } catch {
      clearWalletSession()
      return null
    }
  }

  // Handle EVM wallet session restoration
  const ethereum = getEthereumProvider(session.walletType)
  if (!ethereum) {
    clearWalletSession()
    return null
  }

  try {
    // Check if still connected
    const accounts = await ethereum.request({
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
    const chainIdHex = await ethereum.request({ method: "eth_chainId" })
    const chainId = parseInt(chainIdHex, 16)
    const chain = VIEM_CHAINS[chainId] || mainnet

    currentWalletClient = createWalletClient({
      account: session.address as Address,
      chain,
      transport: custom(ethereum),
    })

    currentPublicClient = createPublicClient({
      chain,
      transport: custom(ethereum),
    })

    currentWalletType = session.walletType

    // Get balance
    const balance = await currentPublicClient.getBalance({
      address: session.address as Address,
    })
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
  // Disconnect Phantom if connected
  if (currentWalletType === "phantom") {
    const phantom = getPhantomProvider()
    if (phantom) {
      try {
        phantom.disconnect()
      } catch {
        // Ignore disconnect errors
      }
    }
    currentSolanaPublicKey = null
  }

  currentWalletClient = null
  currentPublicClient = null
  currentWalletType = null
  clearWalletSession()
}

/**
 * Get current wallet state
 */
export async function getWalletState(): Promise<WalletState> {
  // Handle Phantom wallet state
  if (currentWalletType === "phantom" && currentSolanaPublicKey) {
    return {
      isConnected: true,
      address: currentSolanaPublicKey,
      chainId: 501,
      walletType: "phantom",
      balance: {
        symbol: "SOL",
        amount: "0",
        decimals: 9,
        usdValue: null,
      },
    }
  }

  if (!currentWalletClient || !currentPublicClient || !currentWalletType) {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      walletType: null,
      balance: null,
    }
  }

  try {
    const [address] = await currentWalletClient.getAddresses()
    const chainId = await currentPublicClient.getChainId()

    const balance = await currentPublicClient.getBalance({ address })
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
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.chainId }],
    })

    // Recreate clients for the new chain
    const chain = VIEM_CHAINS[chainId]
    if (chain && currentWalletClient?.account) {
      currentWalletClient = createWalletClient({
        account: currentWalletClient.account,
        chain,
        transport: custom(ethereum),
      })
      currentPublicClient = createPublicClient({
        chain,
        transport: custom(ethereum),
      })
    }

    return true
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
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
 * Get all supported tokens across all chains
 * Used for multi-chain token selection with auto-switching
 */
export function getAllSupportedTokens(): SupportedToken[] {
  const allTokens: SupportedToken[] = []
  const supportedChainIds = [1, 137, 42161, 10, 501] // All EVM chains + Solana

  for (const chainId of supportedChainIds) {
    allTokens.push(...getSupportedTokens(chainId))
  }

  return allTokens
}

/**
 * Get chain name from chain ID
 */
export function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS[chainId]?.chainName || `Chain ${chainId}`
}

/**
 * Get supported tokens for chain - only tokens NEAR Intents can swap to ZEC
 * Addresses must match those in near-intents.ts ASSET_IDS
 */
export function getSupportedTokens(chainId: number): SupportedToken[] {
  // Only tokens supported by NEAR Intents for ZEC swaps
  const tokens: Record<number, SupportedToken[]> = {
    // Ethereum Mainnet
    1: [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 1,
        decimals: 18,
        logoUrl: "/icons/eth.svg",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        chainId: 1,
        decimals: 6,
        logoUrl: "/icons/usdc.svg",
      },
      {
        symbol: "USDT",
        name: "Tether",
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        chainId: 1,
        decimals: 6,
        logoUrl: "/icons/usdt.svg",
      },
    ],
    // Polygon
    137: [
      {
        symbol: "MATIC",
        name: "Polygon",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 137,
        decimals: 18,
        logoUrl: "/icons/matic.svg",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
        chainId: 137,
        decimals: 6,
        logoUrl: "/icons/usdc.svg",
      },
      {
        symbol: "USDT",
        name: "Tether",
        address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        chainId: 137,
        decimals: 6,
        logoUrl: "/icons/usdt.svg",
      },
    ],
    // Arbitrum
    42161: [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 42161,
        decimals: 18,
        logoUrl: "/icons/eth.svg",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        chainId: 42161,
        decimals: 6,
        logoUrl: "/icons/usdc.svg",
      },
      {
        symbol: "USDT",
        name: "Tether",
        address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        chainId: 42161,
        decimals: 6,
        logoUrl: "/icons/usdt.svg",
      },
    ],
    // Optimism
    10: [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        chainId: 10,
        decimals: 18,
        logoUrl: "/icons/eth.svg",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        chainId: 10,
        decimals: 6,
        logoUrl: "/icons/usdc.svg",
      },
      {
        symbol: "USDT",
        name: "Tether",
        address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        chainId: 10,
        decimals: 6,
        logoUrl: "/icons/usdt.svg",
      },
    ],
    // Solana
    501: [
      {
        symbol: "SOL",
        name: "Solana",
        address: "native",
        chainId: 501,
        decimals: 9,
        logoUrl: "/icons/sol.svg",
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
  // Handle Solana balance
  if (currentWalletType === "phantom" && (tokenAddress === "native" || tokenAddress === "")) {
    try {
      const rpcResponse = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [walletAddress],
        }),
      })
      const rpcData = await rpcResponse.json()
      if (rpcData.result?.value !== undefined) {
        const balanceFormatted = (rpcData.result.value / 1e9).toFixed(9)
        return {
          symbol: "SOL",
          amount: balanceFormatted,
          decimals: 9,
          usdValue: null,
        }
      }
    } catch {
      // Ignore errors
    }
    return {
      symbol: "SOL",
      amount: "0",
      decimals: 9,
      usdValue: null,
    }
  }

  if (!currentPublicClient) return null

  try {
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      const balance = await currentPublicClient.getBalance({
        address: walletAddress as Address,
      })
      const chainId = await currentPublicClient.getChainId()
      const symbol = SUPPORTED_CHAINS[chainId]?.nativeCurrency.symbol || "ETH"

      return {
        symbol,
        amount: formatUnits(balance, 18),
        decimals: 18,
        usdValue: null,
      }
    }

    const [balance, decimals, symbol] = await Promise.all([
      currentPublicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [walletAddress as Address],
      }),
      currentPublicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "decimals",
      }),
      currentPublicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: "symbol",
      }),
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
      SOL: "solana",
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
 * Execute Solana tip transaction via Phantom
 */
async function executeSolanaTip(
  quote: SwapQuote & { depositAddress?: string },
  recipientHandle: string,
  recipientAddress: string,
  onStatusChange?: (status: TransactionStatus) => void
): Promise<TipTransaction> {
  const phantom = getPhantomProvider()
  if (!phantom || !currentSolanaPublicKey) {
    throw new Error("Phantom wallet not connected")
  }

  const txId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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
    const depositAddress = quote.depositAddress

    if (depositAddress) {
      // REAL SWAP: Send SOL to NEAR Intents deposit address
      updateStatus("swapping")

      // Convert amount to lamports (9 decimals)
      const lamports = Math.floor(parseFloat(quote.fromAmount) * 1e9)

      console.log("[wallet] Sending SOL to deposit address:", {
        lamports,
      })

      // Create transaction using Solana Web3.js
      const { Connection, PublicKey, Transaction, SystemProgram } = await import("@solana/web3.js")

      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed")
      const fromPubkey = new PublicKey(currentSolanaPublicKey)
      const toPubkey = new PublicKey(depositAddress)

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

      // Create transfer instruction
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      )

      tx.recentBlockhash = blockhash
      tx.feePayer = fromPubkey

      // Sign and send via Phantom
      const { signature } = await phantom.signAndSendTransaction(tx)

      console.log("[wallet] Solana transaction sent:", signature)
      transaction.txHash = signature

      // Wait for confirmation
      updateStatus("confirming")
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      })

      console.log("[wallet] Solana transaction confirmed:", signature)

      // Transaction sent - NEAR Intents will handle the rest
      updateStatus("routing")
      ;(transaction as any).depositAddress = depositAddress
    } else {
      throw new Error("No deposit address available — cannot send transaction")
    }

    transaction.status = "routing"

    saveTransactionToHistory(transaction)
    return transaction
  } catch (error: any) {
    updateStatus("failed")
    if (error.code === 4001 || error.message?.includes("rejected")) {
      transaction.error = "Transaction rejected by user"
    } else {
      transaction.error = error.message || "Solana transaction failed"
    }
    throw error
  }
}

/**
 * Get swap quote from API
 */
export async function getSwapQuote(
  fromToken: SupportedToken,
  fromAmount: string,
  destinationAddress: string,
  refundAddress?: string
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
      refundAddress,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Quote failed: ${response.status}`)
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
    // Real swap fields (from NEAR Intents)
    depositAddress: data.depositAddress,
    quoteId: data.quoteId,
    minDestinationAmount: data.minDestinationAmount,
  }
}

/**
 * Execute tip transaction
 *
 * For NEAR Intents 1Click flow:
 * 1. Send funds from user's wallet to the deposit address
 * 2. NEAR Intents monitors and completes the swap to ZEC
 */
export async function executeTip(
  quote: SwapQuote & { depositAddress?: string },
  recipientHandle: string,
  recipientAddress: string,
  onStatusChange?: (status: TransactionStatus) => void
): Promise<TipTransaction> {
  // Handle Solana transactions (Phantom wallet)
  if (currentWalletType === "phantom") {
    return executeSolanaTip(quote, recipientHandle, recipientAddress, onStatusChange)
  }

  if (!currentWalletClient || !currentPublicClient) {
    throw new Error("Wallet not connected")
  }

  const txId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const [walletAddress] = await currentWalletClient.getAddresses()

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
    // Check if this is a real swap with deposit address
    const depositAddress = quote.depositAddress

    if (depositAddress) {
      // REAL SWAP: Send funds to NEAR Intents deposit address
      const isNativeToken = quote.fromToken.address === "0x0000000000000000000000000000000000000000"

      if (isNativeToken) {
        // Send native token (ETH, MATIC, etc.)
        updateStatus("swapping")

        const amountWei = parseUnits(quote.fromAmount, quote.fromToken.decimals)

        console.log("[wallet] Sending native token to deposit address:", {
          amount: quote.fromAmount,
          amountWei: amountWei.toString(),
        })

        const hash = await currentWalletClient.sendTransaction({
          to: depositAddress as Address,
          value: amountWei,
          account: walletAddress,
          chain: currentWalletClient.chain,
        })

        console.log("[wallet] Transaction sent:", hash)
        transaction.txHash = hash

        // Wait for confirmation
        updateStatus("confirming")
        const receipt = await currentPublicClient.waitForTransactionReceipt({ hash })
        console.log("[wallet] Transaction confirmed:", receipt.transactionHash)
      } else {
        // Send ERC20 token
        updateStatus("approving")

        const amountSmallest = parseUnits(quote.fromAmount, quote.fromToken.decimals)

        updateStatus("swapping")

        console.log("[wallet] Sending ERC20 to deposit address:", {
          token: quote.fromToken.symbol,
          amount: quote.fromAmount,
        })

        // Use transfer directly to deposit address
        const hash = await currentWalletClient.writeContract({
          address: quote.fromToken.address as Address,
          abi: erc20Abi,
          functionName: "transfer",
          args: [depositAddress as Address, amountSmallest],
          account: walletAddress,
          chain: currentWalletClient.chain,
        })

        console.log("[wallet] Transaction sent:", hash)
        transaction.txHash = hash

        // Wait for confirmation
        updateStatus("confirming")
        const receipt = await currentPublicClient.waitForTransactionReceipt({ hash })
        console.log("[wallet] Transaction confirmed:", receipt.transactionHash)
      }

      // Transaction sent - NEAR Intents will handle the rest
      updateStatus("routing")

      // Store deposit address for status polling
      ;(transaction as any).depositAddress = depositAddress
    } else {
      throw new Error("No deposit address available — cannot send transaction")
    }

    // Status will be updated by polling
    transaction.status = "routing"

    // Save to history
    saveTransactionToHistory(transaction)

    return transaction
  } catch (error: any) {
    updateStatus("failed")
    // Provide user-friendly error messages
    // viem uses error names instead of string codes
    if (
      error.name === "UserRejectedRequestError" ||
      error.code === 4001 ||
      error.code === "ACTION_REJECTED"
    ) {
      transaction.error = "Transaction rejected by user"
    } else if (error.name === "InsufficientFundsError" || error.code === "INSUFFICIENT_FUNDS") {
      transaction.error = "Insufficient funds for transaction"
    } else {
      transaction.error = error.message || "Transaction failed"
    }
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
  return address.startsWith("u1")
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
