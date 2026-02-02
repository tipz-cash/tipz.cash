"use client"

import { useEffect, useState, useMemo } from "react"
import { colors } from "@/lib/colors"

interface ActivityItem {
  creator_handle: string
  displayed_at: string
}

interface ActivityResponse {
  activity: ActivityItem[]
  demo?: boolean
}

// Demo data shown when no real activity exists
const demoActivity: ActivityItem[] = [
  {
    creator_handle: "privacy_advocate",
    displayed_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    creator_handle: "crypto_builder",
    displayed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    creator_handle: "journalist_x",
    displayed_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    creator_handle: "open_source_dev",
    displayed_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    creator_handle: "anon_writer",
    displayed_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
]

// Privacy: Vague time labels to prevent on-chain correlation
function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diffMs = now - date

  if (diffMs < 0) return "Recently"

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return "Recently"
  if (diffHours < 24) return "Today"
  return "Yesterday"
}

interface ActivityTickerProps {
  prefersReducedMotion?: boolean
}

export function ActivityTicker({
  prefersReducedMotion = false,
}: ActivityTickerProps) {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/activity?limit=20")
      const data: ActivityResponse = await res.json()

      if (data.activity && data.activity.length > 0) {
        setActivity(data.activity)
        setIsDemo(data.demo || false)
      } else {
        setActivity(demoActivity)
        setIsDemo(true)
      }
    } catch (error) {
      console.error("[ActivityTicker] Fetch error:", error)
      setActivity(demoActivity)
      setIsDemo(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
    const interval = setInterval(fetchActivity, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  const tickerItems = useMemo(() => {
    if (activity.length === 0) return []
    return [...activity, ...activity, ...activity]
  }, [activity])

  if (isLoading || activity.length === 0) {
    return null
  }

  return (
    <>
      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes soft-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
          margin: "40px 0 48px",
        }}
      >
        {/* Subtle ambient glow behind ticker */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "200%",
            background: `radial-gradient(ellipse, ${colors.primaryGlow} 0%, transparent 70%)`,
            opacity: 0.3,
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        {/* Left fade */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "120px",
            background: `linear-gradient(90deg, ${colors.pageBg} 0%, transparent 100%)`,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Right fade */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "120px",
            background: `linear-gradient(270deg, ${colors.pageBg} 0%, transparent 100%)`,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Ticker content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            animation: prefersReducedMotion
              ? "none"
              : "ticker-scroll 50s linear infinite",
            width: "max-content",
            padding: "16px 0",
          }}
        >
          {tickerItems.map((item, index) => (
            <TickerItem
              key={`${item.creator_handle}-${index}`}
              handle={item.creator_handle}
              displayedAt={item.displayed_at}
              isDemo={isDemo}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* Demo indicator - subtle, bottom right */}
        {isDemo && (
          <div
            style={{
              position: "absolute",
              bottom: "-4px",
              right: "24px",
              fontSize: "9px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1px",
              color: colors.muted,
              opacity: 0.4,
            }}
          >
            DEMO
          </div>
        )}
      </div>
    </>
  )
}

interface TickerItemProps {
  handle: string
  displayedAt: string
  isDemo: boolean
  prefersReducedMotion: boolean
}

function TickerItem({ handle, displayedAt, prefersReducedMotion }: TickerItemProps) {
  const relativeTime = formatRelativeTime(displayedAt)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "13px",
        padding: "0 32px",
      }}
    >
      {/* Shield icon with glow */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Glow behind icon */}
        <div
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: colors.primary,
            filter: "blur(8px)",
            opacity: 0.3,
          }}
        />
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={colors.primary}
          style={{ position: "relative", zIndex: 1 }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      {/* Handle */}
      <span
        style={{
          color: colors.textBright,
          fontWeight: 500,
        }}
      >
        @{handle}
      </span>

      {/* Action text */}
      <span style={{ color: colors.muted }}>
        received a tip
      </span>

      {/* Dot separator */}
      <span
        style={{
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          background: colors.border,
        }}
      />

      {/* Time */}
      <span
        style={{
          color: colors.muted,
          opacity: 0.6,
          fontSize: "12px",
        }}
      >
        {relativeTime}
      </span>

      {/* Live pulse indicator */}
      <div
        style={{
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: colors.success,
          animation: prefersReducedMotion ? "none" : "soft-pulse 3s ease-in-out infinite",
          boxShadow: `0 0 6px ${colors.successGlow}`,
        }}
      />
    </div>
  )
}
