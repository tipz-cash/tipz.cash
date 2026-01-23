import cssText from "data-text:~styles.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"
import { useState, useEffect } from "react"

import { TipButton } from "~components/TipButton"
import { TipModal } from "~components/TipModal"
import { lookupCreator, type Creator } from "~lib/api"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://twitter.com/*"],
  all_frames: true
}

// Debug: Log when content script loads
console.log("TIPZ: Content script loaded on", window.location.href)

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// Find tweet action bars to inject tip buttons
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  console.log("TIPZ: Looking for tweet action bars...")

  // Try multiple selectors - X changes their markup frequently
  const selectors = [
    '[data-testid="tweet"] [role="group"]',
    'article[data-testid="tweet"] [role="group"]',
    'article [role="group"][id]',
    '[data-testid="tweet"] div[role="group"]',
  ]

  let anchors: Element[] = []
  for (const selector of selectors) {
    const found = document.querySelectorAll(selector)
    console.log(`TIPZ: Selector "${selector}" found ${found.length} elements`)
    if (found.length > 0) {
      anchors = Array.from(found)
      break
    }
  }

  console.log(`TIPZ: Total anchors found: ${anchors.length}`)

  return anchors.map((element) => ({
    element,
    insertPosition: "beforeend" as const
  }))
}

// Check if tweet is a reply (not an original post)
function isReplyTweet(element: HTMLElement): boolean {
  const tweetContainer = element.closest('[data-testid="tweet"]') || element.closest('article')
  if (!tweetContainer) return false

  // Check for "Replying to" context that appears above reply tweets
  const socialContext = tweetContainer.querySelector('[data-testid="socialContext"]')
  if (socialContext?.textContent?.includes('Replying to')) return true

  // Also check for reply thread indicator
  const hasReplyingToText = tweetContainer.textContent?.includes('Replying to @')
  if (hasReplyingToText) return true

  return false
}

// Extract handle from tweet element
function getHandleFromTweet(element: HTMLElement): string | null {
  // Navigate up to find the tweet container
  const tweetContainer = element.closest('[data-testid="tweet"]') || element.closest('article')
  if (!tweetContainer) {
    console.log("TIPZ: No tweet container found")
    return null
  }

  // Try multiple selectors for username - X changes their markup
  const userLinkSelectors = [
    'a[href^="/"][role="link"]',
    'a[href^="/"][tabindex="-1"]',
    'div[data-testid="User-Name"] a[href^="/"]',
    'a[href^="/"][dir="ltr"]',
  ]

  let userLink: Element | null = null
  for (const selector of userLinkSelectors) {
    const links = tweetContainer.querySelectorAll(selector)
    // Find a link that looks like a username (single path segment)
    for (const link of links) {
      const href = link.getAttribute("href")
      if (href && /^\/[^\/]+$/.test(href) && !href.includes("/status")) {
        userLink = link
        break
      }
    }
    if (userLink) break
  }

  if (!userLink) {
    console.log("TIPZ: No user link found in tweet")
    return null
  }

  const href = userLink.getAttribute("href")
  if (!href) return null

  // Extract handle from href (e.g., "/username" -> "username")
  const match = href.match(/^\/([^\/]+)$/)
  const handle = match ? match[1] : null
  console.log("TIPZ: Extracted handle:", handle)
  return handle
}

// Global state for modal triggered from external sources
let globalSetCreator: ((creator: Creator | null) => void) | null = null
let globalSetIsModalOpen: ((open: boolean) => void) | null = null
let globalSetExternalHandle: ((handle: string | null) => void) | null = null

// Inject extension marker and set up external event listener (runs once)
if (typeof window !== "undefined") {
  // Inject marker div for extension detection
  if (!document.getElementById('tipz-extension-installed')) {
    const marker = document.createElement('div')
    marker.id = 'tipz-extension-installed'
    marker.style.display = 'none'
    document.body.appendChild(marker)
    console.log("TIPZ: Extension marker injected")
  }

  // Listen for external modal trigger events
  window.addEventListener('tipz-open-modal', ((event: CustomEvent) => {
    const { handle } = event.detail || {}
    console.log("TIPZ: External modal trigger received for handle:", handle)

    if (handle && globalSetCreator && globalSetIsModalOpen && globalSetExternalHandle) {
      lookupCreator("x", handle).then((result) => {
        if (result.found && result.creator) {
          globalSetCreator(result.creator)
          globalSetExternalHandle(handle)
          globalSetIsModalOpen(true)
        } else {
          // Even if creator not found, open modal with handle
          globalSetCreator(null)
          globalSetExternalHandle(handle)
          globalSetIsModalOpen(true)
        }
      })
    }
  }) as EventListener)
}

interface TipzInlineProps {
  anchor: {
    element: HTMLElement
  }
}

function TipzInline({ anchor }: TipzInlineProps) {
  const [handle, setHandle] = useState<string | null>(null)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isReply, setIsReply] = useState(false)
  const [externalHandle, setExternalHandle] = useState<string | null>(null)

  console.log("TIPZ: TipzInline component rendering")

  // Register global setters for external modal triggering
  useEffect(() => {
    globalSetCreator = setCreator
    globalSetIsModalOpen = setIsModalOpen
    globalSetExternalHandle = setExternalHandle

    return () => {
      globalSetCreator = null
      globalSetIsModalOpen = null
      globalSetExternalHandle = null
    }
  }, [])

  useEffect(() => {
    // Check if this is a reply tweet - don't show TIP on replies
    const reply = isReplyTweet(anchor.element)
    setIsReply(reply)

    const extractedHandle = getHandleFromTweet(anchor.element)
    setHandle(extractedHandle)

    if (extractedHandle && !reply) {
      lookupCreator("x", extractedHandle)
        .then((result) => {
          if (result.found && result.creator) {
            setCreator(result.creator)
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [anchor.element])

  // Don't show TIP button on replies, only original posts
  if (!handle || isLoading || isReply) {
    return null
  }

  // Use externalHandle if available (from tipz-open-modal event), otherwise use handle from tweet
  const modalHandle = externalHandle || handle

  return (
    <>
      <div style={{ marginLeft: "8px" }}>
        <TipButton
          creator={creator}
          handle={handle}
          onTip={() => setIsModalOpen(true)}
        />
      </div>
      <TipModal
        creator={creator}
        handle={modalHandle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setExternalHandle(null) // Reset external handle when closing
        }}
      />
    </>
  )
}

export default TipzInline
