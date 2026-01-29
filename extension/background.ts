/**
 * TIPZ Background Service Worker
 *
 * Handles:
 * - Real-time tip notifications via Supabase
 * - Real-time encrypted message reception
 * - Badge updates for unread tips
 * - Background sync of creator identity
 */

import { subscribeToTips, subscribeToMessages, onConnectionStatusChange, type TipEvent, type MessageEvent, type ConnectionStatus } from "~lib/realtime"
import { getLinkedCreator, onLinkedCreatorChange, type CreatorIdentity } from "~lib/identity"
import { decryptMessage, hasPrivateKey } from "~lib/crypto"
import { sanitizeMessage, truncateText } from "~lib/sanitize"

// Storage keys
const UNREAD_COUNT_KEY = 'tipz_unread_count'
const LAST_NOTIFICATION_KEY = 'tipz_last_notification'
const MESSAGES_KEY = 'tipz_messages'
const LOCAL_TIPS_KEY = 'tipz_local_tips'

// State
let currentSubscription: (() => void) | null = null
let currentMessageSubscription: (() => void) | null = null
let currentStatusSubscription: (() => void) | null = null
let currentHandle: string | null = null
let currentCreatorId: string | null = null
let currentConnectionStatus: ConnectionStatus = 'disconnected'

/**
 * Initialize the background service worker
 */
async function init() {
  console.log("TIPZ Background: Initializing...")

  // Load linked creator and start subscription
  const identity = await getLinkedCreator()
  if (identity) {
    startTipSubscription(identity)
  }

  // Listen for identity changes
  onLinkedCreatorChange((identity) => {
    if (identity) {
      startTipSubscription(identity)
    } else {
      stopTipSubscription()
    }
  })

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CLEAR_UNREAD') {
      clearUnreadCount()
      sendResponse({ success: true })
    } else if (message.type === 'GET_UNREAD_COUNT') {
      getUnreadCount().then((count) => sendResponse({ count }))
      return true // Keep channel open for async response
    } else if (message.type === 'GET_MESSAGES') {
      getMessages().then((messages) => sendResponse({ messages }))
      return true
    } else if (message.type === 'GET_LOCAL_TIPS') {
      getLocalTips().then((tips) => sendResponse({ tips }))
      return true
    } else if (message.type === 'GET_CONNECTION_STATUS') {
      sendResponse({ status: currentConnectionStatus })
    } else if (message.type === 'TEST_TIP_NOTIFICATION') {
      // DEV: Test tip notification
      handleNewTip({
        id: `test-${Date.now()}`,
        amount: "0.0250",
        amountUsd: "$1.25",
        message: "Great content! Keep it up!",
        created_at: new Date().toISOString()
      })
      sendResponse({ success: true })
    } else if (message.type === 'TEST_MESSAGE_NOTIFICATION') {
      // DEV: Test message notification
      showMessageNotification("This is a test private message from a supporter!")
      sendResponse({ success: true })
    }
  })

  console.log("TIPZ Background: Initialized")
}

/**
 * Start subscribing to tips for the linked creator
 */
function startTipSubscription(identity: CreatorIdentity) {
  // Don't resubscribe if already subscribed to same handle
  if (currentHandle === identity.handle && currentSubscription) {
    return
  }

  // Stop any existing subscription
  stopTipSubscription()

  console.log("TIPZ Background: Subscribing to tips for", identity.handle)
  currentHandle = identity.handle

  currentSubscription = subscribeToTips(identity.handle, (tip) => {
    handleNewTip(tip)
  })

  // Subscribe to connection status changes
  currentStatusSubscription = onConnectionStatusChange((status) => {
    currentConnectionStatus = status
    // Broadcast status change to popup
    chrome.runtime.sendMessage({
      type: "TIPZ_CONNECTION_STATUS_CHANGED",
      data: { status }
    }).catch(() => {
      // Popup not open, ignore
    })
  })

  // Also start message subscription if we have a creator ID
  if (identity.creatorId) {
    startMessageSubscription(identity.creatorId)
  }
}

/**
 * Stop the current tip subscription
 */
function stopTipSubscription() {
  if (currentSubscription) {
    currentSubscription()
    currentSubscription = null
    currentHandle = null
  }

  if (currentMessageSubscription) {
    currentMessageSubscription()
    currentMessageSubscription = null
    currentCreatorId = null
  }

  if (currentStatusSubscription) {
    currentStatusSubscription()
    currentStatusSubscription = null
  }

  currentConnectionStatus = 'disconnected'

  // Clear badge
  updateBadge(0)
}

