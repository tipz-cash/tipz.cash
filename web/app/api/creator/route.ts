import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle } from "@/lib/supabase"

// Demo creators for testing without Supabase
const DEMO_CREATORS: Record<string, { handle: string; shielded_address: string }> = {
  jack: {
    handle: "jack",
    shielded_address: "zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9sly",
  },
  naval: {
    handle: "naval",
    shielded_address: "zs1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9rjv8v",
  },
  elonmusk: {
    handle: "elonmusk",
    shielded_address: "zs1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx8f6tg",
  },
  vitalikbuterin: {
    handle: "vitalikbuterin",
    shielded_address: "zs1yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy3k9mzs",
  },
  balajis: {
    handle: "balajis",
    shielded_address: "zs1zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz7lx4wn",
  },
}

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

  const normalizedHandle = handle.toLowerCase().replace(/^@/, "")

  // If Supabase is not configured, use demo creators
  if (!supabase) {
    const demoCreator = DEMO_CREATORS[normalizedHandle]
    if (demoCreator) {
      return NextResponse.json({
        found: true,
        demo: true,
        creator: {
          id: `demo_${normalizedHandle}`,
          platform: "x",
          handle: demoCreator.handle,
          shielded_address: demoCreator.shielded_address,
        },
      })
    }
    return NextResponse.json({ found: false })
  }

  // Use Supabase's normalizeHandle for production
  const dbNormalizedHandle = normalizeHandle(handle)

  const { data, error } = await supabase
    .from("creators")
    .select("id, platform, handle, shielded_address")
    .eq("platform", platform)
    .eq("handle_normalized", dbNormalizedHandle)
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
