"use client"

import { useState, useCallback, useEffect } from "react"
import {
  getSwapQuote,
  executeTip,
  getSupportedTokens,
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
  | "signing"
  | "processing"
  | "success"
  | "error"

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

  // Actions
  expand: () => void
  collapse: () => void
  setAmount: (amount: number | null, custom?: string) => void
  setToken: (token: SupportedToken) => void
  setPrivateMessage: (message: string) => void
  getQuote: () => Promise<void>
  confirmTip: () => Promise<void>
  sendTip: () => Promise<void>
  reset: () => void
  retry: () => void
}

const PRESET_AMOUNTS = [1, 5, 10, 25]

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

  // Update available tokens when chain changes
  useEffect(() => {
    if (chainId) {
      const tokens = getSupportedTokens(chainId)
      setAvailableTokens(tokens)
      if (tokens.length > 0 && !selectedToken) {
        setSelectedToken(tokens[0])
      }
    }
  }, [chainId])

  // Fetch token balances when wallet is connected
  useEffect(() => {
    if (!walletAddress || !chainId || availableTokens.length === 0) return

    const fetchBalances = async () => {
      const balances: Record<string, TokenBalance> = {}
      for (const token of availableTokens) {
        const balance = await getTokenBalance(token.address, walletAddress)
        if (balance) {
          balances[token.symbol] = balance
        }
      }
      setTokenBalances(balances)
    }

    fetchBalances()
  }, [walletAddress, chainId, availableTokens])

  // Check quote expiration
  const isQuoteExpired = quoteExpiresAt ? Date.now() > quoteExpiresAt : false

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
  }, [])

  const setToken = useCallback((token: SupportedToken) => {
    setSelectedToken(token)
    setQuote(null) // Reset quote when token changes
    setQuoteExpiresAt(null)
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
        // Fetch price for native token
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${selectedToken.symbol === "ETH" ? "ethereum" : "matic-network"}&vs_currencies=usd`
        )
        const data = await response.json()
        const price = data.ethereum?.usd || data["matic-network"]?.usd || 3000
        tokenAmount = (amount / price).toFixed(8)
      }

      const newQuote = await getSwapQuote(selectedToken, tokenAmount, shieldedAddress)
      setQuote(newQuote)
      setQuoteExpiresAt(newQuote.expiresAt)
      setFlowState("confirming")
    } catch (err: any) {
      setError(err.message || "Failed to get quote")
      setFlowState("expanded")
    }
  }, [selectedToken, selectedAmount, customAmount, shieldedAddress])

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

      setTransaction(tx)
      setFlowState("success")
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
  }, [quote, isQuoteExpired, getQuote, creatorHandle, shieldedAddress])

  const reset = useCallback(() => {
    setFlowState("idle")
    setSelectedAmount(null)
    setCustomAmount("")
    setQuote(null)
    setQuoteExpiresAt(null)
    setTransaction(null)
    setError(null)
    setPrivateMessageState("")
  }, [])

  const retry = useCallback(() => {
    setError(null)
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
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${selectedToken.symbol === "ETH" ? "ethereum" : "matic-network"}&vs_currencies=usd`
        )
        const data = await response.json()
        const price = data.ethereum?.usd || data["matic-network"]?.usd || 3000
        tokenAmount = (amount / price).toFixed(8)
      }

      const newQuote = await getSwapQuote(selectedToken, tokenAmount, shieldedAddress)
      setQuote(newQuote)
      setQuoteExpiresAt(newQuote.expiresAt)

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

      setTransaction(tx)
      setFlowState("success")
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
  }, [selectedToken, selectedAmount, customAmount, shieldedAddress, creatorHandle])

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
  }
}
