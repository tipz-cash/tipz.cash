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
          avatar_url
        )
      `
      )
      .in("status", ["pending", "confirmed"])

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

    // Aggregate tip counts by handle
    const counts = new Map<string, { count: number; avatar_url?: string }>()
    for (const t of data) {
      const creator = t.creators as any
      const handle = creator.handle
      const existing = counts.get(handle)
      counts.set(handle, {
        count: (existing?.count || 0) + 1,
        avatar_url: existing?.avatar_url || creator.avatar_url,
      })
    }

    if (counts.size === 0) {
      return NextResponse.json(
        { leaderboard: [] } satisfies LeaderboardResponse,
        { headers: cacheHeaders }
      )
    }

    // Sort by tip count descending and take top N
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)

    const leaderboard: LeaderboardEntry[] = sorted.map(
      ([handle, { count: tip_count, avatar_url }], index) => ({
        rank: index + 1,
        handle,
        tip_count,
        tier: getTier(tip_count),
        avatar_url,
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
