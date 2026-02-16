import { createClient, SupabaseClient } from "@supabase/supabase-js"

/**
 * Client-side Supabase instance using the anon (public) key.
 * Used for Realtime subscriptions on the /my dashboard.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * to be set in environment variables.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseClient: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
