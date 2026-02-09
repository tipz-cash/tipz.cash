import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock env
vi.stubEnv("ENABLE_REAL_SWAPS", "false")
vi.stubEnv("NEAR_DEMO_MODE", "true")

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: null, // No DB in tests
}))

// Mock transactions module
vi.mock("@/lib/transactions", () => ({
  logTransaction: vi.fn().mockResolvedValue({ id: "mock-tx-id" }),
}))

import { POST } from "@/app/api/swap/execute/route"
import { clearAllRateLimits } from "@/lib/rate-limit"

const VALID_ZEC_ADDRESS = "zs1" + "a".repeat(75)
const VALID_ETH_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678"

function createRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "127.0.0.1" }),
  }
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    fromChain: 1,
    fromToken: "0x0000000000000000000000000000000000000000",
    fromAmount: "0.01",
    walletAddress: VALID_ETH_ADDRESS,
    destinationAddress: VALID_ZEC_ADDRESS,
    quote: {
      toAmount: "0.75",
      exchangeRate: "80",
      fees: { network: "0.50", protocol: "0.16", total: "0.66" },
      estimatedTime: 300,
      route: ["ETH", "USDC", "ZEC"],
      expiresAt: Date.now() + 60000,
    },
    ...overrides,
  }
}

beforeEach(() => {
  clearAllRateLimits()
})

describe("POST /api/swap/execute (demo mode)", () => {
  it("executes a demo swap", async () => {
    const res = await POST(createRequest(validBody()))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.demo).toBe(true)
    expect(data.txHash).toMatch(/^0x[a-f0-9]{64}$/)
    expect(data.intentId).toMatch(/^intent_/)
    expect(data.status).toBe("pending")
    expect(data.estimatedCompletion).toBeGreaterThan(Date.now())
  })

  it("rejects missing required fields", async () => {
    const res = await POST(
      createRequest({
        fromChain: 1,
        // missing everything else
      })
    )
    expect(res.status).toBe(400)
  })

  it("rejects invalid ETH address", async () => {
    const res = await POST(
      createRequest(validBody({ walletAddress: "not-an-address" }))
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Invalid wallet address")
  })

  it("rejects invalid ZEC destination", async () => {
    const res = await POST(
      createRequest(validBody({ destinationAddress: "t1notshielded123" }))
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Invalid destination address")
  })

  it("rejects expired quote", async () => {
    const res = await POST(
      createRequest(
        validBody({
          quote: {
            toAmount: "0.75",
            exchangeRate: "80",
            fees: { network: "0", protocol: "0", total: "0" },
            estimatedTime: 300,
            route: ["ETH", "ZEC"],
            expiresAt: Date.now() - 60000, // expired 1 minute ago
          },
        })
      )
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("expired")
  })

  it("uses provided sourceTxHash when available", async () => {
    const txHash = "0x" + "ab".repeat(32)
    const res = await POST(createRequest(validBody({ sourceTxHash: txHash })))
    const data = await res.json()

    expect(data.txHash).toBe(txHash)
  })

  it("enforces rate limits", async () => {
    // swapExecute rate limit is 10/min
    // Each demo execution has a 1-2s delay, so run in parallel
    await Promise.all(
      Array.from({ length: 10 }, () => POST(createRequest(validBody())))
    )

    const res = await POST(createRequest(validBody()))
    expect(res.status).toBe(429)
  }, 30000)
})
