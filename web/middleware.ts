import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PREVIEW_SECRET = 'tipz-preview-2026'
const PREVIEW_COOKIE = 'tipz-preview'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Check for preview bypass via query param — set cookie and strip param
  if (searchParams.get('preview') === PREVIEW_SECRET) {
    const clean = new URL(pathname, request.url)
    const response = NextResponse.redirect(clean)
    response.cookies.set(PREVIEW_COOKIE, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  }

  // If preview cookie exists, allow full site access
  if (request.cookies.get(PREVIEW_COOKIE)?.value === 'true') {
    return NextResponse.next()
  }

  // /coming-soon itself should always render
  if (pathname === '/coming-soon') {
    return NextResponse.next()
  }

  // Everything else → redirect to coming-soon
  return NextResponse.redirect(new URL('/coming-soon', request.url))
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
    '/((?!api|_next/static|_next/image|favicon\\.ico|icon|apple-icon|logo\\.svg|og-image\\.png|manifest\\.json|sw\\.js|robots\\.txt|sitemap\\.xml|fonts|icons|zec).*)',
  ],
}
