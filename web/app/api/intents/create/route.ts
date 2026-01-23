import { NextRequest, NextResponse } from "next/server"
import {
  isDemoMode,
  isNearConfigured,
  getNearConfig,
  generateIntentId,
  isValidShieldedAddress,
  isValidDestinationChain,
  estimateCompletionTime,
  createNearIntent,
  queryNearIntent,
  parseNearError,
  type IntentResponse,
  type CreateIntentRequest,
} from "@/lib/near"

/**
 * NEAR Intents API
 *
 * Creates privacy-preserving intents for cross-chain transactions.
 * Supports both demo mode (mock responses) and production mode (real NEAR).
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
          error: "Invalid ZEC shielded address. Must start with 'zs1' (78 chars) or 'u1' (unified address).",
        },
        { status: 400 }
      )
    }

    // Check if running in demo mode or production
    const demoMode = isDemoMode()
    const nearConfigured = isNearConfigured()

    if (!demoMode && nearConfigured) {
      // PRODUCTION MODE: Create real NEAR Intent
      try {
        console.log("[intents/create] Production mode - creating NEAR intent")

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
    }

    // DEMO MODE: Simulate NEAR Intents processing
    const processingDelay = 1000 + Math.floor(Math.random() * 1000)
    await new Promise(resolve => setTimeout(resolve, processingDelay))

    // Generate intent ID
    const intentId = generateIntentId()

    // Estimated completion time
    const estimatedCompletion = Date.now() + estimateCompletionTime(destinationChain)

    const nearConfig = getNearConfig()
    const response: IntentResponse = {
      success: true,
      intentId,
      status: "pending",
      destinationChain: "ZEC",
      estimatedCompletion,
      nearContract: nearConfig.networkId === "mainnet" ? "intents.near" : "intents.testnet",
      demo: demoMode,
      message: demoMode
        ? "Demo intent created - no real funds routed through NEAR"
        : "Intent created on NEAR",
    }

    console.log("[intents/create] Demo intent created:", {
      intentId,
      amount: `${amount} ZEC`,
      destination: destinationAddress.slice(0, 12) + "...",
      sourceTx: metadata?.sourceTxHash?.slice(0, 12),
      estimatedMinutes: Math.round((estimatedCompletion - Date.now()) / 60000),
      demo: demoMode,
      network: nearConfig.networkId,
    })

    return NextResponse.json(response)
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
 * In production this queries the NEAR chain for intent state
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

  const demoMode = isDemoMode()
  const nearConfigured = isNearConfigured()

  if (!demoMode && nearConfigured) {
    // PRODUCTION MODE: Query real NEAR Intent status
    try {
      console.log("[intents/status] Production mode - querying NEAR intent")

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

  // DEMO MODE: Simulate status based on intent ID timestamp
  const isRecent = intentId.includes(Date.now().toString(36).slice(0, 4))

  return NextResponse.json({
    intentId,
    status: isRecent ? "processing" : "completed",
    demo: demoMode,
    message: demoMode
      ? "Demo status - not querying real NEAR chain"
      : "Status from NEAR",
  })
}
