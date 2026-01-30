/**
 * Creator Identity Management
 *
 * Handles storing and retrieving the linked creator identity
 * across the extension using chrome.storage.local.
 * Also manages keypair generation for private messaging.
 */

import { generateKeyPair, storePrivateKey, hasPrivateKey } from "./crypto"

export interface CreatorIdentity {
  handle: string
  verified: boolean
  verifiedAt: number
  creatorId?: string  // UUID from database, used for message subscriptions
}

const CHROME_STORAGE_KEY = 'tipz_linked_creator'
const API_URL = process.env.PLASMO_PUBLIC_API_URL || "https://tipz.cash"

/**
 * Get the linked creator identity from chrome.storage.local
 */
export async function getLinkedCreator(): Promise<CreatorIdentity | null> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await chrome.storage.local.get([CHROME_STORAGE_KEY])
      const identity = result[CHROME_STORAGE_KEY] as CreatorIdentity | undefined

      if (identity && identity.handle && identity.verified) {
        return identity
      }
    }
    return null
  } catch (e) {
    console.error("TIPZ: Failed to get linked creator", e)
    return null
  }
}

/**
 * Set the linked creator identity in chrome.storage.local
 */
export async function setLinkedCreator(identity: CreatorIdentity): Promise<boolean> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ [CHROME_STORAGE_KEY]: identity })
      return true
    }
    return false
  } catch (e) {
    console.error("TIPZ: Failed to set linked creator", e)
    return false
  }
}

/**
 * Clear the linked creator identity (unlink)
 */
export async function clearLinkedCreator(): Promise<boolean> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.remove([CHROME_STORAGE_KEY])
      return true
    }
    return false
  } catch (e) {
    console.error("TIPZ: Failed to clear linked creator", e)
    return false
  }
}

/**
 * Listen for changes to the linked creator identity
 */
export function onLinkedCreatorChange(
  callback: (identity: CreatorIdentity | null) => void
): () => void {
  if (typeof chrome === "undefined" || !chrome.storage?.onChanged) {
    return () => {}
  }

  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && CHROME_STORAGE_KEY in changes) {
      const newValue = changes[CHROME_STORAGE_KEY].newValue as CreatorIdentity | undefined
      callback(newValue && newValue.verified ? newValue : null)
    }
  }

  chrome.storage.onChanged.addListener(listener)

  return () => {
    chrome.storage.onChanged.removeListener(listener)
  }
}

/**
 * Link creator and set up private messaging (generate keypair if needed).
 * This should be called after the creator identity is verified.
 *
 * SECURITY: Uses challenge-response to prevent unauthorized public key uploads.
 * The challenge is requested from tipz.cash which verifies creator ownership.
 *
 * @param handle - The creator's handle
 * @returns Object with messaging status and creator ID
 */
export async function setupMessagingForCreator(handle: string): Promise<{ enabled: boolean; creatorId?: string }> {
  try {
    // First, fetch creator info to get the creator ID
    const creatorResponse = await fetch(`${API_URL}/api/creator?platform=x&handle=${encodeURIComponent(handle)}`)
    if (!creatorResponse.ok) {
      console.error("TIPZ Identity: Failed to fetch creator info")
      return { enabled: false }
    }

    const creatorData = await creatorResponse.json()
    if (!creatorData.found || !creatorData.creator) {
      console.error("TIPZ Identity: Creator not found")
      return { enabled: false }
    }

    const creatorId = creatorData.creator.id

    // Update stored identity with creator ID
    const identity = await getLinkedCreator()
    if (identity) {
      await setLinkedCreator({ ...identity, creatorId })
    }

    // Check if we already have a private key
    const hasKey = await hasPrivateKey()

    if (hasKey) {
      console.log("TIPZ Identity: Private key already exists")
      return { enabled: true, creatorId }
    }

    // Generate new keypair for private messaging
    console.log("TIPZ Identity: Generating keypair for private messaging...")
    const { publicKey, privateKey } = await generateKeyPair()

    // Store private key locally (never leaves device)
    await storePrivateKey(privateKey)

    // Request a challenge token for secure public key upload
    console.log("TIPZ Identity: Requesting challenge for public key upload...")
    const challengeResponse = await fetch(`${API_URL}/api/link/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    })

    if (!challengeResponse.ok) {
      const errorData = await challengeResponse.json().catch(() => ({}))
      console.error("TIPZ Identity: Failed to get challenge:", errorData.error || challengeResponse.status)
      // Key is stored locally, but not uploaded - will retry on next link
      return { enabled: false, creatorId }
    }

    const { challenge } = await challengeResponse.json()

    // Send public key to server with challenge
    const response = await fetch(`${API_URL}/api/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, publicKey, challenge }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("TIPZ Identity: Failed to upload public key:", errorData.error || response.status)
      return { enabled: false, creatorId }
    }

    console.log("TIPZ Identity: Keypair generated and public key uploaded securely")
    return { enabled: true, creatorId }
  } catch (error) {
    console.error("TIPZ Identity: Failed to setup messaging:", error)
    return { enabled: false }
  }
}
