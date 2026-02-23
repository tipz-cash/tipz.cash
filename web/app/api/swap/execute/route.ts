import { NextRequest, NextResponse } from "next/server"
import {
  generateIntentId as nearGenerateIntentId,
  isValidShieldedAddress as nearValidateAddress,
  estimateCompletionTime,
} from "@/lib/near"
import { submitDeposit } from "@/lib/near-intents"
import { type TipzData, type SourcePlatform } from "@/lib/tipz"
import {
  encryptMessage,
  serializeEncryptedMessage,
  isValidPublicKey,
} from "@/lib/message-encryption"
import { supabase, findCreatorByHandle } from "@/lib/supabase"
import { rateLimit, rateLimitHeaders, getClientIP, RATE_LIMITS } from "@/lib/rate-limit"

/**
 * Swap Execute API
 *
 * Handles cross-chain swap execution from EVM chains to Zcash.
 * - User already has deposit address from /api/swap/quote
 * - User sends funds to deposit address from their wallet
 * - This endpoint logs the transaction and optionally submits the deposit tx hash
 * - Returns status endpoint URL for polling
 *
 * POST /api/swap/execute
 * Request: { fromChain, fromToken, fromAmount, walletAddress, destinationAddress, quote, sourceTxHash?, depositAddress?, creatorId? }
 * Response: { success, txHash, status, intentId, transactionId?, depositAddress?, statusUrl? }
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
  // SECURITY NOTE: creatorId is no longer accepted from request body.
  // We look up the creator by destinationAddress (shielded address) instead.
  // creatorHandle is only used as a fallback lookup if shielded address doesn't match.
  creatorHandle?: string // Fallback identifier for DB lookup
  sourcePlatform?: SourcePlatform // Where the tip originated
  sourceUrl?: string // URL of content being tipped
  memo?: string // Private message to creator (encrypted into tipz.data)
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
  transactionId?: string // Database transaction ID for tracking
  tracked?: boolean // Whether the tip was logged to the database
  estimatedCompletion?: number
  message?: string
  depositAddress?: string
  statusUrl?: string
}

/**
 * Validate wallet address format (EVM or Solana)
 */
function isValidWalletAddress(address: string): boolean {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return true // EVM
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return true // Solana (base58)
  return false
}

/**
 * Validate ZEC shielded address format
 */
