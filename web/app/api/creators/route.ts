import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Demo creators - Zcash ecosystem + notable tech/crypto figures
// Shielded addresses must match those in /api/creator/route.ts
const DEMO_CREATORS = [
  { id: "demo-1", platform: "x", handle: "zooko", avatar_url: "https://unavatar.io/twitter/zooko", shielded_address: "zs1demo0zooko0000000000000000000000000000000000000000000000000000000000qk7zpv", created_at: "2025-01-15T00:00:00Z" },
  { id: "demo-2", platform: "x", handle: "ElectricCoinCo", avatar_url: "https://unavatar.io/twitter/ElectricCoinCo", shielded_address: "zs1demo0ecc000000000000000000000000000000000000000000000000000000000000mv8dqt", created_at: "2025-01-14T00:00:00Z" },
  { id: "demo-3", platform: "x", handle: "zcash", avatar_url: "https://unavatar.io/twitter/zcash", shielded_address: "zs1demo0zcash000000000000000000000000000000000000000000000000000000000y4v2rm", created_at: "2025-01-13T00:00:00Z" },
  { id: "demo-4", platform: "x", handle: "naval", avatar_url: "https://unavatar.io/twitter/naval", shielded_address: "zs1demo0naval000000000000000000000000000000000000000000000000000000009w5lzp", created_at: "2025-01-12T00:00:00Z" },
  { id: "demo-5", platform: "x", handle: "balajis", avatar_url: "https://unavatar.io/twitter/balajis", shielded_address: "zs1demo0balajis0000000000000000000000000000000000000000000000000000007cpyh9", created_at: "2025-01-11T00:00:00Z" },
  { id: "demo-6", platform: "x", handle: "ZcashFoundation", avatar_url: "https://unavatar.io/twitter/ZcashFoundation", shielded_address: "zs1demo0zfnd00000000000000000000000000000000000000000000000000000000003vkcns", created_at: "2025-01-10T00:00:00Z" },
  { id: "demo-7", platform: "x", handle: "ZecHub", avatar_url: "https://unavatar.io/twitter/ZecHub", shielded_address: "zs1demo0zechub00000000000000000000000000000000000000000000000000000000w8znlf", created_at: "2025-01-09T00:00:00Z" },
  { id: "demo-8", platform: "x", handle: "jswihart", avatar_url: "https://unavatar.io/twitter/jswihart", shielded_address: "zs1demo0jswihart000000000000000000000000000000000000000000000000000000qprjzl", created_at: "2025-01-08T00:00:00Z" },
  { id: "demo-9", platform: "x", handle: "mert", avatar_url: "https://unavatar.io/twitter/mert", shielded_address: "zs1demo0mert000000000000000000000000000000000000000000000000000000000u9jphx", created_at: "2025-01-07T00:00:00Z" },
  { id: "demo-10", platform: "x", handle: "cypherpunk", avatar_url: "https://unavatar.io/twitter/cypherpunk", shielded_address: "zs1demo0cypherpunk00000000000000000000000000000000000000000000000000005s42qt", created_at: "2025-01-06T00:00:00Z" },
  { id: "demo-11", platform: "x", handle: "sacha", avatar_url: "https://unavatar.io/twitter/sacha", shielded_address: "zs1demo0sacha00000000000000000000000000000000000000000000000000000000glqvnz", created_at: "2025-01-05T00:00:00Z" },
  { id: "demo-12", platform: "x", handle: "shieldedlabs", avatar_url: "https://unavatar.io/twitter/shieldedlabs", shielded_address: "zs1demo0shieldedlabs000000000000000000000000000000000000000000000000008wdjdl", created_at: "2025-01-04T00:00:00Z" },
]

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
}

function getDemoResponse(limit: number, offset: number, platform?: string | null) {
  let filtered = DEMO_CREATORS
  if (platform) {
    filtered = DEMO_CREATORS.filter(c => c.platform === platform)
  }
  const paged = filtered.slice(offset, offset + limit)
  return {
    creators: paged,
    total: filtered.length,
    limit,
    offset,
    hasMore: filtered.length > offset + limit,
    isDemo: true,
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")
  const platform = searchParams.get("platform") // optional filter
  const demoParam = searchParams.get("demo")

  // If demo=true is explicitly requested, return demo data
  if (demoParam === "true") {
    return NextResponse.json(getDemoResponse(limit, offset, platform), {
      headers: CACHE_HEADERS,
    })
  }

  // If Supabase not configured, return demo data
  if (!supabase) {
    return NextResponse.json(getDemoResponse(limit, offset, platform), {
      headers: CACHE_HEADERS,
    })
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
    // On database error, fall back to demo data
    return NextResponse.json(getDemoResponse(limit, offset, platform), {
      headers: CACHE_HEADERS,
    })
  }

  // If no real creators exist, return demo data
  if (!data || data.length === 0) {
    return NextResponse.json(getDemoResponse(limit, offset, platform), {
      headers: CACHE_HEADERS,
    })
  }

  return NextResponse.json(
    {
      creators: data,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
      isDemo: false,
    },
    { headers: CACHE_HEADERS }
  )
}
