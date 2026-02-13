import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle, type Creator } from "@/lib/supabase"
import { verifyTwitterToken } from "@/lib/twitter-api"
import { getSessionFromRequest } from "@/lib/session"
import {
  rateLimit,
  rateLimitHeaders,
  getClientIP,
  RATE_LIMITS
} from "@/lib/rate-limit"

/**
 * POST /api/link
 *
 * Links a creator's extension and stores their public key for private messaging.
 *
 * SECURITY: This endpoint requires either:
 * 1. A valid Twitter OAuth access token (extension flow), OR
 * 2. A valid session cookie (web dashboard flow)
 *
 * Flow (extension):
 * 1. Extension authenticates user via Twitter OAuth
 * 2. Extension generates RSA key pair client-side, stores private key locally
 * 3. Extension calls this endpoint with the OAuth access token + public key
 * 4. Server verifies token with Twitter, derives handle, stores the public key
 *
 * Flow (web):
 * 1. User logs in via Twitter OAuth on tipz.cash/my
 * 2. Browser generates RSA key pair, stores private key in localStorage
 * 3. Browser calls this endpoint with the public key (session cookie authenticates)
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request.headers)
  const rateLimitResult = rateLimit(clientIP, RATE_LIMITS.link)
  const headers = rateLimitHeaders(rateLimitResult)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
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

  const { twitterAccessToken, publicKey } = body

  // Determine handle: session cookie OR Twitter access token
  let normalizedHandle: string

  if (twitterAccessToken && typeof twitterAccessToken === "string") {
    // Extension flow: verify Twitter OAuth token
    const tokenResult = await verifyTwitterToken(twitterAccessToken)
    if (!tokenResult.valid) {
      return NextResponse.json({
        error: "Invalid Twitter access token.",
        code: "TOKEN_INVALID"
      }, { status: 401, headers })
    }
    normalizedHandle = normalizeHandle(tokenResult.username)
  } else {
    // Web dashboard flow: check session cookie
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({
        error: "Authentication required.",
        code: "AUTH_REQUIRED"
      }, { status: 401, headers })
    }
    normalizedHandle = normalizeHandle(session.handle)
  }

  // Validate publicKey
  if (!publicKey || typeof publicKey !== "object") {
    return NextResponse.json({ error: "Public key is required" }, { status: 400, headers })
  }
  const key = publicKey as Record<string, unknown>
  if (key.kty !== "RSA" || typeof key.n !== "string" || typeof key.e !== "string") {
    return NextResponse.json({ error: "Invalid RSA public key" }, { status: 400, headers })
  }

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
    return NextResponse.json({ error: "Creator not found" }, { status: 404, headers })
  }

  const typedCreator = creator as Creator

  // Store public key in the database
  const { error: updateError } = await supabase
    .from("creators")
    .update({
      public_key: publicKey,
      key_created_at: new Date().toISOString(),
    })
    .eq("id", typedCreator.id)

  if (updateError) {
    console.error("[link] Failed to store public key:", updateError.message)
    return NextResponse.json({ error: "Failed to store key" }, { status: 500, headers })
  }

  console.log("[link] Public key stored for creator:", typedCreator.handle)

  return NextResponse.json({
    success: true,
    handle: typedCreator.handle,
    verified: typedCreator.verification_status === "verified",
  }, { headers })
}
