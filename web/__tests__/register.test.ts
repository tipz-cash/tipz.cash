import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock supabase
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) })) }))

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      update: () => ({ eq: mockUpdate }),
    }),
  },
  normalizeHandle: (h: string) => h.toLowerCase().replace(/^@/, ""),
}))

// Mock twitter API — not configured by default
vi.mock("@/lib/twitter-api", () => ({
  verifyTweetContent: vi.fn(),
  isTwitterApiConfigured: () => false,
  fetchUserProfileImage: vi.fn(() => Promise.resolve(null)),
}))

import { POST } from "@/app/api/register/route"
import { clearAllRateLimits } from "@/lib/rate-limit"

const VALID_U1 = "u1" + "q".repeat(139)  // 141 chars, bech32m charset

function createRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "10.0.0.5" }),
  }
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    platform: "x",
    handle: "testuser",
    shielded_address: VALID_U1,
    tweet_url: "https://x.com/testuser/status/1234567890123456789",
    ...overrides,
  }
}

beforeEach(() => {
  clearAllRateLimits()
  mockSingle.mockReset()
  mockInsert.mockReset()
  mockUpdate.mockReset()

  // Default: no existing registration
  mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } })
  // Default: insert succeeds
  mockInsert.mockReturnValue({ select: () => ({ single: () => Promise.resolve({ data: { id: "new-id" }, error: null }) }) })
  mockInsert.mockResolvedValue({ error: null })
})

describe("POST /api/register", () => {
  // ================================================================
  // Input Validation
  // ================================================================

  it("rejects missing fields", async () => {
    const res = await POST(createRequest({ platform: "x" }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("MISSING_FIELDS")
    expect(data.details.missing).toContain("handle")
  })

  it("rejects invalid platform", async () => {
    const res = await POST(createRequest(validBody({ platform: "instagram" })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_PLATFORM")
  })

  it("rejects invalid handle", async () => {
    const res = await POST(createRequest(validBody({ handle: "way-too-long-handle!" })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_HANDLE")
  })

  it("accepts handle with @ prefix", async () => {
    // The handle validation strips @, but tweet URL won't match
    // Let's test that @ is stripped properly
    const res = await POST(createRequest(validBody({
      handle: "@testuser",
      tweet_url: "https://x.com/testuser/status/1234567890123456789",
    })))
    // Should pass handle validation (not 400 for INVALID_HANDLE)
    const data = await res.json()
    expect(data.code).not.toBe("INVALID_HANDLE")
  })

  // ================================================================
  // Address Validation
  // ================================================================

  it("rejects Sapling address (zs1...)", async () => {
    const res = await POST(createRequest(validBody({ shielded_address: "zs1" + "q".repeat(75) })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_ADDRESS")
  })

  it("accepts valid Unified address (u1...)", async () => {
    const res = await POST(createRequest(validBody({ shielded_address: VALID_U1 })))
    const data = await res.json()
    expect(data.code).not.toBe("INVALID_ADDRESS")
  })

  it("rejects transparent address (t1...)", async () => {
    const res = await POST(createRequest(validBody({
      shielded_address: "t1SomeTransparentAddress12345678901234",
    })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_ADDRESS")
  })

  it("rejects ETH address", async () => {
    const res = await POST(createRequest(validBody({
      shielded_address: "0x1234567890abcdef1234567890abcdef12345678",
    })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_ADDRESS")
  })

  it("rejects too-short u1 address", async () => {
    const res = await POST(createRequest(validBody({
      shielded_address: "u1" + "q".repeat(50), // only 52 chars
    })))
    expect(res.status).toBe(400)
  })

  // ================================================================
  // Tweet URL Validation
  // ================================================================

  it("accepts valid x.com tweet URL", async () => {
    const res = await POST(createRequest(validBody({
      tweet_url: "https://x.com/testuser/status/1234567890123456789",
    })))
    const data = await res.json()
    expect(data.code).not.toBe("INVALID_TWEET_URL")
  })

  it("accepts valid twitter.com tweet URL", async () => {
    const res = await POST(createRequest(validBody({
      tweet_url: "https://twitter.com/testuser/status/1234567890123456789",
    })))
    const data = await res.json()
    expect(data.code).not.toBe("INVALID_TWEET_URL")
  })

  it("rejects non-tweet URL", async () => {
    const res = await POST(createRequest(validBody({
      tweet_url: "https://google.com/search?q=test",
    })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_TWEET_URL")
  })

  it("rejects tweet from wrong handle", async () => {
    const res = await POST(createRequest(validBody({
      handle: "testuser",
      tweet_url: "https://x.com/otheruser/status/1234567890123456789",
    })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("TWEET_HANDLE_MISMATCH")
  })

  it("handles case-insensitive tweet URL matching", async () => {
    const res = await POST(createRequest(validBody({
      handle: "TestUser",
      tweet_url: "https://x.com/testuser/status/1234567890123456789",
    })))
    const data = await res.json()
    // Should NOT fail on handle mismatch
    expect(data.code).not.toBe("TWEET_HANDLE_MISMATCH")
  })

  // ================================================================
  // Sanitization
  // ================================================================

  it("strips HTML from inputs", async () => {
    const res = await POST(createRequest(validBody({
      handle: "<script>alert('xss')</script>testuser",
    })))
    // The handle after stripping HTML would be "alert('xss')testuser" which is invalid
    const data = await res.json()
    expect(data.code).toBe("INVALID_HANDLE")
  })

  // ================================================================
  // Rate Limiting
  // ================================================================

  it("enforces registration rate limits", async () => {
    // Registration is 10 per hour
    for (let i = 0; i < 10; i++) {
      await POST(createRequest(validBody()))
    }

    const res = await POST(createRequest(validBody()))
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.code).toBe("RATE_LIMITED")
  })

  // ================================================================
  // Non-string field types
  // ================================================================

  it("rejects numeric handle", async () => {
    const res = await POST(createRequest(validBody({ handle: 12345 })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_FIELD_TYPE")
  })
})
