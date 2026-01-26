/**
 * TIPZ Background Service Worker
 *
 * Handles:
 * - Real-time tip notifications via Supabase
 * - Badge updates for unread tips
 * - Background sync of creator identity
 */

import { subscribeToTips, type TipEvent } from "~lib/realtime"
import { getLinkedCreator, onLinkedCreatorChange, type CreatorIdentity } from "~lib/identity"

// Storage keys
const UNREAD_COUNT_KEY = 'tipz_unread_count'
const LAST_NOTIFICATION_KEY = 'tipz_last_notification'

// State
let currentSubscription: (() => void) | null = null
let currentHandle: string | null = null

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

  // Clear badge
  updateBadge(0)
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
