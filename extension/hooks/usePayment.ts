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
  connect: (walletType: WalletType) => Promise<void>
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

      // Check if already connected
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
        const state = await getWalletState()
        setWallet(state)
      } else {
        // Wallet disconnected
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
    }

    loadBalances()
  }, [wallet.isConnected, wallet.address, supportedTokens])

  // Connect wallet
  const connect = useCallback(async (walletType: WalletType) => {
    setIsConnecting(true)
    setError(null)

    try {
      const state = await connectWallet(walletType)
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
      setIsConnecting(false)
    }
  }, [])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet()
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
