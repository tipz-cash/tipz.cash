import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock supabase as null (no DB = returns empty)
vi.mock("@/lib/supabase", () => ({
  supabase: null,
  normalizeHandle: (h: string) => h.toLowerCase().replace(/^@/, ""),
  findCreatorByHandle: () => Promise.resolve({ data: null, error: { message: "Database not configured" } }),
}))

import { GET as getReceived } from "@/app/api/tips/received/route"
import { GET as getStats } from "@/app/api/tips/stats/route"

function createGetRequest(params: Record<string, string>, path: string): any {
  const url = new URL(`http://localhost:3000${path}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return {
    url: url.toString(),
    nextUrl: url,
    headers: new Headers({ "x-forwarded-for": "10.0.0.1" }),
  }
}

// ================================================================
// Tips Received (no DB)
// ================================================================

describe("GET /api/tips/received (no DB)", () => {
  it("returns empty tips when no DB configured", async () => {
    const res = await getReceived(
      createGetRequest({ handle: "testuser" }, "/api/tips/received")
    )
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tips).toEqual([])
    expect(data.total_count).toBe(0)
  })

  it("rejects missing handle", async () => {
    const res = await getReceived(
      createGetRequest({}, "/api/tips/received")
    )
    expect(res.status).toBe(400)
  })
})

// ================================================================
// Tips Stats (no DB)
// ================================================================

describe("GET /api/tips/stats (no DB)", () => {
  it("returns zero stats when no DB configured", async () => {
    const res = await getStats(
      createGetRequest({ handle: "testuser" }, "/api/tips/stats")
    )
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tip_count).toBe(0)
    expect(data.last_tip_at).toBeNull()
  })

  it("rejects missing handle", async () => {
    const res = await getStats(
      createGetRequest({}, "/api/tips/stats")
    )
    expect(res.status).toBe(400)
  })
})
