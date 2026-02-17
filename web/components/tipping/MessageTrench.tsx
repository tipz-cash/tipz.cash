"use client"

import { useState } from "react"
import { tokens } from "./designTokens"

interface MessageTrenchProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** If false, the message input is hidden (creator cannot receive messages) */
  canReceiveMessages?: boolean
}

const MAX_CHARS = 280

export function MessageTrench({
  value,
  onChange,
  disabled = false,
  canReceiveMessages = true,
}: MessageTrenchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const charCount = value.length
  const remaining = MAX_CHARS - charCount

  const handleChange = (newValue: string) => {
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue)
    }
  }

  // Don't render if creator cannot receive messages
  if (!canReceiveMessages) {
    return null
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          padding: "10px 0",
          minHeight: "44px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: tokens.colors.textMuted,
          fontSize: "13px",
          fontFamily: tokens.font.sans,
          transition: `color ${tokens.duration.fast}ms`,
        }}
      >
        <span style={{ fontSize: "10px" }}>{isExpanded ? "▼" : "▶"}</span>
        <span>Add a message (optional)</span>
        {value.length > 0 && !isExpanded && (
          <span style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "auto",
            color: tokens.colors.signalGreen,
            fontSize: "11px",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Added
          </span>
        )}
      </button>

      {/* Expandable message input */}
      {isExpanded && (
        <div
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: tokens.radius.md,
            border: `1px solid ${isFocused ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"}`,
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
            transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
          }}
        >
          {/* Textarea for longer messages */}
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Say something nice..."
            disabled={disabled}
            rows={3}
            maxLength={MAX_CHARS}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: tokens.colors.textBright,
              fontSize: "13px",
              fontFamily: tokens.font.sans,
              opacity: disabled ? 0.5 : 1,
              resize: "none",
              lineHeight: 1.5,
            }}
          />

          {/* Footer with encryption badge and char counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: tokens.space.sm,
              paddingTop: tokens.space.sm,
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Encrypted badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.colors.signalGreen}
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span
                style={{
                  color: tokens.colors.signalGreen,
                  fontSize: "10px",
                  fontWeight: 500,
                  fontFamily: tokens.font.mono,
                }}
              >
                End-to-end encrypted
              </span>
            </div>

            {/* Character counter */}
            <span
              style={{
                color: remaining < 20 ? tokens.colors.gold : tokens.colors.textMuted,
                fontSize: "10px",
                fontFamily: tokens.font.mono,
              }}
            >
              {remaining}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
