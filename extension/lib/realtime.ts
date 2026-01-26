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
}

export type TipEventCallback = (tip: TipEvent) => void

// Simple WebSocket-based realtime subscription
// This is a lightweight alternative to the full Supabase client
class TipRealtimeClient {
  private ws: WebSocket | null = null
  private handle: string | null = null
  private callbacks: Set<TipEventCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Subscribe to tips for a specific creator handle
   */
  subscribe(handle: string, callback: TipEventCallback): () => void {
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

    try {
      // Convert https URL to wss for WebSocket
      const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
      const realtimeUrl = `${wsUrl}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`

      this.ws = new WebSocket(realtimeUrl)

      this.ws.onopen = () => {
        console.log("TIPZ Realtime: Connected")
        this.reconnectAttempts = 0
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
        this.attemptReconnect()
      }
    } catch (e) {
      console.error("TIPZ Realtime: Failed to connect", e)
      this.startPolling()
    }
  }

  private subscribeToChannel() {
    if (!this.ws || !this.handle) return

    // Subscribe to tips table for this handle
    const payload = {
      topic: `realtime:public:tips:recipient_handle=eq.${this.handle}`,
      event: "phx_join",
      payload: {},
      ref: "1"
    }

    this.ws.send(JSON.stringify(payload))
  }

  private handleMessage(data: any) {
    // Handle Supabase Realtime protocol messages
    if (data.event === "INSERT" && data.payload?.record) {
      const tip: TipEvent = {
        id: data.payload.record.id,
        amount: data.payload.record.amount,
        from_address: data.payload.record.from_address,
        message: data.payload.record.message,
        created_at: data.payload.record.created_at,
        recipient_handle: data.payload.record.recipient_handle,
      }

      // Notify all callbacks
      this.callbacks.forEach((callback) => callback(tip))
    }

    // Handle heartbeat
    if (data.event === "phx_reply" && data.payload?.status === "ok") {
      console.log("TIPZ Realtime: Subscribed to channel")
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

    this.handle = null
    this.stopPolling()
  }

  // Polling fallback when WebSocket is not available
  private pollingInterval: ReturnType<typeof setInterval> | null = null
  private lastTipId: string | null = null

  private startPolling() {
    if (this.pollingInterval) return

    console.log("TIPZ Realtime: Starting polling fallback")

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
 * @param handle - The creator's handle
 * @param callback - Function called when a new tip arrives
 * @returns Unsubscribe function
 */
export function subscribeToTips(handle: string, callback: TipEventCallback): () => void {
  if (!realtimeClient) {
    realtimeClient = new TipRealtimeClient()
  }

  return realtimeClient.subscribe(handle, callback)
}
