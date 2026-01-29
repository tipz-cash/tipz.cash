import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle } from "@/lib/supabase"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIP,
  RATE_LIMITS
} from "@/lib/rate-limit"
import {
  verifyTweetContent,
  isTwitterApiConfigured
} from "@/lib/twitter-api"

/**
 * Error codes for registration API responses.
 * Used for programmatic error handling by clients.
 */
export const ERROR_CODES = {
  RATE_LIMITED: "RATE_LIMITED",
  INVALID_JSON: "INVALID_JSON",
  MISSING_FIELDS: "MISSING_FIELDS",
  INVALID_FIELD_TYPE: "INVALID_FIELD_TYPE",
  INVALID_PLATFORM: "INVALID_PLATFORM",
  INVALID_HANDLE: "INVALID_HANDLE",
  INVALID_ADDRESS: "INVALID_ADDRESS",
  INVALID_TWEET_URL: "INVALID_TWEET_URL",
  TWEET_HANDLE_MISMATCH: "TWEET_HANDLE_MISMATCH",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR"
} as const

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Structured error response type.
 */
interface ErrorResponse {
  error: string
  code: ErrorCode
  details?: Record<string, string>
  retryAfter?: number
}

/**
 * Create a standardized error response.
 */
function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  headers: Record<string, string>,
  details?: Record<string, string>
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = { error: message, code }
  if (details) {
    body.details = details
  }
  return NextResponse.json(body, { status, headers })
}

/**
 * Sanitize string input to prevent XSS and control characters.
 * Removes HTML tags, control characters, and normalizes whitespace.
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars (except \t, \n, \r)
    .trim()
}

/**
 * Validate Twitter/X handle format.
 * Must be 1-15 alphanumeric characters or underscores.
 */
function isValidTwitterHandle(handle: string): boolean {
  // Remove @ prefix if present
  const cleanHandle = handle.replace(/^@/, "")
  return /^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)
}

/**
 * Zcash Shielded Address Validation
 *
 * Validates that the address is a valid Zcash shielded address:
 * - Sapling addresses: start with "zs1", exactly 78 characters
 * - Unified addresses: start with "u1", 141+ characters
 * - Uses Bech32/Bech32m encoding
 *
 * Note: This is format validation only. It does not verify the address
 * exists on the blockchain or has valid cryptographic properties.
 */
function isValidShieldedAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false
  }

  // Unified addresses start with 'u1' (141+ characters, variable length)
  if (address.startsWith("u1")) {
    // Basic format check - Bech32m character set
    const bech32mRegex = /^u1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/
    return address.length >= 141 && bech32mRegex.test(address)
  }

  // Sapling shielded addresses start with 'zs1' (exactly 78 characters)
  if (address.startsWith("zs1")) {
    // Bech32 character set (excludes 1, b, i, o)
    const bech32Regex = /^zs1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{75}$/
    return address.length === 78 && bech32Regex.test(address)
  }

  return false
}

/**
 * Tweet Verification Status
 *
 * Tracks the verification state of a registration tweet.
 * Used internally for processing and stored for audit purposes.
 */
export type TweetVerificationStatus =
  | "pending"       // Initial state, URL validated but content not verified
  | "verified"      // Tweet content verified via API
  | "failed"        // Verification attempted but failed
  | "manual_review" // Flagged for manual review

export interface TweetVerificationResult {
  valid: boolean
  status: TweetVerificationStatus
  error?: string
  tweetId?: string
  verifiedAt?: string
}

/**
 * Extract and validate tweet URL components.
 *
 * Validates:
 * - URL format matches Twitter/X status URL pattern
 * - Protocol is HTTPS
 * - Domain is x.com or twitter.com
 * - Path contains valid handle and status ID
 * - Status ID is a valid numeric string (Twitter IDs are large integers)
 *
 * @param url - The tweet URL to parse
 * @returns Parsed components or null if invalid
 */
function parseTweetUrl(url: string): {
  domain: string
  handle: string
  tweetId: string
} | null {
  if (!url || typeof url !== "string") {
    return null
  }

  // Trim whitespace and ensure lowercase for domain matching
  const trimmedUrl = url.trim()

  // Strict URL pattern for Twitter/X status URLs
  // Captures: domain (x.com or twitter.com), handle, and tweet ID
  const tweetPattern =
    /^https:\/\/(x\.com|twitter\.com)\/([a-zA-Z0-9_]{1,15})\/status\/(\d{1,20})(?:\?.*)?$/i

  const match = trimmedUrl.match(tweetPattern)

  if (!match) {
    return null
  }

  const [, domain, handle, tweetId] = match

  // Validate tweet ID is a reasonable Twitter ID (minimum 7 digits for older tweets)
  // Twitter IDs are snowflake IDs, typically 18-19 digits for recent tweets
  if (tweetId.length < 7 || tweetId.length > 20) {
    return null
  }

  // Ensure handle follows Twitter handle rules (1-15 alphanumeric or underscore)
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
    return null
  }

  return {
    domain: domain.toLowerCase(),
    handle: handle.toLowerCase(),
    tweetId
  }
}

