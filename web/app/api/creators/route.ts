import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")
  const platform = searchParams.get("platform") // optional filter

  // If Supabase not configured, return empty
  if (!supabase) {
    return NextResponse.json(
      {
        creators: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      },
      { headers: CACHE_HEADERS }
    )
  }

  // Build query
  let query = supabase
    .from("creators")
    .select("id, platform, handle, shielded_address, created_at", { count: "exact" })

  if (platform) {
    query = query.eq("platform", platform)
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Creators list error:", error)
    return NextResponse.json(
      {
        creators: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      },
      { status: 503, headers: CACHE_HEADERS }
    )
  }

  return NextResponse.json(
    {
      creators: data || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
    { headers: CACHE_HEADERS }
  )
}
