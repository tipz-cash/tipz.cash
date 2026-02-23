"use client"

import { useState } from "react"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"
import ImageStampTool from "./ImageStampTool"
import { CopyIcon, CheckIcon, ShareIcon, ImageIcon } from "@/components/Icons"

interface StampToolsProps {
  handle: string
  animStyle: React.CSSProperties
  prefersReducedMotion: boolean
}

interface TileProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void
  hoverColor?: string
  activeColor?: string
  active?: boolean
  delay: string
  prefersReducedMotion: boolean
}

function Tile({
  icon,
  label,
  sublabel,
  onClick,
  hoverColor = colors.primary,
  activeColor,
  active,
  delay,
  prefersReducedMotion,
}: TileProps) {
  const [hovered, setHovered] = useState(false)
  const isActive = active && activeColor
  const currentColor = isActive ? activeColor : hovered ? hoverColor : colors.muted

  const tileAnim = prefersReducedMotion
    ? { opacity: 1 }
    : {
        animation: "fadeInUp 0.3s ease-out forwards",
        animationDelay: delay,
        animationFillMode: "both" as const,
      }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        height: "72px",
        border: `1px solid ${isActive ? activeColor : hovered ? hoverColor : colors.border}`,
        borderRadius: "10px",
        cursor: "pointer",
        transition: transitions.fast,
        background: "transparent",
        color: currentColor,
        fontFamily: "var(--font-family-mono)",
        padding: "8px",
        flex: 1,
        minWidth: 0,
        ...tileAnim,
      }}
    >
      {icon}
      <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px" }}>
        {sublabel || label}
      </span>
    </button>
  )
}

export default function StampTools({ handle, animStyle, prefersReducedMotion }: StampToolsProps) {
  const [copied, setCopied] = useState(false)
  const [stampOpen, setStampOpen] = useState(false)

  const tipUrl = `tipz.cash/${handle}`

  const handleCopyLink = async () => {
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

  const labelAnim = prefersReducedMotion
    ? { opacity: 1 }
    : {
        animation: "fadeInUp 0.3s ease-out forwards",
        animationDelay: "200ms",
        animationFillMode: "both" as const,
      }

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "16px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: colors.muted,
          letterSpacing: "1px",
          marginBottom: "12px",
          fontFamily: "var(--font-family-mono)",
          ...labelAnim,
        }}
      >
        PROMOTE
      </div>

      {/* 3-column tile grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
        }}
      >
        <Tile
          icon={copied ? <CheckIcon /> : <CopyIcon />}
          label="Copy Link"
          sublabel={copied ? "Copied!" : "Copy Link"}
          onClick={handleCopyLink}
          activeColor={colors.success}
          active={copied}
          delay="250ms"
          prefersReducedMotion={prefersReducedMotion}
        />
        <Tile
          icon={<ShareIcon />}
          label="Tweet"
          onClick={handleTweet}
          hoverColor="#1d9bf0"
          delay="300ms"
          prefersReducedMotion={prefersReducedMotion}
        />
        <Tile
          icon={<ImageIcon />}
          label="Stamp Image"
          sublabel="Stamp"
          onClick={() => setStampOpen(!stampOpen)}
          active={stampOpen}
          activeColor={colors.primary}
          delay="350ms"
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {stampOpen && (
        <div style={{ marginTop: "12px" }}>
          <ImageStampTool handle={handle} onClose={() => setStampOpen(false)} />
        </div>
      )}
    </div>
  )
}