/**
 * Verify tweet ownership and content.
 *
 * Implementation:
 * 1. Validates URL format
 * 2. Verifies handle matches URL path
 * 3. If Twitter API is configured, verifies tweet content:
 *    - Tweet exists and is not deleted
 *    - Author matches expected handle
 *    - Contains "TIPZ" keyword
 *    - Contains shielded address (or first/last 8 chars)
 *    - Posted within 48 hours
 *
 * @param tweetUrl - Full URL to the verification tweet
 * @param handle - The handle being registered
 * @param shieldedAddress - The shielded address being registered
 * @returns Verification result with status and metadata
 */
async function verifyTweet(
  tweetUrl: string,
  handle: string,
  shieldedAddress: string
): Promise<TweetVerificationResult> {
  // Parse and validate URL structure
  const parsed = parseTweetUrl(tweetUrl)

  if (!parsed) {
    return {
      valid: false,
      status: "failed",
      error:
        "Invalid tweet URL format. Expected: https://x.com/{handle}/status/{id}"
    }
  }

  // Verify the tweet is from the handle being registered (URL path check)
  const expectedHandle = normalizeHandle(handle)

  if (parsed.handle !== expectedHandle) {
    return {
      valid: false,
      status: "failed",
      error: `Tweet must be from @${handle}. Found tweet from @${parsed.handle}`
    }
  }

  // If Twitter API is configured, verify tweet content
  if (isTwitterApiConfigured()) {
    console.log("[register] Twitter API configured, verifying tweet content")

    const apiResult = await verifyTweetContent(
      parsed.tweetId,
      handle,
      shieldedAddress
    )

    return {
      valid: apiResult.valid,
      status: apiResult.status,
      tweetId: parsed.tweetId,
      error: apiResult.error,
      verifiedAt: apiResult.status === "verified" ? new Date().toISOString() : undefined
    }
  }

  // Twitter API not configured - return pending status for manual review
  console.log("[register] Twitter API not configured, returning pending status")
  return {
    valid: true,
    status: "pending",
    tweetId: parsed.tweetId
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers)
  const rateLimitResult = rateLimit(clientIP, RATE_LIMITS.registration)
  const headers = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many registration attempts. Please try again later.",
        code: ERROR_CODES.RATE_LIMITED,
        retryAfter: rateLimitResult.retryAfter
      } satisfies ErrorResponse,
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(rateLimitResult.retryAfter) }
      }
    )
  }

  // Parse request body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return createErrorResponse(
      "Invalid JSON in request body",
      ERROR_CODES.INVALID_JSON,
      400,
      headers
    )
  }

  const { platform, handle, shielded_address, tweet_url } = body

  // Validate required fields
  const missingFields: string[] = []
  if (!platform) missingFields.push("platform")
  if (!handle) missingFields.push("handle")
  if (!shielded_address) missingFields.push("shielded_address")
  if (!tweet_url) missingFields.push("tweet_url")

  if (missingFields.length > 0) {
    return createErrorResponse(
      `Missing required fields: ${missingFields.join(", ")}`,
      ERROR_CODES.MISSING_FIELDS,
      400,
      headers,
      { missing: missingFields.join(", ") }
    )
  }

  // Validate field types
  const invalidTypes: string[] = []
  if (typeof platform !== "string") invalidTypes.push("platform")
  if (typeof handle !== "string") invalidTypes.push("handle")
  if (typeof shielded_address !== "string") invalidTypes.push("shielded_address")
  if (typeof tweet_url !== "string") invalidTypes.push("tweet_url")

  if (invalidTypes.length > 0) {
    return createErrorResponse(
      `Invalid field types. Expected strings for: ${invalidTypes.join(", ")}`,
      ERROR_CODES.INVALID_FIELD_TYPE,
      400,
      headers,
      { invalid_fields: invalidTypes.join(", ") }
    )
  }

  // Sanitize inputs (type assertion safe after validation above)
  const sanitizedPlatform = sanitizeInput(platform as string).toLowerCase()
  const sanitizedHandle = sanitizeInput(handle as string)
  const sanitizedAddress = sanitizeInput(shielded_address as string)
  const sanitizedTweetUrl = sanitizeInput(tweet_url as string)

  // Validate platform - only X (Twitter) is supported
  if (sanitizedPlatform !== "x") {
    return createErrorResponse(
      "Invalid platform. Only X (Twitter) is supported.",
      ERROR_CODES.INVALID_PLATFORM,
      400,
      headers,
      { provided: sanitizedPlatform, supported: "x" }
    )
  }

  // Validate X handle
  if (!isValidTwitterHandle(sanitizedHandle)) {
    return createErrorResponse(
      "Invalid X/Twitter handle. Must be 1-15 alphanumeric characters or underscores.",
      ERROR_CODES.INVALID_HANDLE,
      400,
      headers
    )
  }

  // Validate shielded address
  if (!isValidShieldedAddress(sanitizedAddress)) {
    return createErrorResponse(
      "Invalid Zcash shielded address. Must be a Sapling (zs1..., 78 chars) or Unified (u1..., 141+ chars) address",
      ERROR_CODES.INVALID_ADDRESS,
      400,
      headers,
      { provided_length: String(sanitizedAddress.length) }
    )
  }

  // Verify tweet ownership
  const tweetVerification = await verifyTweet(
    sanitizedTweetUrl,
    sanitizedHandle,
    sanitizedAddress
  )

  if (!tweetVerification.valid) {
    const errorCode = tweetVerification.error?.includes("Tweet must be from")
      ? ERROR_CODES.TWEET_HANDLE_MISMATCH
      : ERROR_CODES.INVALID_TWEET_URL

    return createErrorResponse(
      tweetVerification.error || "Invalid tweet URL",
      errorCode,
      400,
      headers
    )
  }

    const normalizedHandle = normalizeHandle(sanitizedHandle)

    // If Supabase is not configured, return an error
    if (!supabase) {
      return createErrorResponse(
        "Database not configured. Please contact support.",
        ERROR_CODES.DATABASE_ERROR,
        503,
        headers
      )
    }

    // Check if already registered
    let existing: { id: string } | null = null
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("id")
        .eq("platform", sanitizedPlatform)
        .eq("handle_normalized", normalizedHandle)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = row not found, which is expected for new registrations
        console.error("[register] Database query error:", error)
        return createErrorResponse(
          "Database error while checking registration",
          ERROR_CODES.DATABASE_ERROR,
          500,
          headers
        )
      }

      existing = data
    } catch (error) {
      console.error("[register] Unexpected database error:", error)
      return createErrorResponse(
        "Unexpected database error",
        ERROR_CODES.DATABASE_ERROR,
        500,
        headers
      )
    }

    if (existing) {
      // Update existing registration
      const { error: updateError } = await supabase
        .from("creators")
        .update({
          handle: sanitizedHandle,
          shielded_address: sanitizedAddress,
          tweet_url: sanitizedTweetUrl,
          verification_status: tweetVerification.status,
          tweet_id: tweetVerification.tweetId,
          verified_at: tweetVerification.verifiedAt || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)

      if (updateError) {
        console.error("[register] Update error:", updateError)
        return createErrorResponse(
          "Failed to update registration. Please try again.",
          ERROR_CODES.DATABASE_ERROR,
          500,
          headers
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: "Registration updated",
          verification_status: tweetVerification.status,
          handle: sanitizedHandle,
          platform: sanitizedPlatform
        },
        { status: 200, headers }
      )
    }

    // Create new registration
    const { error: insertError } = await supabase
      .from("creators")
      .insert({
        platform: sanitizedPlatform,
        handle: sanitizedHandle,
        handle_normalized: normalizedHandle,
        shielded_address: sanitizedAddress,
        tweet_url: sanitizedTweetUrl,
        verification_status: tweetVerification.status,
        tweet_id: tweetVerification.tweetId,
        verified_at: tweetVerification.verifiedAt || null
      })

    if (insertError) {
      console.error("[register] Insert error:", insertError)

      // Check for unique constraint violation (duplicate registration race condition)
      if (insertError.code === "23505") {
        return createErrorResponse(
          "This handle is already registered. Please update your existing registration instead.",
          ERROR_CODES.DATABASE_ERROR,
          409,
          headers
        )
      }

      return createErrorResponse(
        "Failed to create registration. Please try again.",
        ERROR_CODES.DATABASE_ERROR,
        500,
        headers
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        verification_status: tweetVerification.status,
        handle: sanitizedHandle,
        platform: sanitizedPlatform
      },
      { status: 201, headers }
    )
}
