import { NextRequest, NextResponse } from "next/server"
import {
  getSwapStatus,
  isSwapComplete,
  isSwapSuccessful,
  getStatusMessage,
  type SwapStatus,
} from "@/lib/near-intents"
import { supabase, findCreatorByHandle } from "@/lib/supabase"

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
  try {
    const address = request.nextUrl.searchParams.get("depositAddress")
    const transactionId = request.nextUrl.searchParams.get("transactionId")

    if (!address) {
      return NextResponse.json({ error: "Missing address parameter" }, { status: 400 })
    }

    console.log("[swap/status] Checking status")

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

      // Update tipz table if swap is complete and we have a transactionId
      if (isSwapComplete(status.status) && supabase && transactionId) {
        try {
          const newStatus = isSwapSuccessful(status.status) ? "confirmed" : "failed"

          await supabase.from("tipz").update({ status: newStatus }).eq("id", transactionId)

          console.log("[swap/status] Updated tip:", {
            id: transactionId,
            status: newStatus,
            swapStatus: status.status,
          })
        } catch (dbError) {
          console.error("[swap/status] Failed to update tip:", dbError)
        }
      }

      // Fallback: insert tip if execute missed it (no transactionId means DB insert never happened)
      const creatorAddress = request.nextUrl.searchParams.get("creatorAddress")
      const creatorHandle = request.nextUrl.searchParams.get("creatorHandle")
      if (
        isSwapComplete(status.status) &&
        isSwapSuccessful(status.status) &&
        supabase &&
        !transactionId &&
        (creatorAddress || creatorHandle)
      ) {
        try {
          let creator: { id: string } | null = null

          // Try shielded address lookup first
          if (creatorAddress) {
            const { data } = await supabase
              .from("creators")
              .select("id")
              .eq("shielded_address", creatorAddress)
              .single()
            creator = data
          }

          // Fallback: look up by handle
          if (!creator && creatorHandle) {
            const { data: fallbackCreator } = await findCreatorByHandle(creatorHandle, {
              select: "id",
            })
            creator = fallbackCreator
            if (creator) {
              console.log("[swap/status] Found creator via handle fallback")
            }
          }

          if (creator) {
            const { error: insertError } = await supabase.from("tipz").insert({
              creator_id: creator.id,
              source_platform: "web",
              status: "confirmed",
              data: null,
            })

            if (!insertError) {
              console.log("[swap/status] Fallback tip insert for creator:", creator.id)
            } else {
              console.error("[swap/status] Fallback insert error:", insertError)
            }
          }
        } catch (dbError) {
          console.error("[swap/status] Fallback insert failed:", dbError)
        }
      }

      console.log("[swap/status] Status:", {
        status: status.status,
        complete: isSwapComplete(status.status),
      })

      return NextResponse.json(response)
    } catch (error) {
      console.error("[swap/status] NEAR Intents error:", error)
      return NextResponse.json({ error: "Failed to fetch swap status" }, { status: 500 })
    }
  } catch (error) {
    console.error("[swap/status] Error:", error)
    return NextResponse.json({ error: "Failed to check swap status" }, { status: 500 })
  }
}
