import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: null,
}))

// Mock near-intents to avoid real API calls
vi.mock("@/lib/near-intents", () => ({
  getSwapStatus: vi.fn().mockResolvedValue({
    status: "PENDING_DEPOSIT",
    depositAddress: "test-deposit-addr",
    updatedAt: new Date().toISOString(),
  }),
  isSwapComplete: vi.fn((status: string) => ["SUCCESS", "REFUNDED", "FAILED"].includes(status)),
  isSwapSuccessful: vi.fn((status: string) => status === "SUCCESS"),
  getStatusMessage: vi.fn((status: string) => {
    const messages: Record<string, string> = {
      PENDING_DEPOSIT: "Waiting for deposit...",
      PROCESSING: "Processing swap...",
      SUCCESS: "Swap complete!",
      REFUNDED: "Swap refunded",
      FAILED: "Swap failed",
    }
    return messages[status] || "Unknown status"
  }),
}))

import { GET } from "@/app/api/swap/status/route"
import { clearAllRateLimits } from "@/lib/rate-limit"

function createRequest(params: Record<string, string>): any {
  const url = new URL("http://localhost:3000/api/swap/status")
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return {
    nextUrl: url,
    headers: new Headers({ "x-forwarded-for": "127.0.0.1" }),
  }
}

beforeEach(() => {
  clearAllRateLimits()
})

describe("GET /api/swap/status", () => {
  it("returns status for a deposit address", async () => {
    const res = await GET(createRequest({ depositAddress: "test-addr-1" }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.status).toBe("PENDING_DEPOSIT")
    expect(data.complete).toBe(false)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Waiting for deposit...")
  })

  it("rejects missing address parameter", async () => {
    const res = await GET(createRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Missing address")
  })

  it("enforces rate limits", async () => {
    // swapStatus rate limit is 60/min
    for (let i = 0; i < 60; i++) {
      await GET(createRequest({ depositAddress: "rate-limit-test" }))
    }

    const res = await GET(createRequest({ depositAddress: "rate-limit-test" }))
    expect(res.status).toBe(429)
  })
})
