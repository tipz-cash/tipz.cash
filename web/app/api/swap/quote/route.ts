import { NextRequest, NextResponse } from "next/server"

/**
 * Mock Swap Quote API
 *
 * Returns realistic swap quotes for demo mode.
 * Uses real prices from CoinGecko when available.
 *
 * POST /api/swap/quote
 * Request: { fromChain, fromToken, fromAmount, toChain, toToken, destinationAddress }
 * Response: { toAmount, exchangeRate, fees, estimatedTime, route, expiresAt }
 */

interface QuoteRequest {
  fromChain: number
  fromToken: string
  fromAmount: string
  toChain: string
  toToken: string
  destinationAddress: string
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
}

// CoinGecko ID mapping
const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  MATIC: "matic-network",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  ZEC: "zcash",
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
}

// Fallback prices if CoinGecko fails
const FALLBACK_PRICES: Record<string, number> = {
  ETH: 3200,
  MATIC: 0.85,
  USDC: 1.0,
  USDT: 1.0,
  DAI: 1.0,
  ZEC: 40,
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

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json()
    const { fromChain, fromToken, fromAmount, destinationAddress } = body

    // Validate required fields
    if (!fromChain || !fromToken || !fromAmount) {
      return NextResponse.json(
        { error: "Missing required fields: fromChain, fromToken, fromAmount" },
        { status: 400 }
      )
    }

    // Resolve token symbol
    const fromSymbol = resolveTokenSymbol(fromToken, fromChain)
    const toSymbol = "ZEC"

    if (fromSymbol === "UNKNOWN") {
      return NextResponse.json(
        { error: "Unsupported token address" },
        { status: 400 }
      )
    }

    // Fetch real prices
    const prices = await getTokenPrices([fromSymbol, toSymbol])

    // Use real prices or fallbacks
    const fromPrice = prices[fromSymbol] || FALLBACK_PRICES[fromSymbol] || 1
    const toPrice = prices[toSymbol] || FALLBACK_PRICES[toSymbol] || 40

    // Calculate amounts
    const fromAmountNum = parseFloat(fromAmount)
    const fromValueUsd = fromAmountNum * fromPrice

    // Apply fees (0.5% protocol fee)
    const protocolFeePercent = 0.005
    const networkFeeUsd = fromSymbol === "ETH" || fromSymbol === "MATIC" ? 0.50 : 0.10 // Estimate
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

    const response: QuoteResponse = {
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

    console.log("[swap/quote] Generated quote:", {
      from: `${fromAmount} ${fromSymbol}`,
      to: `${toAmount} ZEC`,
      rate: exchangeRate,
      pricesUsed: { [fromSymbol]: fromPrice, ZEC: toPrice },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[swap/quote] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate swap quote" },
      { status: 500 }
    )
  }
}
