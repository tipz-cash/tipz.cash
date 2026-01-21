/**
 * Rate Limiting Module for TIPZ API
 *
 * Implements a simple in-memory sliding window rate limiter.
 *
 * NOTE: This is an in-memory implementation suitable for single-instance
 * deployments. For multi-instance deployments (e.g., Vercel serverless),
 * consider using Redis or Upstash for distributed rate limiting.
 *
 * Usage:
 * ```typescript
 * import { rateLimit, RateLimitConfig } from "@/lib/rate-limit"
 *
 * const config: RateLimitConfig = {
 *   windowMs: 60 * 1000, // 1 minute
 *   maxRequests: 10
 * }
 *
 * const result = rateLimit("user-ip-address", config)
 * if (!result.allowed) {
 *   return new Response("Too Many Requests", {
 *     status: 429,
 *     headers: { "Retry-After": String(result.retryAfter) }
 *   })
 * }
 * ```
 */

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum requests allowed within the window */
  maxRequests: number
  /** Optional identifier for the limiter (for logging) */
  name?: string
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of requests remaining in the current window */
  remaining: number
  /** When the rate limit resets (Unix timestamp in seconds) */
  resetTime: number
  /** Seconds until the client can retry (only set if not allowed) */
  retryAfter?: number
  /** Total requests allowed per window */
  limit: number
}

interface RequestRecord {
  /** Timestamps of requests within the current window */
  timestamps: number[]
}

/**
 * In-memory store for rate limit tracking.
 * Maps identifier (e.g., IP address) to request records.
 */
const store = new Map<string, RequestRecord>()

/**
 * Cleanup interval in milliseconds.
 * Removes expired entries to prevent memory leaks.
 */
const CLEANUP_INTERVAL_MS = 60 * 1000 // 1 minute

/**
 * Maximum age of entries to keep during cleanup.
 * Entries older than this are removed.
 */
const MAX_ENTRY_AGE_MS = 10 * 60 * 1000 // 10 minutes

let cleanupInterval: NodeJS.Timeout | null = null

/**
 * Start the cleanup interval if not already running.
 * Automatically cleans up expired rate limit entries.
 */
function ensureCleanupRunning(): void {
  if (cleanupInterval !== null) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    const cutoff = now - MAX_ENTRY_AGE_MS

    for (const [key, record] of store.entries()) {
      // Remove entries where all timestamps are expired
      const recentTimestamps = record.timestamps.filter(ts => ts > cutoff)

      if (recentTimestamps.length === 0) {
        store.delete(key)
      } else {
        record.timestamps = recentTimestamps
      }
    }
  }, CLEANUP_INTERVAL_MS)

  // Allow the process to exit even if interval is running
  cleanupInterval.unref()
}

/**
 * Check rate limit for a given identifier.
 *
 * @param identifier - Unique identifier for the client (typically IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanupRunning()

  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get or create record for this identifier
  let record = store.get(identifier)
  if (!record) {
    record = { timestamps: [] }
    store.set(identifier, record)
  }

  // Filter to only timestamps within the current window
  record.timestamps = record.timestamps.filter(ts => ts > windowStart)

  // Calculate reset time (end of current window)
  const oldestTimestamp = record.timestamps[0] || now
  const resetTime = Math.ceil((oldestTimestamp + config.windowMs) / 1000)

  // Check if limit exceeded
  if (record.timestamps.length >= config.maxRequests) {
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000)

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.max(1, retryAfter),
      limit: config.maxRequests
    }
  }

  // Request allowed - record timestamp
  record.timestamps.push(now)

  return {
    allowed: true,
    remaining: config.maxRequests - record.timestamps.length,
    resetTime,
    limit: config.maxRequests
  }
}

/**
 * Create rate limit response headers.
 *
 * @param result - Rate limit result
 * @returns Headers object with standard rate limit headers
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetTime)
  }

  if (result.retryAfter !== undefined) {
    headers["Retry-After"] = String(result.retryAfter)
  }

  return headers
}

/**
 * Get client IP address from request headers.
 * Handles various proxy configurations.
 *
 * @param headers - Request headers
 * @returns Client IP address or "unknown"
 */
export function getClientIP(headers: Headers): string {
  // Check common headers in order of reliability
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    // Take the first IP (original client)
    const ip = forwardedFor.split(",")[0].trim()
    if (ip) return ip
  }

  const realIP = headers.get("x-real-ip")
  if (realIP) return realIP

  const cfConnectingIP = headers.get("cf-connecting-ip")
  if (cfConnectingIP) return cfConnectingIP

  return "unknown"
}

/**
 * Reset rate limit for a specific identifier.
 * Useful for testing or administrative purposes.
 *
 * @param identifier - Identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier)
}

/**
 * Clear all rate limit records.
 * Useful for testing or administrative purposes.
 */
export function clearAllRateLimits(): void {
  store.clear()
}

// Pre-configured rate limit configs for common use cases
export const RATE_LIMITS = {
  /** Registration endpoint: 10 requests per hour per IP */
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    name: "registration"
  } as RateLimitConfig,

  /** Single lookup: 100 requests per minute per IP */
  lookup: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    name: "lookup"
  } as RateLimitConfig,

  /** Batch lookup: 10 requests per minute per IP */
  batchLookup: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    name: "batch-lookup"
  } as RateLimitConfig
} as const
