"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

// Color palette (terminal theme)
const colors = {
  bg: "#0A0A0A",
  surface: "#1A1A1A",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  success: "#00FF00",
  error: "#FF4444",
  muted: "#888888",
  border: "#333333",
  text: "#E0E0E0",
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
`;

// Skeleton component for loading state
function Skeleton({ width, height, borderRadius = "4px", style = {} }: {
  width: string | number;
  height: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surface} 50%, ${colors.border} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease-in-out infinite",
      ...style,
    }} />
  );
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

  // Shorten address for display
  const shortenAddress = (address: string) => {
    if (!address || address.length < 20) return address
    return `${address.slice(0, 10)}...${address.slice(-8)}`
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: colors.bg,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'JetBrains Mono', 'Monaco', 'Consolas', monospace",
  }

  // Mobile responsive card style
  const cardStyle: React.CSSProperties = {
    maxWidth: "400px",
    width: "100%",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    overflow: "hidden",
  }

  // Mobile responsive content padding
  const cardContentStyle: React.CSSProperties = {
    padding: "clamp(24px, 6vw, 40px) clamp(20px, 5vw, 32px)",
    textAlign: "center" as const,
  }

  // Loading state - Skeleton loader
  if (state === "loading") {
    return (
      <div style={containerStyle}>
        <style>{skeletonStyles}</style>
        <div style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          {/* Terminal header skeleton */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.bg,
          }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27CA40" }} />
            </div>
            <Skeleton width={140} height={12} style={{ marginLeft: "8px" }} />
          </div>

          {/* Card content skeleton */}
          <div style={{ padding: "40px 32px", textAlign: "center" }}>
            {/* Avatar skeleton */}
            <Skeleton
              width={96}
              height={96}
              borderRadius="50%"
              style={{ margin: "0 auto 20px" }}
            />

            {/* Handle skeleton */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "8px",
            }}>
              <Skeleton width={120} height={24} />
              <Skeleton width={20} height={20} borderRadius="50%" />
            </div>

            {/* Status text skeleton */}
            <Skeleton
              width={140}
              height={13}
              style={{ margin: "0 auto 24px" }}
            />

            {/* Address box skeleton */}
            <div style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}>
                <Skeleton width={16} height={16} borderRadius="50%" />
                <Skeleton width={160} height={12} />
              </div>
            </div>

            {/* CTA Button skeleton */}
            <Skeleton
              width="100%"
              height={52}
              borderRadius="8px"
              style={{ marginBottom: "16px" }}
            />

            {/* Footer text skeleton */}
            <Skeleton
              width={180}
              height={11}
              style={{ margin: "0 auto" }}
            />
          </div>
        </div>

        {/* Back link skeleton */}
        <Skeleton
          width={100}
          height={13}
          style={{ marginTop: "24px" }}
        />
      </div>
    )
  }

  // Not found state
  if (state === "not_found") {
    return (
      <div style={containerStyle}>
        <div style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          {/* Terminal header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.bg,
          }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27CA40" }} />
            </div>
            <span style={{ color: colors.muted, fontSize: "12px", marginLeft: "8px" }}>
              [TIPZ] // NOT_FOUND
            </span>
          </div>

          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: colors.bg,
              border: `2px dashed ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <span style={{ fontSize: "32px", color: colors.muted }}>?</span>
            </div>

            <h1 style={{
              color: colors.text,
              fontSize: "20px",
              fontWeight: 600,
              margin: "0 0 8px",
            }}>
              @{handle}
            </h1>

            <p style={{
              color: colors.muted,
              fontSize: "14px",
              margin: "0 0 24px",
            }}>
              Not registered on TIPZ yet
            </p>

            <div style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "24px",
            }}>
              <p style={{ color: colors.text, fontSize: "13px", margin: 0 }}>
                Know this creator? Let them know they can receive private tips by registering on TIPZ.
              </p>
            </div>

            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                backgroundColor: colors.primary,
                color: colors.bg,
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              Learn About TIPZ
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (state === "error") {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", color: colors.error }}>
          <p style={{ marginBottom: "16px" }}>Something went wrong.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Found - show creator card
  return (
    <div style={containerStyle}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}>
        {/* Terminal header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.bg,
        }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27CA40" }} />
          </div>
          <span style={{ color: colors.muted, fontSize: "12px", marginLeft: "8px" }}>
            [TIPZ] // CREATOR_CARD
          </span>
        </div>

        {/* Card content */}
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          {/* Avatar placeholder */}
          <div style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            backgroundColor: colors.bg,
            border: `3px solid ${colors.primary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: `0 0 20px rgba(245, 166, 35, 0.2)`,
          }}>
            <span style={{
              fontSize: "36px",
              color: colors.primary,
              fontWeight: 700,
            }}>
              {creator?.handle?.[0]?.toUpperCase() || "?"}
            </span>
          </div>

          {/* Handle + verified badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "8px",
          }}>
            <h1 style={{
              color: colors.text,
              fontSize: "24px",
              fontWeight: 600,
              margin: 0,
            }}>
              @{creator?.handle}
            </h1>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={colors.primary}
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>

          <p style={{
            color: colors.primary,
            fontSize: "13px",
            fontWeight: 500,
            margin: "0 0 24px",
            letterSpacing: "0.5px",
          }}>
            Verified TIPZ Creator
          </p>

          {/* Shielded address preview */}
          <div style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ color: colors.muted, fontSize: "12px" }}>
                {shortenAddress(creator?.shielded_address || "")}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "16px",
              backgroundColor: colors.primary,
              color: colors.bg,
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "16px",
              transition: "all 0.2s",
            }}
          >
            Add TIPZ to Browser
          </a>

          {/* Secondary info */}
          <p style={{
            color: colors.muted,
            fontSize: "11px",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Powered by Zcash shielding
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
