"use client"

import { useState } from "react"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"
import ConnectionIndicator from "./ConnectionIndicator"

function LogOutIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function ShieldCheckIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  )
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

interface ProfileHeaderProps {
  handle: string
  avatarUrl: string | null
  connectionStatus: "disconnected" | "connecting" | "connected"
  loggingOut: boolean
  onLogout: () => void
  prefersReducedMotion: boolean
}

function getInitialColor(handle: string): string {
  let hash = 0
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 50%, 35%)`
}

export default function ProfileHeader({
  handle,
  avatarUrl,
  connectionStatus,
  loggingOut,
  onLogout,
  prefersReducedMotion,
}: ProfileHeaderProps) {
  const [urlCopied, setUrlCopied] = useState(false)
  const tipUrl = `tipz.cash/${handle}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(tipUrl)
    } catch {
      const input = document.createElement("input")
      input.value = tipUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
    }
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const anim = (delay: string, animation: string) =>
    prefersReducedMotion ? { opacity: 1 } : { animation, animationDelay: delay, animationFillMode: "both" as const }

  return (
    <div style={{
      marginBottom: "0",
      ...anim("0ms", "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"),
    }}>
      {/* Top bar: status + logout */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}>
        <div style={{
          fontSize: "11px",
          color: connectionStatus === "connected" ? colors.success : colors.muted,
          letterSpacing: "1px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <ConnectionIndicator status={connectionStatus} />
          {connectionStatus === "connected" ? "CONNECTED" : connectionStatus === "connecting" ? "CONNECTING" : "OFFLINE"}
        </div>
        <button
          onClick={onLogout}
          disabled={loggingOut}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            fontSize: "11px",
            color: colors.muted,
            backgroundColor: "transparent",
            border: `1px solid ${colors.border}`,
            borderRadius: "6px",
            cursor: loggingOut ? "not-allowed" : "pointer",
            transition: transitions.fast,
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onMouseEnter={(e) => {
            if (!loggingOut) {
              e.currentTarget.style.borderColor = colors.error
              e.currentTarget.style.color = colors.error
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border
            e.currentTarget.style.color = colors.muted
          }}
        >
          <LogOutIcon size={12} />
          {loggingOut ? "..." : "Logout"}
        </button>
      </div>

      {/* Avatar + Identity — centered */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}>
        {/* Avatar with gold ring */}
        <div style={{
          position: "relative",
          width: "64px",
          height: "64px",
          flexShrink: 0,
          ...anim("100ms", "scaleSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"),
        }}>
          {/* Outer gold ring */}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${colors.primary}`,
            animation: connectionStatus === "connected" && !prefersReducedMotion
              ? "avatarPulseRing 2s ease-in-out infinite"
              : "none",
          }} />
          {/* Avatar circle */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`@${handle}`}
              style={{
                position: "absolute",
                top: "4px",
                left: "4px",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: getInitialColor(handle),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 700,
              color: colors.textBright,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {handle.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Handle + verified badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          ...anim("250ms", "fadeInUp 0.3s ease-out forwards"),
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            color: colors.textBright,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            @{handle}
          </h1>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            ...anim("350ms", "fadeIn 0.3s ease-out forwards"),
          }}>
            <ShieldCheckIcon size={13} color={colors.primary} />
            <span style={{
              fontSize: "10px",
              fontWeight: 600,
              color: colors.primary,
              letterSpacing: "1.5px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              VERIFIED
            </span>
          </div>
        </div>

        {/* Tip URL with copy */}
        <button
          onClick={handleCopyUrl}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "2px 0",
            fontSize: "12px",
            color: urlCopied ? colors.success : colors.muted,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: transitions.fast,
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => {
            if (!urlCopied) e.currentTarget.style.color = colors.text
          }}
          onMouseLeave={(e) => {
            if (!urlCopied) e.currentTarget.style.color = colors.muted
          }}
        >
          {tipUrl}
          {urlCopied ? (
            <CheckIcon size={12} />
          ) : (
            <CopyIcon size={12} />
          )}
        </button>
      </div>
    </div>
  )
}
