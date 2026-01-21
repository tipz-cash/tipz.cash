const API_BASE = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"

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

export async function lookupCreator(
  platform: string,
  handle: string
): Promise<LookupResult> {
  try {
    const res = await fetch(
      `${API_BASE}/api/creator?platform=${encodeURIComponent(platform)}&handle=${encodeURIComponent(handle)}`
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
  try {
    const res = await fetch(`${API_BASE}/api/creators/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, handles })
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
