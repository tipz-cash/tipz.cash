import { NextRequest, NextResponse } from "next/server"
import {
  getSwapStatus,
  isSwapComplete,
  isSwapSuccessful,
  getStatusMessage,
  type SwapStatus,
} from "@/lib/near-intents"
import { supabase } from "@/lib/supabase"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIP,
  RATE_LIMITS
} from "@/lib/rate-limit"

/**
 * Swap Status API
 *
 * Polls the status of a swap by deposit address.
 * Queries NEAR Intents for actual swap status.
 * Returns current status: PENDING_DEPOSIT, PROCESSING, SUCCESS, REFUNDED, FAILED
 * Updates transaction in database when completed.
 *
 * GET /api/swap/status?address={depositAddress}
 * Response: { status, depositAddress, sourceTxHash?, destinationTxHash?, message, complete }
 */

interface StatusResponse {
  status: SwapStatus
  depositAddress: string
  sourceTxHash?: string
  destinationTxHash?: string
  depositAmount?: string
  destinationAmount?: string
  message: string
  complete: boolean
  success: boolean
  errorMessage?: string
  refundTxHash?: string
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers)
  const rateLimitResult = rateLimit(clientIP, RATE_LIMITS.swapStatus)
  const headers = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many status requests. Please try again later.",
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(rateLimitResult.retryAfter) }
      }
    )
  }

  try {
    const address = request.nextUrl.searchParams.get("depositAddress")

    if (!address) {
      return NextResponse.json(
        { error: "Missing address parameter" },
        { status: 400 }
      )
    }

    console.log("[swap/status] Checking status for:", address.slice(0, 12) + "...")

    try {
      const status = await getSwapStatus(address)

      const response: StatusResponse = {
        status: status.status,
        depositAddress: status.depositAddress,
        sourceTxHash: status.sourceTxHash,
        destinationTxHash: status.destinationTxHash,
        depositAmount: status.depositAmount,
        destinationAmount: status.destinationAmount,
        message: getStatusMessage(status.status),
        complete: isSwapComplete(status.status),
        success: isSwapSuccessful(status.status),
        errorMessage: status.errorMessage,
        refundTxHash: status.refundTxHash,
      }

      // Update database if swap is complete
      if (isSwapComplete(status.status) && supabase) {
        try {
          // Find transaction by deposit address in metadata
          const { data: transactions } = await supabase
            .from("transactions")
            .select("id, metadata")
            .filter("metadata->depositAddress", "eq", address)
            .limit(1)

          if (transactions && transactions.length > 0) {
            const tx = transactions[0]
            const newStatus = isSwapSuccessful(status.status) ? "confirmed" : "failed"

            await supabase
              .from("transactions")
              .update({
                status: newStatus,
                tx_hash: status.destinationTxHash || tx.metadata?.sourceTxHash,
                confirmed_at: newStatus === "confirmed" ? new Date().toISOString() : null,
                metadata: {
                  ...tx.metadata,
                  swapStatus: status.status,
                  destinationTxHash: status.destinationTxHash,
                  refundTxHash: status.refundTxHash,
                  errorMessage: status.errorMessage,
                },
              })
              .eq("id", tx.id)

            console.log("[swap/status] Updated transaction:", {
              id: tx.id,
              status: newStatus,
              swapStatus: status.status,
            })
          }
        } catch (dbError) {
          console.error("[swap/status] Failed to update transaction:", dbError)
        }
      }

      console.log("[swap/status] Status:", {
        address: address.slice(0, 12) + "...",
        status: status.status,
        complete: isSwapComplete(status.status),
      })

      return NextResponse.json(response)
    } catch (error) {
      console.error("[swap/status] NEAR Intents error:", error)
      return NextResponse.json(
        { error: "Failed to fetch swap status" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[swap/status] Error:", error)
    return NextResponse.json(
      { error: "Failed to check swap status" },
      { status: 500 }
    )
  }
}
