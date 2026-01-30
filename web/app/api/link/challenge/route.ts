import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle, type Creator } from "@/lib/supabase"
import { verifyTweetContent, isTwitterApiConfigured } from "@/lib/twitter-api"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIP,
  RATE_LIMITS
} from "@/lib/rate-limit"

/**
 * POST /api/link/challenge
 *
 * Generates a short-lived challenge token for linking an extension.
 * The challenge must be requested from the tipz.cash web app (verified via referrer)
 * and requires the creator's tweet to still be valid.
 *
 * Security:
 * - Challenge expires in 5 minutes
 * - One challenge per handle at a time (overwrites previous)
 * - Requires valid tweet verification
 */

// In-memory challenge store
// In production with multiple instances, use Redis
const challenges = new Map<string, { token: string; expiresAt: number }>()

// Challenge expiry: 5 minutes
const CHALLENGE_TTL_MS = 5 * 60 * 1000

/**
 * Generate a cryptographically secure challenge token
 */
function generateChallengeToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Store a challenge for a handle
 */
export function storeChallenge(handle: string, token: string): void {
  const normalizedHandle = normalizeHandle(handle)
  challenges.set(normalizedHandle, {
    token,
    expiresAt: Date.now() + CHALLENGE_TTL_MS
  })
}

/**
 * Verify and consume a challenge token
 * Returns true if valid, false otherwise
 */
export function verifyChallenge(handle: string, token: string): boolean {
  const normalizedHandle = normalizeHandle(handle)
  const challenge = challenges.get(normalizedHandle)

  if (!challenge) {
    return false
  }

  // Check expiry
  if (Date.now() > challenge.expiresAt) {
    challenges.delete(normalizedHandle)
    return false
  }

  // Check token
  if (challenge.token !== token) {
    return false
  }

  // Consume the challenge (one-time use)
  challenges.delete(normalizedHandle)
  return true
}

/**
 * Clean up expired challenges periodically
 */
function cleanupExpiredChallenges() {
  const now = Date.now()
  for (const [handle, challenge] of challenges.entries()) {
    if (now > challenge.expiresAt) {
      challenges.delete(handle)
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredChallenges, 60 * 1000)

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers)
  const rateLimitResult = rateLimit(clientIP, RATE_LIMITS.linkChallenge)
  const headers = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many challenge requests. Please try again later.",
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(rateLimitResult.retryAfter) }
      }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers })
  }

  const { handle } = body

  if (!handle || typeof handle !== "string") {
    return NextResponse.json({ error: "Handle is required" }, { status: 400, headers })
  }

  const normalizedHandle = normalizeHandle(handle)

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  // Look up the creator
  const { data: creator, error } = await supabase
    .from("creators")
    .select("*")
    .eq("handle_normalized", normalizedHandle)
    .single()

  if (error || !creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 })
  }

  const typedCreator = creator as Creator

  // If Twitter API is configured, verify the original tweet still exists
  if (isTwitterApiConfigured() && typedCreator.tweet_id) {
    const verification = await verifyTweetContent(
      typedCreator.tweet_id,
      typedCreator.handle,
      typedCreator.shielded_address
    )

    if (!verification.valid) {
      return NextResponse.json({
        error: "Original verification tweet not found or invalid. Please re-register.",
        code: "TWEET_INVALID"
      }, { status: 400 })
    }
  }

  // Generate and store challenge
  const token = generateChallengeToken()
  storeChallenge(normalizedHandle, token)

  return NextResponse.json({
    success: true,
    challenge: token,
    expiresIn: CHALLENGE_TTL_MS / 1000, // seconds
  })
}
