import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/tips/received?handle=<handle>&limit=<limit>
 *
 * Returns recent tips received by a creator.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get("handle")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  if (!handle) {
    return NextResponse.json(
      { error: "Missing handle parameter" },
      { status: 400 }
    )
  }

  if (!supabase) {
    return NextResponse.json({
      tips: [],
      total_zec: "0",
      total_count: 0,
    })
  }

  try {
    // First, look up the creator by handle
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("handle", handle.toLowerCase())
      .single()

    if (creatorError || !creator) {
      // No creator found - return empty
      return NextResponse.json({
        tips: [],
        total_zec: "0",
        total_count: 0,
      })
    }

    // Get recent transactions
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("id, amount_zec, amount_usd, sender_address, created_at, memo, metadata")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (txError) {
      console.error("[tips/received] Query error:", txError)
      return NextResponse.json({
        tips: [],
        total_zec: "0",
        total_count: 0,
      })
    }

    const txList = transactions || []

    // Map to response format
    const tips = txList.map((tx) => ({
      id: tx.id,
      amount: String(tx.amount_zec),
      from_address: tx.sender_address || undefined,
      created_at: tx.created_at,
      message: tx.memo || undefined,
    }))

    // Calculate total
    let totalZec = 0
    for (const tx of txList) {
      totalZec += Number(tx.amount_zec) || 0
    }

    return NextResponse.json({
      tips,
      total_zec: totalZec.toFixed(8),
      total_count: txList.length,
    })
  } catch (error) {
    console.error("[tips/received] Error:", error)
    return NextResponse.json({
      tips: [],
      total_zec: "0",
      total_count: 0,
    })
  }
}
