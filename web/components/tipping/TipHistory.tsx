"use client"

import { useState, useEffect } from "react"
import { getTipHistory, type TipHistoryEntry } from "@/hooks/useTipping"
import { tokens } from "./designTokens"

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const statusConfig: Record<
  TipHistoryEntry["status"],
  { label: string; color: string; icon: string }
> = {
  delivered: { label: "Delivered", color: tokens.colors.success, icon: "check" },
  failed: { label: "Failed", color: tokens.colors.error, icon: "x" },
  refunded: { label: "Refunded", color: tokens.colors.gold, icon: "rotate" },
}

export function TipHistory() {
  const [history, setHistory] = useState<TipHistoryEntry[]>([])

  useEffect(() => {
    setHistory(getTipHistory())
  }, [])

  if (history.length === 0) return null

  return (
    <div
      style={{
        marginTop: tokens.space.md,
        padding: `${tokens.space.sm}px ${tokens.space.md}px`,
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: tokens.radius.md,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: tokens.space.sm,
        }}
      >
        <span
          style={{
            color: tokens.colors.textMuted,
            fontSize: "11px",
            fontFamily: tokens.font.mono,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Recent tips
        </span>
        <span
          style={{
            color: tokens.colors.textSubtle,
            fontSize: "10px",
            fontFamily: tokens.font.mono,
          }}
        >
          {history.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {history.slice(0, 3).map((entry, i) => {
          const cfg = statusConfig[entry.status]
          return (
            <div
              key={`${entry.timestamp}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `${tokens.space.xs}px 0`,
                borderBottom:
                  i < Math.min(history.length, 3) - 1
                    ? "1px solid rgba(255, 255, 255, 0.04)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space.sm,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {/* Status indicator */}
                {cfg.icon === "check" && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {cfg.icon === "x" && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
                {cfg.icon === "rotate" && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="3"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  </svg>
                )}

                <span
                  style={{
                    color: tokens.colors.text,
                    fontSize: "12px",
                    fontFamily: tokens.font.mono,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  @{entry.creatorHandle}
                </span>
                <span
                  style={{
                    color: tokens.colors.textSubtle,
                    fontSize: "11px",
                    fontFamily: tokens.font.mono,
                  }}
                >
                  {entry.amount} {entry.tokenSymbol}
                </span>
              </div>

              <span
                style={{
                  color: tokens.colors.textSubtle,
                  fontSize: "10px",
                  fontFamily: tokens.font.mono,
                  flexShrink: 0,
                  marginLeft: tokens.space.sm,
                }}
              >
                {timeAgo(entry.timestamp)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
