import { useState, useEffect } from "react"
import { colors, fonts } from "~lib/theme"

interface AutoStampToggleProps {
  handle: string
  onStamp: () => void
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

/**
 * AutoStampToggle - Adds a TIPZ tip link toggle to X's tweet compose UI
 *
 * When enabled, appends `tipz.cash/{handle}` to the creator's tweet
 */
export function AutoStampToggle({ handle, onStamp, isEnabled, onToggle }: AutoStampToggleProps) {
  const tipUrl = `tipz.cash/${handle}`

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 8px",
        borderRadius: "9999px",
        backgroundColor: isEnabled ? "rgba(245, 166, 35, 0.1)" : "transparent",
        border: `1px solid ${isEnabled ? colors.primary : colors.border}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
        userSelect: "none",
      }}
      onClick={() => {
        const newState = !isEnabled
        onToggle(newState)
        if (newState) {
          onStamp()
        }
      }}
      title={isEnabled ? `Will add ${tipUrl} to your tweet` : "Click to add your TIPZ link"}
    >
      {/* TIPZ icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isEnabled ? colors.primary : colors.muted}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>

      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          fontFamily: fonts.mono,
          color: isEnabled ? colors.primary : colors.muted,
        }}
      >
        TIPZ
      </span>

      {/* Toggle indicator */}
      <div
        style={{
          width: "28px",
          height: "16px",
          borderRadius: "8px",
          backgroundColor: isEnabled ? colors.primary : colors.border,
          position: "relative",
          transition: "background-color 0.15s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: isEnabled ? "14px" : "2px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: isEnabled ? colors.bg : colors.muted,
            transition: "left 0.15s ease",
          }}
        />
      </div>
    </div>
  )
}

/**
 * Compact version of the toggle for inline use
 */
export function AutoStampBadge({ handle, onClick }: { handle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: fonts.mono,
        color: colors.primary,
        backgroundColor: "rgba(245, 166, 35, 0.1)",
        border: `1px solid ${colors.primary}`,
        borderRadius: "9999px",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      title={`Add tipz.cash/${handle} to tweet`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      TIPZ
    </button>
  )
}
