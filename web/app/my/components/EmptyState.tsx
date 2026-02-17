"use client"

import { useState } from "react"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"

function BroadcastIcon({ size = 32, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
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

function ShareIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  )
}

interface EmptyStateProps {
  handle: string
}

export default function EmptyState({ handle }: EmptyStateProps) {
  const [copied, setCopied] = useState(false)
  const tipUrl = `tipz.cash/${handle}`

  const handleCopy = async () => {
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
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTweet = () => {
    const text = `Support my work with private tips\n\n${tipUrl}`
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <div style={{
      padding: "40px 24px",
      textAlign: "center",
    }}>
      <div style={{
        marginBottom: "16px",
        opacity: 0.6,
      }}>
        <BroadcastIcon size={36} color={colors.primary} />
      </div>

      <div style={{
        fontSize: "15px",
        fontWeight: 600,
        color: colors.textBright,
        marginBottom: "6px",
        fontFamily: "var(--font-family-mono)",
      }}>
        Your tip page is live
      </div>

      <div style={{
        fontSize: "13px",
        color: colors.muted,
        fontFamily: "var(--font-family)",
        lineHeight: 1.6,
        marginBottom: "24px",
        maxWidth: "300px",
        margin: "0 auto 24px",
      }}>
        Share your link and start receiving private, shielded tips from your audience.
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
      }}>
        <button
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-family-mono)",
            border: `1px solid ${copied ? colors.success : colors.border}`,
            borderRadius: "8px",
            cursor: "pointer",
            transition: transitions.fast,
            background: "transparent",
            color: copied ? colors.success : colors.text,
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = colors.primary
              e.currentTarget.style.color = colors.primary
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = colors.border
              e.currentTarget.style.color = colors.text
            }
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={handleTweet}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-family-mono)",
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            cursor: "pointer",
            transition: transitions.fast,
            background: "transparent",
            color: colors.text,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#1d9bf0"
            e.currentTarget.style.color = "#1d9bf0"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border
            e.currentTarget.style.color = colors.text
          }}
        >
          <ShareIcon />
          Share on X
        </button>
      </div>
    </div>
  )
}
