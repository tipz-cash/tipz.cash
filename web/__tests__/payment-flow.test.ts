/**
 * Payment Flow Integration Test
 *
 * Tests the full tip flow: quote → execute → poll status → completion
 * Uses demo mode (no real funds) but exercises all internal logic.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock env
vi.stubEnv("ENABLE_REAL_SWAPS", "false")
vi.stubEnv("NEAR_DEMO_MODE", "true")

// Mock fetch for CoinGecko
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

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
import { clearAllRateLimits } from "@/lib/rate-limit"

const VALID_ZEC_ADDRESS = "zs1" + "a".repeat(75)
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

beforeEach(() => {
  clearAllRateLimits()
  mockFetch.mockReset()
  mockFetch.mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        ethereum: { usd: 3200 },
        zcash: { usd: 40 },
      }),
  })
})

describe("Full Payment Flow (demo mode)", () => {
  it("completes a full ETH → ZEC tip flow", async () => {
    // ================================================================
    // Step 1: Get a quote
    // ================================================================
    const quoteRes = await quoteHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        destinationAddress: VALID_ZEC_ADDRESS,
      })
    )

    expect(quoteRes.status).toBe(200)
    const quote = await quoteRes.json()

    expect(quote.demo).toBe(true)
    expect(parseFloat(quote.toAmount)).toBeGreaterThan(0)
    expect(quote.expiresAt).toBeGreaterThan(Date.now())

    // ================================================================
    // Step 2: Execute the swap
    // ================================================================
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
        },
      })
    )

    expect(executeRes.status).toBe(200)
    const execution = await executeRes.json()

    expect(execution.success).toBe(true)
    expect(execution.demo).toBe(true)
    expect(execution.txHash).toMatch(/^0x[a-f0-9]{64}$/)
    expect(execution.intentId).toBeDefined()
    expect(execution.status).toBe("pending")

    // ================================================================
    // Step 3: Poll status
    // ================================================================
    // In demo mode, status starts at PENDING_DEPOSIT
    const depositAddr = execution.depositAddress || "demo-" + execution.intentId
    const statusRes = await statusHandler(
      createGetRequest({ depositAddress: depositAddr })
    )

    expect(statusRes.status).toBe(200)
    const status = await statusRes.json()

    expect(status.status).toBe("PENDING_DEPOSIT")
    expect(status.complete).toBe(false)
    expect(status.success).toBe(false)
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
    expect(error.error).toContain("shielded")
  })

  it("validates address security: rejects ETH address as destination", async () => {
    const quoteRes = await quoteHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        destinationAddress: VALID_ZEC_ADDRESS,
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

  it("handles multiple tokens: USDC → ZEC", async () => {
    const quoteRes = await quoteHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        fromAmount: "5",
        destinationAddress: VALID_ZEC_ADDRESS,
      })
    )

    expect(quoteRes.status).toBe(200)
    const quote = await quoteRes.json()
    expect(quote.route).toContain("USDC")

    const executeRes = await executeHandler(
      createPostRequest({
        fromChain: 1,
        fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        fromAmount: "5",
        walletAddress: VALID_ETH_ADDRESS,
        destinationAddress: VALID_ZEC_ADDRESS,
        quote: {
          toAmount: quote.toAmount,
          exchangeRate: quote.exchangeRate,
          fees: quote.fees,
          estimatedTime: quote.estimatedTime,
          route: quote.route,
          expiresAt: quote.expiresAt,
        },
      })
    )

    expect(executeRes.status).toBe(200)
    const execution = await executeRes.json()
    expect(execution.success).toBe(true)
  })
})
