import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/auth/twitter
 *
 * Initiates Twitter OAuth 2.0 PKCE flow.
 * Generates code_verifier/challenge, stores in httpOnly cookie,
 * then redirects to Twitter's authorize endpoint.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(new URL("/my?error=not_configured", request.url))
  }

  // Generate PKCE code_verifier (43-128 chars, URL-safe)
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32))
  const codeVerifier = base64UrlEncode(verifierBytes)

  // Generate code_challenge (S256)
  const challengeBytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  )
  const codeChallenge = base64UrlEncode(new Uint8Array(challengeBytes))

  // CSRF state
  const stateBytes = crypto.getRandomValues(new Uint8Array(16))
  const state = base64UrlEncode(stateBytes)

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/auth/twitter/callback`

  const authUrl = new URL("https://twitter.com/i/oauth2/authorize")
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("scope", "tweet.read users.read")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("code_challenge", codeChallenge)
  authUrl.searchParams.set("code_challenge_method", "S256")

  const response = NextResponse.redirect(authUrl.toString())

  // Store verifier + state in httpOnly cookie (10 min TTL)
  response.cookies.set("tipz_oauth_state", JSON.stringify({ codeVerifier, state }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  return response
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
