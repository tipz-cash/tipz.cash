import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle, type Creator } from "@/lib/supabase"
import { verifyTweetContent, isTwitterApiConfigured } from "@/lib/twitter-api"
import { verifyChallenge } from "./challenge/route"

/**
 * POST /api/link
 *
 * Links a creator's extension and generates a key pair for private messaging.
 *
 * SECURITY: This endpoint requires a valid challenge token from /api/link/challenge.
 * The challenge proves the request originated from the tipz.cash web app where the
 * creator verified ownership via tweet.
 *
 * Flow:
 * 1. Creator visits tipz.cash (already registered via tweet verification)
 * 2. Web app calls /api/link/challenge to get a short-lived token
 * 3. Extension calls this endpoint with the challenge token
 * 4. Server verifies challenge, generates RSA key pair, stores public key, returns private key
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { handle, challenge } = body

  if (!handle || typeof handle !== "string") {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 })
  }

  if (!challenge || typeof challenge !== "string") {
    return NextResponse.json({
      error: "Challenge token required. Request a challenge first.",
      code: "CHALLENGE_REQUIRED"
    }, { status: 401 })
  }

  // Verify challenge token
  if (!verifyChallenge(handle, challenge)) {
    return NextResponse.json({
      error: "Invalid or expired challenge token. Request a new challenge.",
      code: "CHALLENGE_INVALID"
    }, { status: 401 })
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

  // Generate RSA-OAEP 4096-bit key pair server-side
  const keyPair = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  )

  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey)
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey)

  // Store public key in the database
  const { error: updateError } = await supabase
    .from("creators")
    .update({
      public_key: publicKeyJwk,
      key_created_at: new Date().toISOString(),
    })
    .eq("id", typedCreator.id)

  if (updateError) {
    console.error("[link] Failed to store public key:", updateError.message)
    return NextResponse.json({ error: "Failed to store key" }, { status: 500 })
  }

  console.log("[link] Key pair generated for creator:", typedCreator.handle)

  // Return private key to the extension
  return NextResponse.json({
    success: true,
    handle: typedCreator.handle,
    verified: typedCreator.verification_status === "verified",
    privateKey: privateKeyJwk,
  })
}
