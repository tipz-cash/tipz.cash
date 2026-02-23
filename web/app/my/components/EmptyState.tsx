"use client"

import { useState } from "react"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"
import { BroadcastIcon, CopyIcon, CheckIcon, ShareIcon } from "@/components/Icons"

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
    <div
      style={{
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          marginBottom: "16px",
          opacity: 0.6,
        }}
      >
        <BroadcastIcon size={36} color={colors.primary} />
      </div>

      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: colors.textBright,
          marginBottom: "6px",
          fontFamily: "var(--font-family-mono)",
        }}
      >
        Your tip page is live
      </div>

      <div
        style={{
          fontSize: "13px",
          color: colors.muted,
          fontFamily: "var(--font-family)",
          lineHeight: 1.6,
          marginBottom: "24px",
          maxWidth: "300px",
          margin: "0 auto 24px",
        }}
      >
        Share your link and start receiving private, shielded tips from your audience.
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
        }}
      >
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
