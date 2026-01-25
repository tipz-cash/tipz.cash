import { NextRequest, NextResponse } from "next/server"
import {
  isDemoMode,
  isNearConfigured,
  generateIntentId as nearGenerateIntentId,
  isValidShieldedAddress as nearValidateAddress,
  createNearIntent,
  parseNearError,
  estimateCompletionTime,
  type CreateIntentRequest,
} from "@/lib/near"
import {
  logTransaction,
  type TransactionSource,
} from "@/lib/transactions"
import { supabase } from "@/lib/supabase"

/**
 * Swap Execute API
 *
 * Executes cross-chain swaps from EVM chains to Zcash.
 * Supports both demo mode (mock responses) and production mode (real NEAR Intents).
 *
 * Flow:
 * 1. User sends ETH/tokens from wallet (handled client-side)
 * 2. Client calls this API with source tx hash
 * 3. API creates NEAR Intent for cross-chain routing
 * 4. Transaction is logged to database
 * 5. Returns intent ID for tracking
 *
 * POST /api/swap/execute
 * Request: { fromChain, fromToken, fromAmount, walletAddress, destinationAddress, quote, sourceTxHash?, creatorId? }
 * Response: { txHash, status: "pending", intentId, demo }
 */

interface ExecuteRequest {
  fromChain: number
  fromToken: string
  fromAmount: string
  toChain: string
  toToken: string
  walletAddress: string
  destinationAddress: string
  sourceTxHash?: string // The tx hash from user's wallet transaction
  creatorId?: string // Optional creator ID for logging
  sourcePlatform?: TransactionSource // Where the tip originated
  sourceUrl?: string // URL of content being tipped
  quote: {
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
}

interface ExecuteResponse {
  success: boolean
  txHash: string
  status: "pending" | "confirmed" | "failed"
  intentId: string
  demo: boolean
  transactionId?: string // Database transaction ID for tracking
  estimatedCompletion?: number
  message?: string
}

/**
 * Generate a realistic-looking Ethereum transaction hash (for demo mode)
 */
function generateMockTxHash(): string {
  const chars = "0123456789abcdef"
  let hash = "0x"
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

/**
 * Validate Ethereum address format
 */
function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate ZEC shielded address format
 */
function isValidShieldedAddress(address: string): boolean {
  return nearValidateAddress(address)
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json()
    const {
      fromChain,
      fromToken,
      fromAmount,
      walletAddress,
      destinationAddress,
      sourceTxHash,
      creatorId,
      sourcePlatform,
      sourceUrl,
      quote,
    } = body

    // Validate required fields
    if (!fromChain || !fromToken || !fromAmount || !walletAddress || !destinationAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate wallet address
    if (!isValidEthAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      )
    }

    // Validate destination address (should be ZEC shielded)
    if (!isValidShieldedAddress(destinationAddress)) {
      return NextResponse.json(
        { error: "Invalid destination address. Expected ZEC shielded address (zs1... or u1...)" },
        { status: 400 }
      )
    }

    // Check quote expiry
    if (quote?.expiresAt && quote.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: "Quote has expired. Please get a new quote." },
        { status: 400 }
      )
    }

    // Check if running in demo mode
    const demoMode = isDemoMode()
    const nearConfigured = isNearConfigured()

    let txHash: string
    let intentId: string
    let estimatedCompletion: number
    let transactionId: string | undefined

    if (!demoMode && nearConfigured) {
      // PRODUCTION MODE: Create real NEAR Intent
      console.log("[swap/execute] Production mode - creating NEAR intent")

      try {
        const intentRequest: CreateIntentRequest = {
          amount: quote.toAmount,
          sourceChain: fromChain,
          sourceToken: fromToken,
          sourceTxHash: sourceTxHash,
          senderAddress: walletAddress,
          destinationChain: "ZEC",
          destinationAddress,
        }

        const intentResult = await createNearIntent(intentRequest)

        intentId = intentResult.intentId
        txHash = sourceTxHash || intentResult.nearTxHash || ""
        estimatedCompletion = intentResult.estimatedCompletion

        console.log("[swap/execute] NEAR intent created:", {
          intentId,
          amount: `${quote.toAmount} ZEC`,
          destination: destinationAddress.slice(0, 12) + "...",
          sourceTx: sourceTxHash?.slice(0, 16),
        })
      } catch (nearError) {
        console.error("[swap/execute] NEAR error:", nearError)
        const errorMessage = parseNearError(nearError)
        return NextResponse.json(
          { error: errorMessage, nearError: true },
          { status: 500 }
        )
      }
    } else {
      // DEMO MODE: Simulate execution
      console.log("[swap/execute] Demo mode - simulating execution")

      // Simulate processing delay (1-2 seconds)
      const processingDelay = 1000 + Math.floor(Math.random() * 1000)
      await new Promise(resolve => setTimeout(resolve, processingDelay))

      txHash = sourceTxHash || generateMockTxHash()
      intentId = nearGenerateIntentId()
      estimatedCompletion = Date.now() + estimateCompletionTime("ZEC")
    }

    // Log transaction to database if configured
    if (supabase && creatorId) {
      try {
        const transaction = await logTransaction({
          creatorId,
          senderAddress: walletAddress,
          recipientAddress: destinationAddress,
          amountZec: parseFloat(quote.toAmount),
          amountUsd: parseFloat(fromAmount) * parseFloat(quote.exchangeRate),
          txHash: txHash || undefined,
          sourcePlatform: sourcePlatform || "web",
          sourceUrl,
          metadata: {
            intentId,
            fromChain,
            fromToken,
            fromAmount,
            exchangeRate: parseFloat(quote.exchangeRate),
            route: quote.route,
            demo: demoMode,
          },
        })

        transactionId = transaction.id
        console.log("[swap/execute] Transaction logged:", {
          transactionId,
          creatorId,
          amountZec: quote.toAmount,
        })
      } catch (dbError) {
        // Log error but don't fail the request - the swap was successful
        console.error("[swap/execute] Failed to log transaction:", dbError)
      }
    }

    const response: ExecuteResponse = {
      success: true,
      txHash,
      status: "pending",
      intentId,
      demo: demoMode,
      transactionId,
      estimatedCompletion,
      message: demoMode
        ? "Demo transaction - no real funds transferred"
        : "Swap initiated via NEAR Intents",
    }

    console.log("[swap/execute] Execution complete:", {
      from: `${fromAmount} ${fromToken === "0x0000000000000000000000000000000000000000" ? "ETH" : "token"}`,
      to: `${quote?.toAmount || "?"} ZEC`,
      wallet: walletAddress.slice(0, 10) + "...",
      destination: destinationAddress.slice(0, 10) + "...",
      intentId,
      demo: demoMode,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[swap/execute] Error:", error)
    return NextResponse.json(
      { error: "Failed to execute swap" },
      { status: 500 }
    )
  }
}
