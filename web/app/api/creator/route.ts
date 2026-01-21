import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get("platform")
  const handle = searchParams.get("handle")

  if (!platform || !handle) {
    return NextResponse.json(
      { error: "Missing platform or handle parameter" },
      { status: 400 }
    )
  }

  const normalizedHandle = normalizeHandle(handle)

  const { data, error } = await supabase
    .from("creators")
    .select("id, platform, handle, shielded_address")
    .eq("platform", platform)
    .eq("handle_normalized", normalizedHandle)
    .single()

  if (error || !data) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({
    found: true,
    creator: {
      id: data.id,
      platform: data.platform,
      handle: data.handle,
      shielded_address: data.shielded_address
    }
  })
}
