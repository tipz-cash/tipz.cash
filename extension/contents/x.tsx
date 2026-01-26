import cssText from "data-text:~styles.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"
import { useState, useEffect, useCallback } from "react"

import { AutoStampBadge } from "~components/AutoStampToggle"
import { getLinkedCreator, type CreatorIdentity } from "~lib/identity"
import { colors, fonts } from "~lib/theme"

const WEB_URL = process.env.PLASMO_PUBLIC_API_URL || "https://tipz.cash"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://twitter.com/*"],
  all_frames: true
}

// Debug logging
console.log("TIPZ: Creator content script loaded on", window.location.href)

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// Storage key for auto-stamp preference
const AUTO_STAMP_KEY = 'tipz_auto_stamp_enabled'

/**
 * Get auto-stamp preference from storage
 */
async function getAutoStampEnabled(): Promise<boolean> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await chrome.storage.local.get([AUTO_STAMP_KEY])
      return result[AUTO_STAMP_KEY] === true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Set auto-stamp preference in storage
 */
async function setAutoStampEnabled(enabled: boolean): Promise<void> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ [AUTO_STAMP_KEY]: enabled })
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Find tweet compose areas to inject TIPZ auto-stamp button
 * X has multiple compose contexts:
 * - Main compose box at /compose/tweet
 * - Reply compose in thread view
 * - Quote tweet compose
 */
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  console.log("TIPZ: Looking for compose areas...")

  // Selectors for compose toolbar areas
  const selectors = [
    // Main compose toolbar (where media, gif, poll buttons are)
    '[data-testid="toolBar"]',
    // Alternative: look for the row with media buttons
    '[data-testid="primaryColumn"] [role="group"]:has([data-testid="fileInput"])',
  ]

  let anchors: Element[] = []
  for (const selector of selectors) {
    try {
      const found = document.querySelectorAll(selector)
      console.log(`TIPZ: Selector "${selector}" found ${found.length} elements`)
      if (found.length > 0) {
        anchors = Array.from(found)
        break
      }
    } catch (e) {
      // Some selectors may not be supported
      console.log(`TIPZ: Selector "${selector}" not supported`)
    }
  }

  console.log(`TIPZ: Total compose anchors found: ${anchors.length}`)

  return anchors.map((element) => ({
    element,
    insertPosition: "beforeend" as const
  }))
}

// Inject extension marker for detection
if (typeof window !== "undefined") {
  if (!document.getElementById('tipz-extension-installed')) {
    const marker = document.createElement('div')
    marker.id = 'tipz-extension-installed'
    marker.style.display = 'none'
    document.body.appendChild(marker)
    console.log("TIPZ: Extension marker injected")
  }
}

interface TipzAutoStampProps {
  anchor: {
    element: HTMLElement
  }
}

/**
 * TIPZ Auto-Stamp Component
 *
 * Injects into X's compose toolbar to let creators easily add their tip link
 */
function TipzAutoStamp({ anchor }: TipzAutoStampProps) {
  const [linkedCreator, setLinkedCreator] = useState<CreatorIdentity | null>(null)
  const [isAutoStampEnabled, setIsAutoStampEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasStamped, setHasStamped] = useState(false)

  // Load linked creator identity
  useEffect(() => {
    getLinkedCreator().then((identity) => {
      setLinkedCreator(identity)
      setIsLoading(false)
    })

    // Load auto-stamp preference
    getAutoStampEnabled().then(setIsAutoStampEnabled)
  }, [])

  // Watch for compose text changes to detect if link is already present
  useEffect(() => {
    if (!linkedCreator) return

    const checkForExistingLink = () => {
      // Find the compose text area
      const textArea = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement
      if (textArea) {
        const text = textArea.textContent || ''
        const tipUrl = `tipz.cash/${linkedCreator.handle}`
        setHasStamped(text.includes(tipUrl))
      }
    }

    // Check initially
    checkForExistingLink()

    // Set up mutation observer to watch for text changes
    const observer = new MutationObserver(checkForExistingLink)
    const composeArea = anchor.element.closest('[data-testid="primaryColumn"]')
    if (composeArea) {
      observer.observe(composeArea, { subtree: true, characterData: true, childList: true })
    }

    return () => observer.disconnect()
  }, [linkedCreator, anchor.element])

  /**
   * Add the TIPZ link to the tweet compose area
   */
  const handleStamp = useCallback(() => {
    if (!linkedCreator) return

    const tipUrl = `tipz.cash/${linkedCreator.handle}`

    // Find the compose text area
    const textArea = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement
    if (!textArea) {
      console.log("TIPZ: Could not find tweet text area")
      return
    }

    // Check if link is already present
    const currentText = textArea.textContent || ''
    if (currentText.includes(tipUrl)) {
      console.log("TIPZ: Link already present in tweet")
      return
    }

    // X uses a contenteditable div, so we need to simulate typing
    // The safest approach is to use the clipboard API
    const linkText = currentText ? `\n\n${tipUrl}` : tipUrl

    // Focus the text area
    textArea.focus()

    // Try to insert via execCommand (works in most cases)
    const selection = window.getSelection()
    if (selection) {
      // Move cursor to end
      const range = document.createRange()
      range.selectNodeContents(textArea)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)

      // Insert text
      document.execCommand('insertText', false, linkText)
      setHasStamped(true)
      console.log("TIPZ: Tip link added to tweet")
    }
  }, [linkedCreator])

  // Auto-stamp when enabled and compose is opened
  useEffect(() => {
    if (isAutoStampEnabled && linkedCreator && !hasStamped && !isLoading) {
      // Small delay to let X's compose UI fully render
      const timer = setTimeout(handleStamp, 500)
      return () => clearTimeout(timer)
    }
  }, [isAutoStampEnabled, linkedCreator, hasStamped, isLoading, handleStamp])

  // Don't show anything if not linked
  if (isLoading || !linkedCreator) {
    return null
  }

  // If link is already in tweet, show confirmation
  if (hasStamped) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 10px",
          marginLeft: "8px",
          fontSize: "12px",
          fontFamily: fonts.mono,
          color: colors.success,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        TIPZ added
      </div>
    )
  }

  return (
    <div style={{ marginLeft: "8px", display: "flex", alignItems: "center" }}>
      <AutoStampBadge
        handle={linkedCreator.handle}
        onClick={handleStamp}
      />
    </div>
  )
}

export default TipzAutoStamp
