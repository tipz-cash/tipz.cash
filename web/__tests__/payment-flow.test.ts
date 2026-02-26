/**
 * Payment Flow Integration Test
 *
 * Tests the full tip flow: quote → execute → poll status → completion
 * Uses mocked NEAR Intents but exercises all internal validation logic.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock near-intents
vi.mock("@/lib/near-intents", () => ({
  getSwapQuote: vi.fn().mockResolvedValue({
    correlationId: "test-correlation-id",
    quote: {
      depositAddress: "0xtest123deposit",
      amountIn: "10000000000000000",
      amountInFormatted: "0.01",
      amountInUsd: "32",
      minAmountIn: "10000000000000000",
      amountOut: "80000000",
      amountOutFormatted: "0.80",
      amountOutUsd: "32",
      minAmountOut: "79000000",
      deadline: new Date(Date.now() + 600000).toISOString(),
      timeWhenInactive: new Date(Date.now() + 600000).toISOString(),
      timeEstimate: 300,
    },
  }),
  mapAddressToAssetId: vi.fn((address: string) => {
    if (address === "0x0000000000000000000000000000000000000000") return "nep141:eth.omft.near"
    if (address === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
      return "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near"
    return null
  }),
  ZEC_ASSET_ID: "nep141:zec.omft.near",
  toSmallestUnits: vi.fn((amount: string, decimals: number) => {
    const parts = amount.split(".")
    const whole = parts[0] || "0"
    const frac = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals)
    return BigInt(whole + frac).toString()
  }),
  fromSmallestUnits: vi.fn(() => "0.80"),
  submitDeposit: vi.fn().mockResolvedValue({ success: true }),
  getSwapStatus: vi.fn().mockResolvedValue({
    status: "PENDING_DEPOSIT",
    depositAddress: "0xtest123deposit",
    updatedAt: new Date().toISOString(),
  }),
  isSwapComplete: vi.fn((status: string) => ["SUCCESS", "REFUNDED", "FAILED"].includes(status)),
  isSwapSuccessful: vi.fn((status: string) => status === "SUCCESS"),
  getStatusMessage: vi.fn((status: string) => {
    const messages: Record<string, string> = {
      PENDING_DEPOSIT: "Waiting for deposit...",
      PROCESSING: "Processing swap...",
      SUCCESS: "Swap complete!",
    }
    return messages[status] || "Unknown status"
  }),
}))

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: null,
}))

vi.mock("@/lib/transactions", () => ({
  logTransaction: vi.fn().mockResolvedValue({ id: "mock-tx-id" }),
}))

import { POST as quoteHandler } from "@/app/api/swap/quote/route"
import { POST as executeHandler } from "@/app/api/swap/execute/route"
import { GET as statusHandler } from "@/app/api/swap/status/route"

const VALID_ZEC_ADDRESS = "u1" + "q".repeat(139)
const VALID_ETH_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678"

function createPostRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "10.0.0.1" }),
  }
}

function createGetRequest(params: Record<string, string>): any {
  const url = new URL("http://localhost:3000/api/swap/status")
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return {
    nextUrl: url,
    headers: new Headers({ "x-forwarded-for": "10.0.0.1" }),
  }
}

describe("Full Payment Flow", () => {
  it("completes a full ETH → ZEC tip flow", async () => {
    // Step 1: Get a quote
    const quoteRes = await quoteHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        destinationAddress: VALID_ZEC_ADDRESS,
        refundAddress: VALID_ETH_ADDRESS,
      })
    )

    expect(quoteRes.status).toBe(200)
    const quote = await quoteRes.json()

    expect(parseFloat(quote.toAmount)).toBeGreaterThan(0)
    expect(quote.depositAddress).toBeDefined()
    expect(quote.quoteId).toBeDefined()

    // Step 2: Execute the swap
    const executeRes = await executeHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        walletAddress: VALID_ETH_ADDRESS,
        destinationAddress: VALID_ZEC_ADDRESS,
        quote: {
          toAmount: quote.toAmount,
          exchangeRate: quote.exchangeRate,
          fees: quote.fees,
          estimatedTime: quote.estimatedTime,
          route: quote.route,
          expiresAt: quote.expiresAt,
          depositAddress: quote.depositAddress,
          quoteId: quote.quoteId,
        },
      })
    )

    expect(executeRes.status).toBe(200)
    const execution = await executeRes.json()

    expect(execution.success).toBe(true)
    expect(execution.intentId).toBeDefined()
    expect(execution.depositAddress).toBeDefined()
    expect(execution.statusUrl).toBeDefined()

    // Step 3: Poll status
    const statusRes = await statusHandler(
      createGetRequest({ depositAddress: execution.depositAddress })
    )

    expect(statusRes.status).toBe(200)
    const status = await statusRes.json()

    expect(status.status).toBe("PENDING_DEPOSIT")
    expect(status.complete).toBe(false)
    expect(status.message).toBeDefined()
  })

  it("validates the full error path: expired quote → rejection", async () => {
    // Get a valid quote first
    const quoteRes = await quoteHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        destinationAddress: VALID_ZEC_ADDRESS,
        refundAddress: VALID_ETH_ADDRESS,
      })
    )
    const quote = await quoteRes.json()

    // Try to execute with an expired quote
    const executeRes = await executeHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        walletAddress: VALID_ETH_ADDRESS,
        destinationAddress: VALID_ZEC_ADDRESS,
        quote: {
          ...quote,
          expiresAt: Date.now() - 1000, // expired
        },
      })
    )

    expect(executeRes.status).toBe(400)
    const error = await executeRes.json()
    expect(error.error).toContain("expired")
  })

  it("validates address security: rejects transparent ZEC address", async () => {
    const quoteRes = await quoteHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        destinationAddress: VALID_ZEC_ADDRESS,
        refundAddress: VALID_ETH_ADDRESS,
      })
    )
    const quote = await quoteRes.json()

    // Try to execute with a transparent address
    const executeRes = await executeHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        walletAddress: VALID_ETH_ADDRESS,
        destinationAddress: "t1SomeTransparentAddress12345678901234",
        quote: {
          ...quote,
          expiresAt: Date.now() + 60000,
        },
      })
    )

    expect(executeRes.status).toBe(400)
    const error = await executeRes.json()
    expect(error.error).toContain("Invalid destination address")
  })

  it("validates address security: rejects ETH address as destination", async () => {
    const quoteRes = await quoteHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        destinationAddress: VALID_ZEC_ADDRESS,
        refundAddress: VALID_ETH_ADDRESS,
      })
    )
    const quote = await quoteRes.json()

    const executeRes = await executeHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        walletAddress: VALID_ETH_ADDRESS,
        destinationAddress: VALID_ETH_ADDRESS, // ETH address, not ZEC
        quote: {
          ...quote,
          expiresAt: Date.now() + 60000,
        },
      })
    )

    expect(executeRes.status).toBe(400)
  })
})
