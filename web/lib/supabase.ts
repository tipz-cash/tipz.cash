import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Only create client if credentials are available
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => supabase !== null

export type VerificationStatus = "pending" | "verified" | "failed" | "manual_review"

export interface Creator {
  id: string
  platform: string
  handle: string
  handle_normalized: string
  shielded_address: string
  tweet_url: string
  created_at: string
  // Verification fields (added in migration 20250123)
  verification_status?: VerificationStatus
  tweet_id?: string
  twitter_user_id?: string
  verified_at?: string
  public_key?: Record<string, unknown>
  key_created_at?: string
}

export function normalizeHandle(handle: string): string {
  return handle.toLowerCase().replace(/^@/, "")
}
