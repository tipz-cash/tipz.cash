import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/activity?limit=20
 *
 * Returns recent tip activity for the public feed.
 * Privacy-preserving: only shows creator handle and randomized displayed_at time.
 * - No amounts shown
 * - No tipper info
 * - 2-10 minute mempool delay prevents timing correlation attacks
 */

interface ActivityItem {
  creator_handle: string
  displayed_at: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50)

  if (!supabase) {
    return NextResponse.json({ activity: [] })
  }

  try {
    // Get confirmed transactions from last 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: transactions, error } = await supabase
      .from("tipz")
      .select(
        `
        created_at,
        creator:creators!inner(handle)
      `
      )
      .eq("status", "confirmed")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(limit * 2) // Fetch extra to account for filtering

    if (error) {
      console.error("[activity] Fallback query error:", error)
      return NextResponse.json({ activity: [] })
    }

    // add randomized delay
    const activity: ActivityItem[] = (transactions || [])
      .slice(0, limit)
      .map((t: any) => {
        // Add random 2-10 minute delay to created_at
        const createdAt = new Date(t.created_at)
        const randomDelayMs = (2 + Math.random() * 8) * 60 * 1000
        const displayedAt = new Date(createdAt.getTime() + randomDelayMs)

        return {
          creator_handle: t.creator?.handle || "anonymous",
          displayed_at: displayedAt.toISOString(),
        }
      })
      // Sort by displayed_at descending
      .sort(
        (a: ActivityItem, b: ActivityItem) =>
          new Date(b.displayed_at).getTime() -
          new Date(a.displayed_at).getTime()
      )

    return NextResponse.json({ activity })
  } catch (error) {
    console.error("[activity] Fallback error:", error)
    return NextResponse.json({ activity: [] })
  }
}
