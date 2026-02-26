import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock near-intents to avoid real API calls
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
  mapAddressToAssetId: vi.fn((address: string, chainId: number) => {
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
}))

import { POST } from "@/app/api/swap/quote/route"

// Helper to create a NextRequest-like object
function createRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "127.0.0.1" }),
  }
}

describe("POST /api/swap/quote", () => {
  it("returns a quote for ETH → ZEC", async () => {
    const req = createRequest({
      fromChain: 1,
      fromToken: "0x0000000000000000000000000000000000000000",
      fromAmount: "0.01",
      destinationAddress: "u1" + "q".repeat(139),
      refundAddress: "0x1234567890abcdef1234567890abcdef12345678",
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(parseFloat(data.toAmount)).toBeGreaterThan(0)
    expect(data.route).toContain("ETH")
    expect(data.route).toContain("ZEC")
    expect(data.depositAddress).toBeDefined()
    expect(data.quoteId).toBeDefined()
  })

  it("rejects missing required fields", async () => {
    const req = createRequest({
      fromChain: 1,
      // missing fromToken and fromAmount
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Missing required")
  })

  it("rejects missing destination address", async () => {
    const req = createRequest({
      fromChain: 1,
      fromToken: "0x0000000000000000000000000000000000000000",
      fromAmount: "0.01",
      // missing destinationAddress
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("destinationAddress")
  })

  it("rejects unsupported token", async () => {
    const req = createRequest({
      fromChain: 1,
      fromToken: "0x1234567890abcdef1234567890abcdef12345678",
      fromAmount: "1",
      destinationAddress: "u1" + "q".repeat(139),
      refundAddress: "0x1234567890abcdef1234567890abcdef12345678",
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Unsupported token")
  })

  it("rejects missing refund address", async () => {
    const req = createRequest({
      fromChain: 1,
      fromToken: "0x0000000000000000000000000000000000000000",
      fromAmount: "0.01",
      destinationAddress: "u1" + "q".repeat(139),
      // missing refundAddress
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("refundAddress")
  })

})
