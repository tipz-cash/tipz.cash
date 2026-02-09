import { describe, it, expect, beforeEach } from "vitest"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIP,
  clearAllRateLimits,
  resetRateLimit,
  type RateLimitConfig,
} from "@/lib/rate-limit"

const TEST_CONFIG: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 3,
  name: "test",
}

beforeEach(() => {
  clearAllRateLimits()
})

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const r1 = rateLimit("ip-1", TEST_CONFIG)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = rateLimit("ip-1", TEST_CONFIG)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = rateLimit("ip-1", TEST_CONFIG)
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it("blocks requests exceeding limit", () => {
    rateLimit("ip-2", TEST_CONFIG)
    rateLimit("ip-2", TEST_CONFIG)
    rateLimit("ip-2", TEST_CONFIG)

    const r4 = rateLimit("ip-2", TEST_CONFIG)
    expect(r4.allowed).toBe(false)
    expect(r4.remaining).toBe(0)
    expect(r4.retryAfter).toBeGreaterThan(0)
  })

  it("tracks IPs independently", () => {
    rateLimit("ip-a", TEST_CONFIG)
    rateLimit("ip-a", TEST_CONFIG)
    rateLimit("ip-a", TEST_CONFIG)

    const resultA = rateLimit("ip-a", TEST_CONFIG)
    const resultB = rateLimit("ip-b", TEST_CONFIG)

    expect(resultA.allowed).toBe(false)
    expect(resultB.allowed).toBe(true)
  })

  it("includes correct limit in result", () => {
    const result = rateLimit("ip-x", TEST_CONFIG)
    expect(result.limit).toBe(3)
  })
})

describe("resetRateLimit", () => {
  it("resets a specific identifier", () => {
    rateLimit("ip-reset", TEST_CONFIG)
    rateLimit("ip-reset", TEST_CONFIG)
    rateLimit("ip-reset", TEST_CONFIG)

    const blocked = rateLimit("ip-reset", TEST_CONFIG)
    expect(blocked.allowed).toBe(false)

    resetRateLimit("ip-reset")

    const after = rateLimit("ip-reset", TEST_CONFIG)
    expect(after.allowed).toBe(true)
    expect(after.remaining).toBe(2)
  })
})

describe("rateLimitHeaders", () => {
  it("includes standard headers when allowed", () => {
    const result = rateLimit("ip-headers", TEST_CONFIG)
    const headers = rateLimitHeaders(result)

    expect(headers["X-RateLimit-Limit"]).toBe("3")
    expect(headers["X-RateLimit-Remaining"]).toBe("2")
    expect(headers["X-RateLimit-Reset"]).toBeDefined()
    expect(headers["Retry-After"]).toBeUndefined()
  })

  it("includes Retry-After when blocked", () => {
    rateLimit("ip-h2", TEST_CONFIG)
    rateLimit("ip-h2", TEST_CONFIG)
    rateLimit("ip-h2", TEST_CONFIG)
    const result = rateLimit("ip-h2", TEST_CONFIG)
    const headers = rateLimitHeaders(result)

    expect(headers["Retry-After"]).toBeDefined()
    expect(parseInt(headers["Retry-After"])).toBeGreaterThan(0)
  })
})

describe("getClientIP", () => {
  it("extracts from x-forwarded-for", () => {
    const headers = new Headers()
    headers.set("x-forwarded-for", "1.2.3.4, 5.6.7.8")
    expect(getClientIP(headers)).toBe("1.2.3.4")
  })

  it("extracts from x-real-ip", () => {
    const headers = new Headers()
    headers.set("x-real-ip", "10.0.0.1")
    expect(getClientIP(headers)).toBe("10.0.0.1")
  })

  it("extracts from cf-connecting-ip", () => {
    const headers = new Headers()
    headers.set("cf-connecting-ip", "192.168.1.1")
    expect(getClientIP(headers)).toBe("192.168.1.1")
  })

  it("returns 'unknown' when no IP headers", () => {
    const headers = new Headers()
    expect(getClientIP(headers)).toBe("unknown")
  })

  it("prefers x-forwarded-for over others", () => {
    const headers = new Headers()
    headers.set("x-forwarded-for", "1.1.1.1")
    headers.set("x-real-ip", "2.2.2.2")
    expect(getClientIP(headers)).toBe("1.1.1.1")
  })
})
