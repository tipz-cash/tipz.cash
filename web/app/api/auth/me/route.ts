import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/session"

/**
 * GET /api/auth/me
 *
 * Returns current session info, or { authenticated: false }.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({
    authenticated: true,
    handle: session.handle,
    creatorId: session.creatorId,
    registered: !!session.creatorId,
  })
}
