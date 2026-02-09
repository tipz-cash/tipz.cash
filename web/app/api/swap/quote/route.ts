import { NextRequest, NextResponse } from "next/server"
import {
  isRealSwapsEnabled,
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
 * Returns swap quotes for ETH/USDC → ZEC.
 *
 * In production mode (ENABLE_REAL_SWAPS=true):
 *   - Calls NEAR Intents 1Click API for real quotes
 *   - Returns deposit address for user to send funds
 *   - Quote expires in ~60 seconds
 *
 * In demo mode:
 *   - Uses CoinGecko prices for realistic quotes
 *   - No real transactions occur
 *
 * POST /api/swap/quote
 * Request: { fromChain, fromToken, fromAmount, toChain, toToken, destinationAddress, refundAddress }
 * Response: { toAmount, exchangeRate, fees, estimatedTime, route, expiresAt, depositAddress?, quoteId?, demo }
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
  demo: boolean
  // Real swap fields
  quoteId?: string
  depositAddress?: string
  minDestinationAmount?: string
}

// CoinGecko ID mapping
const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  MATIC: "matic-network",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  ZEC: "zcash",
  SOL: "solana",
}

// Known token addresses mapped to symbols
const TOKEN_SYMBOLS: Record<string, string> = {
  "0x0000000000000000000000000000000000000000": "ETH", // Native token
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC", // Ethereum USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT", // Ethereum USDT
  "0x6B175474E89094C44Da98b954EesP6F9eb3a26f": "DAI", // Ethereum DAI
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": "USDC", // Polygon USDC
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": "USDT", // Polygon USDT
  "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8": "USDC", // Arbitrum USDC
  "0x7F5c764cBc14f9669B88837ca1490cCa17c31607": "USDC", // Optimism USDC
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
  DAI: 18,
  SOL: 9,
}

// Fallback prices if CoinGecko fails
const FALLBACK_PRICES: Record<string, number> = {
  ETH: 3200,
  MATIC: 0.85,
  USDC: 1.0,
  USDT: 1.0,
  DAI: 1.0,
  ZEC: 247,
  SOL: 200,
}

/**
 * Fetch real token prices from CoinGecko
 */
async function getTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  const coinIds = symbols
    .map(s => COINGECKO_IDS[s])
    .filter(Boolean)
    .join(",")

  if (!coinIds) {
    return {}
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
      { cache: "no-store" } // Don't cache to get fresh prices
    )

    if (!response.ok) {
      console.warn("[swap/quote] CoinGecko API error:", response.status)
      return {}
    }

    const data = await response.json()
    const prices: Record<string, number> = {}

    for (const symbol of symbols) {
      const coinId = COINGECKO_IDS[symbol]
      if (coinId && data[coinId]?.usd) {
        prices[symbol] = data[coinId].usd
      }
    }

    return prices
  } catch (error) {
    console.warn("[swap/quote] Failed to fetch CoinGecko prices:", error)
    return {}
  }
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
 * Generate demo quote using CoinGecko prices
 */
async function generateDemoQuote(
  fromChain: number,
  fromToken: string,
  fromAmount: string,
  destinationAddress: string
): Promise<QuoteResponse> {
  const fromSymbol = resolveTokenSymbol(fromToken, fromChain)
  const toSymbol = "ZEC"

  if (fromSymbol === "UNKNOWN") {
    throw new Error("Unsupported token address")
  }

  // Fetch real prices
  const prices = await getTokenPrices([fromSymbol, toSymbol])

  // Use real prices or fallbacks
  const fromPrice = prices[fromSymbol] || FALLBACK_PRICES[fromSymbol] || 1
  const toPrice = prices[toSymbol] || FALLBACK_PRICES[toSymbol] || 40

  // Calculate amounts
  const fromAmountNum = parseFloat(fromAmount)
  const fromValueUsd = fromAmountNum * fromPrice

  // Apply fees (0.5% protocol fee for demo)
  const protocolFeePercent = 0.005
  const networkFeeUsd = fromSymbol === "ETH" || fromSymbol === "MATIC" ? 0.50 : 0.10
  const protocolFeeUsd = fromValueUsd * protocolFeePercent

  const valueAfterFees = fromValueUsd - networkFeeUsd - protocolFeeUsd
  const toAmount = (valueAfterFees / toPrice).toFixed(8)

  // Calculate exchange rate (tokens per token, not USD)
  const exchangeRate = (fromPrice / toPrice).toString()

  // Determine route based on token
  let route: string[]
  if (fromSymbol === "USDC" || fromSymbol === "USDT" || fromSymbol === "DAI") {
    route = [fromSymbol, "ZEC"]
  } else {
    route = [fromSymbol, "USDC", "ZEC"]
  }

  // Estimated time (5-10 minutes for cross-chain)
  const estimatedTime = 300 + Math.floor(Math.random() * 300)

  console.log("[swap/quote] Demo quote generated:", {
    from: `${fromAmount} ${fromSymbol}`,
    to: `${toAmount} ZEC`,
    rate: exchangeRate,
    pricesUsed: { [fromSymbol]: fromPrice, ZEC: toPrice },
  })

  return {
    toAmount,
    exchangeRate,
    fees: {
      network: networkFeeUsd.toFixed(4),
      protocol: protocolFeeUsd.toFixed(4),
      total: (networkFeeUsd + protocolFeeUsd).toFixed(4),
    },
    estimatedTime,
    route,
    expiresAt: Date.now() + 60000, // 60 second expiry
    demo: true,
  }
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
      demo: false,
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

    // Determine if we should use real swaps
    // For NEAR Intents 1Click API, we only need ENABLE_REAL_SWAPS=true
    // (no NEAR account credentials required - uses deposit addresses)
    const useRealSwaps = isRealSwapsEnabled()

    let response: QuoteResponse

    if (useRealSwaps) {
      // Production: Use NEAR Intents for real quotes
      if (!refundAddress) {
        return NextResponse.json(
          { error: "Missing refundAddress for real swap" },
          { status: 400 }
        )
      }
      response = await generateRealQuote(
        fromChain,
        fromToken,
        fromAmount,
        destinationAddress,
        refundAddress
      )
    } else {
      // Demo: Generate mock quote with real prices
      response = await generateDemoQuote(
        fromChain,
        fromToken,
        fromAmount,
        destinationAddress
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[swap/quote] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate swap quote" },
      { status: 500 }
    )
  }
}