/**
 * Start subscribing to encrypted messages for the creator
 */
async function startMessageSubscription(creatorId: string) {
  // Check if we have a private key to decrypt messages
  const hasKey = await hasPrivateKey()
  if (!hasKey) {
    console.log("TIPZ Background: No private key, skipping message subscription")
    return
  }

  // Don't resubscribe if already subscribed
  if (currentCreatorId === creatorId && currentMessageSubscription) {
    return
  }

  // Stop existing subscription
  if (currentMessageSubscription) {
    currentMessageSubscription()
    currentMessageSubscription = null
  }

  console.log("TIPZ Background: Subscribing to messages for", creatorId)
  currentCreatorId = creatorId

  currentMessageSubscription = subscribeToMessages(creatorId, async (message) => {
    await handleNewMessage(message)
  })
}

/**
 * Handle a new encrypted message
 */
async function handleNewMessage(message: MessageEvent) {
  console.log("TIPZ Background: New encrypted message received")

  try {
    // Decrypt the message (no password for v1)
    const plaintext = await decryptMessage(message.encryptedBlob)

    // Sanitize decrypted content before storage
    const sanitizedText = sanitizeMessage(plaintext)

    // Store the sanitized message with tip amounts
    await storeMessage({
      depositAddress: message.depositAddress,
      text: sanitizedText,
      receivedAt: message.receivedAt,
      amountZec: message.amountZec,
      amountUsd: message.amountUsd,
    })

    // Show notification with sanitized message
    await showMessageNotification(sanitizedText)

    // Increment unread count
    const unreadCount = await incrementUnreadCount()
    updateBadge(unreadCount)

  } catch (error) {
    console.error("TIPZ Background: Failed to decrypt message:", error)
    // Still show notification that a message was received
    await showMessageNotification("[Unable to decrypt message]")
  }
}

/**
 * Show a styled notification for a new message
 * Sends message to content script to display custom card
 */
async function showMessageNotification(message: string) {
  // Sanitize and truncate for notification
  const sanitized = sanitizeMessage(message)
  const truncatedMessage = truncateText(sanitized, 100)

  // Send to all tabs to show styled notification
  const tabs = await chrome.tabs.query({})
  console.log(`TIPZ Background: Sending message notification to ${tabs.length} tabs`)

  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
      chrome.tabs.sendMessage(tab.id, {
        type: "TIPZ_SHOW_MESSAGE_NOTIFICATION",
        data: {
          text: truncatedMessage,
        }
      }).catch(() => {
        // Tab might not have content script loaded, ignore
      })
    }
  }

  // Also show native notification as fallback
  const permission = await chrome.notifications.getPermissionLevel()
  if (permission === 'granted') {
    const notificationId = `tipz-message-${Date.now()}`
    // Get icon path from manifest (Plasmo renames files with content hashes)
    const iconPath = chrome.runtime.getManifest().icons?.['48'] || 'icon48.png'

    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL(iconPath),
      title: 'Private Message',
      message: truncatedMessage,
      priority: 2,
      requireInteraction: false,
    })

    setTimeout(() => {
      chrome.notifications.clear(notificationId)
    }, 10000)
  }
}

interface StoredMessage {
  depositAddress: string
  text: string
  receivedAt: number
  amountZec?: string    // e.g., "0.0500"
  amountUsd?: string    // e.g., "$2.50"
}

/**
 * Store a decrypted message
 */
async function storeMessage(message: StoredMessage): Promise<void> {
  const result = await chrome.storage.local.get([MESSAGES_KEY])
  const messages: StoredMessage[] = result[MESSAGES_KEY] || []

  // Add new message at the beginning
  messages.unshift(message)

  // Keep only the last 50 messages
  const trimmedMessages = messages.slice(0, 50)

  await chrome.storage.local.set({ [MESSAGES_KEY]: trimmedMessages })
}

/**
 * Get stored messages
 */
async function getMessages(): Promise<StoredMessage[]> {
  const result = await chrome.storage.local.get([MESSAGES_KEY])
  return result[MESSAGES_KEY] || []
}

/**
 * Store a tip locally for immediate display in popup
 */
interface LocalTip {
  id: string
  amount: string
  amountUsd: string
  message?: string
  receivedAt: number
}

