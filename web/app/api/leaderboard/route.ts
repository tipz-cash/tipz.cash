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
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  demo: boolean
}

// Demo data shown when no real data exists
const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, handle: "privacy_advocate", tip_count: 247, tier: "diamond" },
  { rank: 2, handle: "crypto_builder", tip_count: 89, tier: "gold" },
  { rank: 3, handle: "anon_writer", tip_count: 34, tier: "silver" },
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
    return NextResponse.json({
      leaderboard: demoLeaderboard.slice(0, limit),
      demo: true,
    } satisfies LeaderboardResponse)
  }

  try {
    // Query creators with tip counts, excluding stealth mode and unverified
    const { data, error } = await supabase
      .from("creators")
      .select(
        `
        handle,
        verification_status,
        stealth_mode,
        transactions!inner(id, status)
      `
      )
      .eq("verification_status", "verified")
      .or("stealth_mode.is.null,stealth_mode.eq.false")

    if (error) {
      console.error("[leaderboard] Query error:", error)
      // Return demo data on error
      return NextResponse.json({
        leaderboard: demoLeaderboard.slice(0, limit),
        demo: true,
      } satisfies LeaderboardResponse)
    }

    if (!data || data.length === 0) {
      // Return demo data when no creators exist
      return NextResponse.json({
        leaderboard: demoLeaderboard.slice(0, limit),
        demo: true,
      } satisfies LeaderboardResponse)
    }

    // Count confirmed tips per creator and sort
    const creatorsWithCounts = data
      .map((creator: any) => {
        const confirmedTips = (creator.transactions || []).filter(
          (t: any) => t.status === "confirmed"
        )
        return {
          handle: creator.handle,
          tip_count: confirmedTips.length,
        }
      })
      .filter((c) => c.tip_count > 0)
      .sort((a, b) => b.tip_count - a.tip_count)
      .slice(0, limit)

    if (creatorsWithCounts.length === 0) {
      // Return demo data when no tips exist
      return NextResponse.json({
        leaderboard: demoLeaderboard.slice(0, limit),
        demo: true,
      } satisfies LeaderboardResponse)
    }

    const leaderboard: LeaderboardEntry[] = creatorsWithCounts.map(
      (creator, index) => ({
        rank: index + 1,
        handle: creator.handle,
        tip_count: creator.tip_count,
        tier: getTier(creator.tip_count),
      })
    )

    return NextResponse.json({
      leaderboard,
      demo: false,
    } satisfies LeaderboardResponse)
  } catch (error) {
    console.error("[leaderboard] Error:", error)
    return NextResponse.json({
      leaderboard: demoLeaderboard.slice(0, limit),
      demo: true,
    } satisfies LeaderboardResponse)
  }
}
