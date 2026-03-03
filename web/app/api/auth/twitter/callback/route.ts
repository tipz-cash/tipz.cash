import { NextRequest, NextResponse } from "next/server"
import { supabase, findCreatorByHandle } from "@/lib/supabase"
import { createSessionToken, setSessionCookie } from "@/lib/session"

export const dynamic = "force-dynamic"

/**
 * GET /api/auth/twitter/callback?code=...&state=...
 *
 * Handles Twitter OAuth 2.0 PKCE callback.
 * Verifies state, exchanges code for access token, looks up creator, creates session.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const origin = new URL(request.url).origin

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/my?error=missing_params`)
  }

  // Read and verify state from cookie
  const oauthCookie = request.cookies.get("tipz_oauth_state")?.value
  if (!oauthCookie) {
    return NextResponse.redirect(`${origin}/my?error=expired`)
  }

  let stored: { codeVerifier: string; state: string }
  try {
    stored = JSON.parse(oauthCookie)
  } catch {
    return NextResponse.redirect(`${origin}/my?error=invalid_state`)
  }

  if (stored.state !== state) {
    return NextResponse.redirect(`${origin}/my?error=csrf`)
  }

  const clientId = process.env.TWITTER_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(`${origin}/my?error=not_configured`)
  }

  // Exchange code for access token
  const redirectUri = `${origin}/api/auth/twitter/callback`
  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: stored.codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    const tokenErr = await tokenRes.text()
    console.error("[auth/callback] Token exchange failed:", tokenRes.status, tokenErr)
    return NextResponse.redirect(`${origin}/my?error=token_exchange`)
  }

  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token

  // Get Twitter username
  const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userRes.ok) {
    const userErr = await userRes.text()
    console.error("[auth/callback] User lookup failed:", userRes.status, userErr)
    return NextResponse.redirect(`${origin}/my?error=user_lookup`)
  }

  const userData = await userRes.json()
  const username = userData.data?.username
  const profileImageUrl = userData.data?.profile_image_url
    ? userData.data.profile_image_url.replace("_normal", "_400x400")
    : null

  if (!username) {
    return NextResponse.redirect(`${origin}/my?error=no_username`)
  }

  // Look up creator in DB
  if (!supabase) {
    return NextResponse.redirect(`${origin}/my?error=db_unavailable`)
  }

  const { data: creator } = await findCreatorByHandle(username, {
    select: "id, handle",
  })

  if (creator) {
    // Registered creator — refresh avatar and create full session
    if (profileImageUrl) {
      await supabase.from("creators").update({ avatar_url: profileImageUrl }).eq("id", creator.id)
    }

    const token = await createSessionToken(creator.handle, creator.id)
    const response = NextResponse.redirect(`${origin}/my`)
    setSessionCookie(response, token)

    // Clear OAuth state cookie
    response.cookies.set("tipz_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    console.log("[auth/callback] Session created for registered creator:", creator.handle)
    return response
  }

  // Unregistered user — create pending session and redirect to register
  const token = await createSessionToken(username, null)
  const response = NextResponse.redirect(`${origin}/register`)
  setSessionCookie(response, token)

  // Clear OAuth state cookie
  response.cookies.set("tipz_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  console.log("[auth/callback] Pending session created for unregistered user:", username)
  return response
}
