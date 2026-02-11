import { NextRequest, NextResponse } from "next/server"
import {
  isNearConfigured,
  getNearConfig,
  isValidShieldedAddress,
  isValidDestinationChain,
  createNearIntent,
  queryNearIntent,
  parseNearError,
  type CreateIntentRequest,
} from "@/lib/near"

/**
 * NEAR Intents API
 *
 * Creates privacy-preserving intents for cross-chain transactions.
 *
 * POST /api/intents/create
 * Request: { amount, destinationAddress, destinationChain }
 * Response: { intentId, status: "pending" }
 */

interface IntentRequest {
  amount: string
  destinationAddress: string
  destinationChain: string
  metadata?: {
    sourceTxHash?: string
    sourceChain?: number
    senderAddress?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: IntentRequest = await request.json()
    const { amount, destinationAddress, destinationChain, metadata } = body

    // Validate required fields
    if (!amount || !destinationAddress || !destinationChain) {
      return NextResponse.json(
        {
          error: "Missing required fields: amount, destinationAddress, destinationChain",
        },
        { status: 400 }
      )
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      )
    }

    // Validate destination chain
    if (!isValidDestinationChain(destinationChain)) {
      return NextResponse.json(
        {
          error: `Unsupported destination chain: ${destinationChain}. Supported: ZEC`,
        },
        { status: 400 }
      )
    }

    // Validate shielded address
    if (!isValidShieldedAddress(destinationAddress)) {
      return NextResponse.json(
        {
          error: "Invalid ZEC shielded address. Must be a unified address starting with 'u1'.",
        },
        { status: 400 }
      )
    }

    if (!isNearConfigured()) {
      return NextResponse.json(
        { error: "NEAR is not configured. Set NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY." },
        { status: 503 }
      )
    }

    // Create real NEAR Intent
    try {
      console.log("[intents/create] Creating NEAR intent")

      const intentRequest: CreateIntentRequest = {
        amount,
        sourceChain: metadata?.sourceChain || 1, // Default to Ethereum
        sourceToken: "native",
        sourceTxHash: metadata?.sourceTxHash,
        senderAddress: metadata?.senderAddress,
        destinationChain,
        destinationAddress,
      }

      const intentResult = await createNearIntent(intentRequest)

      console.log("[intents/create] NEAR intent created:", {
        intentId: intentResult.intentId,
        amount: `${amount} ZEC`,
        destination: destinationAddress.slice(0, 12) + "...",
        nearTxHash: intentResult.nearTxHash?.slice(0, 16),
        estimatedMinutes: Math.round(
          (intentResult.estimatedCompletion - Date.now()) / 60000
        ),
      })

      return NextResponse.json(intentResult)
    } catch (nearError) {
      console.error("[intents/create] NEAR error:", nearError)

      // Parse the error and return a helpful message
      const errorMessage = parseNearError(nearError)
      return NextResponse.json(
        { error: errorMessage, nearError: true },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[intents/create] Error:", error)
    return NextResponse.json(
      { error: "Failed to create intent" },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check intent status
 * Queries the NEAR chain for intent state
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const intentId = searchParams.get("intentId")

  if (!intentId) {
    return NextResponse.json(
      { error: "Missing intentId parameter" },
      { status: 400 }
    )
  }

  if (!isNearConfigured()) {
    return NextResponse.json(
      { error: "NEAR is not configured" },
      { status: 503 }
    )
  }

  try {
    console.log("[intents/status] Querying NEAR intent")

    const intentStatus = await queryNearIntent(intentId)

    console.log("[intents/status] NEAR intent status:", {
      intentId,
      status: intentStatus.status,
      solver: intentStatus.solver,
    })

    return NextResponse.json(intentStatus)
  } catch (nearError) {
    console.error("[intents/status] NEAR error:", nearError)
    const errorMessage = parseNearError(nearError)
    return NextResponse.json(
      { error: errorMessage, nearError: true },
      { status: 500 }
    )
  }
}
