/**
 * TIPZ Background Service Worker
 *
 * Handles:
 * - Real-time tip notifications via Supabase
 * - Real-time encrypted message reception
 * - Badge updates for unread tips
 * - Background sync of creator identity
 */

import { subscribeToTips, subscribeToMessages, type TipEvent, type MessageEvent } from "~lib/realtime"
import { getLinkedCreator, onLinkedCreatorChange, type CreatorIdentity } from "~lib/identity"
import { decryptMessage, hasPrivateKey } from "~lib/crypto"

// Storage keys
const UNREAD_COUNT_KEY = 'tipz_unread_count'
const LAST_NOTIFICATION_KEY = 'tipz_last_notification'
const MESSAGES_KEY = 'tipz_messages'

// State
let currentSubscription: (() => void) | null = null
let currentMessageSubscription: (() => void) | null = null
let currentHandle: string | null = null
let currentCreatorId: string | null = null

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

    // Store the decrypted message
    await storeMessage({
      depositAddress: message.depositAddress,
      text: plaintext,
      receivedAt: message.receivedAt,
    })

    // Show notification with decrypted message
    await showMessageNotification(plaintext)

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
 * Show a browser notification for a new message
 */
async function showMessageNotification(message: string) {
  const permission = await chrome.notifications.getPermissionLevel()
  if (permission !== 'granted') {
    return
  }

  const notificationId = `tipz-message-${Date.now()}`
  const truncatedMessage = message.length > 100 ? message.substring(0, 97) + "..." : message

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/icon48.png'),
    title: 'Private Message',
    message: truncatedMessage,
    priority: 2,
    requireInteraction: false,
  })

  setTimeout(() => {
    chrome.notifications.clear(notificationId)
  }, 10000)
}

interface StoredMessage {
  depositAddress: string
  text: string
  receivedAt: number
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
 * Handle a new incoming tip
 */
async function handleNewTip(tip: TipEvent) {
  console.log("TIPZ Background: New tip received!", tip)

  // Show notification
  await showTipNotification(tip)

  // Increment unread count
  const unreadCount = await incrementUnreadCount()

  // Update badge
  updateBadge(unreadCount)
}

/**
 * Show a browser notification for a new tip
 */
async function showTipNotification(tip: TipEvent) {
  // Check if we have notification permission
  const permission = await chrome.notifications.getPermissionLevel()
  if (permission !== 'granted') {
    console.log("TIPZ Background: Notification permission not granted")
    return
  }

  // Check for duplicate notifications (within 5 seconds)
  const lastNotification = await chrome.storage.local.get([LAST_NOTIFICATION_KEY])
  const lastId = lastNotification[LAST_NOTIFICATION_KEY]
  if (lastId === tip.id) {
    return
  }

  // Store this notification ID
  await chrome.storage.local.set({ [LAST_NOTIFICATION_KEY]: tip.id })

  // Format the notification
  const notificationId = `tipz-tip-${tip.id}`
  const amount = parseFloat(tip.amount).toFixed(4)

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/icon48.png'),
    title: 'New Tip Received! 🎉',
    message: `You received ${amount} ZEC${tip.message ? `: "${tip.message}"` : ''}`,
    priority: 2,
    requireInteraction: false,
  })

  // Clear notification after 10 seconds
  setTimeout(() => {
    chrome.notifications.clear(notificationId)
  }, 10000)
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
