import { describe, it, expect } from "vitest"
import {
  isValidShieldedAddress,
  isValidDestinationChain,
  generateIntentId,
  formatIntentId,
  parseNearError,
  estimateCompletionTime,
} from "@/lib/near"

// ============================================================================
// ZEC Address Validation
// ============================================================================

describe("isValidShieldedAddress", () => {
  it("accepts valid unified address (u1...)", () => {
    // u1 addresses are at least 78 chars
    const addr = "u1" + "a".repeat(139)
    expect(isValidShieldedAddress(addr)).toBe(true)
  })

  it("rejects zs1 (Sapling) addresses", () => {
    const addr = "zs1" + "a".repeat(75)
    expect(isValidShieldedAddress(addr)).toBe(false)
  })

  it("rejects too-short unified address", () => {
    const addr = "u1" + "a".repeat(10)
    expect(isValidShieldedAddress(addr)).toBe(false)
  })

  it("rejects transparent addresses (t1...)", () => {
    expect(isValidShieldedAddress("t1" + "a".repeat(33))).toBe(false)
  })

  it("rejects ETH addresses", () => {
    expect(isValidShieldedAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(isValidShieldedAddress("")).toBe(false)
  })

  it("rejects null/undefined", () => {
    expect(isValidShieldedAddress(null as any)).toBe(false)
    expect(isValidShieldedAddress(undefined as any)).toBe(false)
  })
})

// ============================================================================
// Destination Chain Validation
// ============================================================================

describe("isValidDestinationChain", () => {
  it("accepts ZEC variants", () => {
    expect(isValidDestinationChain("ZEC")).toBe(true)
    expect(isValidDestinationChain("ZCASH")).toBe(true)
    expect(isValidDestinationChain("zec")).toBe(true)
    expect(isValidDestinationChain("zcash")).toBe(true)
  })

  it("rejects other chains", () => {
    expect(isValidDestinationChain("ETH")).toBe(false)
    expect(isValidDestinationChain("BTC")).toBe(false)
    expect(isValidDestinationChain("SOL")).toBe(false)
  })
})

// ============================================================================
// Intent ID Generation
// ============================================================================

describe("generateIntentId", () => {
  it("generates unique IDs", () => {
    const id1 = generateIntentId()
    const id2 = generateIntentId()
    expect(id1).not.toBe(id2)
  })

  it("starts with intent_ prefix", () => {
    const id = generateIntentId()
    expect(id.startsWith("intent_")).toBe(true)
  })
})

describe("formatIntentId", () => {
  it("shortens long IDs", () => {
    const longId = "intent_m5abc123_xyz789def"
    const formatted = formatIntentId(longId)
    expect(formatted.length).toBeLessThan(longId.length)
    expect(formatted).toContain("...")
  })

  it("returns short IDs unchanged", () => {
    const shortId = "intent_abc"
    expect(formatIntentId(shortId)).toBe(shortId)
  })

  it("handles empty string", () => {
    expect(formatIntentId("")).toBe("")
  })
})

// ============================================================================
// Error Parsing
// ============================================================================

describe("parseNearError", () => {
  it("parses insufficient funds", () => {
    expect(parseNearError(new Error("insufficient_funds"))).toBe(
      "Insufficient funds for transaction"
    )
  })

  it("parses expired deadline", () => {
    expect(parseNearError(new Error("deadline_exceeded"))).toBe("Intent expired. Please try again.")
  })

  it("parses no solver", () => {
    expect(parseNearError(new Error("no_solver available"))).toBe(
      "No solver available. Please try later."
    )
  })

  it("parses invalid address", () => {
    expect(parseNearError(new Error("invalid_address format"))).toBe("Invalid destination address")
  })

  it("parses rate limit", () => {
    expect(parseNearError(new Error("rate_limit exceeded"))).toBe(
      "Too many requests. Please wait and try again."
    )
  })

  it("returns original message for unknown errors", () => {
    expect(parseNearError(new Error("something weird"))).toBe("something weird")
  })

  it("handles non-Error objects", () => {
    expect(parseNearError("string error")).toBe("An unknown error occurred")
    expect(parseNearError(42)).toBe("An unknown error occurred")
  })
})

// ============================================================================
// Completion Time Estimation
// ============================================================================

describe("estimateCompletionTime", () => {
  it("returns a positive number", () => {
    const time = estimateCompletionTime("ZEC")
    expect(time).toBeGreaterThan(0)
  })

  it("adds extra time for ZEC", () => {
    // Run multiple times to check ZEC is consistently >= 4 minutes (240000ms)
    for (let i = 0; i < 10; i++) {
      const time = estimateCompletionTime("ZEC")
      expect(time).toBeGreaterThanOrEqual(240000)
    }
  })
})
