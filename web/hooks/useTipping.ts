"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  getSwapQuote,
  executeTip,
  getSupportedTokens,
  getAllSupportedTokens,
  getTokenBalance,
  type SupportedToken,
  type SwapQuote,
  type TipTransaction,
  type TransactionStatus,
  type TokenBalance,
} from "@/lib/wallet"

export type TippingFlowState =
  | "idle"
  | "expanded"
  | "connecting"
  | "connected"
  | "quoting"
  | "confirming"
  | "awaiting_deposit" // New: Waiting for user to send funds to deposit address
  | "signing"
  | "processing"
  | "delivering" // New: Deposit confirmed, ZEC delivery in progress (honest messaging)
  | "success"
  | "error"
  | "refunded" // New: Swap was refunded

export type SwapStatusType =
  | "PENDING_DEPOSIT"
  | "PROCESSING"
  | "SUCCESS"
  | "REFUNDED"
  | "FAILED"
  | "EXPIRED"

// localStorage keys for fire-and-forget persistence
const PENDING_TIP_KEY = "tipz_pending_tip"
const FAILED_TIP_KEY = "tipz_failed_tip"

interface PendingTip {
  depositAddress: string
  creatorHandle: string
  amount: string
  tokenSymbol: string
  timestamp: number
}

interface FailedTip {
  creatorHandle: string
  amount: string
  reason: string
  timestamp: number
}

interface UseTippingOptions {
  creatorHandle: string
  shieldedAddress: string
  walletAddress: string | null
  chainId: number | null
  isWalletConnected: boolean
}

interface UseTippingReturn {
  flowState: TippingFlowState
  selectedAmount: number | null
  customAmount: string
  selectedToken: SupportedToken | null
  availableTokens: SupportedToken[]
  tokenBalances: Record<string, TokenBalance>
  quote: SwapQuote | null
  transaction: TipTransaction | null
  error: string | null
  zecPrice: number | null
  isQuoteExpired: boolean
  privateMessage: string
  // New: Deposit address fields for real swaps
  depositAddress: string | null
  swapStatus: SwapStatusType | null
  isRealSwap: boolean
  // Fire-and-forget: tip status from previous session
  failedTipNotification: FailedTip | null
  pendingTipNotification: PendingTip | null

  // Actions
  expand: () => void
  collapse: () => void
  setAmount: (amount: number | null, custom?: string) => void
  setToken: (token: SupportedToken | null) => void
  setPrivateMessage: (message: string) => void
  getQuote: () => Promise<void>
  confirmTip: () => Promise<void>
  sendTip: () => Promise<void>
  reset: () => void
  retry: () => void
  dismissFailedTipNotification: () => void
  dismissPendingTipNotification: () => void
}

const PRESET_AMOUNTS = [1, 5, 10, 25]
const STATUS_POLL_INTERVAL = 5000 // 5 seconds

