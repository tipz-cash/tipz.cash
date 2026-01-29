import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Basic Auth middleware - protects the entire site with username/password
export function middleware(request: NextRequest) {
  // Skip auth if not configured (allows local dev without setup)
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return NextResponse.next();
  }

  // Check for basic auth header
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(":");

      if (user === username && pass === password) {
        return NextResponse.next();
      }
    }
  }

  // Return 401 with WWW-Authenticate header to trigger browser login prompt
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="TIPZ"',
    },
  });
}

// Apply to all routes except static files and API routes you want public
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc)
     * - opengraph-image, twitter-image, apple-icon (for social previews)
     * - api/og (dynamic OG images)
     * - api/tips (extension API - public for realtime)
     * - api/creator (extension API - public for lookups)
     * - api/zec-price (public price endpoint)
     */
    "/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|apple-icon|icon|api/og|api/tips|api/creator|api/zec-price|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
