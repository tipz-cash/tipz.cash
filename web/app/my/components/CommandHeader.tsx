"use client"

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

interface CommandHeaderProps {
  handle: string
  connectionStatus: "disconnected" | "connecting" | "connected"
  loggingOut: boolean
  onLogout: () => void
  animStyle: React.CSSProperties
}

const glassCard: React.CSSProperties = {
  background: "rgba(26, 26, 26, 0.6)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "12px",
  position: "relative",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
}

export default function CommandHeader({
  handle,
  connectionStatus,
  loggingOut,
  onLogout,
  animStyle,
}: CommandHeaderProps) {
  return (
    <div style={{
      ...glassCard,
      marginBottom: "24px",
      padding: "28px",
      ...animStyle,
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        borderRadius: "12px 12px 0 0",
      }} />
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}>
        <div style={{
          fontSize: "11px",
          color: colors.primary,
          letterSpacing: "2px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <ConnectionIndicator status={connectionStatus} />
          COMMAND CENTER
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
      <h1 style={{
        margin: "0 0 4px",
        fontSize: "clamp(24px, 4vw, 32px)",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
        color: colors.textBright,
      }}>
        @{handle}
      </h1>
      <p style={{
        margin: 0,
        color: colors.muted,
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
      }}>
        tipz.cash/{handle}
      </p>
    </div>
  )
}
