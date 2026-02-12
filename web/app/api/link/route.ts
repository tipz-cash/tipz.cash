import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle, type Creator } from "@/lib/supabase"
import { verifyTwitterToken } from "@/lib/twitter-api"
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
 * SECURITY: This endpoint requires a valid Twitter OAuth access token.
 * The server verifies the token by calling Twitter's /2/users/me endpoint,
 * which proves the caller actually owns the Twitter account.
 *
 * Flow:
 * 1. Extension authenticates user via Twitter OAuth
 * 2. Extension generates RSA key pair client-side, stores private key locally
 * 3. Extension calls this endpoint with the OAuth access token + public key
 * 4. Server verifies token with Twitter, derives handle, stores the public key
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

  if (!twitterAccessToken || typeof twitterAccessToken !== "string") {
    return NextResponse.json({
      error: "Twitter access token is required.",
      code: "TOKEN_REQUIRED"
    }, { status: 401, headers })
  }

  // Verify Twitter OAuth token
  const tokenResult = await verifyTwitterToken(twitterAccessToken)

  if (!tokenResult.valid) {
    return NextResponse.json({
      error: "Invalid Twitter access token.",
      code: "TOKEN_INVALID"
    }, { status: 401, headers })
  }

  // Validate publicKey
  if (!publicKey || typeof publicKey !== "object") {
    return NextResponse.json({ error: "Public key is required" }, { status: 400, headers })
  }
  const key = publicKey as Record<string, unknown>
  if (key.kty !== "RSA" || typeof key.n !== "string" || typeof key.e !== "string") {
    return NextResponse.json({ error: "Invalid RSA public key" }, { status: 400, headers })
  }

  const normalizedHandle = normalizeHandle(tokenResult.username)

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
