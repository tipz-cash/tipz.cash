/**
 * React hook for managing payment state
 */

import { useState, useCallback, useEffect } from "react"
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
  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(
    null
  )

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Initialize - check for existing wallet connection and available wallets
  useEffect(() => {
    const init = async () => {
      const wallets = getAvailableWallets()
      setAvailableWallets(wallets)

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
  }, [])

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
      setTransaction(null)
      setTransactionStatus("idle")
    } catch (err) {
      console.error("TIPZ: Wallet disconnection error", err)
    }
  }, [])

  // Select token
  const selectToken = useCallback((token: SupportedToken) => {
    setSelectedToken(token)
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

      setError(null)
      setTransactionStatus("approving")

      try {
        // Get quote
        const quote = await getSwapQuote(
          selectedToken,
          amount,
          recipientAddress
        )

        // Execute swap
        const tx = await executeSwap(quote, recipientAddress, (status) => {
          setTransactionStatus(status)
        })

        // Update transaction with recipient info
        tx.recipientHandle = recipientHandle

        // Save to history
        await saveTransaction(tx)

        setTransaction(tx)
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
    [wallet.isConnected, selectedToken]
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
    error,
    connect,
    disconnect,
    selectToken,
    tip,
    clearError,
    resetTransaction,
  }
}
