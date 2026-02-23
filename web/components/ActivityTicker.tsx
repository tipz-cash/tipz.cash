"use client"

import { useEffect, useState, useMemo } from "react"
import { colors } from "@/lib/colors"

interface ActivityItem {
  creator_handle: string
  displayed_at: string
}

interface ActivityResponse {
  activity: ActivityItem[]
}

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

export function ActivityTicker({ prefersReducedMotion = false }: ActivityTickerProps) {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/activity?limit=20")
      const data: ActivityResponse = await res.json()

      if (data.activity && data.activity.length > 0) {
        setActivity(data.activity)
      }
    } catch (error) {
      console.error("[ActivityTicker] Fetch error:", error)
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
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }

        @keyframes soft-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        .ticker-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          width: max-content;
          padding: 16px 0;
          will-change: transform;
          contain: layout style;
        }

        .ticker-track:not(.reduced-motion) {
          animation: ticker-scroll 50s linear infinite;
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-family-mono);
          font-size: 13px;
          padding: 0 32px;
          contain: layout style;
        }

        .pulse-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${colors.success};
        }

        .pulse-dot:not(.reduced-motion) {
          animation: soft-pulse 3s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
          margin: "40px 0 48px",
          contain: "layout style",
        }}
      >
        {/* Left fade - using opacity gradient instead of blur */}
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

        {/* Ticker content - GPU accelerated */}
        <div className={`ticker-track ${prefersReducedMotion ? "reduced-motion" : ""}`}>
          {tickerItems.map((item, index) => (
            <div key={`${item.creator_handle}-${index}`} className="ticker-item">
              {/* Shield icon - simple, no blur */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill={colors.primary}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>

              {/* Handle */}
              <span style={{ color: colors.textBright, fontWeight: 500 }}>
                @{item.creator_handle}
              </span>

              {/* Action text */}
              <span style={{ color: colors.muted }}>received a tip</span>

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
              <span style={{ color: colors.muted, opacity: 0.6, fontSize: "12px" }}>
                {formatRelativeTime(item.displayed_at)}
              </span>

              {/* Live pulse indicator - no box-shadow */}
              <div className={`pulse-dot ${prefersReducedMotion ? "reduced-motion" : ""}`} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
