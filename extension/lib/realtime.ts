/**
 * Supabase Realtime Subscription for Tip Alerts
 *
 * Subscribes to the tips table and emits events when new tips arrive
 * for the linked creator.
 */

const API_BASE = process.env.PLASMO_PUBLIC_API_URL || "https://tipz.cash"
const SUPABASE_URL = process.env.PLASMO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY

export interface TipEvent {
  id: string
  amount: string
  from_address?: string
  message?: string
  created_at: string
  recipient_handle: string
  amountUsd?: string  // e.g., "$1.25"
}

export interface MessageEvent {
  depositAddress: string
  encryptedBlob: string
  receivedAt: number
  amountZec?: string    // e.g., "0.0500"
  amountUsd?: string    // e.g., "$2.50"
}

export type TipEventCallback = (tip: TipEvent) => void
export type MessageEventCallback = (message: MessageEvent) => void

// Connection status type
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'polling'

// Callback for connection status changes
export type ConnectionStatusCallback = (status: ConnectionStatus) => void

// Simple WebSocket-based realtime subscription
// This is a lightweight alternative to the full Supabase client
class TipRealtimeClient {
  private ws: WebSocket | null = null
  private creatorId: string | null = null
  private handle: string | null = null
  private callbacks: Set<TipEventCallback> = new Set()
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private _status: ConnectionStatus = 'disconnected'

  /**
   * Get current connection status
   */
  get status(): ConnectionStatus {
    return this._status
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.add(callback)
    // Immediately call with current status
    callback(this._status)
    return () => this.statusCallbacks.delete(callback)
  }

  private setStatus(status: ConnectionStatus) {
    if (this._status !== status) {
      this._status = status
      this.statusCallbacks.forEach(cb => cb(status))
    }
  }