export function useTipping(options: UseTippingOptions): UseTippingReturn {
  const { creatorHandle, shieldedAddress, walletAddress, chainId, isWalletConnected } = options

  // State
  const [flowState, setFlowState] = useState<TippingFlowState>("idle")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(null)
  const [availableTokens, setAvailableTokens] = useState<SupportedToken[]>([])
  const [tokenBalances, setTokenBalances] = useState<Record<string, TokenBalance>>({})
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [transaction, setTransaction] = useState<TipTransaction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zecPrice, setZecPrice] = useState<number | null>(null)
  const [quoteExpiresAt, setQuoteExpiresAt] = useState<number | null>(null)
  const [privateMessage, setPrivateMessageState] = useState("")

  // New: Deposit address and status for real swaps
  const [depositAddress, setDepositAddress] = useState<string | null>(null)
  const [swapStatus, setSwapStatus] = useState<SwapStatusType | null>(null)
  const [isRealSwap, setIsRealSwap] = useState(false)

  // Fire-and-forget: track if we showed optimistic success
  const [shownOptimisticSuccess, setShownOptimisticSuccess] = useState(false)
  const [failedTipNotification, setFailedTipNotification] = useState<FailedTip | null>(null)
  const [pendingTipNotification, setPendingTipNotification] = useState<PendingTip | null>(null)

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const pollingAddressRef = useRef<string | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  // Fire-and-forget: Check for failed tips on mount
  useEffect(() => {
    try {
      const failedTipJson = localStorage.getItem(FAILED_TIP_KEY)
      if (failedTipJson) {
        const failedTip = JSON.parse(failedTipJson) as FailedTip
        // Only show if less than 24 hours old
        if (Date.now() - failedTip.timestamp < 24 * 60 * 60 * 1000) {
          setFailedTipNotification(failedTip)
        } else {
          localStorage.removeItem(FAILED_TIP_KEY)
        }
      }
    } catch (e) {
      console.error("[useTipping] Error reading failed tip:", e)
    }
  }, [])

  // Fire-and-forget: Resume polling for pending tips on mount
  useEffect(() => {
    try {
      const pendingTipJson = localStorage.getItem(PENDING_TIP_KEY)
      if (pendingTipJson) {
        const pendingTip = JSON.parse(pendingTipJson) as PendingTip
        // Only resume if less than 30 minutes old (swaps typically complete within this time)
        if (Date.now() - pendingTip.timestamp < 30 * 60 * 1000) {
          console.log("[useTipping] Resuming polling for pending tip:", pendingTip.depositAddress)
          setDepositAddress(pendingTip.depositAddress)
          setIsRealSwap(true)
          setShownOptimisticSuccess(true)
          // Show pending tip notification to user
          setPendingTipNotification(pendingTip)
          // Start silent background polling
          startBackgroundPolling(pendingTip.depositAddress, pendingTip.creatorHandle, pendingTip.amount)
        } else {
          // Tip too old, clean up
          localStorage.removeItem(PENDING_TIP_KEY)
        }
      }
    } catch (e) {
      console.error("[useTipping] Error reading pending tip:", e)
    }
  }, [])

  // Fetch ZEC price on mount
  useEffect(() => {
    const fetchZecPrice = async () => {
      try {
        const response = await fetch("/api/zec-price")
        const data = await response.json()
        setZecPrice(data.price)
      } catch {
        setZecPrice(40) // Fallback
      }
    }
    fetchZecPrice()
  }, [])

  // Load all supported tokens from all chains (for multi-chain selection)
  useEffect(() => {
    const tokens = getAllSupportedTokens()
    setAvailableTokens(tokens)
    // Auto-select first token on current chain if none selected
    if (tokens.length > 0 && !selectedToken && chainId) {
      const currentChainToken = tokens.find(t => t.chainId === chainId)
      if (currentChainToken) {
        setSelectedToken(currentChainToken)
      }
    }
  }, [chainId])

  // Fetch token balances only for tokens on the current chain
  useEffect(() => {
    if (!walletAddress || !chainId || availableTokens.length === 0) return

    const fetchBalances = async () => {
      const balances: Record<string, TokenBalance> = {}
      // Only fetch balances for tokens on the current chain
      const currentChainTokens = availableTokens.filter(t => t.chainId === chainId)
      for (const token of currentChainTokens) {
        const balance = await getTokenBalance(token.address, walletAddress)
        if (balance) {
          // Use a unique key combining symbol and chainId to differentiate same tokens on different chains
          const tokenKey = `${token.symbol}-${token.chainId}`
          balances[tokenKey] = balance
        }
      }
      setTokenBalances(balances)
    }

    fetchBalances()
  }, [walletAddress, chainId, availableTokens])

  // Check quote expiration
  const isQuoteExpired = quoteExpiresAt ? Date.now() > quoteExpiresAt : false

  /**
   * Poll swap status from the API
   * If shownOptimisticSuccess is true, we don't update UI - just track for notifications
   */
  const pollSwapStatus = useCallback(async (address: string) => {
    try {
      const response = await fetch(`/api/swap/status?depositAddress=${encodeURIComponent(address)}`)
      if (!response.ok) {
        console.error("[useTipping] Status poll failed:", response.status)
        return
      }

      const data = await response.json()

      // Always update swap status for UI feedback
      setSwapStatus(data.status)

      // Handle completion states
      if (data.complete) {
        // Stop polling
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }

        // Clear pending tip from localStorage
        localStorage.removeItem(PENDING_TIP_KEY)

        if (data.success) {
          console.log("[useTipping] Swap completed successfully")
          // Clear pending notification
          setPendingTipNotification(null)
          // Transition from "delivering" to "success" when confirmed
          setFlowState("success")
          if (transaction) {
            setTransaction({
              ...transaction,
              status: "completed",
              completedAt: Date.now(),
            })
          }
        } else if (data.status === "REFUNDED") {
          // Swap was refunded
          if (shownOptimisticSuccess) {
            // User already saw success screen - store failure for next visit
            const failedTip: FailedTip = {
              creatorHandle,
              amount: transaction?.fromAmount || "unknown",
              reason: "refunded",
              timestamp: Date.now(),
            }
            localStorage.setItem(FAILED_TIP_KEY, JSON.stringify(failedTip))
            console.log("[useTipping] Swap refunded after optimistic success, stored notification")
          } else {
            setFlowState("refunded")
            setError(`Swap was refunded. ${data.refundTxHash ? `Tx: ${data.refundTxHash.slice(0, 16)}...` : ""}`)
          }
        } else {
          // Swap failed
          if (shownOptimisticSuccess) {
            // User already saw success screen - store failure for next visit
            const failedTip: FailedTip = {
              creatorHandle,
              amount: transaction?.fromAmount || "unknown",
              reason: "failed",
              timestamp: Date.now(),
            }
            localStorage.setItem(FAILED_TIP_KEY, JSON.stringify(failedTip))
            console.log("[useTipping] Swap failed after optimistic success, stored notification")
          } else {
            setFlowState("error")
            setError(data.errorMessage || "Swap failed. Please try again.")
          }
        }
      }
    } catch (err) {
      console.error("[useTipping] Status poll error:", err)
    }
  }, [transaction, shownOptimisticSuccess, creatorHandle])

  /**
   * Start polling for swap status (updates UI)
   */
  const startStatusPolling = useCallback((address: string) => {
    // Don't start if already polling this address
    if (pollingRef.current && pollingAddressRef.current === address) {
      return
    }

    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingAddressRef.current = address

    // Initial poll
    pollSwapStatus(address)

    // Set up interval
    pollingRef.current = setInterval(() => {
      pollSwapStatus(address)
    }, STATUS_POLL_INTERVAL)
  }, [pollSwapStatus])

  /**
   * Start silent background polling (fire-and-forget mode)
   * Does NOT update UI state - just tracks completion for notifications
   */
  const startBackgroundPolling = useCallback((address: string, handle: string, amount: string) => {
    // Don't start if already polling
    if (pollingRef.current && pollingAddressRef.current === address) {
      return
    }

    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingAddressRef.current = address

    const pollSilently = async () => {
      try {
        const response = await fetch(`/api/swap/status?depositAddress=${encodeURIComponent(address)}`)
        if (!response.ok) {
          console.error("[useTipping] Background poll failed:", response.status)
          return
        }

        const data = await response.json()

        if (data.complete) {
          // Stop polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          pollingAddressRef.current = null

          // Clear pending tip from localStorage and UI
          localStorage.removeItem(PENDING_TIP_KEY)
          setPendingTipNotification(null)

          if (data.success) {
            console.log("[useTipping] Background swap completed successfully")
            // Could trigger browser notification here if permission granted
          } else {
            // Swap failed/refunded - store for notification banner
            const failedTip: FailedTip = {
              creatorHandle: handle,
              amount,
              reason: data.status === "REFUNDED" ? "refunded" : "failed",
              timestamp: Date.now(),
            }
            localStorage.setItem(FAILED_TIP_KEY, JSON.stringify(failedTip))
            setFailedTipNotification(failedTip)
            console.log("[useTipping] Background swap failed, stored for notification")
          }
        }
      } catch (err) {
        console.error("[useTipping] Background poll error:", err)
      }
    }

    // Initial poll
    pollSilently()

    // Set up interval
    pollingRef.current = setInterval(pollSilently, STATUS_POLL_INTERVAL)
  }, [])

  // Actions
  const expand = useCallback(() => {
    setFlowState("expanded")
  }, [])

  const collapse = useCallback(() => {
    setFlowState("idle")
    setError(null)
  }, [])

  const setAmount = useCallback((amount: number | null, custom?: string) => {
    setSelectedAmount(amount)
    setCustomAmount(custom || "")
    setQuote(null) // Reset quote when amount changes
    setQuoteExpiresAt(null)
    setDepositAddress(null)
    setSwapStatus(null)
  }, [])

  const setToken = useCallback((token: SupportedToken | null) => {
    setSelectedToken(token)
    setQuote(null) // Reset quote when token changes
    setQuoteExpiresAt(null)
    setDepositAddress(null)
    setSwapStatus(null)
  }, [])

  const setPrivateMessage = useCallback((message: string) => {
    setPrivateMessageState(message)
  }, [])

  const getQuote = useCallback(async () => {
    if (!selectedToken) {
      setError("Please select a token")
      return
    }

    const amount = selectedAmount || parseFloat(customAmount)
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setFlowState("quoting")
    setError(null)

    try {
      // Calculate token amount from USD
      // For simplicity, assume stablecoins are 1:1 USD
      // For ETH/MATIC, we'd need to fetch price
      let tokenAmount: string
      if (selectedToken.symbol === "USDC" || selectedToken.symbol === "USDT" || selectedToken.symbol === "DAI") {
        tokenAmount = amount.toString()
      } else {
        // Fetch price for native token with fallback
        let price: number
        try {
          const coinId = selectedToken.symbol === "ETH" ? "ethereum" : selectedToken.symbol === "SOL" ? "solana" : "matic-network"
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
          )
          if (!response.ok) throw new Error("CoinGecko API error")
          const data = await response.json()
          price = data.ethereum?.usd || data.solana?.usd || data["matic-network"]?.usd || 3000
        } catch {
          // Use fallback prices if CoinGecko is unavailable
          const fallbackPrices: Record<string, number> = { ETH: 3200, SOL: 200, MATIC: 0.85 }
          price = fallbackPrices[selectedToken.symbol] || 100
          console.warn("[useTipping] Using fallback price for", selectedToken.symbol)
        }
        tokenAmount = (amount / price).toFixed(8)
      }

      const newQuote = await getSwapQuote(selectedToken, tokenAmount, shieldedAddress, walletAddress || undefined)
      setQuote(newQuote)
      setQuoteExpiresAt(newQuote.expiresAt)

      // Check if this is a real swap (has deposit address)
      const quoteData = newQuote as any
      if (quoteData.depositAddress) {
        setDepositAddress(quoteData.depositAddress)
        setIsRealSwap(true)
      } else {
        setIsRealSwap(false)
      }

      setFlowState("confirming")
    } catch (err: any) {
      setError(err.message || "Failed to get quote")
      setFlowState("expanded")
    }
  }, [selectedToken, selectedAmount, customAmount, shieldedAddress, walletAddress])

  const confirmTip = useCallback(async () => {
    if (!quote) {
      setError("No quote available")
      return
    }

    if (isQuoteExpired) {
      setError("Quote expired. Getting new quote...")
      await getQuote()
      return
    }

    setFlowState("signing")
    setError(null)

    try {
      const tx = await executeTip(
        quote,
        creatorHandle,
        shieldedAddress,
        (status: TransactionStatus) => {
          if (status === "swapping" || status === "routing" || status === "confirming") {
            setFlowState("processing")
          }
        }
      )

      // Add USD amount and network fee to transaction for receipt display
      const usdAmt = selectedAmount || (customAmount ? parseFloat(customAmount) : 0)
      tx.usdAmount = usdAmt
      tx.networkFee = quote?.fees?.network

      setTransaction(tx)

      // Check if we need to start polling for real swaps
      const txData = tx as any
      if (isRealSwap && (depositAddress || txData.depositAddress)) {
        const pollAddress = depositAddress || txData.depositAddress
        setDepositAddress(pollAddress)

        // Honest messaging: Show "delivering" state, not "success"
        // ZEC delivery is still in progress - user can close page
        setFlowState("delivering")
        setShownOptimisticSuccess(true)

        // Store pending tip in localStorage for persistence
        const pendingTip: PendingTip = {
          depositAddress: pollAddress,
          creatorHandle,
          amount: tx.fromAmount || selectedAmount?.toString() || customAmount,
          tokenSymbol: selectedToken?.symbol || "UNKNOWN",
          timestamp: Date.now(),
        }
        localStorage.setItem(PENDING_TIP_KEY, JSON.stringify(pendingTip))

        // Continue background polling - will transition to "success" when confirmed
        startStatusPolling(pollAddress)
      } else {
        // Demo mode or immediate swaps - show success directly
        setFlowState("success")
      }
    } catch (err: any) {
      // Handle specific errors
      if (err.message?.includes("rejected") || err.message?.includes("cancelled")) {
        setError("You cancelled the transaction")
      } else if (err.message?.includes("insufficient")) {
        setError("Insufficient balance")
      } else {
        setError(err.message || "Transaction failed")
      }
      setFlowState("error")
    }
  }, [quote, isQuoteExpired, getQuote, creatorHandle, shieldedAddress, isRealSwap, depositAddress, startStatusPolling, selectedAmount, customAmount, selectedToken])

  const reset = useCallback(() => {
    // Stop polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    pollingAddressRef.current = null

    setFlowState("idle")
    setSelectedAmount(null)
    setCustomAmount("")
    setQuote(null)
    setQuoteExpiresAt(null)
    setTransaction(null)
    setError(null)
    setPrivateMessageState("")
    setDepositAddress(null)
    setSwapStatus(null)
    setIsRealSwap(false)
    setShownOptimisticSuccess(false)
  }, [])

  const dismissFailedTipNotification = useCallback(() => {
    setFailedTipNotification(null)
    localStorage.removeItem(FAILED_TIP_KEY)
  }, [])

  const dismissPendingTipNotification = useCallback(() => {
    setPendingTipNotification(null)
    // Don't remove from localStorage - still need to track the tip
    // Just hide the UI notification
  }, [])

  const retry = useCallback(() => {
    // Stop polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    setError(null)
    setDepositAddress(null)
    setSwapStatus(null)
    setFlowState("expanded")
  }, [])

  // Combined action: get quote and immediately confirm (skip confirmation step)
  const sendTip = useCallback(async () => {
    if (!selectedToken) {
      setError("Please select a token")
      return
    }

    const amount = selectedAmount || parseFloat(customAmount)
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setFlowState("quoting")
    setError(null)

    try {
      // Calculate token amount from USD
      let tokenAmount: string
      if (selectedToken.symbol === "USDC" || selectedToken.symbol === "USDT" || selectedToken.symbol === "DAI") {
        tokenAmount = amount.toString()
      } else {
        // Fetch price for native token with fallback
        let price: number
        try {
          const coinId = selectedToken.symbol === "ETH" ? "ethereum" : selectedToken.symbol === "SOL" ? "solana" : "matic-network"
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
          )
          if (!response.ok) throw new Error("CoinGecko API error")
          const data = await response.json()
          price = data.ethereum?.usd || data.solana?.usd || data["matic-network"]?.usd || 3000
        } catch {
          // Use fallback prices if CoinGecko is unavailable
          const fallbackPrices: Record<string, number> = { ETH: 3200, SOL: 200, MATIC: 0.85 }
          price = fallbackPrices[selectedToken.symbol] || 100
          console.warn("[useTipping] Using fallback price for", selectedToken.symbol)
        }
        tokenAmount = (amount / price).toFixed(8)
      }

      const newQuote = await getSwapQuote(selectedToken, tokenAmount, shieldedAddress, walletAddress || undefined)
      setQuote(newQuote)
      setQuoteExpiresAt(newQuote.expiresAt)

      // Check if this is a real swap (has deposit address)
      const quoteData = newQuote as any
      const hasDepositAddress = !!quoteData.depositAddress
      setIsRealSwap(hasDepositAddress)

      if (hasDepositAddress) {
        setDepositAddress(quoteData.depositAddress)
      }

      // Immediately proceed to signing (skip confirmation step)
      setFlowState("signing")

      const tx = await executeTip(
        newQuote,
        creatorHandle,
        shieldedAddress,
        (status: TransactionStatus) => {
          if (status === "swapping" || status === "routing" || status === "confirming") {
            setFlowState("processing")
          }
        }
      )

      // Add USD amount and network fee to transaction for receipt display
      const usdAmt = selectedAmount || (customAmount ? parseFloat(customAmount) : 0)
      tx.usdAmount = usdAmt
      tx.networkFee = newQuote?.fees?.network

      setTransaction(tx)

      // Check if we need to start polling for real swaps
      const txData = tx as any
      if (hasDepositAddress || txData.depositAddress) {
        const pollAddress = quoteData.depositAddress || txData.depositAddress
        setDepositAddress(pollAddress)

        // Honest messaging: Show "delivering" state, not "success"
        // ZEC delivery is still in progress - user can close page
        setFlowState("delivering")
        setShownOptimisticSuccess(true)

        // Store pending tip in localStorage for persistence
        const pendingTip: PendingTip = {
          depositAddress: pollAddress,
          creatorHandle,
          amount: tx.fromAmount || selectedAmount?.toString() || customAmount,
          tokenSymbol: selectedToken?.symbol || "UNKNOWN",
          timestamp: Date.now(),
        }
        localStorage.setItem(PENDING_TIP_KEY, JSON.stringify(pendingTip))

        // Continue background polling - will transition to "success" when confirmed
        startStatusPolling(pollAddress)
      } else {
        // Demo mode or immediate swaps - show success directly
        setFlowState("success")
      }
    } catch (err: any) {
      if (err.message?.includes("rejected") || err.message?.includes("cancelled")) {
        setError("You cancelled the transaction")
      } else if (err.message?.includes("insufficient")) {
        setError("Insufficient balance")
      } else {
        setError(err.message || "Transaction failed")
      }
      setFlowState("error")
    }
  }, [selectedToken, selectedAmount, customAmount, shieldedAddress, walletAddress, creatorHandle, startStatusPolling])

  // Auto-transition to connected state when wallet connects
  useEffect(() => {
    if (flowState === "connecting" && isWalletConnected) {
      setFlowState("connected")
    }
    if (flowState === "expanded" && isWalletConnected) {
      setFlowState("connected")
    }
  }, [isWalletConnected, flowState])

  return {
    flowState,
    selectedAmount,
    customAmount,
    selectedToken,
    availableTokens,
    tokenBalances,
    quote,
    transaction,
    error,
    zecPrice,
    isQuoteExpired,
    privateMessage,
    depositAddress,
    swapStatus,
    isRealSwap,
    failedTipNotification,
    pendingTipNotification,

    expand,
    collapse,
    setAmount,
    setToken,
    setPrivateMessage,
    getQuote,
    confirmTip,
    sendTip,
    reset,
    retry,
    dismissFailedTipNotification,
    dismissPendingTipNotification,
  }
}
