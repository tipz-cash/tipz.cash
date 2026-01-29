import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*", "https://twitter.com/*"],
  all_frames: true
}

console.log("TIPZ: Content script loaded on", window.location.href)

// Inject extension marker for detection
if (typeof window !== "undefined") {
  if (!document.getElementById('tipz-extension-installed')) {
    const marker = document.createElement('div')
    marker.id = 'tipz-extension-installed'
    marker.style.display = 'none'
    document.body.appendChild(marker)
  }
}

/**
 * Insert tip link into the tweet compose area
 */
function insertTipLink(tipUrl: string): boolean {
  // Find the compose text area
  const textArea = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement
  if (!textArea) {
    console.log("TIPZ: Could not find tweet compose area")
    return false
  }

  // Check if link is already present
  const currentText = textArea.textContent || ''
  if (currentText.includes(tipUrl)) {
    console.log("TIPZ: Link already present")
    return true
  }

  // Prepare the link text (add newlines if there's existing content)
  const linkText = currentText.trim() ? `\n\n${tipUrl}` : tipUrl

  // Focus and insert
  textArea.focus()

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
    console.log("TIPZ: Tip link inserted")
    return true
  }

  return false
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("TIPZ: Received message", message)

  if (message.type === "TIPZ_STAMP" && message.tipUrl) {
    const success = insertTipLink(message.tipUrl)
    sendResponse({ success })
  }

  return true // Keep channel open for async
})
