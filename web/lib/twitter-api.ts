/**
 * Twitter API v2 Client for Tweet Verification
 *
 * This module provides functions to verify registration tweets via the Twitter API.
 * It checks that:
 * 1. The tweet exists and is not deleted
 * 2. The tweet is from the correct author
 * 3. The tweet contains required verification content
 * 4. The tweet was posted recently (within verification window)
 */

const TWITTER_API_BASE = "https://api.twitter.com/2"

/**
 * Twitter API response types
 */
interface TwitterTweet {
  id: string
  text: string
  author_id: string
  created_at: string
}

interface TwitterUser {
  id: string
  username: string
  name: string
}

interface TwitterTweetResponse {
  data?: TwitterTweet
  includes?: {
    users?: TwitterUser[]
  }
  errors?: Array<{
    title: string
    detail: string
    type: string
  }>
}

export interface TweetVerificationData {
  tweetId: string
  text: string
  authorId: string
  authorUsername: string
  createdAt: Date
}

export interface VerificationResult {
  valid: boolean
  status: "pending" | "verified" | "failed" | "manual_review"
  data?: TweetVerificationData
  error?: string
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
 * Fetch a tweet by ID from the Twitter API
 */
export async function fetchTweet(tweetId: string): Promise<TwitterTweetResponse> {
  const bearerToken = getTwitterBearerToken()

  if (!bearerToken) {
    throw new Error("Twitter API not configured. Set TWITTER_BEARER_TOKEN environment variable.")
  }

  const url = new URL(`${TWITTER_API_BASE}/tweets/${tweetId}`)
  url.searchParams.set("expansions", "author_id")
  url.searchParams.set("tweet.fields", "text,created_at,author_id")
  url.searchParams.set("user.fields", "username")

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Twitter API authentication failed. Check TWITTER_BEARER_TOKEN.")
    }
    if (response.status === 404) {
      throw new Error("Tweet not found. It may have been deleted.")
    }
    if (response.status === 429) {
      throw new Error("Twitter API rate limit exceeded. Please try again later.")
    }
    if (response.status === 402) {
      throw new Error("Twitter API payment required. Registration will proceed with manual review.")
    }
    throw new Error(`Twitter API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Verification window in hours (how old a tweet can be)
 */
const VERIFICATION_WINDOW_HOURS = 48

/**
 * Required keywords that must appear in the verification tweet
 */
const REQUIRED_KEYWORDS = ["TIPZ"]

/**
 * Verify a tweet for registration
 *
 * Checks:
 * 1. Tweet exists
 * 2. Tweet is from the expected author (case-insensitive)
 * 3. Tweet contains "TIPZ" keyword
 * 4. Tweet contains part of the shielded address (first 8 or last 8 chars)
 * 5. Tweet was created within the verification window
 */
export async function verifyTweetContent(
  tweetId: string,
  expectedHandle: string,
  shieldedAddress: string
): Promise<VerificationResult> {
  // Check if Twitter API is configured
  if (!isTwitterApiConfigured()) {
    console.log("[twitter-api] Twitter API not configured, returning pending status")
    return {
      valid: true,
      status: "pending",
      error: "Twitter API not configured. Tweet will be verified manually.",
    }
  }

  try {
    const response = await fetchTweet(tweetId)

    // Check for API errors
    if (response.errors && response.errors.length > 0) {
      const error = response.errors[0]
      return {
        valid: false,
        status: "failed",
        error: `Twitter API error: ${error.title} - ${error.detail}`,
      }
    }

    // Check tweet data exists
    if (!response.data) {
      return {
        valid: false,
        status: "failed",
        error: "Tweet not found. It may have been deleted.",
      }
    }

    const tweet = response.data
    const author = response.includes?.users?.find((u) => u.id === tweet.author_id)

    if (!author) {
      return {
        valid: false,
        status: "failed",
        error: "Could not verify tweet author.",
      }
    }

    // Verify author matches expected handle (case-insensitive)
    const normalizedExpected = expectedHandle.toLowerCase().replace(/^@/, "")
    const normalizedAuthor = author.username.toLowerCase()

    if (normalizedAuthor !== normalizedExpected) {
      return {
        valid: false,
        status: "failed",
        error: `Tweet author @${author.username} does not match expected @${expectedHandle}`,
      }
    }

    // Check tweet content for required keywords
    const tweetTextLower = tweet.text.toLowerCase()
    const hasRequiredKeyword = REQUIRED_KEYWORDS.some(
      (keyword) => tweetTextLower.includes(keyword.toLowerCase())
    )

    if (!hasRequiredKeyword) {
      return {
        valid: false,
        status: "failed",
        error: `Tweet must contain "TIPZ". Found: "${tweet.text.substring(0, 100)}..."`,
      }
    }

    // Check tweet contains part of the shielded address
    const addressFirst8 = shieldedAddress.substring(0, 8)
    const addressLast8 = shieldedAddress.substring(shieldedAddress.length - 8)
    const hasAddressPart =
      tweet.text.includes(addressFirst8) ||
      tweet.text.includes(addressLast8) ||
      tweet.text.includes(shieldedAddress)

    if (!hasAddressPart) {
      return {
        valid: false,
        status: "failed",
        error: `Tweet must contain your shielded address (or first/last 8 characters): ${addressFirst8}...${addressLast8}`,
      }
    }

    // Check tweet is within verification window
    const createdAt = new Date(tweet.created_at)
    const now = new Date()
    const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursAgo > VERIFICATION_WINDOW_HOURS) {
      return {
        valid: false,
        status: "failed",
        error: `Tweet is too old (${Math.floor(hoursAgo)} hours). Please post a new verification tweet within the last ${VERIFICATION_WINDOW_HOURS} hours.`,
      }
    }

    // All checks passed
    return {
      valid: true,
      status: "verified",
      data: {
        tweetId: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id,
        authorUsername: author.username,
        createdAt,
      },
    }
  } catch (error) {
    console.error("[twitter-api] Verification error:", error)

    // If it's a known error type, pass it through
    if (error instanceof Error) {
      // Rate limiting or payment issues should result in manual review
      if (error.message.includes("rate limit") || error.message.includes("payment required")) {
        return {
          valid: true,
          status: "manual_review",
          error: error.message,
        }
      }

      return {
        valid: false,
        status: "failed",
        error: error.message,
      }
    }

    return {
      valid: false,
      status: "failed",
      error: "Unknown error during tweet verification",
    }
  }
}
