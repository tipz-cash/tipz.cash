import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock supabase as null (demo mode)
vi.mock("@/lib/supabase", () => ({
  supabase: null,
  normalizeHandle: (h: string) => h.toLowerCase().replace(/^@/, ""),
}))

import { GET as getCreator } from "@/app/api/creator/route"
import { GET as getCreators } from "@/app/api/creators/route"

function createGetRequest(params: Record<string, string>, path = "/api/creator"): any {
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
// Single Creator Lookup (Demo Mode)
// ================================================================

describe("GET /api/creator (demo mode)", () => {
  it("returns demo creator by handle", async () => {
    const res = await getCreator(createGetRequest({ platform: "x", handle: "zooko" }))
    const data = await res.json()

    expect(data.found).toBe(true)
    expect(data.demo).toBe(true)
    expect(data.creator.handle).toBe("zooko")
    expect(data.creator.shielded_address).toMatch(/^zs1/)
  })

  it("is case-insensitive", async () => {
    const res = await getCreator(createGetRequest({ platform: "x", handle: "ZecHub" }))
    const data = await res.json()

    expect(data.found).toBe(true)
    expect(data.creator.handle).toBe("ZecHub")
  })

  it("strips @ prefix", async () => {
    const res = await getCreator(createGetRequest({ platform: "x", handle: "@naval" }))
    const data = await res.json()

    expect(data.found).toBe(true)
    expect(data.creator.handle).toBe("naval")
  })

  it("returns not found for unknown handle", async () => {
    const res = await getCreator(createGetRequest({ platform: "x", handle: "unknownuser123" }))
    const data = await res.json()

    expect(data.found).toBe(false)
  })

  it("rejects missing parameters", async () => {
    const res = await getCreator(createGetRequest({ platform: "x" }))
    expect(res.status).toBe(400)
  })

  it("includes avatar URL for demo creators", async () => {
    const res = await getCreator(createGetRequest({ platform: "x", handle: "balajis" }))
    const data = await res.json()

    expect(data.creator.avatar_url).toContain("unavatar.io")
  })
})

// ================================================================
// Creator Directory (Demo Mode)
// ================================================================

describe("GET /api/creators (demo mode)", () => {
  it("returns demo creators list", async () => {
    const res = await getCreators(createGetRequest({}, "/api/creators"))
    const data = await res.json()

    expect(data.isDemo).toBe(true)
    expect(data.creators.length).toBeGreaterThan(0)
    expect(data.total).toBe(12) // 12 demo creators
  })

  it("respects limit parameter", async () => {
    const res = await getCreators(createGetRequest({ limit: "3" }, "/api/creators"))
    const data = await res.json()

    expect(data.creators.length).toBe(3)
    expect(data.hasMore).toBe(true)
  })

  it("respects offset parameter", async () => {
    const res = await getCreators(createGetRequest({ limit: "5", offset: "10" }, "/api/creators"))
    const data = await res.json()

    expect(data.creators.length).toBe(2) // 12 total, offset 10 = 2 remaining
    expect(data.hasMore).toBe(false)
  })

  it("caps limit at 100", async () => {
    const res = await getCreators(createGetRequest({ limit: "500" }, "/api/creators"))
    const data = await res.json()

    expect(data.limit).toBe(100)
  })

  it("returns demo data when demo=true param", async () => {
    const res = await getCreators(createGetRequest({ demo: "true" }, "/api/creators"))
    const data = await res.json()

    expect(data.isDemo).toBe(true)
  })

  it("each creator has required fields", async () => {
    const res = await getCreators(createGetRequest({}, "/api/creators"))
    const data = await res.json()

    for (const creator of data.creators) {
      expect(creator.id).toBeDefined()
      expect(creator.platform).toBe("x")
      expect(creator.handle).toBeDefined()
      expect(creator.shielded_address).toMatch(/^zs1/)
    }
  })
})
