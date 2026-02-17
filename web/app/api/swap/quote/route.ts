import { NextRequest, NextResponse } from "next/server"
import {
  getSwapQuote as getNearIntentsQuote,
  mapAddressToAssetId,
  ZEC_ASSET_ID,
  toSmallestUnits,
  fromSmallestUnits,
} from "@/lib/near-intents"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIP,
  RATE_LIMITS
} from "@/lib/rate-limit"

/**
 * Swap Quote API
 *
 * Returns swap quotes for ETH/USDC → ZEC using NEAR Intents 1Click API.
 * - Calls NEAR Intents 1Click API for real quotes
 * - Returns deposit address for user to send funds
 * - Quote expires in ~60 seconds
 *
 * POST /api/swap/quote
 * Request: { fromChain, fromToken, fromAmount, toChain, toToken, destinationAddress, refundAddress }
 * Response: { toAmount, exchangeRate, fees, estimatedTime, route, expiresAt, depositAddress?, quoteId? }
 */

interface QuoteRequest {
  fromChain: number
  fromToken: string
  fromAmount: string
  toChain: string
  toToken: string
  destinationAddress: string
  refundAddress?: string // Wallet address to refund if swap fails
}

interface QuoteResponse {
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
  // Real swap fields
  quoteId?: string
  depositAddress?: string
  minDestinationAmount?: string
}

// Known token addresses mapped to symbols
const TOKEN_SYMBOLS: Record<string, string> = {
  "0x0000000000000000000000000000000000000000": "ETH", // Native token
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC", // Ethereum USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT", // Ethereum USDT
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": "USDC", // Polygon USDC
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": "USDT", // Polygon USDT
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "USDC", // Arbitrum USDC
  "0x0b2c639c533813f4aa9d7837caf62653d097ff85": "USDC", // Optimism USDC
}

// Chain ID to native token symbol
const CHAIN_NATIVE: Record<number, string> = {
  1: "ETH",
  137: "MATIC",
  42161: "ETH",
  10: "ETH",
  501: "SOL",
}

// Token decimals
const TOKEN_DECIMALS: Record<string, number> = {
  ETH: 18,
  MATIC: 18,
  USDC: 6,
  USDT: 6,
  SOL: 9,
}

/**
 * Resolve token symbol from address
 */
function resolveTokenSymbol(address: string, chainId: number): string {
  // Solana native token
  if (chainId === 501) {
    if (address === "native" || address === "" || address === "So11111111111111111111111111111111111111112") {
      return "SOL"
    }
    return "UNKNOWN"
  }

  // Check if it's a known token address
  const known = TOKEN_SYMBOLS[address]
  if (known) {
    // Adjust for chain (MATIC on Polygon)
    if (address === "0x0000000000000000000000000000000000000000") {
      return CHAIN_NATIVE[chainId] || "ETH"
    }
    return known
  }

  // Native token for chain
  if (address === "0x0000000000000000000000000000000000000000") {
    return CHAIN_NATIVE[chainId] || "ETH"
  }

  return "UNKNOWN"
}

/**
 * Generate real quote using NEAR Intents
 */
async function generateRealQuote(
  fromChain: number,
  fromToken: string,
  fromAmount: string,
  destinationAddress: string,
  refundAddress: string
): Promise<QuoteResponse> {
  const fromSymbol = resolveTokenSymbol(fromToken, fromChain)
  const decimals = TOKEN_DECIMALS[fromSymbol] || 18

  // Map to NEAR Intents asset ID
  const originAsset = mapAddressToAssetId(fromToken, fromChain)
  if (!originAsset) {
    throw new Error(`Unsupported token: ${fromToken} on chain ${fromChain}`)
  }

  // Convert amount to smallest units
  const depositAmount = toSmallestUnits(fromAmount, decimals)

  console.log("[swap/quote] Requesting NEAR Intents quote:", {
    originAsset,
    depositAmount,
    destinationAsset: ZEC_ASSET_ID,
    recipient: destinationAddress.slice(0, 12) + "...",
  })

  try {
    const nearResponse = await getNearIntentsQuote({
      originAsset,
      destinationAsset: ZEC_ASSET_ID,
      depositAmount,
      recipient: destinationAddress,
      refundTo: refundAddress,
      slippageTolerance: 100, // 1%
    })

    // Extract the nested quote object
    const quote = nearResponse.quote
    if (!quote) {
      throw new Error("No quote returned from NEAR Intents")
    }

    // Convert destination amount from smallest units (ZEC has 8 decimals)
    const toAmount = fromSmallestUnits(quote.amountOut, 8)
    const minToAmount = fromSmallestUnits(quote.minAmountOut, 8)

    // Route via NEAR Intents
    const route = [fromSymbol, "NEAR", "ZEC"]

    // Parse deadline from ISO 8601 string
    const expiresAt = new Date(quote.deadline).getTime()

    // Calculate exchange rate from amounts
    const amountInNum = parseFloat(quote.amountInFormatted)
    const amountOutNum = parseFloat(quote.amountOutFormatted)
    const exchangeRate = amountInNum > 0 ? (amountOutNum / amountInNum).toString() : "0"

    console.log("[swap/quote] Real quote received:", {
      correlationId: nearResponse.correlationId,
      depositAddress: quote.depositAddress,
      amountIn: quote.amountInFormatted,
      amountOut: quote.amountOutFormatted,
      deadline: quote.deadline,
      timeEstimate: quote.timeEstimate,
    })

    return {
      toAmount,
      exchangeRate,
      fees: {
        network: "0",
        protocol: "0",
        total: "0", // Fees are included in the rate
      },
      estimatedTime: quote.timeEstimate || 300,
      route,
      expiresAt,
      quoteId: nearResponse.correlationId,
      depositAddress: quote.depositAddress,
      minDestinationAmount: minToAmount,
    }
  } catch (error) {
    console.error("[swap/quote] NEAR Intents error:", error)
    throw new Error(`Failed to get quote from NEAR Intents: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers)
  const rateLimitResult = rateLimit(clientIP, RATE_LIMITS.swapQuote)
  const headers = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many quote requests. Please try again later.",
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(rateLimitResult.retryAfter) }
      }
    )
  }

  try {
    const body: QuoteRequest = await request.json()
    const { fromChain, fromToken, fromAmount, destinationAddress, refundAddress } = body

    // Validate required fields
    if (!fromChain || !fromToken || !fromAmount) {
      return NextResponse.json(
        { error: "Missing required fields: fromChain, fromToken, fromAmount" },
        { status: 400 }
      )
    }

    // Validate destination address (ZEC shielded)
    if (!destinationAddress) {
      return NextResponse.json(
        { error: "Missing destinationAddress" },
        { status: 400 }
      )
    }

    // Check for unsupported token
    const fromSymbol = resolveTokenSymbol(fromToken, fromChain)
    if (fromSymbol === "UNKNOWN") {
      return NextResponse.json(
        { error: "Unsupported token address" },
        { status: 400 }
      )
    }

    if (!refundAddress) {
      return NextResponse.json(
        { error: "Missing refundAddress for swap" },
        { status: 400 }
      )
    }

    const response = await generateRealQuote(
      fromChain,
      fromToken,
      fromAmount,
      destinationAddress,
      refundAddress
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error("[swap/quote] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate swap quote" },
      { status: 500 }
    )
  }
}
