/**
 * Twitter API v2 — OAuth token verification and profile image fetching.
 *
 * Used by:
 * - /api/link (verifyTwitterToken)
 * - /api/health (isTwitterApiConfigured)
 * - /api/register (fetchUserProfileImage)
 */

const TWITTER_API_BASE = "https://api.twitter.com/2"

interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
}

export type TwitterTokenResult = {
  valid: true
  username: string
} | {
  valid: false
}

/**
 * Verify a user's Twitter OAuth access token by calling /2/users/me.
 * This uses the user's own OAuth token (not the server's bearer token).
 */
export async function verifyTwitterToken(accessToken: string): Promise<TwitterTokenResult> {
  try {
    const response = await fetch(`${TWITTER_API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return { valid: false }
    }

    const body = (await response.json()) as { data?: { username?: string } }
    const username = body.data?.username

    if (!username) {
      return { valid: false }
    }

    return { valid: true, username }
  } catch {
    return { valid: false }
  }
}

/**
 * Get the Twitter Bearer Token from environment
 */
function getTwitterBearerToken(): string | null {
  return process.env.TWITTER_BEARER_TOKEN || null
}

/**
 * Check if Twitter API is configured
 */
export function isTwitterApiConfigured(): boolean {
  return !!getTwitterBearerToken()
}

/**
 * Fetch a user's profile image URL from the Twitter API.
 * Uses Bearer Token auth (app-only) via /2/users/by/username endpoint.
 * Returns the _400x400 variant for higher resolution.
 */
export async function fetchUserProfileImage(handle: string): Promise<string | null> {
  const bearerToken = getTwitterBearerToken()
  if (!bearerToken) return null

  try {
    const url = `${TWITTER_API_BASE}/users/by/username/${encodeURIComponent(handle)}?user.fields=profile_image_url`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })

    if (!response.ok) return null

    const data = await response.json()
    const profileImageUrl = data.data?.profile_image_url
    if (!profileImageUrl) return null

    // Twitter returns _normal suffix (48x48) — swap to _400x400 for higher res
    return profileImageUrl.replace("_normal", "_400x400")
  } catch (error) {
    console.error("[twitter-api] Failed to fetch profile image:", error)
    return null
  }
}
