import { NextRequest, NextResponse } from "next/server"
import { supabase, findCreatorByHandle } from "@/lib/supabase"
import { getSessionFromRequest } from "@/lib/session"

/**
 * GET /api/tips/received?handle=<handle>&limit=<limit>
 *
 * Returns recent tips received by a creator.
 * Requires authentication — only returns tips for the logged-in user's handle.
 * The `data` field on each tip is encrypted and must be decrypted client-side.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ tips: [], total_count: 0 })
  }

  const { searchParams } = new URL(request.url)
  const handle = searchParams.get("handle")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  if (!handle) {
    return NextResponse.json(
      { error: "Missing handle parameter" },
      { status: 400 }
    )
  }

  // Only allow fetching tips for the authenticated user's own handle
  if (handle.toLowerCase().replace(/^@/, "") !== session.handle.toLowerCase().replace(/^@/, "")) {
    return NextResponse.json({ tips: [], total_count: 0 })
  }

  if (!supabase) {
    return NextResponse.json({ tips: [], total_count: 0 })
  }

  try {
    const { data: creator, error: creatorError } = await findCreatorByHandle(handle)

    if (creatorError || !creator) {
      return NextResponse.json({ tips: [], total_count: 0 })
    }

    const { data: tips, error: txError } = await supabase
      .from("tipz")
      .select("id, created_at, status, source_platform, data, amount_zec, amount_usd")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (txError) {
      console.error("[tips/received] Query error:", txError)
      return NextResponse.json({ tips: [], total_count: 0 })
    }

    const tipList = (tips || []).map((tip) => ({
      id: tip.id,
      created_at: tip.created_at,
      status: tip.status,
      source_platform: tip.source_platform,
      data: tip.data,
      amount_zec: tip.amount_zec ? Number(tip.amount_zec) : null,
      amount_usd: tip.amount_usd ? Number(tip.amount_usd) : null,
    }))

    return NextResponse.json({
      tips: tipList,
      total_count: tipList.length,
    })
  } catch (error) {
    console.error("[tips/received] Error:", error)
    return NextResponse.json({ tips: [], total_count: 0 })
  }
}
