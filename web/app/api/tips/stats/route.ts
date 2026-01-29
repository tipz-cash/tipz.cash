import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/tips/stats?handle=<handle>
 *
 * Returns aggregated revenue statistics for a creator by their handle.
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
    return NextResponse.json(
      { total_zec: "0", total_usd: "$0.00", tip_count: 0, last_tip_at: null }
    )
  }

  try {
    // First, look up the creator by handle
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("handle", handle.toLowerCase())
      .single()

    if (creatorError || !creator) {
      // No creator found - return empty stats
      return NextResponse.json({
        total_zec: "0",
        total_usd: "$0.00",
        tip_count: 0,
        last_tip_at: null,
      })
    }

    // Get aggregated stats from transactions
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("amount_zec, amount_usd, created_at")
      .eq("creator_id", creator.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })

    if (txError) {
      console.error("[tips/stats] Query error:", txError)
      return NextResponse.json({
        total_zec: "0",
        total_usd: "$0.00",
        tip_count: 0,
        last_tip_at: null,
      })
    }

    const txList = transactions || []

    // Calculate totals
    let totalZec = 0
    let totalUsd = 0

    for (const tx of txList) {
      totalZec += Number(tx.amount_zec) || 0
      totalUsd += Number(tx.amount_usd) || 0
    }

    const lastTipAt = txList.length > 0 ? txList[0].created_at : null

    return NextResponse.json({
      total_zec: totalZec.toFixed(8),
      total_usd: `$${totalUsd.toFixed(2)}`,
      tip_count: txList.length,
      last_tip_at: lastTipAt,
    })
  } catch (error) {
    console.error("[tips/stats] Error:", error)
    return NextResponse.json(
      { total_zec: "0", total_usd: "$0.00", tip_count: 0, last_tip_at: null }
    )
  }
}
