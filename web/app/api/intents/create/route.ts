import { NextRequest, NextResponse } from "next/server"

/**
 * Mock NEAR Intents API
 *
 * Simulates NEAR Intents privacy routing for demo mode.
 * In production, this would integrate with the Defuse SDK
 * to route payments through NEAR's intent system to
 * shielded Zcash addresses.
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

interface IntentResponse {
  success: boolean
  intentId: string
  status: "pending" | "processing" | "completed" | "failed"
  destinationChain: string
  estimatedCompletion: number
  demo: boolean
  nearContract?: string
  message?: string
}

/**
 * Generate a NEAR-style intent ID
 * Format: intent_{timestamp}_{random}
 */
function generateIntentId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 11)
  return `intent_${timestamp}_${random}`
}

/**
 * Validate ZEC shielded address format
 */
function isValidShieldedAddress(address: string): boolean {
  // Unified addresses start with 'u1' (preferred for new wallets)
  // Sapling addresses start with 'zs1' (legacy but still valid)
  if (address.startsWith("u1")) {
    // Unified addresses are variable length but typically 141+ characters
    return address.length >= 78
  }
  if (address.startsWith("zs1")) {
    // Sapling shielded addresses are exactly 78 characters
    return address.length === 78
  }
  return false
}

/**
 * Validate destination chain
 */
function isValidDestinationChain(chain: string): boolean {
  const supportedChains = ["ZEC", "ZCASH", "zec", "zcash"]
  return supportedChains.includes(chain)
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

    // Simulate NEAR Intents processing delay (1-2 seconds)
    const processingDelay = 1000 + Math.floor(Math.random() * 1000)
    await new Promise(resolve => setTimeout(resolve, processingDelay))

    // Generate intent ID
    const intentId = generateIntentId()

    // Estimated completion time (3-10 minutes for cross-chain privacy routing)
    const estimatedCompletion = Date.now() + (180000 + Math.floor(Math.random() * 420000))

    const response: IntentResponse = {
      success: true,
      intentId,
      status: "pending",
      destinationChain: "ZEC",
      estimatedCompletion,
      demo: true,
      nearContract: "intents.near",
      message: "Demo intent created - no real funds routed through NEAR",
    }

    console.log("[intents/create] Mock intent created:", {
      intentId,
      amount: `${amount} ZEC`,
      destination: destinationAddress.slice(0, 12) + "...",
      sourceTx: metadata?.sourceTxHash?.slice(0, 12),
      estimatedMinutes: Math.round((estimatedCompletion - Date.now()) / 60000),
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
 * In production this would query the NEAR chain for intent state
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

  // For demo mode, always return "processing" or "completed" based on time
  // In production, this would query the actual intent status on NEAR
  const isRecent = intentId.includes(Date.now().toString(36).slice(0, 4))

  return NextResponse.json({
    intentId,
    status: isRecent ? "processing" : "completed",
    demo: true,
    message: "Demo status - not querying real NEAR chain",
  })
}
