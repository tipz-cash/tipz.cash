"use client"

import { useState } from "react"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"
import { useAvatarFallback } from "@/hooks/useAvatarFallback"
import ConnectionIndicator from "./ConnectionIndicator"
import { CypherpunkShield, VerifiedCheck } from "@/components/BadgeIcons"
import { LogOutIcon, CopyIcon, CheckIcon } from "@/components/Icons"

interface ProfileHeaderProps {
  handle: string
  avatarUrl: string | null
  connectionStatus: "disconnected" | "connecting" | "connected"
  loggingOut: boolean
  onLogout: () => void
  prefersReducedMotion: boolean
  isOgCypherpunk?: boolean
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
  isOgCypherpunk,
}: ProfileHeaderProps) {
  const [urlCopied, setUrlCopied] = useState(false)
  const { imgFailed, onImgError } = useAvatarFallback(avatarUrl)
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
    prefersReducedMotion
      ? { opacity: 1 }
      : { animation, animationDelay: delay, animationFillMode: "both" as const }

  return (
    <div
      style={{
        marginBottom: "0",
        ...anim("0ms", "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"),
      }}
    >
      {/* Top bar: status + logout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: connectionStatus === "connected" ? colors.success : colors.muted,
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-family-mono)",
          }}
        >
          <ConnectionIndicator status={connectionStatus} />
          {connectionStatus === "connected"
            ? "CONNECTED"
            : connectionStatus === "connecting"
              ? "CONNECTING"
              : "OFFLINE"}
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
            fontFamily: "var(--font-family-mono)",
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Avatar with gold ring */}
        <div
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            flexShrink: 0,
            ...anim("100ms", "scaleSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"),
          }}
        >
          {/* Outer gold ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${colors.primary}`,
              animation:
                connectionStatus === "connected" && !prefersReducedMotion
                  ? "avatarPulseRing 2s ease-in-out infinite"
                  : "none",
            }}
          />
          {/* Avatar circle */}
          {avatarUrl && !imgFailed ? (
            <img
              src={avatarUrl}
              alt={`@${handle}`}
              onError={onImgError}
              style={{
                position: "absolute",
                top: "4px",
                left: "4px",
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: "4px",
                left: "4px",
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: getInitialColor(handle),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 700,
                color: colors.textBright,
                fontFamily: "var(--font-family-mono)",
              }}
            >
              {handle.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Handle + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            ...anim("250ms", "fadeInUp 0.3s ease-out forwards"),
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: colors.textBright,
              fontFamily: "var(--font-family-mono)",
            }}
          >
            @{handle}
          </h1>
          {isOgCypherpunk ? <CypherpunkShield size={16} /> : <VerifiedCheck size={14} />}
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
            fontFamily: "var(--font-family)",
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
          {urlCopied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
        </button>
      </div>
    </div>
  )
}
