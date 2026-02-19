"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TippingFlow } from "@/components/tipping"
import { LetterGridBackground } from "@/components/LetterGridBackground"
import SiteHeader from "@/components/SiteHeader"

const colors = {
  bg: "#050505",
  surface: "rgba(26, 26, 26, 0.6)",
  surfaceBorder: "rgba(255, 215, 0, 0.4)",
  primary: "#FFD700",
  primaryHover: "#FFA500",
  primaryGlow: "rgba(255, 215, 0, 0.15)",
  primaryGlowStrong: "rgba(255, 215, 0, 0.3)",
  success: "#00FF94",
  verified: "#00FF94",
  error: "#EF4444",
  info: "#3B82F6",
  muted: "rgba(255, 255, 255, 0.6)",
  border: "rgba(255, 255, 255, 0.1)",
  text: "rgba(255, 255, 255, 0.85)",
  textBright: "#FFFFFF",
}

// Responsive styles - Compact premium fintech design
const responsiveStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  * {
    box-sizing: border-box;
  }

  .tipz-page {
    min-height: 100vh;
    min-height: 100dvh;
    background: ${colors.bg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    overflow: clip;
  }

  /* Aurora glow effect — anchored to card, not page */
  .tipz-card::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
    filter: blur(100px);
    animation: auroraDrift 20s ease-in-out infinite;
    pointer-events: none;
    z-index: -1;
  }

  /* Noise texture overlay */
  .tipz-page::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes auroraDrift {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.15); }
  }

  @keyframes backgroundFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .tipz-background-wrapper {
    animation: backgroundFadeIn 0.3s ease-in forwards;
  }

  .tipz-card {
    position: relative;
    width: 100%;
    max-width: min(400px, calc(100vw - 32px));
    z-index: 1;
  }

  .tipz-card-content {
    position: relative;
    padding: 20px;
    text-align: center;
  }

  .tipz-logo {
    font-size: 14px;
    font-weight: 700;
    color: ${colors.primary};
    letter-spacing: 2px;
    margin-bottom: 16px;
    font-family: var(--font-family-mono);
  }

  /* Squircle avatar with gold ring pulse */
  .tipz-avatar-wrap {
    position: relative;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .tipz-avatar-ring {
    position: absolute;
    inset: -3px;
    border-radius: 22%;
    border: 2px solid ${colors.primary};
    animation: pulseRing 3s ease-in-out infinite;
  }

  @keyframes pulseRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
    50% { box-shadow: 0 0 0 4px rgba(255, 215, 0, 0); }
  }

  .tipz-avatar {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 22%;
    border: 2px solid ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .tipz-avatar-letter {
    font-size: 18px;
    color: ${colors.textBright};
    font-weight: 600;
    text-transform: uppercase;
    font-family: 'Inter', sans-serif;
  }

  .tipz-handle {
    color: ${colors.textBright};
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.01em;
    word-break: break-word;
    font-family: 'Inter', sans-serif;
  }

  .tipz-verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .tipz-verified-text {
    color: ${colors.verified};
    font-size: 12px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }

  /* Trust footer - signal green icons, centered */
  .tipz-trust-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 16px;
    font-size: 12px;
    color: ${colors.muted};
    font-family: 'Inter', sans-serif;
    flex-wrap: wrap;
  }

  @media (max-width: 375px) {
    .tipz-trust-footer {
      gap: 10px;
      font-size: 11px;
    }
    .tipz-card-content {
      padding: 16px;
    }
  }

  .tipz-trust-icon {
    color: ${colors.success};
  }

  .tipz-trust-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tipz-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px 20px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: ${colors.bg};
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px ${colors.primaryGlow};
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .tipz-cta:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 6px 20px ${colors.primaryGlowStrong};
  }

  .tipz-cta:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: ${colors.muted};
    cursor: not-allowed;
    box-shadow: none;
  }

  .tipz-back {
    color: ${colors.muted};
    font-size: 13px;
    text-decoration: none;
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s ease;
    font-family: 'Inter', sans-serif;
  }

  .tipz-back:hover {
    color: ${colors.text};
  }

  /* Skeleton loading */
  .tipz-skeleton {
    background: linear-gradient(90deg, ${colors.border} 25%, #252a35 50%, ${colors.border} 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 6px;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Not found state specific */
  .tipz-notfound-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    border: 2px dashed ${colors.border};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .tipz-notfound-handle {
    color: ${colors.textBright};
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
    font-family: 'Inter', sans-serif;
  }

  .tipz-notfound-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255,68,68,0.08);
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .tipz-info-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid ${colors.surfaceBorder};
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .tipz-btn-primary {
    display: block;
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: ${colors.bg};
    text-decoration: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 10px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px ${colors.primaryGlow};
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-family: 'Inter', sans-serif;
  }

  .tipz-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 6px 20px ${colors.primaryGlowStrong};
  }

  .tipz-btn-secondary {
    display: block;
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: ${colors.muted};
    text-decoration: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
    font-family: 'Inter', sans-serif;
  }

  .tipz-btn-secondary:hover {
    border-color: rgba(255, 255, 255, 0.2);
    color: ${colors.text};
    background: rgba(255, 255, 255, 0.08);
  }

  .tipz-tagline {
    color: ${colors.muted};
    font-size: 11px;
    margin-top: 16px;
    text-align: center;
    font-family: 'Inter', sans-serif;
  }

  /* Powered by footer */
  .tipz-powered-by {
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .tipz-powered-by:hover {
    opacity: 0.8;
  }

  /* Mobile-specific layout (edge-to-edge) */
  .tipz-page.tipz-mobile {
    padding: 0;
    justify-content: flex-start;
  }

  .tipz-mobile .tipz-card {
    max-width: 100%;
    border-radius: 0;
    min-height: 100dvh;
    border: none;
  }

  .tipz-mobile .tipz-card-content {
    padding: 0;
    text-align: left;
  }

  .tipz-mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid ${colors.surfaceBorder};
  }

  .tipz-mobile-logo {
    font-size: 14px;
    font-weight: 700;
    color: ${colors.primary};
    letter-spacing: 2px;
    font-family: var(--font-family-mono);
  }

  .tipz-mobile-back {
    color: ${colors.muted};
    font-size: 13px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 0;
    min-height: 44px;
    font-family: 'Inter', sans-serif;
  }

  .tipz-mobile-content {
    padding: 16px;
  }

  /* Desktop enhancements */
  @media (min-width: 480px) {
    .tipz-page {
      padding: 24px;
    }

    .tipz-card {
      max-width: 420px;
    }

    .tipz-card-content {
      padding: 24px;
    }

    .tipz-logo {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .tipz-notfound-avatar {
      width: 72px;
      height: 72px;
      margin-bottom: 16px;
    }

    .tipz-notfound-handle {
      font-size: 20px;
    }

    .tipz-btn-primary {
      padding: 14px;
      font-size: 14px;
    }

    .tipz-btn-secondary {
      padding: 14px;
      font-size: 13px;
    }

    .tipz-tagline {
      font-size: 12px;
      margin-top: 20px;
    }

    .tipz-back {
      margin-top: 24px;
    }
  }
`

interface Creator {
  id: string
  platform: string
  handle: string
  shielded_address: string
  avatar_url?: string
  publicKey?: JsonWebKey
  canReceiveMessages?: boolean
}

type PageState = "loading" | "found" | "not_found" | "error"

export default function CreatorCardPage() {
  const params = useParams()
  const handle = params.handle as string
  const [state, setState] = useState<PageState>("loading")
  const [creator, setCreator] = useState<Creator | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showBackground, setShowBackground] = useState(false)

  // Lazy load background to prioritize content rendering
  useEffect(() => {
    const timer = setTimeout(() => setShowBackground(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = /iPhone|iPad|Android/i.test(navigator.userAgent)
      const isMobileWidth = window.innerWidth < 480
      setIsMobile(isMobileUA || isMobileWidth)
    }

    checkMobile()

    // Re-check on resize for DevTools testing
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Fetch creator data
  useEffect(() => {
    async function fetchCreator() {
      try {
        const response = await fetch(`/api/creator?platform=x&handle=${encodeURIComponent(handle)}`)
        const data = await response.json()

        if (data.found && data.creator) {
          setCreator({
            ...data.creator,
            publicKey: data.creator.public_key,
          })
          setState("found")
        } else {
          setState("not_found")
        }
      } catch {
        setState("error")
      }
    }

    if (handle) fetchCreator()
  }, [handle])

  // Avatar color based on handle
  const getAvatarColor = (h: string) => {
    const hue = h.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, 55%, 35%)`
  }


  // Loading state - compact skeleton
  if (state === "loading") {
    return (
      <>
        <style>{responsiveStyles}</style>
        <div className="tipz-page">
          {showBackground && (
            <div className="tipz-background-wrapper">
              <LetterGridBackground />
            </div>
          )}
          <div className="tipz-card">
            <div className="tipz-card-content">
              <div className="tipz-skeleton" style={{ width: 60, height: 16, margin: "0 auto 16px" }} />
              <div className="tipz-skeleton" style={{ width: "100%", height: 200, borderRadius: 10 }} />
            </div>
          </div>
        </div>
      </>
    )
  }

  // Not found state
  if (state === "not_found") {
    return (
      <>
        <style>{responsiveStyles}</style>
        <div className="tipz-page">
          {showBackground && (
            <div className="tipz-background-wrapper">
              <LetterGridBackground />
            </div>
          )}
          <div className="tipz-card">
            <div className="tipz-card-content">
              <div className="tipz-logo">TIPZ</div>

              <div className="tipz-notfound-avatar">
                <span style={{ fontSize: 24, color: colors.muted }}>?</span>
              </div>

              <h1 className="tipz-notfound-handle">@{handle}</h1>

              <div className="tipz-notfound-badge">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.error }} />
                <span style={{ color: colors.error, fontSize: 11, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                  Not registered
                </span>
              </div>

              <div className="tipz-info-box">
                <p style={{ color: colors.text, fontSize: 14, margin: 0, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                  This creator hasn't joined yet. Let them know they can receive private, fee-free tips!
                </p>
              </div>

              <a
                href={`https://x.com/intent/tweet?text=Hey%20@${handle}%20you%20should%20join%20@tipz_cash%20to%20receive%20private%2C%20fee-free%20tips!`}
                target="_blank"
                rel="noopener noreferrer"
                className="tipz-btn-primary"
              >
                Invite on X
              </a>

              <a href="/creators" className="tipz-btn-secondary">
                Browse creators
              </a>

              <p className="tipz-tagline">Private &middot; Instant &middot; 0% fees</p>
            </div>
          </div>

          <a href="/" className="tipz-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to TIPZ
          </a>
        </div>
      </>
    )
  }

  // Error state
  if (state === "error") {
    return (
      <>
        <style>{responsiveStyles}</style>
        <div className="tipz-page">
          {showBackground && (
            <div className="tipz-background-wrapper">
              <LetterGridBackground />
            </div>
          )}
          <div className="tipz-card">
            <div className="tipz-card-content">
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <p style={{ color: colors.text, marginBottom: 24, fontSize: 14 }}>
                Something went wrong.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="tipz-btn-secondary"
                style={{ border: `1px solid ${colors.border}` }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Found - Creator profile
  // Mobile layout: edge-to-edge, TippingFlow owns the content
  if (isMobile) {
    return (
      <>
        <style>{responsiveStyles}</style>
        <div className="tipz-page tipz-mobile">
          {showBackground && (
            <div className="tipz-background-wrapper">
              <LetterGridBackground />
            </div>
          )}
          <div className="tipz-card">
            <div className="tipz-card-content">
              {/* Header with back button only */}
              <div className="tipz-mobile-header" style={{ justifyContent: "flex-start" }}>
                <a href="/" className="tipz-mobile-back">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </a>
              </div>

              {/* Content - TippingFlow owns creator header */}
              <div className="tipz-mobile-content">
                <TippingFlow
                  creatorHandle={creator?.handle || handle}
                  shieldedAddress={creator?.shielded_address || ""}
                  isMobile={isMobile}
                  avatarColor={getAvatarColor(creator?.handle || handle)}
                  avatarUrl={creator?.avatar_url}
                  publicKey={creator?.publicKey}
                />

                {/* Powered by TIPZ footer */}
                <a
                  href="/"
                  className="tipz-powered-by"
                  style={{
                    marginTop: "16px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.4)",
                  }}>
                    Powered by
                  </span>
                  <span style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#FFD700",
                    letterSpacing: "1px",
                  }}>
                    TIPZ
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop layout: centered card - TippingFlow owns the content
  return (
    <>
      <style>{responsiveStyles}</style>
      <SiteHeader />
      <div className="tipz-page">
        {showBackground && (
            <div className="tipz-background-wrapper">
              <LetterGridBackground />
            </div>
          )}
        <div className="tipz-card">
          <div className="tipz-card-content">
            <TippingFlow
              creatorHandle={creator?.handle || handle}
              shieldedAddress={creator?.shielded_address || ""}
              isMobile={isMobile}
              avatarColor={getAvatarColor(creator?.handle || handle)}
              avatarUrl={creator?.avatar_url}
              publicKey={creator?.publicKey}

            />
          </div>
        </div>

        {/* Powered by TIPZ footer */}
        <a
          href="/"
          className="tipz-powered-by"
          style={{
            marginTop: "16px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            transition: "opacity 0.2s ease",
          }}
        >
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.4)",
          }}>
            Powered by
          </span>
          <span style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "12px",
            fontWeight: 700,
            color: "#FFD700",
            letterSpacing: "1px",
          }}>
            TIPZ
          </span>
        </a>
      </div>
    </>
  )
}
