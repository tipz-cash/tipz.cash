/**
 * Backfill avatar_url for existing creators.
 *
 * Fetches profile images from Twitter API for all creators
 * that don't yet have an avatar_url set.
 *
 * Usage:
 *   npx tsx scripts/backfill-avatars.ts
 *
 * Requires:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, TWITTER_BEARER_TOKEN
 */

import { readFileSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

// Load .env.local manually (no dotenv dependency needed)
function loadEnvFile(filePath: string) {
  try {
    const content = readFileSync(filePath, "utf-8")
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIndex = trimmed.indexOf("=")
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const val = trimmed.slice(eqIndex + 1).trim()
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  } catch {
    // File not found, skip
  }
}

loadEnvFile(resolve(__dirname, "../.env.local"))
loadEnvFile(resolve(__dirname, "../.env"))

const TWITTER_API_BASE = "https://api.twitter.com/2"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const bearerToken = process.env.TWITTER_BEARER_TOKEN

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
  process.exit(1)
}

if (!bearerToken) {
  console.error("Missing TWITTER_BEARER_TOKEN")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchProfileImage(handle: string): Promise<string | null> {
  try {
    const url = `${TWITTER_API_BASE}/users/by/username/${encodeURIComponent(handle)}?user.fields=profile_image_url`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after")
      console.warn(`  Rate limited. Retry after ${retryAfter || "?"}s`)
      return "RATE_LIMITED"
    }

    if (!res.ok) return null

    const data = await res.json()
    const imageUrl = data.data?.profile_image_url
    if (!imageUrl) return null

    return imageUrl.replace("_normal", "_400x400")
  } catch (err) {
    console.error(`  Fetch error for @${handle}:`, err)
    return null
  }
}

async function main() {
  // Fetch all creators without an avatar_url
  const { data: creators, error } = await supabase
    .from("creators")
    .select("id, handle")
    .is("avatar_url", null)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Failed to query creators:", error)
    process.exit(1)
  }

  if (!creators || creators.length === 0) {
    console.log("All creators already have avatars. Nothing to do.")
    return
  }

  console.log(`Found ${creators.length} creators without avatars.\n`)

  let updated = 0
  let skipped = 0

  for (const creator of creators) {
    process.stdout.write(`@${creator.handle}... `)

    const avatarUrl = await fetchProfileImage(creator.handle)

    if (avatarUrl === "RATE_LIMITED") {
      console.log("pausing 60s for rate limit...")
      await new Promise((r) => setTimeout(r, 60_000))
      // Retry once
      const retry = await fetchProfileImage(creator.handle)
      if (!retry || retry === "RATE_LIMITED") {
        console.log("still limited, skipping")
        skipped++
        continue
      }
      const { error: updateErr } = await supabase
        .from("creators")
        .update({ avatar_url: retry })
        .eq("id", creator.id)
      if (updateErr) {
        console.log(`DB error: ${updateErr.message}`)
        skipped++
      } else {
        console.log("done (after retry)")
        updated++
      }
      continue
    }

    if (!avatarUrl) {
      console.log("no image found")
      skipped++
      continue
    }

    const { error: updateErr } = await supabase
      .from("creators")
      .update({ avatar_url: avatarUrl })
      .eq("id", creator.id)

    if (updateErr) {
      console.log(`DB error: ${updateErr.message}`)
      skipped++
    } else {
      console.log("done")
      updated++
    }

    // Small delay to respect Twitter rate limits (300 req/15min for app-only)
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

main()
