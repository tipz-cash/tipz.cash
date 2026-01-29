import cssText from "data-text:~styles.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { setupMessagingForCreator } from "~lib/identity"

export const config: PlasmoCSConfig = {
  matches: [
    "https://tipz.cash/*",
    "http://localhost:3001/*",
    "http://localhost:3000/*",
  ],
  run_at: "document_idle"
}

// Debug logging
console.log("TIPZ Interceptor: Content script loaded on", window.location.href)

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// Types for creator identity
interface CreatorIdentity {
  handle: string
  verified: boolean
  verifiedAt: number
}

// Constants
const STORAGE_KEY = 'tipz_creator_identity'
const CHROME_STORAGE_KEY = 'tipz_linked_creator'

/**
 * Read creator identity from localStorage (set by tipz.cash web app)
 */
function readLocalStorageIdentity(): CreatorIdentity | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const identity = JSON.parse(stored) as CreatorIdentity
    if (!identity.handle || !identity.verified) return null

    return identity
  } catch (e) {
    console.warn("TIPZ Interceptor: Failed to read identity from localStorage", e)
    return null
  }
}

/**
 * Store verified identity in chrome.storage.local for extension-wide access.
 * Also sets up messaging keypair if not already present.
 */
async function storeIdentityInChromeStorage(identity: CreatorIdentity): Promise<boolean> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ [CHROME_STORAGE_KEY]: identity })
      console.log("TIPZ Interceptor: Identity stored in chrome.storage.local", identity.handle)

      // Setup messaging keypair (generates if needed, uploads public key)
      setupMessagingForCreator(identity.handle).then((result) => {
        if (result.enabled) {
          console.log("TIPZ Interceptor: Private messaging enabled for", identity.handle)
        }
      })

      return true
    }
    return false
  } catch (e) {
    console.error("TIPZ Interceptor: Failed to store identity in chrome.storage", e)
    return false
  }
}

/**
 * Check for creator identity and sync to chrome.storage
 * This is the core Web Bridge flow
 */
async function syncCreatorIdentity() {
  console.log("TIPZ Interceptor: Checking for creator identity...")

  // Read identity from localStorage (set by web app after registration)
  const identity = readLocalStorageIdentity()

  if (identity) {
    console.log("TIPZ Interceptor: Found verified identity for", identity.handle)

    // Store in chrome.storage for extension-wide access
    const stored = await storeIdentityInChromeStorage(identity)

    if (stored) {
      // Notify popup that identity was linked
      window.dispatchEvent(new CustomEvent('tipz-identity-linked', {
        detail: { handle: identity.handle }
      }))
    }
  } else {
    console.log("TIPZ Interceptor: No verified identity found in localStorage")
  }
}

// Inject extension marker for detection on tipz.cash
if (typeof window !== "undefined") {
  if (!document.getElementById('tipz-extension-installed')) {
    const marker = document.createElement('div')
    marker.id = 'tipz-extension-installed'
    marker.style.display = 'none'
    document.body.appendChild(marker)
    console.log('TIPZ Interceptor: Extension marker injected')
  }

  // Run identity sync on load
  syncCreatorIdentity()

  // Also sync on visibility change (user might register in another tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncCreatorIdentity()
    }
  })

  // Listen for registration success event (dispatched by web app)
  window.addEventListener('tipz-registration-success', ((event: CustomEvent) => {
    const { handle } = event.detail || {}
    console.log("TIPZ Interceptor: Registration success event received for", handle)
    // Re-sync identity after registration
    setTimeout(syncCreatorIdentity, 500)
  }) as EventListener)
}

// Main component - minimal, just for Plasmo to mount
function TipzInterceptor() {
  useEffect(() => {
    // Re-check identity when component mounts
    syncCreatorIdentity()
  }, [])

  // This component doesn't render any UI
  return null
}

export default TipzInterceptor
