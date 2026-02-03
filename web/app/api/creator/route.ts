import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle } from "@/lib/supabase"

// Demo creators for testing without Supabase
// These must match the creators in /api/creators/route.ts
const DEMO_CREATORS: Record<string, { handle: string; shielded_address: string; avatar_url: string }> = {
  zooko: {
    handle: "zooko",
    shielded_address: "zs1demo0zooko0000000000000000000000000000000000000000000000000000000000qk7zpv",
    avatar_url: "https://unavatar.io/twitter/zooko",
  },
  electriccoinco: {
    handle: "ElectricCoinCo",
    shielded_address: "zs1demo0ecc000000000000000000000000000000000000000000000000000000000000mv8dqt",
    avatar_url: "https://unavatar.io/twitter/ElectricCoinCo",
  },
  zcash: {
    handle: "zcash",
    shielded_address: "zs1demo0zcash000000000000000000000000000000000000000000000000000000000y4v2rm",
    avatar_url: "https://unavatar.io/twitter/zcash",
  },
  naval: {
    handle: "naval",
    shielded_address: "zs1demo0naval000000000000000000000000000000000000000000000000000000009w5lzp",
    avatar_url: "https://unavatar.io/twitter/naval",
  },
  balajis: {
    handle: "balajis",
    shielded_address: "zs1demo0balajis0000000000000000000000000000000000000000000000000000007cpyh9",
    avatar_url: "https://unavatar.io/twitter/balajis",
  },
  zcashfoundation: {
    handle: "ZcashFoundation",
    shielded_address: "zs1demo0zfnd00000000000000000000000000000000000000000000000000000000003vkcns",
    avatar_url: "https://unavatar.io/twitter/ZcashFoundation",
  },
  zechub: {
    handle: "ZecHub",
    shielded_address: "zs1demo0zechub00000000000000000000000000000000000000000000000000000000w8znlf",
    avatar_url: "https://unavatar.io/twitter/ZecHub",
  },
  jswihart: {
    handle: "jswihart",
    shielded_address: "zs1demo0jswihart000000000000000000000000000000000000000000000000000000qprjzl",
    avatar_url: "https://unavatar.io/twitter/jswihart",
  },
  mert: {
    handle: "mert",
    shielded_address: "zs1demo0mert000000000000000000000000000000000000000000000000000000000u9jphx",
    avatar_url: "https://unavatar.io/twitter/mikifreyr",
  },
  cypherpunk: {
    handle: "cypherpunk",
    shielded_address: "zs1demo0cypherpunk00000000000000000000000000000000000000000000000000005s42qt",
    avatar_url: "https://unavatar.io/twitter/caborhea",
  },
  sacha: {
    handle: "sacha",
    shielded_address: "zs1demo0sacha00000000000000000000000000000000000000000000000000000000glqvnz",
    avatar_url: "https://unavatar.io/twitter/sachatremblay",
  },
  shieldedlabs: {
    handle: "shieldedlabs",
    shielded_address: "zs1demo0shieldedlabs000000000000000000000000000000000000000000000000008wdjdl",
    avatar_url: "https://unavatar.io/twitter/shaborhea",
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
          avatar_url: demoCreator.avatar_url,
        },
      })
    }
    return NextResponse.json({ found: false })
    return NextResponse.json({ found: false })
  }

  // Lookup by handle (already normalized to lowercase)
  const { data, error } = await supabase
    .from("creators")
    .select("id, platform, handle, shielded_address")
    .eq("platform", platform)
    .eq("handle", normalizedHandle)
    .single()

  if (error || !data) {
    console.log("[creator] Lookup failed:", { platform, normalizedHandle, error: error?.message })
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({
    found: true,
    creator: {
      id: data.id,
      platform: data.platform,
      handle: data.handle,
      shielded_address: data.shielded_address,
    }
  })
}
