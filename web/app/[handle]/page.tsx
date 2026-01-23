"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

// Color palette (terminal theme with Zcash gold)
const colors = {
  bg: "#050505",
  surface: "rgba(255, 255, 255, 0.05)",
  surfaceBorder: "rgba(255, 255, 255, 0.1)",
  primary: "#F5A623", // Zcash gold
  primaryHover: "#FFB84D",
  success: "#00FF00",
  verified: "#22c55e",
  error: "#FF4444",
  muted: "#888888",
  border: "#333333",
  text: "#E0E0E0",
  textBright: "#FFFFFF",
}

// Skeleton keyframes style
const skeletonStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

// Skeleton component for loading state
function Skeleton({ width, height, borderRadius = "4px", style = {} }: {
  width: string | number
  height: string | number
  borderRadius?: string
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, ${colors.border} 25%, rgba(40,40,40,1) 50%, ${colors.border} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease-in-out infinite",
      ...style,
    }} />
  )
}

interface Creator {
  id: string
  platform: string
  handle: string
  shielded_address: string
}

type PageState = "loading" | "found" | "not_found" | "error"

export default function CreatorCardPage() {
  const params = useParams()
  const handle = params.handle as string
  const [state, setState] = useState<PageState>("loading")
  const [creator, setCreator] = useState<Creator | null>(null)
  const [extensionInstalled, setExtensionInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for extension and mobile on client side
  useEffect(() => {
    // Check for extension marker
    const marker = document.getElementById('tipz-extension-installed')
    setExtensionInstalled(!!marker)

    // Check for mobile
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    async function fetchCreator() {
      try {
        const response = await fetch(`/api/creator?platform=x&handle=${encodeURIComponent(handle)}`)
        const data = await response.json()

        if (data.found && data.creator) {
          setCreator(data.creator)
          setState("found")
        } else {
          setState("not_found")
        }
      } catch {
        setState("error")
      }
    }

    if (handle) {
      fetchCreator()
    }
  }, [handle])

  // Get smart CTA button configuration
  const getButtonConfig = () => {
    if (isMobile) {
      return {
        text: "Visit on Desktop to Tip",
        action: null,
        disabled: true,
      }
    }
    if (extensionInstalled) {
      return {
        text: "Send Tip Now",
        action: () => {
          window.dispatchEvent(new CustomEvent('tipz-open-modal', {
            detail: { handle: creator?.handle || handle }
          }))
        },
        disabled: false,
      }
    }
    return {
      text: "Add to Browser to Tip",
      action: () => window.open('https://chromewebstore.google.com/detail/tipz/pkfmgpniebpokpjojomhaaajgcdkbfpc', '_blank'),
      disabled: false,
    }
  }

  // Generate letter avatar background color based on handle
  const getAvatarColor = (handle: string) => {
    const hue = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, 60%, 40%)`
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at center top, rgba(245, 166, 35, 0.08) 0%, ${colors.bg} 50%)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'JetBrains Mono', 'Monaco', 'Consolas', monospace",
  }

  // Glassmorphism card style
  const cardStyle: React.CSSProperties = {
    maxWidth: "400px",
    width: "100%",
    background: colors.surface,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: `1px solid ${colors.surfaceBorder}`,
    borderRadius: "20px",
    overflow: "hidden",
  }

  const cardContentStyle: React.CSSProperties = {
    padding: "clamp(32px, 8vw, 48px) clamp(24px, 6vw, 40px)",
    textAlign: "center" as const,
  }

  // Loading state - Skeleton loader
  if (state === "loading") {
    return (
      <div style={containerStyle}>
        <style>{skeletonStyles}</style>
        <div style={cardStyle}>
          <div style={cardContentStyle}>
            {/* Logo skeleton */}
            <Skeleton width={100} height={24} style={{ margin: "0 auto 32px" }} />

            {/* Avatar skeleton */}
            <Skeleton
              width={110}
              height={110}
              borderRadius="50%"
              style={{ margin: "0 auto 24px" }}
            />

            {/* Handle skeleton */}
            <Skeleton width={140} height={28} style={{ margin: "0 auto 12px" }} />

            {/* Verified badge skeleton */}
            <Skeleton width={140} height={20} borderRadius="12px" style={{ margin: "0 auto 32px" }} />

            {/* CTA Button skeleton */}
            <Skeleton
              width="100%"
              height={52}
              borderRadius="12px"
              style={{ marginBottom: "24px" }}
            />

            {/* Footer text skeleton */}
            <Skeleton width={200} height={14} style={{ margin: "0 auto" }} />
          </div>
        </div>

        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </div>
    )
  }

  // Not found state
  if (state === "not_found") {
    return (
      <div style={containerStyle}>
        <style>{skeletonStyles}</style>
        <div style={cardStyle}>
          <div style={cardContentStyle}>
            {/* TIPZ Logo */}
            <div style={{
              fontSize: "24px",
              fontWeight: 700,
              color: colors.primary,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              TIPZ
            </div>

            {/* Empty avatar */}
            <div style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: `3px dashed ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <span style={{ fontSize: "40px", color: colors.muted }}>?</span>
            </div>

            {/* Handle */}
            <h1 style={{
              color: colors.text,
              fontSize: "24px",
              fontWeight: 600,
              margin: "0 0 12px",
            }}>
              @{handle}
            </h1>

            {/* Not registered badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              backgroundColor: "rgba(255,68,68,0.15)",
              borderRadius: "20px",
              marginBottom: "32px",
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: colors.error,
              }} />
              <span style={{
                color: colors.error,
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}>
                NOT REGISTERED
              </span>
            </div>

            {/* Info box */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: `1px solid ${colors.surfaceBorder}`,
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}>
              <p style={{
                color: colors.muted,
                fontSize: "14px",
                margin: 0,
                lineHeight: 1.5,
              }}>
                This creator hasn't joined TIPZ yet. Let them know they can receive private tips!
              </p>
            </div>

            {/* CTA */}
            <a
              href="/"
              style={{
                display: "block",
                width: "100%",
                padding: "16px",
                backgroundColor: colors.primary,
                color: colors.bg,
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              Learn About TIPZ
            </a>

            {/* Footer */}
            <p style={{
              color: colors.muted,
              fontSize: "12px",
              marginTop: "24px",
              marginBottom: 0,
              letterSpacing: "1px",
            }}>
              0% FEES • PRIVATE • UNLINKABLE
            </p>
          </div>
        </div>

        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </div>
    )
  }

  // Error state
  if (state === "error") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ ...cardContentStyle, textAlign: "center" }}>
            <div style={{
              color: colors.error,
              fontSize: "48px",
              marginBottom: "16px",
            }}>
              ⚠
            </div>
            <p style={{ color: colors.text, marginBottom: "24px" }}>
              Something went wrong.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "14px 28px",
                backgroundColor: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Try Again
            </button>
          </div>
        </div>

        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </div>
    )
  }

  const buttonConfig = getButtonConfig()

  // Found - show creator card
  return (
    <div style={containerStyle}>
      <style>{skeletonStyles}</style>
      <div style={cardStyle}>
        <div style={cardContentStyle}>
          {/* TIPZ Logo */}
          <div style={{
            fontSize: "24px",
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: "2px",
            marginBottom: "32px",
          }}>
            TIPZ
          </div>

          {/* Letter Avatar with orange ring */}
          <div style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            backgroundColor: getAvatarColor(creator?.handle || handle),
            border: `4px solid ${colors.primary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: `0 0 30px rgba(245, 166, 35, 0.25)`,
          }}>
            <span style={{
              fontSize: "44px",
              color: colors.textBright,
              fontWeight: 700,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}>
              {creator?.handle?.[0]?.toUpperCase() || "?"}
            </span>
          </div>

          {/* Handle */}
          <h1 style={{
            color: colors.textBright,
            fontSize: "26px",
            fontWeight: 600,
            margin: "0 0 12px",
          }}>
            @{creator?.handle}
          </h1>

          {/* Verified shielded badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            borderRadius: "20px",
            marginBottom: "32px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.verified} strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{
              color: colors.verified,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}>
              VERIFIED SHIELDED
            </span>
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={buttonConfig.action || undefined}
            disabled={buttonConfig.disabled}
            style={{
              display: "block",
              width: "100%",
              padding: "16px",
              backgroundColor: buttonConfig.disabled ? colors.border : colors.primary,
              color: buttonConfig.disabled ? colors.muted : colors.bg,
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: buttonConfig.disabled ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: buttonConfig.disabled ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            {buttonConfig.text}
          </button>

          {/* Footer */}
          <p style={{
            color: colors.muted,
            fontSize: "12px",
            marginTop: "24px",
            marginBottom: 0,
            letterSpacing: "1px",
          }}>
            0% FEES • PRIVATE • UNLINKABLE
          </p>
        </div>
      </div>

      {/* Back to home link */}
      <a
        href="/"
        style={{
          color: colors.muted,
          fontSize: "13px",
          textDecoration: "none",
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "color 0.2s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to TIPZ
      </a>

      {/* JetBrains Mono font */}
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  )
}
