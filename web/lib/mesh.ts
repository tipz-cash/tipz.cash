/**
 * Mesh Connect Integration for TIPZ
 *
 * Mesh provides unified access to Coinbase, Kraken, Phantom, 300+ wallets,
 * and fiat on-ramps through one SDK.
 *
 * Flow:
 * 1. User clicks "Pay with Mesh"
 * 2. Backend generates linkToken via Mesh API
 * 3. Frontend opens Mesh Link modal with linkToken
 * 4. User picks Coinbase/Kraken/card/wallet
 * 5. Mesh handles auth + transfer
 * 6. onTransferFinished callback fires
 * 7. We show success
 *
 * SETUP REQUIRED:
 * 1. Register at https://dashboard.meshconnect.com
 * 2. Get client ID and API key
 * 3. Create backend endpoint to generate link tokens
 */

// Dynamic import to avoid SSR issues - SDK accesses `window` at module load
// Types are imported separately for TypeScript
import type { Link, LinkPayload, TransferFinishedPayload } from "@meshconnect/web-link-sdk"

// ============================================================================
// Types
// ============================================================================

export interface MeshTransferRequest {
  // Destination for the transfer (creator's shielded ZEC address)
  destinationAddress: string
  // Amount in USD
  amountUsd: number
  // Creator handle for memo/reference
  creatorHandle: string
}

export interface MeshTransferResult {
  success: boolean
  transferId?: string
  txHash?: string
  txId?: string
  fromAddress?: string
  toAddress?: string
  symbol?: string
  amount?: number
  networkId?: string
  error?: string
}

export type MeshTransferCallback = (result: MeshTransferResult) => void

// ============================================================================
// Configuration
// ============================================================================

// Mesh client ID - required for Link initialization
const MESH_CLIENT_ID = process.env.NEXT_PUBLIC_MESH_CLIENT_ID || ""

// Mesh Link instance (singleton)
let meshLink: Link | null = null
let pendingCallback: MeshTransferCallback | null = null

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize Mesh Link
 * Should be called once on app load
 */
export async function initMeshLink(): Promise<Link | null> {
  if (typeof window === "undefined") return null

  if (!MESH_CLIENT_ID) {
    console.warn("[mesh] MESH_CLIENT_ID not configured - Mesh payments disabled")
    return null
  }

  if (meshLink) return meshLink

  try {
    // Dynamic import to avoid SSR issues
    const { createLink } = await import("@meshconnect/web-link-sdk")
    meshLink = createLink({
      clientId: MESH_CLIENT_ID,
      onIntegrationConnected: (payload: LinkPayload) => {
        console.log("[mesh] Integration connected:", payload)
      },
      onTransferFinished: (payload: TransferFinishedPayload) => {
        console.log("[mesh] Transfer finished:", payload)
        if (pendingCallback) {
          pendingCallback({
            success: payload.status === "success",
            transferId: payload.transferId,
            txHash: payload.txHash,
            txId: payload.txId,
            fromAddress: payload.fromAddress,
            toAddress: payload.toAddress,
            symbol: payload.symbol,
            amount: payload.amount,
            networkId: payload.networkId,
          })
          pendingCallback = null
        }
      },
      onExit: (error?: string) => {
        if (error) {
          console.error("[mesh] Link exited with error:", error)
          if (pendingCallback) {
            pendingCallback({
              success: false,
              error: error,
            })
            pendingCallback = null
          }
        } else {
          console.log("[mesh] Link closed by user")
        }
      },
      onEvent: (event) => {
        console.log("[mesh] Event:", event)
      },
      theme: "dark",
    })

    console.log("[mesh] Link initialized")
    return meshLink
  } catch (error) {
    console.error("[mesh] Failed to initialize Link:", error)
    return null
  }
}

/**
 * Check if Mesh is available (client ID configured)
 */
export function isMeshAvailable(): boolean {
  return !!MESH_CLIENT_ID
}

// ============================================================================
// Transfer Functions
// ============================================================================

/**
 * Get link token from backend
 * This requires a backend endpoint that calls Mesh API to generate a link token
 */
async function getLinkToken(request: MeshTransferRequest): Promise<string | null> {
  try {
    const response = await fetch("/api/mesh/link-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationAddress: request.destinationAddress,
        amountUsd: request.amountUsd,
        creatorHandle: request.creatorHandle,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[mesh] Failed to get link token:", errorData)
      return null
    }

    const data = await response.json()
    return data.linkToken
  } catch (error) {
    console.error("[mesh] Error getting link token:", error)
    return null
  }
}

/**
 * Open Mesh Link for a crypto transfer
 *
 * This opens the Mesh modal where users can:
 * - Connect Coinbase, Kraken, or 300+ other exchanges
 * - Connect crypto wallets (MetaMask, Phantom, etc.)
 * - Use fiat on-ramps (card payments)
 *
 * The transfer goes directly to the destination address.
 */
export async function openMeshTransfer(
  request: MeshTransferRequest,
  onComplete: MeshTransferCallback
): Promise<void> {
  const link = await initMeshLink()

  if (!link) {
    onComplete({
      success: false,
      error: "Mesh not configured. Please use wallet connection instead.",
    })
    return
  }

  // Store callback for when transfer completes
  pendingCallback = onComplete

  try {
    // Get link token from backend
    const linkToken = await getLinkToken(request)

    if (!linkToken) {
      onComplete({
        success: false,
        error: "Failed to initialize payment. Please try another method.",
      })
      pendingCallback = null
      return
    }

    // Open the Link modal with the token
    link.openLink(linkToken)

  } catch (error: any) {
    console.error("[mesh] Failed to open Link:", error)
    onComplete({
      success: false,
      error: error.message || "Failed to open Mesh",
    })
    pendingCallback = null
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Close Mesh Link if open
 */
export function closeMeshLink(): void {
  if (meshLink) {
    try {
      meshLink.closeLink()
    } catch (error) {
      console.error("[mesh] Error closing link:", error)
    }
  }
  pendingCallback = null
}
