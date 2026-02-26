import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock supabase
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) })),
}))

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: (...args: any[]) => {
        // Count query: .select("id", { count: "exact", head: true })
        if (args[1]?.count === "exact") {
          return { eq: () => Promise.resolve({ count: 3, error: null }) }
        }
        return mockSelect(...args)
      },
      insert: mockInsert,
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  },
  normalizeHandle: (h: string) => h.toLowerCase().replace(/^@/, ""),
  findCreatorByHandle: vi.fn(),
}))

// Mock twitter API
vi.mock("@/lib/twitter-api", () => ({
  fetchUserProfileImage: vi.fn(() => Promise.resolve(null)),
}))

// Mock session — authenticated by default
const mockSession = vi.fn()
vi.mock("@/lib/session", () => ({
  getSessionFromRequest: (...args: unknown[]) => mockSession(...args),
  createSessionToken: vi.fn(() => Promise.resolve("mock-token")),
  setSessionCookie: vi.fn(),
}))

import { POST } from "@/app/api/register/route"
import { findCreatorByHandle } from "@/lib/supabase"

const VALID_U1 = "u1" + "q".repeat(139) // 141 chars, bech32m charset

function createRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "10.0.0.5" }),
    cookies: { get: () => ({ value: "mock-session-cookie" }) },
  }
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    shielded_address: VALID_U1,
    ...overrides,
  }
}

beforeEach(() => {
  mockSingle.mockReset()
  mockInsert.mockReset()
  mockUpdate.mockReset()
  mockSession.mockReset()

  // Default: authenticated session
  mockSession.mockResolvedValue({ handle: "testuser", creatorId: null })

  // Default: no existing registration
  vi.mocked(findCreatorByHandle).mockResolvedValue({
    data: null,
    error: { code: "PGRST116", message: "" },
  } as any)

  // Default: insert succeeds
  mockInsert.mockReturnValue({
    select: () => ({
      single: () => Promise.resolve({ data: { id: "new-id" }, error: null }),
    }),
  })
})

describe("POST /api/register", () => {
  // ================================================================
  // Authentication
  // ================================================================

  it("rejects unauthenticated requests", async () => {
    mockSession.mockResolvedValue(null)
    const res = await POST(createRequest(validBody()))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.code).toBe("NOT_AUTHENTICATED")
  })

  it("accepts authenticated requests", async () => {
    const res = await POST(createRequest(validBody()))
    const data = await res.json()
    expect(data.code).not.toBe("NOT_AUTHENTICATED")
  })

  // ================================================================
  // Input Validation
  // ================================================================

  it("rejects missing shielded_address", async () => {
    const res = await POST(createRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("MISSING_FIELDS")
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
    const res = await POST(
      createRequest(
        validBody({
          shielded_address: "t1SomeTransparentAddress12345678901234",
        })
      )
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_ADDRESS")
  })

  it("rejects ETH address", async () => {
    const res = await POST(
      createRequest(
        validBody({
          shielded_address: "0x1234567890abcdef1234567890abcdef12345678",
        })
      )
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_ADDRESS")
  })

  it("rejects too-short u1 address", async () => {
    const res = await POST(
      createRequest(
        validBody({
          shielded_address: "u1" + "q".repeat(50), // only 52 chars
        })
      )
    )
    expect(res.status).toBe(400)
  })

  // ================================================================
  // Sanitization
  // ================================================================

  it("strips HTML from address input", async () => {
    const res = await POST(
      createRequest(
        validBody({
          shielded_address: "<script>alert('xss')</script>" + VALID_U1,
        })
      )
    )
    // After stripping HTML, the address won't start with u1
    const data = await res.json()
    expect(data.code).toBe("INVALID_ADDRESS")
  })

  // ================================================================
  // Non-string field types
  // ================================================================

  it("rejects numeric shielded_address", async () => {
    const res = await POST(createRequest(validBody({ shielded_address: 12345 })))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe("INVALID_FIELD_TYPE")
  })
})
