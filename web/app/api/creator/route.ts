import { NextRequest, NextResponse } from "next/server"
import { supabase, findCreatorByHandle } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get("platform")
  const handle = searchParams.get("handle")

  if (!platform || !handle) {
    return NextResponse.json({ error: "Missing platform or handle parameter" }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json({ found: false })
  }

  const { data, error } = await findCreatorByHandle(handle, {
    select: "id, platform, handle, shielded_address, avatar_url, public_key, is_og_cypherpunk, og_number",
    platform,
  })

  if (error || !data) {
    console.log("[creator] Lookup failed:", { platform, handle, error: error?.message })
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({
    found: true,
    creator: {
      id: data.id,
      platform: data.platform,
      handle: data.handle,
      shielded_address: data.shielded_address,
      avatar_url: data.avatar_url,
      public_key: data.public_key,
      is_og_cypherpunk: data.is_og_cypherpunk ?? false,
      og_number: data.og_number ?? null,
    },
  })
}
