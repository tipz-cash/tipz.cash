import { NextRequest, NextResponse } from "next/server"
import { supabase, findCreatorByHandle } from "@/lib/supabase"

/**
 * GET /api/tips/latest?handle=<handle>
 * GET /api/tips/latest?creator_id=<uuid>&since=<iso>
 *
 * When `since` is provided, returns all tips after that timestamp as `{ tips: [...] }`.
 * Otherwise returns the single most recent tip as `{ tip: ... }`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get("handle")
  const creatorIdParam = searchParams.get("creator_id")
  const since = searchParams.get("since")

  if (!handle && !creatorIdParam) {
    return NextResponse.json(
      { error: "Missing handle or creator_id parameter" },
      { status: 400 }
    )
  }

  if (!supabase) {
    return NextResponse.json(since ? { tips: [] } : { tip: null })
  }

  try {
    let creatorId = creatorIdParam

    // If only handle provided, look up creator_id
    if (!creatorId && handle) {
      const { data: creator, error: creatorError } = await findCreatorByHandle(handle)

      if (creatorError || !creator) {
        return NextResponse.json(since ? { tips: [] } : { tip: null })
      }
      creatorId = creator.id
    }

    // Since param: return array of tips after that timestamp
    if (since) {
      const { data: tips, error: txError } = await supabase
        .from("tipz")
        .select("id, created_at, status, source_platform, data, creator_id")
        .eq("creator_id", creatorId!)
        .gt("created_at", since)
        .order("created_at", { ascending: false })

      if (txError || !tips) {
        return NextResponse.json({ tips: [] })
      }

      return NextResponse.json({ tips })
    }

    // No since: return single latest tip
    const { data: tip, error: txError } = await supabase
      .from("tipz")
      .select("id, created_at, status, source_platform, data")
      .eq("creator_id", creatorId!)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (txError || !tip) {
      return NextResponse.json({ tip: null })
    }

    return NextResponse.json({
      tip: {
        id: tip.id,
        created_at: tip.created_at,
        status: tip.status,
        source_platform: tip.source_platform,
        data: tip.data,
      },
    })
  } catch (error) {
    console.error("[tips/latest] Error:", error)
    return NextResponse.json(since ? { tips: [] } : { tip: null })
  }
}
