const API_BASE = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"

// DEV MODE: Set PLASMO_PUBLIC_DEV_MODE=true to show TIP button on ALL tweets for testing
// In production, set to false or omit the env var
const DEV_MODE = process.env.PLASMO_PUBLIC_DEV_MODE === "true"

// Mock creator for testing wallet connection
const MOCK_CREATOR: Creator = {
  id: "test-123",
  platform: "x",
  handle: "test",
  shielded_address: "zs1j29m7zdhhyy2eqrz89l4zhvtymrgAfT89kP4Z6gkPaywLgrxSGbCZAi5xonHZonbJgstJuFuXWa"
}

export interface Creator {
  id: string
  platform: string
  handle: string
  shielded_address: string
}

export interface LookupResult {
  found: boolean
  creator?: Creator
}

export interface BatchLookupResult {
  results: Record<string, LookupResult>
}

/**
 * Normalize handle by removing @ prefix and converting to lowercase
 */
function normalizeHandle(handle: string): string {
  return handle.toLowerCase().replace(/^@/, "")
}

export async function lookupCreator(
  platform: string,
  handle: string
): Promise<LookupResult> {
  // Normalize handle (strip @ prefix)
  const normalizedHandle = normalizeHandle(handle)

  // In DEV_MODE, return mock creator for ALL handles
  if (DEV_MODE) {
    console.log("TIPZ [DEV]: Returning mock creator for", normalizedHandle)
    return {
      found: true,
      creator: { ...MOCK_CREATOR, handle: normalizedHandle }
    }
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/creator?platform=${encodeURIComponent(platform)}&handle=${encodeURIComponent(normalizedHandle)}`
    )
    if (!res.ok) {
      return { found: false }
    }
    return await res.json()
  } catch (error) {
    console.error("TIPZ: Failed to lookup creator", error)
    return { found: false }
  }
}

export async function batchLookupCreators(
  platform: string,
  handles: string[]
): Promise<BatchLookupResult> {
  // Normalize all handles (strip @ prefix)
  const normalizedHandles = handles.map(normalizeHandle)

  try {
    const res = await fetch(`${API_BASE}/api/creators/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, handles: normalizedHandles })
    })
    if (!res.ok) {
      return { results: {} }
    }
    return await res.json()
  } catch (error) {
    console.error("TIPZ: Failed to batch lookup creators", error)
    return { results: {} }
  }
}

// ============================================================================
// Creator Revenue (Received Tips) API
// ============================================================================

export interface ReceivedTip {
  id: string
  amount: string // ZEC amount
  from_address?: string // Optional: sender address (may be shielded)
  created_at: string
  message?: string
}

export interface ReceivedTipsResult {
  tips: ReceivedTip[]
  total_zec: string
  total_count: number
}

/**
 * Get tips received by a creator
 * @param handle - The creator's handle
 * @param limit - Maximum number of tips to return (default 50)
 */
export async function getReceivedTips(
  handle: string,
  limit: number = 50
): Promise<ReceivedTipsResult> {
  const normalizedHandle = normalizeHandle(handle)

  try {
    const res = await fetch(
      `${API_BASE}/api/tips/received?handle=${encodeURIComponent(normalizedHandle)}&limit=${limit}`
    )

    if (!res.ok) {
      // Return empty result on error
      return { tips: [], total_zec: "0", total_count: 0 }
    }

    return await res.json()
  } catch (error) {
    console.error("TIPZ: Failed to get received tips", error)
    return { tips: [], total_zec: "0", total_count: 0 }
  }
}

/**
 * Get revenue stats for a creator
 */
export interface RevenueStats {
  total_zec: string
  total_usd: string
  tip_count: number
  last_tip_at: string | null
}

export async function getRevenueStats(handle: string): Promise<RevenueStats> {
  const normalizedHandle = normalizeHandle(handle)

  try {
    const res = await fetch(
      `${API_BASE}/api/tips/stats?handle=${encodeURIComponent(normalizedHandle)}`
    )

    if (!res.ok) {
      return { total_zec: "0", total_usd: "$0.00", tip_count: 0, last_tip_at: null }
    }

    return await res.json()
  } catch (error) {
    console.error("TIPZ: Failed to get revenue stats", error)
    return { total_zec: "0", total_usd: "$0.00", tip_count: 0, last_tip_at: null }
  }
}