  /**
   * Subscribe to tips for a specific creator
   * @param creatorId - The creator's UUID from database
   * @param handle - The creator's handle (for display/fallback)
   * @param callback - Function called when a new tip arrives
   */
  subscribe(creatorId: string, handle: string, callback: TipEventCallback): () => void {
    this.creatorId = creatorId
    this.handle = handle
    this.callbacks.add(callback)

    // Connect if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
      if (this.callbacks.size === 0) {
        this.disconnect()
      }
    }
  }

  private connect() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn("TIPZ Realtime: Supabase credentials not configured, using polling fallback")
      this.startPolling()
      return
    }

    this.setStatus('connecting')

    try {
      // Convert https URL to wss for WebSocket
      const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
      const realtimeUrl = `${wsUrl}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`

      this.ws = new WebSocket(realtimeUrl)

      this.ws.onopen = () => {
        console.log("TIPZ Realtime: Connected")
        this.reconnectAttempts = 0
        this.setStatus('connected')
        this.subscribeToChannel()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (e) {
          console.warn("TIPZ Realtime: Failed to parse message", e)
        }
      }

      this.ws.onerror = (error) => {
        console.error("TIPZ Realtime: WebSocket error", error)
      }

      this.ws.onclose = () => {
        console.log("TIPZ Realtime: Disconnected")
        this.setStatus('disconnected')
        this.attemptReconnect()
      }
    } catch (e) {
      console.error("TIPZ Realtime: Failed to connect", e)
      this.setStatus('disconnected')
      this.startPolling()
    }
  }

  private subscribeToChannel() {
    if (!this.ws || !this.creatorId) return

    // Subscribe to transactions table for this creator
    const payload = {
      topic: `realtime:public:transactions:creator_id=eq.${this.creatorId}`,
      event: "phx_join",
      payload: {},
      ref: "1"
    }

    this.ws.send(JSON.stringify(payload))
    console.log("TIPZ Realtime: Subscribing to transactions for creator:", this.creatorId)
  }

  private handleMessage(data: any) {
    // Handle Supabase Realtime protocol messages
    if (data.event === "INSERT" && data.payload?.record) {
      const record = data.payload.record
      // Map transaction table columns to TipEvent
      const tip: TipEvent = {
        id: record.id,
        amount: String(record.amount_zec),
        from_address: record.sender_address,
        message: record.memo,
        created_at: record.created_at,
        recipient_handle: this.handle || "",
        // Include USD amount from metadata if available
        amountUsd: record.amount_usd ? `$${Number(record.amount_usd).toFixed(2)}` : undefined,
      }

      console.log("TIPZ Realtime: New transaction received:", tip.id)
      // Notify all callbacks
      this.callbacks.forEach((callback) => callback(tip))
    }

    // Handle heartbeat
    if (data.event === "phx_reply" && data.payload?.status === "ok") {
      console.log("TIPZ Realtime: Subscribed to transactions channel")
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("TIPZ Realtime: Max reconnect attempts reached, falling back to polling")
      this.startPolling()
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    console.log(`TIPZ Realtime: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.creatorId = null
    this.handle = null
    this.stopPolling()
    this.setStatus('disconnected')
  }

  // Polling fallback when WebSocket is not available
  private pollingInterval: ReturnType<typeof setInterval> | null = null
  private lastTipId: string | null = null

  private startPolling() {
    if (this.pollingInterval) return

    console.log("TIPZ Realtime: Starting polling fallback")
    this.setStatus('polling')

    // Poll every 30 seconds
    this.pollingInterval = setInterval(() => this.poll(), 30000)
    // Initial poll
    this.poll()
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private async poll() {
    if (!this.handle) return

    try {
      const response = await fetch(
        `${API_BASE}/api/tips/latest?handle=${encodeURIComponent(this.handle)}`
      )

      if (!response.ok) return

      const data = await response.json()
      const latestTip = data.tip as TipEvent | null

      if (latestTip && latestTip.id !== this.lastTipId) {
        // New tip received
        if (this.lastTipId !== null) {
          // Only notify if we had a previous tip (not on first load)
          this.callbacks.forEach((callback) => callback(latestTip))
        }
        this.lastTipId = latestTip.id
      }
    } catch (e) {
      console.warn("TIPZ Realtime: Polling failed", e)
    }
  }
}

// Singleton instance
let realtimeClient: TipRealtimeClient | null = null

/**
 * Subscribe to tip notifications for a creator
 * @param creatorId - The creator's UUID from database
 * @param handle - The creator's handle (for display)
 * @param callback - Function called when a new tip arrives
 * @returns Unsubscribe function
 */
export function subscribeToTips(creatorId: string, handle: string, callback: TipEventCallback): () => void {
  if (!realtimeClient) {
    realtimeClient = new TipRealtimeClient()
  }

  return realtimeClient.subscribe(creatorId, handle, callback)
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): ConnectionStatus {
  if (!realtimeClient) return 'disconnected'
  return realtimeClient.status
}

/**
 * Subscribe to connection status changes
 * @param callback - Function called when connection status changes
 * @returns Unsubscribe function
 */
export function onConnectionStatusChange(callback: ConnectionStatusCallback): () => void {
  if (!realtimeClient) {
    realtimeClient = new TipRealtimeClient()
  }
  return realtimeClient.onStatusChange(callback)
}

// Messages realtime client for encrypted messages
class MessageRealtimeClient {
  private ws: WebSocket | null = null
  private creatorId: string | null = null
  private callbacks: Set<MessageEventCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Subscribe to encrypted messages for a specific creator ID
   */
  subscribe(creatorId: string, callback: MessageEventCallback): () => void {
    this.creatorId = creatorId
    this.callbacks.add(callback)

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect()
    }

    return () => {
      this.callbacks.delete(callback)
      if (this.callbacks.size === 0) {
        this.disconnect()
      }
    }
  }

  private connect() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn("TIPZ Messages: Supabase credentials not configured")
      return
    }

    try {
      const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
      const realtimeUrl = `${wsUrl}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`

      this.ws = new WebSocket(realtimeUrl)

      this.ws.onopen = () => {
        console.log("TIPZ Messages: Connected")
        this.reconnectAttempts = 0
        this.subscribeToChannel()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (e) {
          console.warn("TIPZ Messages: Failed to parse message", e)
        }
      }

      this.ws.onerror = (error) => {
        console.error("TIPZ Messages: WebSocket error", error)
      }

      this.ws.onclose = () => {
        console.log("TIPZ Messages: Disconnected")
        this.attemptReconnect()
      }
    } catch (e) {
      console.error("TIPZ Messages: Failed to connect", e)
    }
  }

  private subscribeToChannel() {
    if (!this.ws || !this.creatorId) return

    // Subscribe to broadcast channel for this creator's messages
    const payload = {
      topic: `realtime:messages:${this.creatorId}`,
      event: "phx_join",
      payload: {},
      ref: "2"
    }

    this.ws.send(JSON.stringify(payload))
  }

  private handleMessage(data: any) {
    // Handle broadcast messages
    if (data.event === "broadcast" && data.payload?.event === "new_message") {
      const message: MessageEvent = {
        depositAddress: data.payload.payload.depositAddress,
        encryptedBlob: data.payload.payload.encryptedBlob,
        receivedAt: data.payload.payload.receivedAt,
        amountZec: data.payload.payload.amountZec,
        amountUsd: data.payload.payload.amountUsd,
      }

      this.callbacks.forEach((callback) => callback(message))
    }

    if (data.event === "phx_reply" && data.payload?.status === "ok") {
      console.log("TIPZ Messages: Subscribed to channel")
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("TIPZ Messages: Max reconnect attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    console.log(`TIPZ Messages: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.creatorId = null
  }
}

let messageClient: MessageRealtimeClient | null = null

/**
 * Subscribe to encrypted message notifications for a creator
 * @param creatorId - The creator's UUID (not handle)
 * @param callback - Function called when a new encrypted message arrives
 * @returns Unsubscribe function
 */
export function subscribeToMessages(creatorId: string, callback: MessageEventCallback): () => void {
  if (!messageClient) {
    messageClient = new MessageRealtimeClient()
  }

  return messageClient.subscribe(creatorId, callback)
}
