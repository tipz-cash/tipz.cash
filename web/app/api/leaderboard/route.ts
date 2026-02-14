import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/leaderboard?limit=3
 *
 * Returns privacy-preserving leaderboard based on tip count (not amounts).
 * - Ranks by activity (tip count), not wealth
 * - Only shows verified creators
 * - No amount information exposed
 */

export interface LeaderboardEntry {
  rank: number
  handle: string
  tip_count: number
  tier: "bronze" | "silver" | "gold" | "diamond"
  avatar_url?: string
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

function getTier(tipCount: number): LeaderboardEntry["tier"] {
  if (tipCount >= 200) return "diamond"
  if (tipCount >= 51) return "gold"
  if (tipCount >= 11) return "silver"
  return "bronze"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "3", 10), 10)

  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  }

  if (!supabase) {
    return NextResponse.json(
      { leaderboard: [] } satisfies LeaderboardResponse,
      { headers: cacheHeaders }
    )
  }

  try {
    // Optimized query: fetch only confirmed tipz with creator info
    // This is much faster than fetching all tipz per creator
    const { data, error } = await supabase
      .from("tipz")
      .select(
        `
        creator_id,
        creators!inner(
          handle,
          verification_status
        )
      `
      )
      .eq("status", "confirmed")
      .eq("creators.verification_status", "verified")

    if (error) {
      console.error("[leaderboard] Query error:", error)
      return NextResponse.json(
        { leaderboard: [] } satisfies LeaderboardResponse,
        { status: 503, headers: cacheHeaders }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { leaderboard: [] } satisfies LeaderboardResponse,
        { headers: cacheHeaders }
      )
    }

    const counts = new Map<string, number>()
    for (const t of data) {
      const creator = t.creators as any
      const handle = creator.handle
      counts.set(handle, (counts.get(handle) || 0) + 1)
    }

    if (counts.size === 0) {
      return NextResponse.json(
        { leaderboard: [] } satisfies LeaderboardResponse,
        { headers: cacheHeaders }
      )
    }

    // Sort by tip count descending and take top N
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    const leaderboard: LeaderboardEntry[] = sorted.map(
      ([handle, tip_count], index) => ({
        rank: index + 1,
        handle,
        tip_count,
        tier: getTier(tip_count),
      })
    )

    return NextResponse.json(
      { leaderboard } satisfies LeaderboardResponse,
      { headers: cacheHeaders }
    )
  } catch (error) {
    console.error("[leaderboard] Error:", error)
    return NextResponse.json(
      { leaderboard: [] } satisfies LeaderboardResponse,
      { status: 503, headers: cacheHeaders }
    )
  }
}
