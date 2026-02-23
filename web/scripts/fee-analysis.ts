#!/usr/bin/env npx tsx
/**
 * NEAR Intents Fee Analysis
 *
 * Measures the actual effective cost of NEAR Intents cross-chain swaps
 * by comparing amountInUsd vs amountOutUsd from dry-run quotes.
 *
 * NEAR Intents embeds all fees (gas, spread, market maker margin) into
 * the exchange rate — there's no explicit fee field. This script measures
 * the real-world cost by requesting quotes for every supported pair.
 *
 * Usage: npx tsx scripts/fee-analysis.ts
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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
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

const TEST_ZEC_ADDRESS =
  "u1testaddr0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
const TEST_REFUND_ADDRESS_EVM = "0x0000000000000000000000000000000000000001"
const TEST_REFUND_ADDRESS_SOL = "11111111111111111111111111111111"

// ============================================================================
// Types
// ============================================================================

interface TestPair {
  token: string
  chain: string
  chainId: number
  assetId: string
  amount: string // in smallest units
  humanAmount: string // for display
  refundAddress: string
}

interface QuoteResult {
  pair: TestPair
  amountInUsd: number
  amountOutUsd: number
  amountInFormatted: string
  amountOutFormatted: string
  feeUsd: number
  feePct: number
  timeEstimate: number
}

// ============================================================================
// Test matrix — 13 pairs, ~$5 equivalent each
// ============================================================================

const TEST_PAIRS: TestPair[] = [
  // ETH across chains
  {
    token: "ETH",
    chain: "Ethereum",
    chainId: 1,
    assetId: "nep141:eth.omft.near",
    amount: "2000000000000000", // 0.002 ETH (18 decimals)
    humanAmount: "0.002 ETH",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "ETH",
    chain: "Arbitrum",
    chainId: 42161,
    assetId: "nep141:arb.omft.near",
    amount: "2000000000000000", // 0.002 ETH
    humanAmount: "0.002 ETH",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "ETH",
    chain: "Optimism",
    chainId: 10,
    assetId: "nep245:v2_1.omni.hot.tg:10_11111111111111111111",
    amount: "2000000000000000", // 0.002 ETH
    humanAmount: "0.002 ETH",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },

  // USDC across chains
  {
    token: "USDC",
    chain: "Ethereum",
    chainId: 1,
    assetId: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
    amount: "5000000", // 5 USDC (6 decimals)
    humanAmount: "5 USDC",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "USDC",
    chain: "Arbitrum",
    chainId: 42161,
    assetId: "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near",
    amount: "5000000", // 5 USDC
    humanAmount: "5 USDC",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "USDC",
    chain: "Optimism",
    chainId: 10,
    assetId: "nep245:v2_1.omni.hot.tg:10_A2ewyUyDp6qsue1jqZsGypkCxRJ",
    amount: "5000000", // 5 USDC
    humanAmount: "5 USDC",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "USDC",
    chain: "Polygon",
    chainId: 137,
    assetId: "nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L",
    amount: "5000000", // 5 USDC
    humanAmount: "5 USDC",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },

  // USDT across chains
  {
    token: "USDT",
    chain: "Ethereum",
    chainId: 1,
    assetId: "nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near",
    amount: "5000000", // 5 USDT (6 decimals)
    humanAmount: "5 USDT",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "USDT",
    chain: "Arbitrum",
    chainId: 42161,
    assetId: "nep141:arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near",
    amount: "5000000", // 5 USDT
    humanAmount: "5 USDT",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "USDT",
    chain: "Optimism",
    chainId: 10,
    assetId: "nep245:v2_1.omni.hot.tg:10_359RPSJVdTxwTJT9TyGssr2rFoWo",
    amount: "5000000", // 5 USDT
    humanAmount: "5 USDT",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },
  {
    token: "USDT",
    chain: "Polygon",
    chainId: 137,
    assetId: "nep245:v2_1.omni.hot.tg:137_3hpYoaLtt8MP1Z2GH1U473DMRKgr",
    amount: "5000000", // 5 USDT
    humanAmount: "5 USDT",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },

  // MATIC (POL) on Polygon
  {
    token: "MATIC",
    chain: "Polygon",
    chainId: 137,
    assetId: "nep245:v2_1.omni.hot.tg:137_11111111111111111111",
    amount: "10000000000000000000", // 10 MATIC (18 decimals)
    humanAmount: "10 MATIC",
    refundAddress: TEST_REFUND_ADDRESS_EVM,
  },

  // SOL on Solana
  {
    token: "SOL",
    chain: "Solana",
    chainId: 501,
    assetId: "nep141:sol.omft.near",
    amount: "30000000", // 0.03 SOL (9 decimals)
    humanAmount: "0.03 SOL",
    refundAddress: TEST_REFUND_ADDRESS_SOL,
  },
]

// ============================================================================
// Helpers
// ============================================================================

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

async function fetchQuote(pair: TestPair): Promise<QuoteResult | null> {
  const deadline = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const body = {
    dry: true,
    originAsset: pair.assetId,
    depositType: "ORIGIN_CHAIN",
    amount: pair.amount,
    destinationAsset: "nep141:zec.omft.near",
    recipientType: "DESTINATION_CHAIN",
    recipient: TEST_ZEC_ADDRESS,
    refundType: "ORIGIN_CHAIN",
    refundTo: pair.refundAddress,
    deadline,
    swapType: "EXACT_INPUT",
    slippageTolerance: 100,
  }

  const { ok, data, error } = await apiRequest<any>("/v0/quote", {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (!ok || !data?.quote) {
    console.error(`  ❌ ${pair.token}/${pair.chain}: ${error || "no quote returned"}`)
    return null
  }

  const quote = data.quote
  const amountInUsd = parseFloat(quote.amountInUsd)
  const amountOutUsd = parseFloat(quote.amountOutUsd)
  const feeUsd = amountInUsd - amountOutUsd
  const feePct = amountInUsd > 0 ? (1 - amountOutUsd / amountInUsd) * 100 : 0

  return {
    pair,
    amountInUsd,
    amountOutUsd,
    amountInFormatted: quote.amountInFormatted,
    amountOutFormatted: quote.amountOutFormatted,
    feeUsd,
    feePct,
    timeEstimate: quote.timeEstimate,
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log("\n📊 NEAR Intents Fee Analysis")
  console.log(`   API: ${BASE_URL}`)
  console.log(`   Time: ${new Date().toISOString()}`)
  console.log(`   Pairs: ${TEST_PAIRS.length}`)
  console.log(`   Mode: dry-run (no deposit addresses generated)`)

  if (!JWT) {
    console.log(`   JWT: not set (quotes will include 0.1% partner fee)`)
  } else {
    console.log(`   JWT: ${JWT.slice(0, 20)}...${JWT.slice(-10)}`)
  }

  // Fetch all quotes sequentially to avoid rate limiting
  const results: QuoteResult[] = []
  const failures: { pair: TestPair; error: string }[] = []

  console.log("\nFetching quotes...\n")

  for (const pair of TEST_PAIRS) {
    process.stdout.write(`  ${pair.token}/${pair.chain}... `)
    const result = await fetchQuote(pair)
    if (result) {
      results.push(result)
      console.log(
        `✅ $${result.amountInUsd.toFixed(2)} → $${result.amountOutUsd.toFixed(2)} (${result.feePct.toFixed(2)}%)`
      )
    } else {
      failures.push({ pair, error: "quote failed" })
    }
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500))
  }

  // Print results table
  console.log("\n" + "=".repeat(110))
  console.log("  FEE ANALYSIS RESULTS")
  console.log("=".repeat(110))

  const header = [
    "Token".padEnd(6),
    "Chain".padEnd(10),
    "Amount In".padEnd(14),
    "USD In".padEnd(10),
    "ZEC Out".padEnd(14),
    "USD Out".padEnd(10),
    "Fee $".padEnd(10),
    "Fee %".padEnd(8),
    "Time (s)",
  ].join(" | ")

  console.log(`  ${header}`)
  console.log("  " + "-".repeat(header.length))

  for (const r of results) {
    const row = [
      r.pair.token.padEnd(6),
      r.pair.chain.padEnd(10),
      r.amountInFormatted.slice(0, 13).padEnd(14),
      `$${r.amountInUsd.toFixed(2)}`.padEnd(10),
      r.amountOutFormatted.slice(0, 13).padEnd(14),
      `$${r.amountOutUsd.toFixed(2)}`.padEnd(10),
      `$${r.feeUsd.toFixed(4)}`.padEnd(10),
      `${r.feePct.toFixed(2)}%`.padEnd(8),
      `${r.timeEstimate}`,
    ].join(" | ")

    console.log(`  ${row}`)
  }

  // Summary stats
  if (results.length > 0) {
    const fees = results.map((r) => r.feeUsd)
    const pcts = results.map((r) => r.feePct)
    const minFee = Math.min(...fees)
    const maxFee = Math.max(...fees)
    const avgFee = fees.reduce((a, b) => a + b, 0) / fees.length
    const minPct = Math.min(...pcts)
    const maxPct = Math.max(...pcts)
    const avgPct = pcts.reduce((a, b) => a + b, 0) / pcts.length

    console.log("\n" + "=".repeat(110))
    console.log("  SUMMARY")
    console.log("=".repeat(110))
    console.log(`  Successful quotes: ${results.length}/${TEST_PAIRS.length}`)
    console.log(`  Failed quotes:     ${failures.length}`)
    console.log()
    console.log(`  Fee range (USD):   $${minFee.toFixed(4)} — $${maxFee.toFixed(4)}`)
    console.log(`  Fee range (%):     ${minPct.toFixed(2)}% — ${maxPct.toFixed(2)}%`)
    console.log(`  Average fee (USD): $${avgFee.toFixed(4)}`)
    console.log(`  Average fee (%):   ${avgPct.toFixed(2)}%`)

    // Group by token
    console.log("\n  By token:")
    const byToken = new Map<string, QuoteResult[]>()
    for (const r of results) {
      const existing = byToken.get(r.pair.token) || []
      existing.push(r)
      byToken.set(r.pair.token, existing)
    }

    for (const [token, tokenResults] of byToken) {
      const tokenFees = tokenResults.map((r) => r.feeUsd)
      const tokenPcts = tokenResults.map((r) => r.feePct)
      const tMin = Math.min(...tokenFees)
      const tMax = Math.max(...tokenFees)
      const tAvgPct = tokenPcts.reduce((a, b) => a + b, 0) / tokenPcts.length
      console.log(
        `    ${token.padEnd(6)} $${tMin.toFixed(4)} — $${tMax.toFixed(4)}  (avg ${tAvgPct.toFixed(2)}%)`
      )
    }

    // Group by chain
    console.log("\n  By chain:")
    const byChain = new Map<string, QuoteResult[]>()
    for (const r of results) {
      const existing = byChain.get(r.pair.chain) || []
      existing.push(r)
      byChain.set(r.pair.chain, existing)
    }

    for (const [chain, chainResults] of byChain) {
      const chainFees = chainResults.map((r) => r.feeUsd)
      const chainPcts = chainResults.map((r) => r.feePct)
      const cMin = Math.min(...chainFees)
      const cMax = Math.max(...chainFees)
      const cAvgPct = chainPcts.reduce((a, b) => a + b, 0) / chainPcts.length
      console.log(
        `    ${chain.padEnd(10)} $${cMin.toFixed(4)} — $${cMax.toFixed(4)}  (avg ${cAvgPct.toFixed(2)}%)`
      )
    }
  }

  if (failures.length > 0) {
    console.log("\n  Failed pairs:")
    for (const f of failures) {
      console.log(`    ❌ ${f.pair.token}/${f.pair.chain} — ${f.error}`)
    }
  }

  console.log()
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