async function storeLocalTip(tip: TipEvent): Promise<void> {
  const result = await chrome.storage.local.get([LOCAL_TIPS_KEY])
  const tips: LocalTip[] = result[LOCAL_TIPS_KEY] || []

  // Calculate USD amount (approximate)
  const zecAmount = parseFloat(tip.amount)
  const amountUsd = (tip as any).amountUsd || `$${(zecAmount * 50).toFixed(2)}`

  // Add new tip at the beginning
  tips.unshift({
    id: tip.id,
    amount: tip.amount,
    amountUsd,
    message: tip.message,
    receivedAt: Date.now(),
  })

  // Keep only the last 50 tips
  const trimmedTips = tips.slice(0, 50)

  await chrome.storage.local.set({ [LOCAL_TIPS_KEY]: trimmedTips })
}

/**
 * Get locally stored tips
 */
async function getLocalTips(): Promise<LocalTip[]> {
  const result = await chrome.storage.local.get([LOCAL_TIPS_KEY])
  return result[LOCAL_TIPS_KEY] || []
}

/**
 * Handle a new incoming tip
 */
async function handleNewTip(tip: TipEvent) {
  console.log("TIPZ Background: New tip received!", tip)

  // Store the tip locally for immediate display
  await storeLocalTip(tip)

  // Show notification
  await showTipNotification(tip)

  // Increment unread count
  const unreadCount = await incrementUnreadCount()

  // Update badge
  updateBadge(unreadCount)

  // Notify popup if it's open (for realtime updates)
  chrome.runtime.sendMessage({
    type: "TIPZ_NEW_TIP_RECEIVED",
    data: tip
  }).catch(() => {
    // Popup not open, ignore
  })
}

/**
 * Show a styled notification for a new tip
 * Sends message to content script to display custom card
 */
async function showTipNotification(tip: TipEvent) {
  // Check for duplicate notifications (within 5 seconds)
  const lastNotification = await chrome.storage.local.get([LAST_NOTIFICATION_KEY])
  const lastId = lastNotification[LAST_NOTIFICATION_KEY]
  if (lastId === tip.id) {
    return
  }

  // Store this notification ID
  await chrome.storage.local.set({ [LAST_NOTIFICATION_KEY]: tip.id })

  // Send to all tabs to show styled notification
  const tabs = await chrome.tabs.query({})
  console.log(`TIPZ Background: Sending notification to ${tabs.length} tabs`)

  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
      console.log(`TIPZ Background: Sending to tab ${tab.id}: ${tab.url?.slice(0, 50)}`)
      chrome.tabs.sendMessage(tab.id, {
        type: "TIPZ_SHOW_TIP_NOTIFICATION",
        data: {
          amount: tip.amount,
          amountUsd: (tip as any).amountUsd || null,
          message: tip.message,
        }
      }).then(() => {
        console.log(`TIPZ Background: Sent to tab ${tab.id} successfully`)
      }).catch((err) => {
        console.log(`TIPZ Background: Tab ${tab.id} - content script not loaded (${err.message})`)
      })
    }
  }

  // Also show native notification as fallback
  const permission = await chrome.notifications.getPermissionLevel()
  if (permission === 'granted') {
    const notificationId = `tipz-tip-${tip.id}`
    const amount = parseFloat(tip.amount).toFixed(4)
    // Get icon path from manifest (Plasmo renames files with content hashes)
    const iconPath = chrome.runtime.getManifest().icons?.['48'] || 'icon48.png'

    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL(iconPath),
      title: 'New Tip Received!',
      message: `You received ${amount} ZEC${tip.message ? `: "${tip.message}"` : ''}`,
      priority: 2,
      requireInteraction: false,
    })

    setTimeout(() => {
      chrome.notifications.clear(notificationId)
    }, 10000)
  }
}

/**
 * Update the extension badge with unread count
 */
function updateBadge(count: number) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() })
    chrome.action.setBadgeBackgroundColor({ color: '#22C55E' }) // Success green
  } else {
    chrome.action.setBadgeText({ text: '' })
  }
}

/**
 * Get the current unread tip count
 */
async function getUnreadCount(): Promise<number> {
  const result = await chrome.storage.local.get([UNREAD_COUNT_KEY])
  return result[UNREAD_COUNT_KEY] || 0
}

/**
 * Increment the unread tip count
 */
async function incrementUnreadCount(): Promise<number> {
  const currentCount = await getUnreadCount()
  const newCount = currentCount + 1
  await chrome.storage.local.set({ [UNREAD_COUNT_KEY]: newCount })
  return newCount
}

/**
 * Clear the unread tip count
 */
async function clearUnreadCount(): Promise<void> {
  await chrome.storage.local.set({ [UNREAD_COUNT_KEY]: 0 })
  updateBadge(0)
}

// Initialize
init()
