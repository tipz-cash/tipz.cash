import { describe, it, expect, vi } from "vitest"

// Mock supabase as null (no DB = returns empty)
vi.mock("@/lib/supabase", () => ({
  supabase: null,
  normalizeHandle: (h: string) => h.toLowerCase().replace(/^@/, ""),
  findCreatorByHandle: () =>
    Promise.resolve({ data: null, error: { message: "Database not configured" } }),
}))

import { GET as getReceived } from "@/app/api/tips/received/route"
import { GET as getStats } from "@/app/api/tips/stats/route"
import { GET as getLatest } from "@/app/api/tips/latest/route"

function createGetRequest(params: Record<string, string>, path: string): any {
  const url = new URL(`http://localhost:3000${path}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return {
    url: url.toString(),
    nextUrl: url,
    headers: new Headers({ "x-forwarded-for": "10.0.0.1" }),
    cookies: { get: () => undefined },
  }
}

// ================================================================
// Tips Received
// ================================================================

describe("GET /api/tips/received", () => {
  it("returns empty tips when no DB configured", async () => {
    const res = await getReceived(createGetRequest({ handle: "testuser" }, "/api/tips/received"))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tips).toEqual([])
    expect(data.total_count).toBe(0)
  })

  it("rejects missing handle", async () => {
    const res = await getReceived(createGetRequest({}, "/api/tips/received"))
    expect(res.status).toBe(400)
  })
})

// ================================================================
// Tips Stats
// ================================================================

describe("GET /api/tips/stats", () => {
  it("returns zero stats when no DB configured", async () => {
    const res = await getStats(createGetRequest({ handle: "testuser" }, "/api/tips/stats"))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tip_count).toBe(0)
    expect(data.last_tip_at).toBeNull()
  })

  it("rejects missing handle", async () => {
    const res = await getStats(createGetRequest({}, "/api/tips/stats"))
    expect(res.status).toBe(400)
  })
})

// ================================================================
// Tips Latest
// ================================================================

describe("GET /api/tips/latest", () => {
  it("returns null tip when no DB configured (handle param)", async () => {
    const res = await getLatest(createGetRequest({ handle: "testuser" }, "/api/tips/latest"))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tip).toBeNull()
  })

  it("returns empty tips when no DB configured (creator_id + since params)", async () => {
    const res = await getLatest(
      createGetRequest({ creator_id: "abc", since: "2024-01-01T00:00:00Z" }, "/api/tips/latest")
    )
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tips).toEqual([])
  })

  it("rejects missing handle and creator_id", async () => {
    const res = await getLatest(createGetRequest({}, "/api/tips/latest"))
    expect(res.status).toBe(400)
  })
})
