import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock supabase with a working creator
const mockCreator = {
  id: "creator-123",
  handle: "testcreator",
  handle_normalized: "testcreator",
  shielded_address: "u1" + "q".repeat(139),
  tweet_id: "1234567890",
  verification_status: "verified",
}

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockCreator, error: null }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  },
  normalizeHandle: (h: string) => h.toLowerCase().replace(/^@/, ""),
  findCreatorByHandle: () => Promise.resolve({ data: mockCreator, error: null }),
}))

vi.mock("@/lib/twitter-api", () => ({
  verifyTwitterToken: vi.fn(),
}))

import { POST as linkHandler } from "@/app/api/link/route"
import { clearAllRateLimits } from "@/lib/rate-limit"
import { verifyTwitterToken } from "@/lib/twitter-api"

const mockVerifyTwitterToken = vi.mocked(verifyTwitterToken)

function createRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "10.0.0.10" }),
    cookies: { get: () => undefined },
  }
}

beforeEach(() => {
  clearAllRateLimits()
  vi.clearAllMocks()
})

// 4096-bit (512-byte) modulus in base64url for test fixtures
const VALID_4096_MODULUS =
  "q6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6s"

describe("POST /api/link", () => {
  it("links with valid token and valid public key", async () => {
    mockVerifyTwitterToken.mockResolvedValue({ valid: true, username: "testcreator" })

    const res = await linkHandler(
      createRequest({
        twitterAccessToken: "valid-oauth-token",
        publicKey: { kty: "RSA", n: VALID_4096_MODULUS, e: "AQAB" },
      })
    )
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.handle).toBe("testcreator")
    expect(data.verified).toBe(true)
  })

  it("rejects invalid Twitter token", async () => {
    mockVerifyTwitterToken.mockResolvedValue({ valid: false })

    const res = await linkHandler(
      createRequest({
        twitterAccessToken: "bad-token",
        publicKey: { kty: "RSA", n: "abc", e: "AQAB" },
      })
    )
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.code).toBe("TOKEN_INVALID")
  })

  it("rejects missing public key", async () => {
    mockVerifyTwitterToken.mockResolvedValue({ valid: true, username: "testcreator" })

    const res = await linkHandler(
      createRequest({
        twitterAccessToken: "valid-oauth-token",
      })
    )

    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain("Public key is required")
  })

  it("rejects invalid RSA key format", async () => {
    mockVerifyTwitterToken.mockResolvedValue({ valid: true, username: "testcreator" })

    const res = await linkHandler(
      createRequest({
        twitterAccessToken: "valid-oauth-token",
        publicKey: { kty: "EC", crv: "P-256" },
      })
    )

    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain("Invalid RSA public key")
  })

  it("rejects missing Twitter access token", async () => {
    const res = await linkHandler(
      createRequest({
        publicKey: { kty: "RSA", n: "abc", e: "AQAB" },
      })
    )

    expect(res.status).toBe(401)
    expect((await res.json()).code).toBe("AUTH_REQUIRED")
  })

  it("rejects RSA key smaller than 4096 bits", async () => {
    mockVerifyTwitterToken.mockResolvedValue({ valid: true, username: "testcreator" })

    // 2048-bit (256-byte) modulus — too small
    const weakModulus =
      "q6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6urq6s"
    const res = await linkHandler(
      createRequest({
        twitterAccessToken: "valid-oauth-token",
        publicKey: { kty: "RSA", n: weakModulus, e: "AQAB" },
      })
    )
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toContain("RSA key too small")
  })
})
