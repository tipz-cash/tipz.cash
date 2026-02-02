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

// Demo activity using actual demo creators
const demoActivity: ActivityItem[] = [
  { creator_handle: "zooko", displayed_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { creator_handle: "naval", displayed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { creator_handle: "balajis", displayed_at: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { creator_handle: "zcash", displayed_at: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
  { creator_handle: "ZcashFoundation", displayed_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { creator_handle: "mert", displayed_at: new Date(Date.now() - 32 * 60 * 1000).toISOString() },
  { creator_handle: "shieldedlabs", displayed_at: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50)

  if (!supabase) {
    // Return demo data when Supabase is not configured
    return NextResponse.json({ activity: demoActivity.slice(0, limit), demo: true })
  }

  try {
    // Query confirmed transactions from the last 24 hours
    // Add random 2-10 minute delay to displayed_at for privacy
    const { data: transactions, error } = await supabase.rpc(
      "get_activity_feed",
      { feed_limit: limit }
    )

    if (error) {
      // If RPC doesn't exist, fall back to direct query
      if (error.code === "42883") {
        // Function does not exist - use fallback
        return await getFallbackActivity(limit)
      }
      console.error("[activity] Error:", error)
      return NextResponse.json({ activity: demoActivity.slice(0, limit), demo: true })
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ activity: demoActivity.slice(0, limit), demo: true })
    }

    const activity: ActivityItem[] = (transactions || []).map(
      (t: { creator_handle: string; displayed_at: string }) => ({
        creator_handle: t.creator_handle,
        displayed_at: t.displayed_at,
      })
    )

    return NextResponse.json({
      activity,
      demo: false,
    })
  } catch (error) {
    console.error("[activity] Error:", error)
    return NextResponse.json({ activity: demoActivity.slice(0, limit), demo: true })
  }
}

/**
 * Fallback query when RPC function doesn't exist.
 * Adds randomized delay in JavaScript instead of SQL.
 */
async function getFallbackActivity(limit: number) {
  if (!supabase) {
    return NextResponse.json({ activity: [] })
  }

  try {
    // Get confirmed transactions from last 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(
        `
        created_at,
        creator:creators!inner(handle, stealth_mode)
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

    // Filter out stealth mode creators and add randomized delay
    const activity: ActivityItem[] = (transactions || [])
      .filter((t: any) => !t.creator?.stealth_mode)
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

    return NextResponse.json({
      activity,
      demo: false,
    })
  } catch (error) {
    console.error("[activity] Fallback error:", error)
    return NextResponse.json({ activity: [] })
  }
}
