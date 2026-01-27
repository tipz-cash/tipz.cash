import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle, type Creator } from "@/lib/supabase"
import { verifyTweetContent, isTwitterApiConfigured } from "@/lib/twitter-api"

/**
 * POST /api/link
 *
 * Re-links a returning creator's extension by verifying their original tweet still exists.
 * Sets up the localStorage bridge for the extension to read.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { handle } = body

  if (!handle || typeof handle !== "string") {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 })
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

  // Return success - the frontend will set localStorage
  return NextResponse.json({
    success: true,
    handle: typedCreator.handle,
    verified: typedCreator.verification_status === "verified"
  })
}
