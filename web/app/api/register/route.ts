import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle } from "@/lib/supabase"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIP,
  RATE_LIMITS
} from "@/lib/rate-limit"

/**
 * Zcash Shielded Address Validation
 *
 * Validates that the address:
 * - Starts with "zs" (Sapling shielded address prefix)
 * - Is exactly 78 characters in length
 * - Contains only valid Base58 characters (alphanumeric, excluding 0, O, I, l)
 *
 * Note: This is format validation only. It does not verify the address
 * exists on the blockchain or has valid cryptographic properties.
 */
function isValidShieldedAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false
  }

  // Shielded addresses must be exactly 78 characters
  if (address.length !== 78) {
    return false
  }

  // Must start with "zs" (Sapling shielded address prefix)
  if (!address.startsWith("zs")) {
    return false
  }

  // Validate Base58 character set (excludes 0, O, I, l to avoid confusion)
  // The remaining 76 characters after "zs" should be valid Base58
  const base58Regex = /^zs[1-9A-HJ-NP-Za-km-z]{76}$/
  return base58Regex.test(address)
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
 * Current implementation (Phase 1):
 * - Validates URL format
 * - Verifies handle matches
 * - Returns "pending" status for later API verification
 *
 * TODO: Phase 2 - Twitter API Integration
 * - Use Twitter API v2 to fetch tweet content
 * - Verify tweet contains required text (e.g., "TIPZ" or shielded address)
 * - Check tweet is not deleted
 * - Verify tweet timestamp is recent (within last 24 hours)
 * - Store verification proof (tweet content hash)
 *
 * TODO: Phase 3 - Enhanced Verification
 * - Add webhook for tweet deletion detection
 * - Implement periodic re-verification
 * - Add challenge-response verification option
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

  // Verify the tweet is from the handle being registered
  const expectedHandle = normalizeHandle(handle)

  if (parsed.handle !== expectedHandle) {
    return {
      valid: false,
      status: "failed",
      error: `Tweet must be from @${handle}. Found tweet from @${parsed.handle}`
    }
  }

  // TODO: Twitter API verification
  // When implementing, add the following checks:
  //
  // 1. Fetch tweet via Twitter API v2:
  //    GET /2/tweets/:id?expansions=author_id&tweet.fields=text,created_at
  //
  // 2. Verify author_id matches the handle's user_id
  //
  // 3. Check tweet text contains required content:
  //    - Must contain "TIPZ" or similar identifier
  //    - Optionally contain the shielded address (first/last 8 chars)
  //    - Example: "Registering for TIPZ tips! My address: zs1abc...xyz78"
  //
  // 4. Verify tweet is recent (created within last 24-48 hours)
  //
  // 5. Store verification metadata:
  //    - Tweet ID
  //    - Verification timestamp
  //    - Content hash for audit trail
  //
  // Example implementation:
  // const twitterApiKey = process.env.TWITTER_BEARER_TOKEN
  // if (twitterApiKey) {
  //   const response = await fetch(
  //     `https://api.twitter.com/2/tweets/${parsed.tweetId}?expansions=author_id&tweet.fields=text,created_at`,
  //     { headers: { Authorization: `Bearer ${twitterApiKey}` } }
  //   )
  //   const tweet = await response.json()
  //   // Verify content...
  // }

  // For now, return pending status - URL is valid but content not verified
  return {
    valid: true,
    status: "pending",
    tweetId: parsed.tweetId
  }
}

/**
 * Verify ownership by tweet.
 * Currently only X platform is supported.
 */
async function verifyOwnership(
  platform: string,
  verificationUrl: string,
  handle: string,
  shieldedAddress: string
): Promise<TweetVerificationResult> {
  if (platform === "x") {
    return verifyTweet(verificationUrl, handle, shieldedAddress)
  }

  return {
    valid: false,
    status: "failed",
    error: `Unsupported platform: ${platform}. Only X is currently supported.`
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers)
  const rateLimitResult = rateLimit(clientIP, RATE_LIMITS.registration)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many registration attempts. Please try again later.",
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult)
      }
    )
  }

  try {
    const body = await request.json()
    const { platform, handle, shielded_address, tweet_url } = body

    // Validate required fields
    if (!platform || !handle || !shielded_address || !tweet_url) {
      return NextResponse.json(
        { error: "Missing required fields: platform, handle, shielded_address, tweet_url" },
        {
          status: 400,
          headers: rateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Validate field types
    if (
      typeof platform !== "string" ||
      typeof handle !== "string" ||
      typeof shielded_address !== "string" ||
      typeof tweet_url !== "string"
    ) {
      return NextResponse.json(
        { error: "All fields must be strings" },
        {
          status: 400,
          headers: rateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Validate platform (X-only for now)
    const validPlatforms = ["x"] as const
    if (!validPlatforms.includes(platform as typeof validPlatforms[number])) {
      return NextResponse.json(
        { error: "Invalid platform. Only 'x' is currently supported." },
        {
          status: 400,
          headers: rateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Validate handle length and format
    const trimmedHandle = handle.trim()
    if (trimmedHandle.length === 0 || trimmedHandle.length > 50) {
      return NextResponse.json(
        { error: "Handle must be between 1 and 50 characters" },
        {
          status: 400,
          headers: rateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Validate shielded address
    if (!isValidShieldedAddress(shielded_address)) {
      return NextResponse.json(
        {
          error:
            "Invalid Zcash shielded address. Must start with 'zs', be 78 characters, and contain only valid Base58 characters"
        },
        {
          status: 400,
          headers: rateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Verify ownership via tweet or note depending on platform
    const verification = await verifyOwnership(
      platform,
      tweet_url,
      trimmedHandle,
      shielded_address
    )
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        {
          status: 400,
          headers: rateLimitHeaders(rateLimitResult)
        }
      )
    }

    const normalizedHandle = normalizeHandle(trimmedHandle)

    // Check if already registered
    const { data: existing } = await supabase
      .from("creators")
      .select("id")
      .eq("platform", platform)
      .eq("handle_normalized", normalizedHandle)
      .single()

    if (existing) {
      // Update existing registration
      const { error: updateError } = await supabase
        .from("creators")
        .update({
          handle: trimmedHandle,
          shielded_address,
          tweet_url,
          // TODO: Add verification_status field to track tweet verification state
          // verification_status: verification.status,
          // verified_at: verification.status === "verified" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)

      if (updateError) {
        console.error("Update error:", updateError)
        return NextResponse.json(
          { error: "Failed to update registration" },
          {
            status: 500,
            headers: rateLimitHeaders(rateLimitResult)
          }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: "Registration updated",
          verification_status: verification.status
        },
        { headers: rateLimitHeaders(rateLimitResult) }
      )
    }

    // Create new registration
    const { error: insertError } = await supabase
      .from("creators")
      .insert({
        platform,
        handle: trimmedHandle,
        handle_normalized: normalizedHandle,
        shielded_address,
        tweet_url
        // TODO: Add these fields when database schema is updated:
        // verification_status: verification.status,
        // tweet_id: verification.tweetId,
        // verified_at: null
      })

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to create registration" },
        {
          status: 500,
          headers: rateLimitHeaders(rateLimitResult)
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        verification_status: verification.status
      },
      { headers: rateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
