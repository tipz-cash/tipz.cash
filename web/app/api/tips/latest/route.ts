import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/tips/latest?handle=<handle>
 *
 * Returns the most recent tip for a creator.
 * The `data` field is encrypted and must be decrypted client-side.
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
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("handle", handle.toLowerCase())
      .single()

    if (creatorError || !creator) {
      return NextResponse.json({ tip: null })
    }

    const { data: tip, error: txError } = await supabase
      .from("tipz")
      .select("id, created_at, status, source_platform, data")
      .eq("creator_id", creator.id)
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
    return NextResponse.json({ tip: null })
  }
}
