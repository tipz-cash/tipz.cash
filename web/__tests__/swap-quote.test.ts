import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock env before importing modules
vi.stubEnv("ENABLE_REAL_SWAPS", "false")

// Mock fetch for CoinGecko
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

// We need to test the quote route handler. Since it's a Next.js route,
// we'll import and call POST directly.
import { POST } from "@/app/api/swap/quote/route"
import { clearAllRateLimits } from "@/lib/rate-limit"

// Helper to create a NextRequest-like object
function createRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "127.0.0.1" }),
  }
}

beforeEach(() => {
  clearAllRateLimits()
  mockFetch.mockReset()

  // Default CoinGecko response
  mockFetch.mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        ethereum: { usd: 3200 },
        zcash: { usd: 40 },
        "usd-coin": { usd: 1 },
        tether: { usd: 1 },
      }),
  })
})

describe("POST /api/swap/quote (demo mode)", () => {
  it("returns a demo quote for ETH → ZEC", async () => {
    const req = createRequest({
      fromChain: 1,
      fromToken: "0x0000000000000000000000000000000000000000",
      fromAmount: "0.01",
      destinationAddress: "zs1" + "a".repeat(75),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.demo).toBe(true)
    expect(parseFloat(data.toAmount)).toBeGreaterThan(0)
    expect(parseFloat(data.exchangeRate)).toBeGreaterThan(0)
    expect(data.fees).toBeDefined()
    expect(data.fees.total).toBeDefined()
    expect(data.route).toContain("ETH")
    expect(data.route).toContain("ZEC")
    expect(data.expiresAt).toBeGreaterThan(Date.now())
    // Demo mode should NOT have depositAddress
    expect(data.depositAddress).toBeUndefined()
  })

  it("returns a demo quote for USDC → ZEC", async () => {
    const req = createRequest({
      fromChain: 1,
      fromToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      fromAmount: "10",
      destinationAddress: "zs1" + "a".repeat(75),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.demo).toBe(true)
    expect(data.route).toContain("USDC")
    expect(data.route).toContain("ZEC")
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
      destinationAddress: "zs1" + "a".repeat(75),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Unsupported token")
  })

  it("uses fallback prices when CoinGecko fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
    })

    const req = createRequest({
      fromChain: 1,
      fromToken: "0x0000000000000000000000000000000000000000",
      fromAmount: "0.01",
      destinationAddress: "zs1" + "a".repeat(75),
    })

    const res = await POST(req)
    const data = await res.json()

    // Should still return a quote using fallback prices
    expect(res.status).toBe(200)
    expect(data.demo).toBe(true)
    expect(parseFloat(data.toAmount)).toBeGreaterThan(0)
  })

  it("enforces rate limits", async () => {
    const makeReq = () =>
      createRequest({
        fromChain: 1,
        fromToken: "0x0000000000000000000000000000000000000000",
        fromAmount: "0.01",
        destinationAddress: "zs1" + "a".repeat(75),
      })

    // swapQuote rate limit is 30/min - send 31 requests
    for (let i = 0; i < 30; i++) {
      await POST(makeReq())
    }

    const res = await POST(makeReq())
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toContain("Too many")
  })
})
