import { NextRequest, NextResponse } from "next/server"
import { supabase, findCreatorByHandle } from "@/lib/supabase"

/**
 * GET /api/tips/stats?handle=<handle>
 *
 * Returns aggregated statistics for a creator by their handle.
 * Amounts are encrypted in the data column, so only tip_count and last_tip_at
 * are available server-side.
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
    return NextResponse.json({ tip_count: 0, last_tip_at: null })
  }

  try {
    const { data: creator, error: creatorError } = await findCreatorByHandle(handle)

    if (creatorError || !creator) {
      return NextResponse.json({ tip_count: 0, last_tip_at: null })
    }

    const { data: tips, error: txError } = await supabase
      .from("tipz")
      .select("created_at")
      .eq("creator_id", creator.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })

    if (txError) {
      console.error("[tips/stats] Query error:", txError)
      return NextResponse.json({ tip_count: 0, last_tip_at: null })
    }

    const tipList = tips || []

    return NextResponse.json({
      tip_count: tipList.length,
      last_tip_at: tipList.length > 0 ? tipList[0].created_at : null,
    })
  } catch (error) {
    console.error("[tips/stats] Error:", error)
    return NextResponse.json({ tip_count: 0, last_tip_at: null })
  }
}
