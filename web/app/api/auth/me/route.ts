import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/session"

export const dynamic = "force-dynamic"

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
} as const

/**
 * GET /api/auth/me
 *
 * Returns current session info, or { authenticated: false }.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ authenticated: false }, { headers: NO_CACHE_HEADERS })
  }

  return NextResponse.json(
    {
      authenticated: true,
      handle: session.handle,
      creatorId: session.creatorId,
      registered: !!session.creatorId,
    },
    { headers: NO_CACHE_HEADERS }
  )
}
