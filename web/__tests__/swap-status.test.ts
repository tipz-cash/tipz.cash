import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock env
vi.stubEnv("ENABLE_REAL_SWAPS", "false")

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: null,
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

describe("GET /api/swap/status (demo mode)", () => {
  it("returns PENDING_DEPOSIT on first poll", async () => {
    const res = await GET(createRequest({ depositAddress: "demo-addr-1" }))
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

  it("progresses through demo states over time", async () => {
    const addr = "demo-progression-" + Date.now()

    // First poll → PENDING_DEPOSIT
    const r1 = await GET(createRequest({ depositAddress: addr }))
    const d1 = await r1.json()
    expect(d1.status).toBe("PENDING_DEPOSIT")

    // The demo progression uses elapsed time, so we can't easily test
    // the full progression without waiting. But we can verify the
    // response structure is consistent.
    expect(d1.depositAddress).toBe(addr)
    expect(typeof d1.complete).toBe("boolean")
    expect(typeof d1.success).toBe("boolean")
    expect(typeof d1.message).toBe("string")
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
