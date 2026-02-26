import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
}

const TOTAL_SPOTS = 100

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { total: TOTAL_SPOTS, claimed: 0, remaining: TOTAL_SPOTS },
      { headers: CACHE_HEADERS }
    )
  }

  const { count, error } = await supabase
    .from("creators")
    .select("id", { count: "exact", head: true })
    .eq("is_og_cypherpunk", true)

  if (error) {
    console.error("[og-spots] Count error:", error)
    return NextResponse.json(
      { total: TOTAL_SPOTS, claimed: 0, remaining: TOTAL_SPOTS },
      { status: 503, headers: CACHE_HEADERS }
    )
  }

  const claimed = count ?? 0

  return NextResponse.json(
    { total: TOTAL_SPOTS, claimed, remaining: TOTAL_SPOTS - claimed },
    { headers: CACHE_HEADERS }
  )
}
