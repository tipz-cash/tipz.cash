"use client"

import { useState } from "react"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"
import ImageStampTool from "./ImageStampTool"

interface StampToolsProps {
  handle: string
  animStyle: React.CSSProperties
  prefersReducedMotion: boolean
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

function ImageIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  )
}

const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "10px 16px",
  fontSize: "12px",
  fontWeight: 600,
  fontFamily: "'JetBrains Mono', monospace",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  cursor: "pointer",
  transition: transitions.fast,
  background: "transparent",
  color: colors.text,
}

const glassCard: React.CSSProperties = {
  background: "rgba(26, 26, 26, 0.6)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "12px",
  position: "relative",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
}

export default function StampTools({ handle, animStyle, prefersReducedMotion }: StampToolsProps) {
  const [copied, setCopied] = useState(false)
  const [stampOpen, setStampOpen] = useState(false)

  const tipUrl = `tipz.cash/${handle}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tipUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text in a temp input
      const input = document.createElement("input")
      input.value = tipUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTweet = () => {
    const text = `Support my work with private tips ⚡\n\n${tipUrl}`
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <div style={{
      marginBottom: "24px",
      ...animStyle,
      animationDelay: prefersReducedMotion ? "0s" : "0.15s",
    }}>
      <div style={{
        fontSize: "11px",
        color: colors.muted,
        letterSpacing: "1px",
        marginBottom: "12px",
      }}>
        PROMOTE
      </div>

      <div style={{
        ...glassCard,
        padding: "20px",
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
          gap: "8px",
          flexWrap: "wrap",
        }}>
          <button
            onClick={handleCopyLink}
            style={{
              ...pillBase,
              borderColor: copied ? colors.success : colors.border,
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
            style={pillBase}
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
            Tweet
          </button>

          <button
            onClick={() => setStampOpen(!stampOpen)}
            style={{
              ...pillBase,
              borderColor: stampOpen ? colors.primary : colors.border,
              color: stampOpen ? colors.primary : colors.text,
            }}
            onMouseEnter={(e) => {
              if (!stampOpen) {
                e.currentTarget.style.borderColor = colors.primary
                e.currentTarget.style.color = colors.primary
              }
            }}
            onMouseLeave={(e) => {
              if (!stampOpen) {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.color = colors.text
              }
            }}
          >
            <ImageIcon />
            Stamp Image
          </button>
        </div>

        {stampOpen && (
          <div style={{ marginTop: "16px" }}>
            <ImageStampTool
              handle={handle}
              onClose={() => setStampOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
