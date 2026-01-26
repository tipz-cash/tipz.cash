"use client"

import { useState } from "react"
import { tokens } from "./designTokens"

interface MessageTrenchProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const MAX_CHARS = 140

export function MessageTrench({ value, onChange, disabled = false }: MessageTrenchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const charCount = value.length

  const handleChange = (newValue: string) => {
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue)
    }
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "48px",
        padding: "14px 16px",
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: tokens.radius.md,
        border: `1px solid ${isFocused ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"}`,
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
        transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: tokens.space.sm,
        }}
      >
        {/* Input area */}
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add a private note..."
          disabled={disabled}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: tokens.colors.textBright,
            fontSize: "13px",
            fontFamily: tokens.font.sans,
            opacity: disabled ? 0.5 : 1,
          }}
        />

        {/* Encrypted badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            background: "rgba(0, 255, 148, 0.1)",
            borderRadius: tokens.radius.sm,
            flexShrink: 0,
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
              fontSize: "9px",
              fontWeight: 600,
              fontFamily: tokens.font.mono,
              letterSpacing: "0.5px",
            }}
          >
            ENCRYPTED
          </span>
        </div>
      </div>

      {/* Character counter - only show when typing */}
      {charCount > 0 && (
        <div
          style={{
            marginTop: tokens.space.xs,
            textAlign: "right",
          }}
        >
          <span
            style={{
              color: charCount >= MAX_CHARS ? tokens.colors.error : tokens.colors.textMuted,
              fontSize: "10px",
              fontFamily: tokens.font.mono,
            }}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      )}
    </div>
  )
}
