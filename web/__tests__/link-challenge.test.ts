import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  storeChallenge,
  verifyChallenge,
} from "@/app/api/link/challenge/route"

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
}))

vi.mock("@/lib/twitter-api", () => ({
  verifyTweetContent: vi.fn(),
  isTwitterApiConfigured: () => false,
}))

import { POST as challengeHandler } from "@/app/api/link/challenge/route"
import { POST as linkHandler } from "@/app/api/link/route"
import { clearAllRateLimits } from "@/lib/rate-limit"

function createRequest(body: Record<string, unknown>): any {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers({ "x-forwarded-for": "10.0.0.10" }),
  }
}

beforeEach(() => {
  clearAllRateLimits()
})

// ================================================================
// Challenge Generation
// ================================================================

describe("POST /api/link/challenge", () => {
  it("generates a challenge token", async () => {
    const res = await challengeHandler(createRequest({ handle: "testcreator" }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.challenge).toBeDefined()
    expect(data.challenge.length).toBe(64) // 32 bytes hex
    expect(data.expiresIn).toBe(300) // 5 minutes
  })

  it("rejects missing handle", async () => {
    const res = await challengeHandler(createRequest({}))
    expect(res.status).toBe(400)
  })
})

// ================================================================
// Challenge Verification (Unit)
// ================================================================

describe("storeChallenge / verifyChallenge", () => {
  it("verifies valid challenge", () => {
    storeChallenge("testuser", "token123")
    expect(verifyChallenge("testuser", "token123")).toBe(true)
  })

  it("consumes challenge on use (one-time)", () => {
    storeChallenge("testuser2", "token456")
    expect(verifyChallenge("testuser2", "token456")).toBe(true)
    // Second use should fail
    expect(verifyChallenge("testuser2", "token456")).toBe(false)
  })

  it("rejects wrong token", () => {
    storeChallenge("testuser3", "correct")
    expect(verifyChallenge("testuser3", "wrong")).toBe(false)
  })

  it("rejects unknown handle", () => {
    expect(verifyChallenge("nonexistent", "any")).toBe(false)
  })

  it("is case-insensitive on handle", () => {
    storeChallenge("TestUser", "abc")
    expect(verifyChallenge("testuser", "abc")).toBe(true)
  })
})

// ================================================================
// Link with Public Key
// ================================================================

describe("POST /api/link", () => {
  it("links without public key (basic link)", async () => {
    const res = await linkHandler(createRequest({ handle: "testcreator" }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.handle).toBe("testcreator")
    expect(data.verified).toBe(true)
    expect(data.messagingEnabled).toBe(false)
  })

  it("rejects public key upload without challenge", async () => {
    const res = await linkHandler(createRequest({
      handle: "testcreator",
      publicKey: { kty: "RSA", n: "abc", e: "AQAB" },
    }))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.code).toBe("CHALLENGE_REQUIRED")
  })

  it("rejects public key upload with invalid challenge", async () => {
    const res = await linkHandler(createRequest({
      handle: "testcreator",
      publicKey: { kty: "RSA", n: "abc", e: "AQAB" },
      challenge: "invalid-token",
    }))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.code).toBe("CHALLENGE_INVALID")
  })

  it("accepts public key upload with valid challenge", async () => {
    // Get a challenge first
    const chalRes = await challengeHandler(createRequest({ handle: "testcreator" }))
    const { challenge } = await chalRes.json()

    // Use it to link with public key
    const res = await linkHandler(createRequest({
      handle: "testcreator",
      publicKey: { kty: "RSA", n: "abc123", e: "AQAB" },
      challenge,
    }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.messagingEnabled).toBe(true)
  })

  it("rejects invalid RSA key format", async () => {
    // Get a challenge
    const chalRes = await challengeHandler(createRequest({ handle: "testcreator" }))
    const { challenge } = await chalRes.json()

    const res = await linkHandler(createRequest({
      handle: "testcreator",
      publicKey: { kty: "EC", crv: "P-256" }, // Not RSA
      challenge,
    }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain("Invalid public key")
  })

  it("rejects missing handle", async () => {
    const res = await linkHandler(createRequest({}))
    expect(res.status).toBe(400)
  })
})
