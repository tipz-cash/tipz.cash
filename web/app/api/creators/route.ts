import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Demo creators for client demos and when no real creators exist
const DEMO_CREATORS = [
  { id: "demo-1", platform: "x", handle: "jack", shielded_address: "zs1demo..." },
  { id: "demo-2", platform: "x", handle: "elonmusk", shielded_address: "zs1demo..." },
  { id: "demo-3", platform: "x", handle: "naval", shielded_address: "zs1demo..." },
  { id: "demo-4", platform: "x", handle: "balajis", shielded_address: "zs1demo..." },
  { id: "demo-5", platform: "x", handle: "VitalikButerin", shielded_address: "zs1demo..." },
  { id: "demo-6", platform: "x", handle: "zolotor", shielded_address: "zs1demo..." },
  { id: "demo-7", platform: "substack", handle: "gwern", shielded_address: "zs1demo..." },
  { id: "demo-8", platform: "x", handle: "punk6529", shielded_address: "zs1demo..." },
  { id: "demo-9", platform: "x", handle: "zcaboramas", shielded_address: "zs1demo..." },
  { id: "demo-10", platform: "x", handle: "electriccoin", shielded_address: "zs1demo..." },
  { id: "demo-11", platform: "substack", handle: "molly0xfff", shielded_address: "zs1demo..." },
  { id: "demo-12", platform: "x", handle: "MessariCrypto", shielded_address: "zs1demo..." },
]

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
    return NextResponse.json(getDemoResponse(limit, offset, platform))
  }

  // If Supabase not configured, return demo data
  if (!supabase) {
    return NextResponse.json(getDemoResponse(limit, offset, platform))
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
    return NextResponse.json(getDemoResponse(limit, offset, platform))
  }

  // If no real creators exist, return demo data
  if (!data || data.length === 0) {
    return NextResponse.json(getDemoResponse(limit, offset, platform))
  }

  return NextResponse.json({
    creators: data,
    total: count || 0,
    limit,
    offset,
    hasMore: (count || 0) > offset + limit,
    isDemo: false,
  })
}
