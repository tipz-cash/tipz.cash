import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * POST /api/messages/relay
 *
 * Blind Relay Endpoint for encrypted messages.
 *
 * Security guarantees:
 * - Content blindness: Server receives encrypted blob, cannot decrypt
 * - Sender blindness: No IP logging on message content
 * - Minimal logging: Only timestamp + delivery status (NO content, NO IP)
 *
 * The server never has access to the private key, so it cannot read messages.
 */

interface RelayRequest {
  depositAddress: string  // NEAR Intents deposit address (identifies tip)
  encryptedBlob: string   // Base64-encoded encrypted message
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitStore.get(ip) || []

  // Remove old timestamps
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)

  if (recent.length >= RATE_LIMIT_MAX) {
    return true
  }

  // Add current request
  recent.push(now)
  rateLimitStore.set(ip, recent)

  return false
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting only (NOT logged with message)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      )
    }

    // Parse request body
    let body: RelayRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      )
    }

    const { depositAddress, encryptedBlob } = body

    // 1. Validate required fields
    if (!depositAddress || !encryptedBlob) {
      return NextResponse.json(
        { error: "Missing depositAddress or encryptedBlob" },
        { status: 400 }
      )
    }

    // 2. Validate blob size (prevent abuse)
    if (encryptedBlob.length > 10000) {
      return NextResponse.json(
        { error: "Message too large" },
        { status: 413 }
      )
    }

    // 3. Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    // 4. Look up creator by deposit address
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("creator_id")
      .eq("deposit_address", depositAddress)
      .single()

    if (txError || !transaction) {
      return NextResponse.json(
        { error: "Unknown deposit address" },
        { status: 404 }
      )
    }

    // 5. Get creator details
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, handle, public_key")
      .eq("id", transaction.creator_id)
      .single()

    if (creatorError || !creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      )
    }

    // 6. Verify creator has public key (can receive messages)
    if (!creator.public_key) {
      return NextResponse.json(
        { error: "Creator cannot receive messages" },
        { status: 400 }
      )
    }

    // 7. Push to creator's Realtime channel
    const channel = supabase.channel(`messages:${creator.id}`)
    await channel.send({
      type: "broadcast",
      event: "new_message",
      payload: {
        depositAddress,
        encryptedBlob,
        receivedAt: Date.now(),
      },
    })

    // 8. Log delivery to message_deliveries table (metadata only)
    await supabase
      .from("message_deliveries")
      .insert({
        creator_id: creator.id,
        deposit_address: depositAddress,
      })

    // 9. Log ONLY delivery metadata (NO content, NO sender info)
    // DO NOT log: encryptedBlob, IP address, user agent
    console.log(JSON.stringify({
      event: "message_relayed",
      timestamp: Date.now(),
      creatorId: creator.id,    // OK to log (public)
      depositAddress,            // OK to log (public from blockchain)
      delivered: true,
    }))

    return NextResponse.json({
      success: true,
      delivered: true,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[relay] Error:", message)
    return NextResponse.json(
      { error: "Relay failed" },
      { status: 500 }
    )
  }
}
