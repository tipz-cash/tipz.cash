import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PREVIEW_SECRET = "tipz-preview-2026"
const PREVIEW_COOKIE = "tipz-preview"
const SESSION_COOKIE = "tipz_session"

// Set to true to enable coming-soon wall on the homepage
const COMING_SOON_ENABLED = true

// Routes accessible without preview cookie or session
const PUBLIC_ROUTES = [
  "/coming-soon",
  "/creators",
  "/manifesto",
  "/docs",
  "/register",
]

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Check for preview bypass via query param — set cookie and strip param
  if (searchParams.get("preview") === PREVIEW_SECRET) {
    const clean = new URL(pathname, request.url)
    const response = NextResponse.redirect(clean)
    response.cookies.set(PREVIEW_COOKIE, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  }

  // If coming-soon wall is disabled, allow everything
  if (!COMING_SOON_ENABLED) {
    return NextResponse.next()
  }

  // Preview cookie holders get full access
  if (request.cookies.get(PREVIEW_COOKIE)?.value === "true") {
    return NextResponse.next()
  }

  // Authenticated users (have a session) get full access
  if (request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.next()
  }

  // Creator profile pages (/:handle) are public
  if (pathname.match(/^\/[a-zA-Z0-9_]{1,15}$/) && pathname !== "/coming-soon") {
    return NextResponse.next()
  }

  // Public routes are always accessible
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next()
  }

  // Homepage and other protected routes → redirect to coming-soon
  return NextResponse.redirect(new URL("/coming-soon", request.url))
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api (API routes)
     * - /_next/static (static assets)
     * - /_next/image (image optimization)
     * - Static files (favicon, icons, fonts, images, manifests, sw)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|icon|apple-icon|logo\\.svg|og-image\\.png|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml|fonts|icons|zec).*)",
  ],
}
