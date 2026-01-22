/**
 * React hook for managing payment state
 *
 * This hook provides:
 * - Wallet connection management (MetaMask, WalletConnect, Coinbase)
 * - Token selection and balance tracking
 * - Transaction execution and status monitoring
 * - Real-time wallet event handling
 */

import { useState, useCallback, useEffect, useRef } from "react"
import {
  type WalletState,
  type WalletType,
  type TipTransaction,
  type SupportedToken,
  type TransactionStatus,
  connectWallet,
  disconnectWallet,
  getWalletState,
  getSupportedTokens,
  getSwapQuote,
  executeSwap,
  saveTransaction,
  getAvailableWallets,
  getTokenBalance,
  setupWalletListeners,
  switchChain,
  restoreWalletSession,
  loadWalletSession,
  clearWalletSession,
  blockSessionRestoration,
  unblockSessionRestoration,
  isSessionRestorationBlocked,
} from "~lib/payment"

export interface UsePaymentReturn {
  // Wallet state
  wallet: WalletState
  availableWallets: WalletType[]
  isConnecting: boolean

  // Transaction state
  transaction: TipTransaction | null
  transactionStatus: TransactionStatus

  // Token state
  supportedTokens: SupportedToken[]
  selectedToken: SupportedToken | null
  tokenBalances: Map<string, string>

  // Error state
  error: string | null

  // Actions
  connect: (walletType: WalletType, force?: boolean) => Promise<void>
  disconnect: () => Promise<void>
  selectToken: (token: SupportedToken) => void
  tip: (
    amount: string,
    recipientAddress: string,
    recipientHandle: string
  ) => Promise<TipTransaction | null>
  clearError: () => void
  resetTransaction: () => void
  refreshBalance: () => Promise<void>
  changeChain: (chainId: number) => Promise<boolean>
}

const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  walletType: null,
  balance: null,
}

// Auto-select token with highest USD value
const selectHighestValueToken = (
  tokens: SupportedToken[],
  balances: Map<string, string>
): SupportedToken | null => {
  if (tokens.length === 0) return null

  // For now, simple heuristic: ETH balance * rough price > others
  // TODO: Add price feed for accurate USD values
  let bestToken = tokens[0]
  let bestValue = 0

  for (const token of tokens) {
    const balance = parseFloat(balances.get(token.symbol) || "0")
    // Rough USD estimates - ETH ~$3000, USDC/USDT = $1
    const price =
      token.symbol === "ETH"
        ? 3000
        : ["USDC", "USDT", "DAI"].includes(token.symbol)
          ? 1
          : 0
    const value = balance * price
    if (value > bestValue) {
      bestValue = value
      bestToken = token
    }
  }
  return bestToken
}

