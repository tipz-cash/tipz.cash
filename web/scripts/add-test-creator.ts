/**
 * Quick script to add a test creator directly to Supabase
 * Run with: npx tsx scripts/add-test-creator.ts
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), ".env.local")
const envContent = readFileSync(envPath, "utf-8")
const env: Record<string, string> = {}
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "")
  }
}

const supabaseUrl = env.SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addTestCreator() {
  const creator = {
    platform: "x",
    handle: "definaly",
    handle_normalized: "definaly",
    shielded_address: "u1testaddr1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
    verification_status: "verified",
    verified_at: new Date().toISOString(),
  }

  console.log("Adding test creator:", creator.handle)

  // Check if already exists
  const { data: existing } = await supabase
    .from("creators")
    .select("id")
    .eq("handle_normalized", creator.handle_normalized)
    .single()

  if (existing) {
    console.log("Creator already exists, updating...")
    const { error } = await supabase
      .from("creators")
      .update({
        shielded_address: creator.shielded_address,
        verification_status: creator.verification_status,
        verified_at: creator.verified_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)

    if (error) {
      console.error("Update error:", error)
      process.exit(1)
    }
    console.log("✓ Creator updated successfully")
  } else {
    const { error } = await supabase.from("creators").insert(creator)

    if (error) {
      console.error("Insert error:", error)
      process.exit(1)
    }
    console.log("✓ Creator added successfully")
  }

  console.log(`\nTest at: http://localhost:3000/${creator.handle}`)
}

addTestCreator()