function isValidShieldedAddress(address: string): boolean {
  return nearValidateAddress(address)
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers)
  const rateLimitResult = rateLimit(clientIP, RATE_LIMITS.swapExecute)
  const headers = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many swap requests. Please try again later.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(rateLimitResult.retryAfter) },
      }
    )
  }

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
      creatorHandle,
      sourcePlatform,
      sourceUrl,
      memo,
      quote,
    } = body

    // Validate required fields
    if (!fromChain || !fromToken || !fromAmount || !walletAddress || !destinationAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate wallet address
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
    }

    // Validate destination address (should be ZEC shielded)
    if (!isValidShieldedAddress(destinationAddress)) {
      return NextResponse.json(
        { error: "Invalid destination address. Expected ZEC unified address (u1...)" },
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

    // PRODUCTION MODE: Real NEAR Intents swap via deposit address
    console.log("[swap/execute] Handling deposit-based swap")

    // Get deposit address from quote or request
    const depositAddress = quote.depositAddress || requestDepositAddress
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
        console.log("[swap/execute] Deposit tx submitted")
      } catch (error) {
        // Non-fatal - swap will still work, just might take longer
        console.warn("[swap/execute] Failed to submit deposit tx:", error)
      }
    }

    const txHash = sourceTxHash || ""
    const intentId = quote.quoteId || nearGenerateIntentId()
    const estimatedCompletion = Date.now() + estimateCompletionTime("ZEC")
    const status: ExecuteResponse["status"] = sourceTxHash ? "pending" : "pending_deposit"
    const statusUrl = `/api/swap/status?address=${encodeURIComponent(depositAddress)}`

    console.log("[swap/execute] Swap initiated:", {
      amount: `${quote.toAmount} ZEC`,
      status,
    })

    // Log tip to database if configured
    // SECURITY: Look up creator by shielded address instead of accepting creatorId from request
    // This prevents transaction misattribution attacks
    let transactionId: string | undefined
    if (supabase) {
      try {
        // Look up creator by their shielded address (include public_key for encryption)
        console.log("[swap/execute] DB lookup — looking up creator")

        const { data: addressCreator, error: creatorError } = await supabase
          .from("creators")
          .select("id, public_key")
          .eq("shielded_address", destinationAddress)
          .single()

        console.log(
          "[swap/execute] Primary lookup (shielded_address):",
          addressCreator
            ? `FOUND id=${addressCreator.id}`
            : `NOT FOUND error=${creatorError?.message}`
        )

        let creator = addressCreator

        if ((creatorError || !creator) && creatorHandle) {
          // Fallback: look up by handle when shielded_address doesn't match
          console.log("[swap/execute] Attempting handle fallback")
          const { data: fallbackCreator, error: fallbackError } = await findCreatorByHandle(
            creatorHandle,
            {
              select: "id, public_key",
            }
          )
          if (fallbackCreator) {
            creator = fallbackCreator
            console.log("[swap/execute] Handle fallback FOUND id=", fallbackCreator.id)
          } else {
            console.log("[swap/execute] Handle fallback FAILED error=", fallbackError?.message)
          }
        }

        if (!creator) {
          console.log("[swap/execute] Creator NOT FOUND — tip will NOT be tracked")
          // Continue without logging - swap still works, just not tracked
        } else {
          // Encrypt tip data with creator's public key
          let encryptedData: string | null = null
          if (creator.public_key && isValidPublicKey(creator.public_key)) {
            const tipzData: TipzData = {
              amount_zec: parseFloat(quote.toAmount),
              amount_usd: parseFloat(fromAmount) * parseFloat(quote.exchangeRate),
              memo: memo || undefined,
            }
            const encrypted = await encryptMessage(
              JSON.stringify(tipzData),
              creator.public_key as JsonWebKey
            )
            encryptedData = serializeEncryptedMessage(encrypted)
          }

          const { data: tip, error: tipError } = await supabase
            .from("tipz")
            .insert({
              creator_id: creator.id,
              source_platform: sourcePlatform || "web",
              status: "pending",
              data: encryptedData,
            })
            .select("id")
            .single()

          if (tipError) {
            console.error("[swap/execute] INSERT FAILED:", {
              error: tipError.message,
              code: tipError.code,
              details: tipError.details,
              hint: tipError.hint,
            })
          } else {
            transactionId = tip.id
            console.log("[swap/execute] INSERT SUCCESS:", {
              transactionId,
              creatorId: creator.id,
              encrypted: !!encryptedData,
              sourcePlatform: sourcePlatform || "web",
            })
          }
        }
      } catch (dbError) {
        // Log error but don't fail the request - the swap was successful
        console.error("[swap/execute] Failed to log tip:", dbError)
      }
    }

    const response: ExecuteResponse = {
      success: true,
      txHash,
      status,
      intentId,
      transactionId,
      tracked: !!transactionId,
      estimatedCompletion,
      depositAddress,
      statusUrl,
      message:
        status === "pending_deposit"
          ? `Send funds to deposit address to complete swap`
          : "Swap initiated via NEAR Intents",
    }

    console.log("[swap/execute] Execution complete:", {
      from: `${fromAmount} ${fromToken === "0x0000000000000000000000000000000000000000" ? "ETH" : "token"}`,
      to: `${quote?.toAmount || "?"} ZEC`,
      intentId,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[swap/execute] Error:", error)
    return NextResponse.json({ error: "Failed to execute swap" }, { status: 500 })
  }
}
