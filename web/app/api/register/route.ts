import { NextRequest, NextResponse } from "next/server"
import { supabase, normalizeHandle, findCreatorByHandle } from "@/lib/supabase"

import { fetchUserProfileImage } from "@/lib/twitter-api"
import { getSessionFromRequest, createSessionToken, setSessionCookie } from "@/lib/session"

/**
 * Error codes for registration API responses.
 * Used for programmatic error handling by clients.
 */
export const ERROR_CODES = {
INVALID_JSON: "INVALID_JSON",
  MISSING_FIELDS: "MISSING_FIELDS",
  INVALID_FIELD_TYPE: "INVALID_FIELD_TYPE",
  INVALID_ADDRESS: "INVALID_ADDRESS",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Structured error response type.
 */
interface ErrorResponse {
  error: string
  code: ErrorCode
  details?: Record<string, string>
  retryAfter?: number
}

/**
 * Create a standardized error response.
 */
function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  headers: Record<string, string>,
  details?: Record<string, string>
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = { error: message, code }
  if (details) {
    body.details = details
  }
  return NextResponse.json(body, { status, headers })
}

/**
 * Sanitize string input to prevent XSS and control characters.
 * Removes HTML tags, control characters, and normalizes whitespace.
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars (except \t, \n, \r)
    .trim()
}

/**
 * Zcash Unified Address Validation
 *
 * Validates that the address is a valid Zcash unified address:
 * - Unified addresses: start with "u1", 141+ characters
 * - Uses Bech32m encoding
 *
 * Note: This is format validation only. It does not verify the address
 * exists on the blockchain or has valid cryptographic properties.
 */
function isValidShieldedAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false
  }

  // Unified addresses start with 'u1' (141+ characters, variable length)
  if (address.startsWith("u1")) {
    // Basic format check - Bech32m character set
    const bech32mRegex = /^u1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/
    return address.length >= 141 && bech32mRegex.test(address)
  }

  return false
}

/**
 * POST /api/register
 *
 * Registers a creator. Requires an authenticated session (from Twitter OAuth).
 * Handle comes from the session — only shielded_address is submitted.
 *
 * Body: { shielded_address: string }
 */
export async function POST(request: NextRequest) {
  const headers: Record<string, string> = {}

  // Require authenticated session (from Twitter OAuth)
  const session = await getSessionFromRequest(request)
  if (!session) {
    return createErrorResponse(
      "Authentication required. Please sign in with X first.",
      ERROR_CODES.NOT_AUTHENTICATED,
      401,
      headers
    )
  }

  const sessionHandle = session.handle

  // Parse request body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return createErrorResponse(
      "Invalid JSON in request body",
      ERROR_CODES.INVALID_JSON,
      400,
      headers
    )
  }

  const { shielded_address } = body

  // Validate required fields
  if (!shielded_address) {
    return createErrorResponse(
      "Missing required field: shielded_address",
      ERROR_CODES.MISSING_FIELDS,
      400,
      headers,
      { missing: "shielded_address" }
    )
  }

  // Validate field type
  if (typeof shielded_address !== "string") {
    return createErrorResponse(
      "Invalid field type. Expected string for: shielded_address",
      ERROR_CODES.INVALID_FIELD_TYPE,
      400,
      headers,
      { invalid_fields: "shielded_address" }
    )
  }

  // Sanitize address
  const sanitizedAddress = sanitizeInput(shielded_address as string)

  // Validate shielded address
  if (!isValidShieldedAddress(sanitizedAddress)) {
    return createErrorResponse(
      "Invalid Zcash shielded address. Must be a Unified address (u1..., 141+ chars)",
      ERROR_CODES.INVALID_ADDRESS,
      400,
      headers,
      { provided_length: String(sanitizedAddress.length) }
    )
  }

  const normalizedHandle = normalizeHandle(sessionHandle)

  // Fetch profile image from Twitter API (best-effort)
  const avatarUrl = await fetchUserProfileImage(normalizedHandle)

  // If Supabase is not configured, return an error
  if (!supabase) {
    return createErrorResponse(
      "Database not configured. Please contact support.",
      ERROR_CODES.DATABASE_ERROR,
      503,
      headers
    )
  }

  // Check if already registered
  let existing: { id: string } | null = null
  try {
    const { data, error } = await findCreatorByHandle(sessionHandle, {
      platform: "x",
    })

    if (error && error.code !== "PGRST116" && error.message !== "Database not configured") {
      console.error("[register] Database query error:", error)
      return createErrorResponse(
        "Database error while checking registration",
        ERROR_CODES.DATABASE_ERROR,
        500,
        headers
      )
    }

    existing = data
  } catch (error) {
    console.error("[register] Unexpected database error:", error)
    return createErrorResponse(
      "Unexpected database error",
      ERROR_CODES.DATABASE_ERROR,
      500,
      headers
    )
  }

  if (existing) {
    // Update existing registration (e.g. changing address)
    const { error: updateError } = await supabase
      .from("creators")
      .update({
        shielded_address: sanitizedAddress,
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      })
      .eq("id", existing.id)

    if (updateError) {
      console.error("[register] Update error:", updateError)
      return createErrorResponse(
        "Failed to update registration. Please try again.",
        ERROR_CODES.DATABASE_ERROR,
        500,
        headers
      )
    }

    // Upgrade session to include creatorId
    const response = NextResponse.json(
      {
        success: true,
        message: "Registration updated",
        handle: sessionHandle,
        platform: "x",
      },
      { status: 200, headers }
    )

    const token = await createSessionToken(sessionHandle, existing.id)
    setSessionCookie(response, token)

    return response
  }

  // Create new registration
  const { data: newCreator, error: insertError } = await supabase
    .from("creators")
    .insert({
      platform: "x",
      handle: sessionHandle,
      handle_normalized: normalizedHandle,
      shielded_address: sanitizedAddress,
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      ...(avatarUrl && { avatar_url: avatarUrl }),
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("[register] Insert error:", insertError)

    // Check for unique constraint violation (duplicate registration race condition)
    if (insertError.code === "23505") {
      return createErrorResponse(
        "This handle is already registered.",
        ERROR_CODES.DATABASE_ERROR,
        409,
        headers
      )
    }

    return createErrorResponse(
      "Failed to create registration. Please try again.",
      ERROR_CODES.DATABASE_ERROR,
      500,
      headers
    )
  }

  const creatorId = newCreator?.id

  // Assign OG Cypherpunk badge if under 100 creators
  if (creatorId) {
    const { count } = await supabase
      .from("creators")
      .select("id", { count: "exact", head: true })
      .eq("is_og_cypherpunk", true)

    if ((count ?? 0) < 100) {
      const { error: ogError } = await supabase
        .from("creators")
        .update({
          is_og_cypherpunk: true,
          og_number: (count ?? 0) + 1,
        })
        .eq("id", creatorId)

      if (ogError) {
        // Unique index on og_number prevents race condition duplicates — safe to ignore
        console.warn("[register] OG badge assignment failed (race condition?):", ogError.message)
      }
    }
  }

  // Upgrade session to include creatorId
  const response = NextResponse.json(
    {
      success: true,
      message: "Registration successful",
      handle: sessionHandle,
      platform: "x",
    },
    { status: 201, headers }
  )

  if (creatorId) {
    const token = await createSessionToken(sessionHandle, creatorId)
    setSessionCookie(response, token)
  }

  return response
}
