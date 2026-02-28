import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Only create client if credentials are available
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => supabase !== null

export type VerificationStatus = "pending" | "verified" | "failed" | "manual_review"

export interface Creator {
  id: string
  platform: string
  handle: string
  handle_normalized: string
  shielded_address: string
  created_at: string
  avatar_url?: string
  verification_status?: VerificationStatus
  verified_at?: string
  public_key?: Record<string, unknown>
  key_created_at?: string
  is_og_cypherpunk?: boolean
  og_number?: number
}

export function normalizeHandle(handle: string): string {
  return handle.toLowerCase().replace(/^@/, "")
}

/**
 * Resilient creator lookup by handle.
 *
 * Primary: query handle_normalized (fast, indexed).
 * Fallback: case-insensitive match on handle column (catches NULL handle_normalized).
 * Auto-heal: backfills handle_normalized when found via fallback.
 */
export async function findCreatorByHandle(
  handle: string,
  options?: { select?: string; platform?: string }
): Promise<{ data: any | null; error: any | null }> {
  if (!supabase) {
    return { data: null, error: { message: "Database not configured" } }
  }

  const normalized = normalizeHandle(handle)
  const safe = normalized.replace(/[^a-z0-9_]/g, "")
  const select = options?.select ?? "id"

  // Primary: fast path via handle_normalized
  let query = supabase.from("creators").select(select).eq("handle_normalized", safe)
  if (options?.platform) {
    query = query.eq("platform", options.platform)
  }
  const { data, error } = await query.single()

  if (data) {
    return { data, error: null }
  }

  // Fallback: case-insensitive match on handle column
  let fallbackQuery = supabase
    .from("creators")
    .select(select)
    .or(`handle.ilike.${safe},handle.ilike.@${safe}`)
  if (options?.platform) {
    fallbackQuery = fallbackQuery.eq("platform", options.platform)
  }
  const { data: fallbackData, error: fallbackError } = await fallbackQuery.single()

  if (fallbackData) {
    // Auto-heal: backfill handle_normalized (fire-and-forget)
    Promise.resolve(
      supabase
        .from("creators")
        .update({ handle_normalized: safe })
        .or(`handle.ilike.${safe},handle.ilike.@${safe}`)
    )
      .then(() => console.log(`[supabase] Auto-healed handle_normalized for ${safe}`))
      .catch(() => {})

    return { data: fallbackData, error: null }
  }

  return { data: null, error: error || fallbackError }
}
