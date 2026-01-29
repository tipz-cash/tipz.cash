import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/tips/latest?handle=<handle>
 *
 * Returns the most recent tip for a creator (used by extension polling fallback).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get("handle")

  if (!handle) {
    return NextResponse.json(
      { error: "Missing handle parameter" },
      { status: 400 }
    )
  }

  if (!supabase) {
    return NextResponse.json({ tip: null })
  }

  try {
    // First, look up the creator by handle
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("handle", handle.toLowerCase())
      .single()

    if (creatorError || !creator) {
      return NextResponse.json({ tip: null })
    }

    // Get most recent transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("id, amount_zec, amount_usd, sender_address, created_at, memo")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (txError || !transaction) {
      return NextResponse.json({ tip: null })
    }

    return NextResponse.json({
      tip: {
        id: transaction.id,
        amount: String(transaction.amount_zec),
        from_address: transaction.sender_address || undefined,
        created_at: transaction.created_at,
        message: transaction.memo || undefined,
        recipient_handle: handle,
      },
    })
  } catch (error) {
    console.error("[tips/latest] Error:", error)
    return NextResponse.json({ tip: null })
  }
}
