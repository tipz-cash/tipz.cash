import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, handles } = body

    if (!platform || !Array.isArray(handles)) {
      return NextResponse.json(
        { error: "Missing platform or handles array" },
        { status: 400 }
      )
    }

    if (handles.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 handles per request" },
        { status: 400 }
      )
    }

    const normalizedHandles = handles.map(normalizeHandle)

    const { data, error } = await supabase
      .from("creators")
      .select("id, platform, handle, handle_normalized, shielded_address")
      .eq("platform", platform)
      .in("handle_normalized", normalizedHandles)

    if (error) {
      console.error("Batch lookup error:", error)
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      )
    }

    // Build results map
    const results: Record<string, { found: boolean; creator?: any }> = {}

    for (const handle of handles) {
      const normalized = normalizeHandle(handle)
      const creator = data?.find((c) => c.handle_normalized === normalized)

      if (creator) {
        results[handle] = {
          found: true,
          creator: {
            id: creator.id,
            platform: creator.platform,
            handle: creator.handle,
            shielded_address: creator.shielded_address
          }
        }
      } else {
        results[handle] = { found: false }
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Batch lookup error:", error)
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
