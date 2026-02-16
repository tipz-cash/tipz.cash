"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabaseClient } from "@/lib/supabase-client"

interface RawTip {
  id: string
  created_at: string
  status: string
  source_platform: string
  data: string | null
  creator_id: string
}

type ConnectionStatus = "disconnected" | "connecting" | "connected"

interface UseRealtimeTipsReturn {
  status: ConnectionStatus
  newTips: RawTip[]
  clearNewTips: () => void
}

export function useRealtimeTips(creatorId: string | null): UseRealtimeTipsReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [newTips, setNewTips] = useState<RawTip[]>([])
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastCheckRef = useRef<string>(new Date().toISOString())

  const clearNewTips = useCallback(() => setNewTips([]), [])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!creatorId || !supabaseClient) {
      // Fall back to polling if no Supabase client
      if (creatorId) {
        setStatus("connecting")
        startPolling()
      }
      return
    }

    setStatus("connecting")

    const channel = supabaseClient
      .channel(`tips:${creatorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tipz",
          filter: `creator_id=eq.${creatorId}`,
        },
        (payload) => {
          const tip = payload.new as RawTip
          setNewTips((prev) => [tip, ...prev])
        }
      )
      .subscribe((state) => {
        if (state === "SUBSCRIBED") {
          setStatus("connected")
        } else if (state === "CLOSED" || state === "CHANNEL_ERROR") {
          setStatus("disconnected")
          // Fall back to polling
          startPolling()
        }
      })

    return () => {
      channel.unsubscribe()
      stopPolling()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId])

  function startPolling() {
    if (pollingRef.current) return
    pollingRef.current = setInterval(async () => {
      if (!creatorId) return
      try {
        const res = await fetch(
          `/api/tips/latest?creator_id=${encodeURIComponent(creatorId)}&since=${encodeURIComponent(lastCheckRef.current)}`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.tips?.length > 0) {
            setNewTips((prev) => [...data.tips, ...prev])
            lastCheckRef.current = new Date().toISOString()
          }
          setStatus("connected")
        }
      } catch {
        setStatus("disconnected")
      }
    }, 30000)
  }

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  return { status, newTips, clearNewTips }
}
