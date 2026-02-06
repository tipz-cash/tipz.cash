import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/leaderboard?limit=3
 *
 * Returns privacy-preserving leaderboard based on tip count (not amounts).
 * - Ranks by activity (tip count), not wealth
 * - Excludes stealth_mode creators
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
  demo: boolean
}

// Demo data shown when no real data exists - uses actual demo creators
const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, handle: "zooko", tip_count: 1843, tier: "diamond", avatar_url: "https://unavatar.io/twitter/zooko" },
  { rank: 2, handle: "mert", tip_count: 1247, tier: "diamond", avatar_url: "https://unavatar.io/twitter/mert" },
  { rank: 3, handle: "naval", tip_count: 891, tier: "diamond", avatar_url: "https://unavatar.io/twitter/naval" },
]

function getTier(tipCount: number): LeaderboardEntry["tier"] {
  if (tipCount >= 200) return "diamond"
  if (tipCount >= 51) return "gold"
  if (tipCount >= 11) return "silver"
  return "bronze"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "3", 10), 10)

  if (!supabase) {
    // Return demo data when Supabase is not configured
    return NextResponse.json(
      {
        leaderboard: demoLeaderboard.slice(0, limit),
        demo: true,
      } satisfies LeaderboardResponse,
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  }

  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  }

  try {
    // Optimized query: fetch only confirmed transactions with creator info
    // This is much faster than fetching all transactions per creator
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        creator_id,
        creators!inner(
          handle,
          verification_status,
          stealth_mode
        )
      `
      )
      .eq("status", "confirmed")
      .eq("creators.verification_status", "verified")

    if (error) {
      console.error("[leaderboard] Query error:", error)
      return NextResponse.json(
        {
          leaderboard: demoLeaderboard.slice(0, limit),
          demo: true,
        } satisfies LeaderboardResponse,
        { headers: cacheHeaders }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          leaderboard: demoLeaderboard.slice(0, limit),
          demo: true,
        } satisfies LeaderboardResponse,
        { headers: cacheHeaders }
      )
    }

    // Filter stealth_mode in JS (Supabase doesn't support OR on foreign table in same query)
    // and aggregate tip counts by handle
    const counts = new Map<string, number>()
    for (const t of data) {
      const creator = t.creators as any
      // Skip stealth mode creators
      if (creator.stealth_mode === true) continue
      const handle = creator.handle
      counts.set(handle, (counts.get(handle) || 0) + 1)
    }

    if (counts.size === 0) {
      return NextResponse.json(
        {
          leaderboard: demoLeaderboard.slice(0, limit),
          demo: true,
        } satisfies LeaderboardResponse,
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
      {
        leaderboard,
        demo: false,
      } satisfies LeaderboardResponse,
      { headers: cacheHeaders }
    )
  } catch (error) {
    console.error("[leaderboard] Error:", error)
    return NextResponse.json(
      {
        leaderboard: demoLeaderboard.slice(0, limit),
        demo: true,
      } satisfies LeaderboardResponse,
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  }
}
