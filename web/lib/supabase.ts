import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface Creator {
  id: string
  platform: string
  handle: string
  handle_normalized: string
  shielded_address: string
  tweet_url: string
  created_at: string
}

export function normalizeHandle(handle: string): string {
  return handle.toLowerCase().replace(/^@/, "")
}
