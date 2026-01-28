import { NextRequest, NextResponse } from "next/server"
import {
  generateIntentId as nearGenerateIntentId,
  isValidShieldedAddress as nearValidateAddress,
  estimateCompletionTime,
} from "@/lib/near"
import {
  isRealSwapsEnabled,
  submitDeposit,
} from "@/lib/near-intents"
import {
  logTransaction,
  type TransactionSource,
} from "@/lib/transactions"
import { supabase } from "@/lib/supabase"

/**
 * Swap Execute API
 *
 * Handles cross-chain swap execution from EVM chains to Zcash.
 *
 * For REAL SWAPS (ENABLE_REAL_SWAPS=true):
 *   - User already has deposit address from /api/swap/quote
 *   - User sends funds to deposit address from their wallet
 *   - This endpoint logs the transaction and optionally submits the deposit tx hash
 *   - Returns status endpoint URL for polling
 *
 * For DEMO MODE:
 *   - Simulates execution with mock responses
 *   - No real funds transferred
 *
 * POST /api/swap/execute
 * Request: { fromChain, fromToken, fromAmount, walletAddress, destinationAddress, quote, sourceTxHash?, depositAddress?, creatorId? }
 * Response: { success, txHash, status, intentId, demo, transactionId?, depositAddress?, statusUrl? }
 */

interface ExecuteRequest {
  fromChain: number
  fromToken: string
  fromAmount: string
  toChain: string
  toToken: string
  walletAddress: string
  destinationAddress: string
  sourceTxHash?: string // The tx hash from user's wallet transaction (deposit to deposit address)
  depositAddress?: string // The deposit address from the quote (for real swaps)
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
    quoteId?: string
    depositAddress?: string
  }
}

interface ExecuteResponse {
  success: boolean
  txHash: string
  status: "pending" | "pending_deposit" | "confirmed" | "failed"
  intentId: string
  demo: boolean
  transactionId?: string // Database transaction ID for tracking
  estimatedCompletion?: number
  message?: string
  // Real swap fields
  depositAddress?: string
  statusUrl?: string
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
      depositAddress: requestDepositAddress,
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

    // Determine mode
    // For NEAR Intents 1Click API, we only need ENABLE_REAL_SWAPS=true
    // (no NEAR account credentials required - uses deposit addresses)
    const useRealSwaps = isRealSwapsEnabled()

    let txHash: string
    let intentId: string
    let estimatedCompletion: number
    let transactionId: string | undefined
    let status: ExecuteResponse["status"]
    let depositAddress: string | undefined
    let statusUrl: string | undefined

    if (useRealSwaps) {
      // PRODUCTION MODE: Real NEAR Intents swap via deposit address
      console.log("[swap/execute] Production mode - handling deposit-based swap")

      // Get deposit address from quote or request
      depositAddress = quote.depositAddress || requestDepositAddress
      if (!depositAddress) {
        return NextResponse.json(
          { error: "Missing deposit address. Please get a new quote." },
          { status: 400 }
        )
      }

      // If user provided a tx hash, submit it to speed up processing
      if (sourceTxHash) {
        try {
          await submitDeposit(depositAddress, sourceTxHash)
          console.log("[swap/execute] Deposit tx submitted:", {
            depositAddress,
            txHash: sourceTxHash.slice(0, 16) + "...",
          })
        } catch (error) {
          // Non-fatal - swap will still work, just might take longer
          console.warn("[swap/execute] Failed to submit deposit tx:", error)
        }
      }

      txHash = sourceTxHash || ""
      intentId = quote.quoteId || nearGenerateIntentId()
      estimatedCompletion = Date.now() + estimateCompletionTime("ZEC")
      status = sourceTxHash ? "pending" : "pending_deposit"
      statusUrl = `/api/swap/status?address=${encodeURIComponent(depositAddress)}`

      console.log("[swap/execute] Real swap initiated:", {
        depositAddress,
        amount: `${quote.toAmount} ZEC`,
        destination: destinationAddress.slice(0, 12) + "...",
        status,
      })
    } else {
      // DEMO MODE: Simulate execution
      console.log("[swap/execute] Demo mode - simulating execution")

      // Simulate processing delay (1-2 seconds)
      const processingDelay = 1000 + Math.floor(Math.random() * 1000)
      await new Promise(resolve => setTimeout(resolve, processingDelay))

      txHash = sourceTxHash || generateMockTxHash()
      intentId = nearGenerateIntentId()
      estimatedCompletion = Date.now() + estimateCompletionTime("ZEC")
      status = "pending"
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
            demo: !useRealSwaps,
            depositAddress: depositAddress,
            swapStatus: status,
          },
        })

        transactionId = transaction.id
        console.log("[swap/execute] Transaction logged:", {
          transactionId,
          creatorId,
          amountZec: quote.toAmount,
          depositAddress,
        })
      } catch (dbError) {
        // Log error but don't fail the request - the swap was successful
        console.error("[swap/execute] Failed to log transaction:", dbError)
      }
    }

    const response: ExecuteResponse = {
      success: true,
      txHash,
      status,
      intentId,
      demo: !useRealSwaps,
      transactionId,
      estimatedCompletion,
      depositAddress,
      statusUrl,
      message: useRealSwaps
        ? status === "pending_deposit"
          ? `Send funds to deposit address to complete swap`
          : "Swap initiated via NEAR Intents"
        : "Demo transaction - no real funds transferred",
    }

    console.log("[swap/execute] Execution complete:", {
      from: `${fromAmount} ${fromToken === "0x0000000000000000000000000000000000000000" ? "ETH" : "token"}`,
      to: `${quote?.toAmount || "?"} ZEC`,
      wallet: walletAddress.slice(0, 10) + "...",
      destination: destinationAddress.slice(0, 10) + "...",
      intentId,
      demo: !useRealSwaps,
      depositAddress,
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
