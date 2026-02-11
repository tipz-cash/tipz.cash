import { NextRequest, NextResponse } from "next/server"
import {
  getSwapQuote,
  ZEC_ASSET_ID,
  USDC_POLYGON_ASSET_ID,
  toSmallestUnits,
} from "@/lib/near-intents"

/**
 * POST /api/mesh/link-token
 *
 * Generates a Mesh link token for exchange/wallet payments.
 *
 * Flow:
 * 1. Get NEAR Intents quote to obtain a deposit address
 * 2. Create Mesh link token pointing to that deposit address
 * 3. Return token + deposit info for status polling
 *
 * Request: { destinationAddress, amountUsd, creatorHandle }
 * Response: { linkToken, depositAddress, quoteId, expiresAt }
 */

interface LinkTokenRequest {
  destinationAddress: string  // Creator's ZEC shielded address
  amountUsd: number          // Amount in USD
  creatorHandle: string      // For reference/memo
}

interface LinkTokenResponse {
  linkToken: string
  depositAddress: string
  quoteId: string
  expiresAt: number
}

// Mesh API configuration
const MESH_API_URL = "https://integration-api.meshconnect.com/api/v1/linktoken"
const MESH_CLIENT_ID = process.env.NEXT_PUBLIC_MESH_CLIENT_ID
const MESH_CLIENT_SECRET = process.env.MESH_CLIENT_SECRET

export async function POST(request: NextRequest) {
  try {
    // Validate Mesh credentials
    if (!MESH_CLIENT_ID || !MESH_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Mesh not configured" },
        { status: 503 }
      )
    }

    // Parse request
    let body: LinkTokenRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      )
    }

    const { destinationAddress, amountUsd, creatorHandle } = body

    // Validate required fields
    if (!destinationAddress || !amountUsd || amountUsd <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid destinationAddress or amountUsd" },
        { status: 400 }
      )
    }

    // Get NEAR Intents quote for USDC → ZEC
    // We use USDC on Polygon as the source since it's common on exchanges
    const depositAmount = toSmallestUnits(amountUsd.toString(), 6) // USDC has 6 decimals

    console.log("[mesh/link-token] Getting NEAR Intents quote:", {
      originAsset: USDC_POLYGON_ASSET_ID,
      depositAmount,
      destinationAsset: ZEC_ASSET_ID,
      recipient: destinationAddress.slice(0, 12) + "...",
    })

    const nearResponse = await getSwapQuote({
      originAsset: USDC_POLYGON_ASSET_ID,
      destinationAsset: ZEC_ASSET_ID,
      depositAmount,
      recipient: destinationAddress,
      // Mesh handles refunds internally, so use a placeholder
      refundTo: "0x0000000000000000000000000000000000000000",
      slippageTolerance: 100, // 1%
    })

    const quote = nearResponse.quote
    if (!quote || !quote.depositAddress) {
      throw new Error("No deposit address in NEAR Intents quote")
    }

    console.log("[mesh/link-token] NEAR Intents quote received:", {
      correlationId: nearResponse.correlationId,
      depositAddress: quote.depositAddress,
      deadline: quote.deadline,
    })

    // Create Mesh link token
    const meshResponse = await fetch(MESH_API_URL, {
      method: "POST",
      headers: {
        "X-Client-Id": MESH_CLIENT_ID,
        "X-Client-Secret": MESH_CLIENT_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: `tip_${creatorHandle}_${Date.now()}`,
        transferOptions: {
          toAddresses: [{
            symbol: "USDC",
            address: quote.depositAddress,
            networkId: "polygon",
            amount: amountUsd,
          }],
        },
        // Optional: customize the experience
        integrationConfig: {
          hideExitMessage: true,
        },
      }),
    })

    if (!meshResponse.ok) {
      const errorText = await meshResponse.text()
      console.error("[mesh/link-token] Mesh API error:", meshResponse.status, errorText)
      return NextResponse.json(
        { error: "Failed to create Mesh link token" },
        { status: 502 }
      )
    }

    const meshData = await meshResponse.json()

    if (!meshData.linkToken) {
      console.error("[mesh/link-token] No linkToken in Mesh response:", meshData)
      return NextResponse.json(
        { error: "Invalid Mesh response" },
        { status: 502 }
      )
    }

    console.log("[mesh/link-token] Mesh link token created")

    // Return combined response
    const response: LinkTokenResponse = {
      linkToken: meshData.linkToken,
      depositAddress: quote.depositAddress,
      quoteId: nearResponse.correlationId,
      expiresAt: new Date(quote.deadline).getTime(),
    }

    return NextResponse.json(response)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[mesh/link-token] Error:", message)
    return NextResponse.json(
      { error: `Failed to generate link token: ${message}` },
      { status: 500 }
    )
  }
}
