import cssText from "data-text:~styles.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"

import { TipModal } from "~components/TipModal"
import { lookupCreator, type Creator } from "~lib/api"

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

// Global state for modal
let globalSetCreator: ((creator: Creator | null) => void) | null = null
let globalSetIsModalOpen: ((open: boolean) => void) | null = null
let globalSetHandle: ((handle: string | null) => void) | null = null

// Inject extension marker for detection on tipz.cash
if (typeof window !== "undefined") {
  if (!document.getElementById('tipz-extension-installed')) {
    const marker = document.createElement('div')
    marker.id = 'tipz-extension-installed'
    marker.style.display = 'none'
    document.body.appendChild(marker)
    console.log('TIPZ Interceptor: Extension marker injected')
  }

  // Listen for tipz-open-modal events (from profile page or Install Interceptor)
  window.addEventListener('tipz-open-modal', ((event: CustomEvent) => {
    const { handle } = event.detail || {}
    console.log("TIPZ Interceptor: Modal trigger received for handle:", handle)

    if (handle && globalSetCreator && globalSetIsModalOpen && globalSetHandle) {
      lookupCreator("x", handle).then((result) => {
        if (result.found && result.creator) {
          globalSetCreator(result.creator)
        } else {
          globalSetCreator(null)
        }
        globalSetHandle(handle)
        globalSetIsModalOpen(true)
      })
    }
  }) as EventListener)

  // Install Interceptor: Check for pending tip on load
  const checkPendingTip = () => {
    try {
      const pending = sessionStorage.getItem('tipz_pending_tip')
      if (!pending) {
        console.log('TIPZ Interceptor: No pending tip found')
        return
      }

      const { handle, timestamp } = JSON.parse(pending)
      console.log('TIPZ Interceptor: Found pending tip for', handle)

      // Only honor pending tips from last 10 minutes
      const TEN_MINUTES = 10 * 60 * 1000
      if (Date.now() - timestamp > TEN_MINUTES) {
        console.log('TIPZ Interceptor: Pending tip expired, clearing')
        sessionStorage.removeItem('tipz_pending_tip')
        return
      }

      // Clear immediately to prevent re-triggering
      sessionStorage.removeItem('tipz_pending_tip')

      // Wait for React to mount, then trigger modal
      setTimeout(() => {
        console.log('TIPZ Interceptor: Dispatching tipz-open-modal event for', handle)
        window.dispatchEvent(new CustomEvent('tipz-open-modal', {
          detail: { handle }
        }))
      }, 500)

    } catch (e) {
      console.log('TIPZ Interceptor: Error checking pending tip', e)
    }
  }

  // Run check on load
  checkPendingTip()
}

// Main component that provides the TipModal overlay
function TipzInterceptor() {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [handle, setHandle] = useState<string | null>(null)

  // Register global setters for event handling
  useEffect(() => {
    globalSetCreator = setCreator
    globalSetIsModalOpen = setIsModalOpen
    globalSetHandle = setHandle

    return () => {
      globalSetCreator = null
      globalSetIsModalOpen = null
      globalSetHandle = null
    }
  }, [])

  if (!handle) return null

  return (
    <TipModal
      creator={creator}
      handle={handle}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false)
        setHandle(null)
        setCreator(null)
      }}
    />
  )
}

export default TipzInterceptor
