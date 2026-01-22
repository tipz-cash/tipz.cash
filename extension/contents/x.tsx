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

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// Find tweet action bars to inject tip buttons
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = document.querySelectorAll('[data-testid="tweet"] [role="group"]')
  return Array.from(anchors).map((element) => ({
    element,
    insertPosition: "beforeend"
  }))
}

// Check if tweet is a reply (not an original post)
function isReplyTweet(element: HTMLElement): boolean {
  const tweetContainer = element.closest('[data-testid="tweet"]')
  if (!tweetContainer) return false

  // Check for "Replying to" text which indicates a reply
  const replyingTo = tweetContainer.querySelector('[data-testid="reply"]')
  if (replyingTo) return true

  // Also check for the reply context that shows who you're replying to
  const socialContext = tweetContainer.querySelector('[data-testid="socialContext"]')
  if (socialContext?.textContent?.includes('Replying to')) return true

  return false
}

// Extract handle from tweet element
function getHandleFromTweet(element: HTMLElement): string | null {
  // Navigate up to find the tweet container
  const tweetContainer = element.closest('[data-testid="tweet"]')
  if (!tweetContainer) return null

  // Find the username link
  const userLink = tweetContainer.querySelector('a[href^="/"][role="link"]')
  if (!userLink) return null

  const href = userLink.getAttribute("href")
  if (!href) return null

  // Extract handle from href (e.g., "/username" -> "username")
  const match = href.match(/^\/([^\/]+)$/)
  return match ? match[1] : null
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
        handle={handle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default TipzInline