export function usePayment(): UsePaymentReturn {
  // Wallet state
  const [wallet, setWallet] = useState<WalletState>(initialWalletState)
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([])
  const [isConnecting, setIsConnecting] = useState(false)

  // Transaction state
  const [transaction, setTransaction] = useState<TipTransaction | null>(null)
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>("idle")

  // Token state
  const [supportedTokens, setSupportedTokens] = useState<SupportedToken[]>([])
  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(null)
  const [tokenBalances, setTokenBalances] = useState<Map<string, string>>(new Map())

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Ref for cleanup
  const cleanupRef = useRef<(() => void) | null>(null)

  // Initialize - check for existing wallet connection and available wallets
  useEffect(() => {
    const init = async () => {
      // Detect available wallets
      const wallets = getAvailableWallets()
      setAvailableWallets(wallets)

      // Skip session restoration if blocked (during wallet change flow)
      if (isSessionRestorationBlocked()) {
        console.log("TIPZ: Session restoration blocked, skipping init restore")
        return
      }

      // Check if we have a saved session to restore
      const savedSession = loadWalletSession()
      if (savedSession) {
        console.log("TIPZ: Found saved wallet session, attempting to restore...")
        const restoredState = await restoreWalletSession()
        if (restoredState) {
          setWallet(restoredState)
          if (restoredState.chainId) {
            const tokens = await getSupportedTokens(restoredState.chainId)
            setSupportedTokens(tokens)
            if (tokens.length > 0) {
              setSelectedToken(tokens[0])
            }
          }
          return // Successfully restored, done
        }
        // Session restore failed - session was already cleared by restoreWalletSession()
        // User will need to manually connect, so just leave wallet disconnected
        console.log("TIPZ: Session restore failed, user will need to reconnect")
        return
      }

      // No saved session - check if already connected via provider (unlikely but possible)
      const state = await getWalletState()
      if (state.isConnected) {
        setWallet(state)
        if (state.chainId) {
          const tokens = await getSupportedTokens(state.chainId)
          setSupportedTokens(tokens)
          if (tokens.length > 0) {
            setSelectedToken(tokens[0])
          }
        }
      }
      // If not connected, that's fine - user will connect when they want to tip
    }

    init()

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  // Set up wallet event listeners when connected
  useEffect(() => {
    if (!wallet.isConnected) {
      return
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        // Clear old session FIRST before getting new state
        clearWalletSession()
        const state = await getWalletState()
        setWallet(state)
      } else {
        // Wallet disconnected - clear session
        clearWalletSession()
        setWallet(initialWalletState)
        setSelectedToken(null)
        setSupportedTokens([])
      }
    }

    const handleChainChanged = async (chainId: number) => {
      const state = await getWalletState()
      setWallet({ ...state, chainId })

      // Load tokens for new chain
      const tokens = await getSupportedTokens(chainId)
      setSupportedTokens(tokens)

      // Reset selected token to first available
      if (tokens.length > 0) {
        setSelectedToken(tokens[0])
      } else {
        setSelectedToken(null)
      }
    }

    const handleDisconnect = () => {
      // Clear session FIRST
      clearWalletSession()
      setWallet(initialWalletState)
      setSelectedToken(null)
      setSupportedTokens([])
      setTokenBalances(new Map())
    }

    // Set up listeners
    cleanupRef.current = setupWalletListeners(
      handleAccountsChanged,
      handleChainChanged,
      handleDisconnect
    )

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [wallet.isConnected, wallet.walletType])

  // Load supported tokens when chain changes
  useEffect(() => {
    const loadTokens = async () => {
      if (wallet.chainId) {
        const tokens = await getSupportedTokens(wallet.chainId)
        setSupportedTokens(tokens)
        if (tokens.length > 0 && !selectedToken) {
          setSelectedToken(tokens[0])
        }
      }
    }

    loadTokens()
  }, [wallet.chainId])

  // Load token balances when wallet or tokens change
  useEffect(() => {
    const loadBalances = async () => {
      if (!wallet.isConnected || !wallet.address || supportedTokens.length === 0) {
        return
      }

      const balances = new Map<string, string>()

      for (const token of supportedTokens) {
        try {
          const balance = await getTokenBalance(token.address, wallet.address)
          if (balance) {
            balances.set(token.symbol, balance.amount)
          }
        } catch (err) {
          console.error(`TIPZ: Failed to load balance for ${token.symbol}`, err)
        }
      }

      setTokenBalances(balances)

      // Auto-select token with highest USD value
      const bestToken = selectHighestValueToken(supportedTokens, balances)
      if (bestToken) {
        setSelectedToken(bestToken)
      }
    }

    loadBalances()
  }, [wallet.isConnected, wallet.address, supportedTokens])

  // Connect wallet
  const connect = useCallback(async (walletType: WalletType, force?: boolean) => {
    setIsConnecting(true)
    setError(null)

    // Block session restoration during force connect to prevent race conditions
    if (force) {
      blockSessionRestoration()
    }

    try {
      const state = await connectWallet(walletType, force)
      setWallet(state)

      if (state.chainId) {
        const tokens = await getSupportedTokens(state.chainId)
        setSupportedTokens(tokens)
        if (tokens.length > 0) {
          setSelectedToken(tokens[0])
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect wallet"
      setError(message)
      console.error("TIPZ: Wallet connection error", err)
    } finally {
      // Unblock session restoration after connect completes
      if (force) {
        unblockSessionRestoration()
      }
      setIsConnecting(false)
    }
  }, [])

  // Disconnect wallet
  // IMPORTANT: Clear localStorage FIRST (synchronously) to prevent race conditions,
  // then clear React state and call disconnectWallet() for async cleanup
  const disconnect = useCallback(async () => {
    // Step 1: Clear localStorage FIRST to prevent session restoration race conditions
    clearWalletSession()

    // Step 2: Clear all React state synchronously
    // This ensures the UI reflects disconnected state immediately
    setWallet(initialWalletState)
    setSelectedToken(null)
    setSupportedTokens([])
    setTokenBalances(new Map())
    setTransaction(null)
    setTransactionStatus("idle")

    // Clean up listeners
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    // Step 3: Async cleanup (wallet providers, etc.)
    try {
      await disconnectWallet()
    } catch (err) {
      console.error("TIPZ: Wallet disconnection error", err)
    }
  }, [])

  // Select token
  const selectToken = useCallback((token: SupportedToken) => {
    setSelectedToken(token)
  }, [])

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!wallet.isConnected || !wallet.address) {
      return
    }

    const state = await getWalletState()
    setWallet(state)

    // Reload token balances
    if (supportedTokens.length > 0) {
      const balances = new Map<string, string>()

      for (const token of supportedTokens) {
        try {
          const balance = await getTokenBalance(token.address, wallet.address)
          if (balance) {
            balances.set(token.symbol, balance.amount)
          }
        } catch (err) {
          console.error(`TIPZ: Failed to refresh balance for ${token.symbol}`, err)
        }
      }

      setTokenBalances(balances)
    }
  }, [wallet.isConnected, wallet.address, supportedTokens])

  // Change chain
  const changeChain = useCallback(async (chainId: number): Promise<boolean> => {
    const success = await switchChain(chainId)
    if (success) {
      // Chain change will be handled by the chainChanged event listener
      return true
    }
    setError(`Failed to switch to chain ${chainId}`)
    return false
  }, [])

  // Execute tip
  const tip = useCallback(
    async (
      amount: string,
      recipientAddress: string,
      recipientHandle: string
    ): Promise<TipTransaction | null> => {
      if (!wallet.isConnected) {
        setError("Please connect your wallet first")
        return null
      }

      if (!selectedToken) {
        setError("Please select a token")
        return null
      }

      if (!amount || parseFloat(amount) <= 0) {
        setError("Please enter a valid amount")
        return null
      }

      // Check if user has sufficient balance
      const balance = tokenBalances.get(selectedToken.symbol)
      if (balance && parseFloat(amount) > parseFloat(balance)) {
        setError(`Insufficient ${selectedToken.symbol} balance`)
        return null
      }

      setError(null)
      setTransactionStatus("approving")

      try {
        // Get quote
        console.log("TIPZ: Getting swap quote...")
        const quote = await getSwapQuote(
          selectedToken,
          amount,
          recipientAddress
        )

        console.log("TIPZ: Quote received", quote)

        // Execute swap
        const tx = await executeSwap(quote, recipientAddress, (status) => {
          console.log("TIPZ: Transaction status update", status)
          setTransactionStatus(status)
        })

        // Update transaction with recipient info
        tx.recipientHandle = recipientHandle

        // Save to history
        await saveTransaction(tx)

        setTransaction(tx)

        // Refresh balance after transaction
        await refreshBalance()

        return tx
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Transaction failed"
        setError(message)
        setTransactionStatus("failed")
        console.error("TIPZ: Transaction error", err)
        return null
      }
    },
    [wallet.isConnected, selectedToken, tokenBalances, refreshBalance]
  )

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Reset transaction state
  const resetTransaction = useCallback(() => {
    setTransaction(null)
    setTransactionStatus("idle")
    setError(null)
  }, [])

  return {
    wallet,
    availableWallets,
    isConnecting,
    transaction,
    transactionStatus,
    supportedTokens,
    selectedToken,
    tokenBalances,
    error,
    connect,
    disconnect,
    selectToken,
    tip,
    clearError,
    resetTransaction,
    refreshBalance,
    changeChain,
  }
}
