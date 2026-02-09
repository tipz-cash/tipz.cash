#!/usr/bin/env npx tsx
/**
 * NEAR Intents API Integration Test
 *
 * Hits the real NEAR Intents 1Click API to verify:
 * 1. JWT authentication works
 * 2. Quote endpoint returns deposit addresses
 * 3. Supported tokens are available
 * 4. Status endpoint responds
 *
 * Usage: npx tsx scripts/test-near-intents.ts
 */

import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, "../.env.local")
try {
  const envContent = readFileSync(envPath, "utf-8")
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
} catch {
  console.error("Could not read .env.local")
}

const BASE_URL = "https://1click.chaindefuser.com"
const JWT = process.env.NEAR_INTENTS_JWT

// Real ZEC unified address for testing quotes
// (no funds will be sent — we're only requesting quotes)
const TEST_ZEC_ADDRESS =
  "u1testaddr0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
const TEST_REFUND_ADDRESS_EVM = "0x0000000000000000000000000000000000000001"
const TEST_REFUND_ADDRESS_SOL = "11111111111111111111111111111111"

// ============================================================================
// Helpers
// ============================================================================

function log(label: string, data: unknown) {
  console.log(`\n${"=".repeat(60)}`)
  console.log(`  ${label}`)
  console.log("=".repeat(60))
  if (typeof data === "string") {
    console.log(data)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
}

function pass(msg: string) {
  console.log(`  ✅ ${msg}`)
}

function fail(msg: string) {
  console.log(`  ❌ ${msg}`)
}

function warn(msg: string) {
  console.log(`  ⚠️  ${msg}`)
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (JWT) {
    headers["Authorization"] = `Bearer ${JWT}`
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const errorText = await res.text()
      return { ok: false, status: res.status, data: null, error: errorText }
    }

    const data = await res.json()
    return { ok: true, status: res.status, data }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ============================================================================
// Tests
// ============================================================================

async function testAuth() {
  log("1. JWT Authentication", "")

  if (!JWT) {
    fail("NEAR_INTENTS_JWT not set in .env.local")
    return false
  }

  pass(`JWT present (${JWT.slice(0, 20)}...${JWT.slice(-10)})`)

  // Decode JWT payload (no verification, just inspect)
  try {
    const payload = JSON.parse(
      Buffer.from(JWT.split(".")[1], "base64").toString()
    )
    console.log(`  Partner ID: ${payload.partner_id}`)
    console.log(`  Issued: ${new Date(payload.iat * 1000).toISOString()}`)
    console.log(`  Expires: ${new Date(payload.exp * 1000).toISOString()}`)

    const now = Date.now() / 1000
    if (payload.exp < now) {
      fail(`JWT EXPIRED ${Math.round((now - payload.exp) / 86400)} days ago`)
      return false
    } else {
      const daysLeft = Math.round((payload.exp - now) / 86400)
      pass(`JWT valid for ${daysLeft} more days`)
    }
  } catch {
    warn("Could not decode JWT payload")
  }

  return true
}

async function testSupportedTokens() {
  log("2. Supported Tokens", "")

  const { ok, data, error } = await apiRequest<any[]>("/v0/tokens")

  if (!ok) {
    fail(`Failed to fetch tokens: ${error}`)
    return false
  }

  pass(`API returned ${data!.length} tokens`)

  // Check for our required tokens
  const symbols = new Set(data!.map((t: any) => t.symbol?.toUpperCase()))
  const required = ["ETH", "USDC", "USDT", "ZEC", "SOL"]

  for (const sym of required) {
    if (symbols.has(sym)) {
      pass(`${sym} supported`)
    } else {
      // Check by defuse_asset_id or other fields
      const found = data!.find(
        (t: any) =>
          t.defuse_asset_id?.includes(sym.toLowerCase()) ||
          t.asset_name?.toUpperCase().includes(sym)
      )
      if (found) {
        pass(`${sym} supported (as ${found.asset_name || found.defuse_asset_id})`)
      } else {
        warn(`${sym} not found in token list`)
      }
    }
  }

  // Show a sample token for reference
  if (data!.length > 0) {
    console.log("\n  Sample token structure:")
    console.log("  " + JSON.stringify(data![0], null, 2).replace(/\n/g, "\n  "))
  }

  return true
}

async function testQuoteETH() {
  log("3. Quote: ETH → ZEC", "")

  const deadline = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const body = {
    dry: false,
    originAsset: "nep141:eth.omft.near",
    depositType: "ORIGIN_CHAIN",
    amount: "10000000000000000", // 0.01 ETH in wei
    destinationAsset: "nep141:zec.omft.near",
    recipientType: "DESTINATION_CHAIN",
    recipient: TEST_ZEC_ADDRESS,
    refundType: "ORIGIN_CHAIN",
    refundTo: TEST_REFUND_ADDRESS_EVM,
    deadline,
    swapType: "EXACT_INPUT",
    slippageTolerance: 100,
  }

  console.log("  Request:", JSON.stringify(body, null, 2).replace(/\n/g, "\n  "))

  const { ok, status, data, error } = await apiRequest<any>("/v0/quote", {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (!ok) {
    fail(`Quote failed (${status}): ${error}`)
    return null
  }

  const quote = data!.quote
  if (!quote) {
    fail("Response missing 'quote' field")
    console.log("  Full response:", JSON.stringify(data, null, 2))
    return null
  }

  pass(`Quote received`)
  pass(`Correlation ID: ${data!.correlationId}`)
  pass(`Deposit Address: ${quote.depositAddress}`)
  pass(`Amount In: ${quote.amountInFormatted} (${quote.amountIn} wei)`)
  pass(`Amount Out: ${quote.amountOutFormatted} ZEC (${quote.amountOut} zatoshi)`)
  pass(`Min Amount Out: ${quote.minAmountOut} zatoshi`)
  pass(`Deadline: ${quote.deadline}`)
  pass(`Time Estimate: ${quote.timeEstimate}s`)

  return { depositAddress: quote.depositAddress, correlationId: data!.correlationId }
}

async function testQuoteUSDC() {
  log("4. Quote: USDC → ZEC", "")

  const deadline = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const body = {
    dry: false,
    originAsset: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
    depositType: "ORIGIN_CHAIN",
    amount: "5000000", // 5 USDC (6 decimals)
    destinationAsset: "nep141:zec.omft.near",
    recipientType: "DESTINATION_CHAIN",
    recipient: TEST_ZEC_ADDRESS,
    refundType: "ORIGIN_CHAIN",
    refundTo: TEST_REFUND_ADDRESS_EVM,
    deadline,
    swapType: "EXACT_INPUT",
    slippageTolerance: 100,
  }

  const { ok, status, data, error } = await apiRequest<any>("/v0/quote", {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (!ok) {
    fail(`Quote failed (${status}): ${error}`)
    return null
  }

  const quote = data!.quote
  if (!quote) {
    fail("Response missing 'quote' field")
    return null
  }

  pass(`Quote received`)
  pass(`Deposit Address: ${quote.depositAddress}`)
  pass(`5 USDC → ${quote.amountOutFormatted} ZEC`)
  pass(`Time Estimate: ${quote.timeEstimate}s`)

  return { depositAddress: quote.depositAddress }
}

async function testQuoteSOL() {
  log("5. Quote: SOL → ZEC", "")

  const deadline = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const body = {
    dry: false,
    originAsset: "nep141:sol.omft.near",
    depositType: "ORIGIN_CHAIN",
    amount: "100000000", // 0.1 SOL (9 decimals)
    destinationAsset: "nep141:zec.omft.near",
    recipientType: "DESTINATION_CHAIN",
    recipient: TEST_ZEC_ADDRESS,
    refundType: "ORIGIN_CHAIN",
    refundTo: TEST_REFUND_ADDRESS_SOL, // SOL needs Solana-format refund address
    deadline,
    swapType: "EXACT_INPUT",
    slippageTolerance: 100,
  }

  const { ok, status, data, error } = await apiRequest<any>("/v0/quote", {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (!ok) {
    fail(`Quote failed (${status}): ${error}`)
    return null
  }

  const quote = data!.quote
  if (!quote) {
    fail("Response missing 'quote' field")
    return null
  }

  pass(`Quote received`)
  pass(`Deposit Address: ${quote.depositAddress}`)
  pass(`0.1 SOL → ${quote.amountOutFormatted} ZEC`)
  pass(`Time Estimate: ${quote.timeEstimate}s`)

  return { depositAddress: quote.depositAddress }
}

async function testStatus(depositAddress: string | null) {
  log("6. Status Endpoint", "")

  if (!depositAddress) {
    warn("Skipping — no deposit address from quote test")
    return
  }

  const { ok, status, data, error } = await apiRequest<any>(
    `/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`
  )

  if (!ok) {
    // 404 or similar is expected since we never deposited
    if (status === 404) {
      pass(`Status endpoint reachable (404 expected — no deposit made)`)
    } else {
      fail(`Status check failed (${status}): ${error}`)
    }
    return
  }

  pass(`Status: ${data!.status}`)
  pass(`Deposit Address: ${data!.depositAddress}`)

  if (data!.status === "PENDING_DEPOSIT") {
    pass("Correctly waiting for deposit (we didn't send anything)")
  }
}

async function testDryRunQuote() {
  log("7. Dry Run Quote (no commitment)", "")

  const deadline = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const body = {
    dry: true, // Dry run — no deposit address generated
    originAsset: "nep141:eth.omft.near",
    depositType: "ORIGIN_CHAIN",
    amount: "50000000000000000", // 0.05 ETH
    destinationAsset: "nep141:zec.omft.near",
    recipientType: "DESTINATION_CHAIN",
    recipient: TEST_ZEC_ADDRESS,
    refundType: "ORIGIN_CHAIN",
    refundTo: TEST_REFUND_ADDRESS_EVM,
    deadline,
    swapType: "EXACT_INPUT",
    slippageTolerance: 100,
  }

  const { ok, status, data, error } = await apiRequest<any>("/v0/quote", {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (!ok) {
    fail(`Dry run quote failed (${status}): ${error}`)
    return
  }

  const quote = data!.quote
  if (!quote) {
    fail("No quote in response")
    return
  }

  pass(`Dry run quote received`)
  pass(`0.05 ETH → ${quote.amountOutFormatted} ZEC`)

  if (quote.depositAddress) {
    warn(`Dry run returned a deposit address (unexpected): ${quote.depositAddress}`)
  } else {
    pass("No deposit address (correct for dry run)")
  }
}

// ============================================================================
// Run
// ============================================================================

async function main() {
  console.log("\n🔧 TIPZ × NEAR Intents API Integration Test")
  console.log(`   API: ${BASE_URL}`)
  console.log(`   Time: ${new Date().toISOString()}`)

  const authOk = await testAuth()
  if (!authOk) {
    console.log("\n❌ Auth failed — fix JWT before continuing\n")
    process.exit(1)
  }

  await testSupportedTokens()

  const ethQuote = await testQuoteETH()
  const usdcQuote = await testQuoteUSDC()
  const solQuote = await testQuoteSOL()

  await testStatus(ethQuote?.depositAddress || null)
  await testDryRunQuote()

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("  SUMMARY")
  console.log("=".repeat(60))

  const results = [
    ["Auth", authOk],
    ["ETH → ZEC Quote", !!ethQuote],
    ["USDC → ZEC Quote", !!usdcQuote],
    ["SOL → ZEC Quote", !!solQuote],
  ] as const

  let allPassed = true
  for (const [name, passed] of results) {
    console.log(`  ${passed ? "✅" : "❌"} ${name}`)
    if (!passed) allPassed = false
  }

  if (allPassed) {
    console.log("\n  🚀 All checks passed — ready to ship\n")
  } else {
    console.log("\n  ⚠️  Some checks failed — review above\n")
  }
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
