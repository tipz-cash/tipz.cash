"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

const colors = {
  bg: "#050505",
  surface: "rgba(18, 20, 26, 0.95)",
  surfaceBorder: "rgba(255, 255, 255, 0.08)",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  primaryGlow: "rgba(245, 166, 35, 0.15)",
  primaryGlowStrong: "rgba(245, 166, 35, 0.4)",
  success: "#22C55E",
  verified: "#22c55e",
  error: "#FF4444",
  muted: "#6B7280",
  border: "#2a2f38",
  text: "#D1D5DB",
  textBright: "#F9FAFB",
}

// Responsive styles
const responsiveStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  * {
    box-sizing: border-box;
  }

  .tipz-page {
    min-height: 100vh;
    min-height: 100dvh;
    background: radial-gradient(ellipse at center top, rgba(245, 166, 35, 0.12) 0%, ${colors.bg} 60%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    position: relative;
    overflow-x: hidden;
  }

  .tipz-card {
    position: relative;
    width: 100%;
    max-width: 380px;
    background: ${colors.surface};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .tipz-card-content {
    position: relative;
    padding: 32px 24px;
    text-align: center;
  }

  .tipz-logo {
    font-size: 22px;
    font-weight: 700;
    color: ${colors.primary};
    letter-spacing: 3px;
    margin-bottom: 28px;
    text-shadow: 0 0 30px ${colors.primaryGlow};
  }

  .tipz-avatar-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
  }

  .tipz-avatar-ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid ${colors.primary};
    opacity: 0.6;
    box-shadow: 0 0 25px ${colors.primaryGlow};
  }

  .tipz-avatar {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 3px solid ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 40px ${colors.primaryGlowStrong}, 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  .tipz-avatar-letter {
    font-size: 48px;
    color: ${colors.textBright};
    font-weight: 700;
    text-shadow: 0 4px 8px rgba(0,0,0,0.4);
    text-transform: uppercase;
  }

  .tipz-handle {
    color: ${colors.textBright};
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
    word-break: break-word;
  }

  .tipz-verified {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.25);
    border-radius: 20px;
    margin-bottom: 24px;
  }

  .tipz-verified-text {
    color: ${colors.verified};
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .tipz-value-box {
    padding: 16px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(245, 166, 35, 0.05) 100%);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .tipz-benefits {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }

  .tipz-benefit {
    white-space: nowrap;
  }

  .tipz-value-text {
    color: ${colors.muted};
    font-size: 11px;
    margin: 0;
    text-align: center;
    line-height: 1.5;
  }

  .tipz-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 20px;
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%);
    color: ${colors.bg};
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.5px;
    box-shadow: 0 0 25px ${colors.primaryGlow}, 0 8px 20px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .tipz-cta:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 0 40px ${colors.primaryGlowStrong}, 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .tipz-cta:disabled {
    background: ${colors.border};
    color: ${colors.muted};
    cursor: not-allowed;
    box-shadow: none;
  }

  .tipz-instruction {
    color: ${colors.muted};
    font-size: 10px;
    margin: 14px 0 20px;
    text-align: center;
    line-height: 1.5;
  }

  .tipz-address {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid ${colors.surfaceBorder};
    border-radius: 8px;
  }

  .tipz-address-text {
    font-size: 10px;
    color: ${colors.muted};
    font-family: inherit;
    word-break: break-all;
  }

  .tipz-copy-btn {
    background: transparent;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: ${colors.muted};
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: color 0.2s ease;
  }

  .tipz-copy-btn:hover {
    color: ${colors.text};
  }

  .tipz-back {
    color: ${colors.muted};
    font-size: 12px;
    text-decoration: none;
    margin-top: 24px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s ease;
  }

  .tipz-back:hover {
    color: ${colors.text};
  }

  /* Skeleton loading */
  .tipz-skeleton {
    background: linear-gradient(90deg, ${colors.border} 25%, rgba(50,50,50,1) 50%, ${colors.border} 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Not found state specific */
  .tipz-notfound-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    border: 2px dashed ${colors.border};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .tipz-notfound-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255,68,68,0.12);
    border-radius: 20px;
    margin-bottom: 24px;
  }

  .tipz-info-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid ${colors.surfaceBorder};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .tipz-btn-primary {
    display: block;
    width: 100%;
    padding: 14px;
    background: ${colors.primary};
    color: ${colors.bg};
    text-decoration: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-align: center;
    margin-bottom: 10px;
    transition: background 0.2s ease;
  }

  .tipz-btn-primary:hover {
    background: ${colors.primaryHover};
  }

  .tipz-btn-secondary {
    display: block;
    width: 100%;
    padding: 14px;
    background: transparent;
    color: ${colors.muted};
    text-decoration: none;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    border: 1px solid ${colors.border};
    text-align: center;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  .tipz-btn-secondary:hover {
    border-color: ${colors.text};
    color: ${colors.text};
  }

  .tipz-tagline {
    color: ${colors.muted};
    font-size: 9px;
    margin-top: 20px;
    letter-spacing: 1.5px;
    text-align: center;
  }

  /* Mobile-specific layout (edge-to-edge) */
  .tipz-mobile {
    padding: 0;
    justify-content: flex-start;
  }

  .tipz-mobile .tipz-card {
    max-width: 100%;
    border-radius: 0;
    min-height: 100dvh;
  }

  .tipz-mobile .tipz-card-content {
    padding: 0;
    text-align: left;
  }

  .tipz-mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .tipz-mobile-logo {
    font-size: 16px;
    font-weight: 700;
    color: ${colors.primary};
    letter-spacing: 2px;
    text-shadow: 0 0 20px ${colors.primaryGlow};
  }

  .tipz-mobile-back {
    color: ${colors.muted};
    font-size: 11px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tipz-mobile-profile {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 16px;
  }

  .tipz-mobile .tipz-avatar-wrap {
    width: 60px;
    height: 60px;
    margin: 0;
    flex-shrink: 0;
  }

  .tipz-mobile .tipz-avatar-ring {
    inset: -3px;
    border-width: 1.5px;
  }

  .tipz-mobile .tipz-avatar {
    border-width: 2px;
  }

  .tipz-mobile .tipz-avatar-letter {
    font-size: 24px;
  }

  .tipz-mobile-profile-info {
    flex: 1;
    min-width: 0;
  }

  .tipz-mobile .tipz-handle {
    font-size: 18px;
    margin: 0 0 8px;
    text-align: left;
  }

  .tipz-mobile .tipz-verified {
    display: inline-flex;
    padding: 4px 10px;
    gap: 5px;
    margin: 0;
  }

  .tipz-mobile .tipz-verified-text {
    font-size: 8px;
  }

  .tipz-mobile-content {
    padding: 0 16px 16px;
  }

  .tipz-mobile .tipz-value-box {
    padding: 14px;
    margin-bottom: 16px;
  }

  .tipz-mobile .tipz-benefits {
    gap: 8px;
    font-size: 9px;
    justify-content: flex-start;
    margin-bottom: 8px;
  }

  .tipz-mobile .tipz-value-text {
    font-size: 10px;
    text-align: left;
  }

  .tipz-mobile .tipz-cta {
    font-size: 14px;
    padding: 16px;
    border-radius: 10px;
  }

  .tipz-mobile .tipz-instruction {
    font-size: 9px;
    margin: 12px 0 16px;
    text-align: left;
  }

  .tipz-mobile .tipz-address {
    padding: 10px 12px;
    gap: 8px;
  }

  .tipz-mobile .tipz-address-text {
    font-size: 9px;
  }

  /* Desktop enhancements */
  @media (min-width: 480px) {
    .tipz-page {
      padding: 24px;
    }

    .tipz-card {
      max-width: 420px;
      border-radius: 24px;
    }

    .tipz-card-content {
      padding: 48px 40px;
    }

    .tipz-logo {
      font-size: 26px;
      margin-bottom: 36px;
    }

    .tipz-avatar-wrap {
      width: 150px;
      height: 150px;
      margin-bottom: 24px;
    }

    .tipz-avatar-ring {
      inset: -8px;
      border-width: 3px;
    }

    .tipz-avatar {
      border-width: 4px;
    }

    .tipz-avatar-letter {
      font-size: 60px;
    }

    .tipz-handle {
      font-size: 28px;
      margin-bottom: 14px;
    }

    .tipz-verified {
      padding: 10px 18px;
      gap: 8px;
      margin-bottom: 28px;
    }

    .tipz-verified-text {
      font-size: 11px;
    }

    .tipz-value-box {
      padding: 20px;
      margin-bottom: 24px;
    }

    .tipz-benefits {
      gap: 18px;
      font-size: 11px;
      margin-bottom: 12px;
    }

    .tipz-value-text {
      font-size: 12px;
    }

    .tipz-cta {
      padding: 18px 24px;
      font-size: 15px;
      border-radius: 14px;
    }

    .tipz-instruction {
      font-size: 11px;
      margin: 16px 0 24px;
    }

    .tipz-address {
      padding: 12px 16px;
      gap: 10px;
    }

    .tipz-address-text {
      font-size: 11px;
    }

    .tipz-back {
      font-size: 13px;
      margin-top: 28px;
    }

    .tipz-notfound-avatar {
      width: 120px;
      height: 120px;
      margin-bottom: 24px;
    }

    .tipz-btn-primary {
      padding: 16px;
      font-size: 14px;
    }

    .tipz-btn-secondary {
      padding: 16px;
      font-size: 13px;
    }

    .tipz-tagline {
      font-size: 10px;
      margin-top: 24px;
    }
  }
`

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
  const [copied, setCopied] = useState(false)

  // Check for extension and mobile
  useEffect(() => {
    const checkExtension = () => {
      const marker = document.getElementById('tipz-extension-installed')
      setExtensionInstalled(!!marker)
    }

    checkExtension()
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))

    const observer = new MutationObserver(checkExtension)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Fetch creator data
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

    if (handle) fetchCreator()
  }, [handle])

  // Avatar color based on handle
  const getAvatarColor = (h: string) => {
    const hue = h.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, 55%, 35%)`
  }

  // Copy address
  const copyAddress = async () => {
    if (!creator?.shielded_address) return
    try {
      await navigator.clipboard.writeText(creator.shielded_address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  // Truncate address
  const truncateAddress = (addr: string) => {
    if (addr.length <= 16) return addr
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  // Button config
  const getButtonConfig = () => {
    if (isMobile) {
      return { text: "Open on Desktop to Tip", action: null, disabled: true }
    }
    if (extensionInstalled) {
      return {
        text: "SEND A TIP",
        action: () => {
          window.dispatchEvent(new CustomEvent('tipz-open-modal', {
            detail: { handle: creator?.handle || handle }
          }))
        },
        disabled: false,
      }
    }
    return {
      text: "GET STARTED — FREE",
      action: () => {
        sessionStorage.setItem('tipz_pending_tip', JSON.stringify({
          handle: creator?.handle || handle,
          platform: 'x',
          timestamp: Date.now()
        }))
        window.open('https://chromewebstore.google.com/detail/tipz/pkfmgpniebpokpjojomhaaajgcdkbfpc', '_blank')
      },
      disabled: false,
    }
  }

  const buttonConfig = getButtonConfig()

  // Loading state
  if (state === "loading") {
    return (
      <>
        <style>{responsiveStyles}</style>
        <div className="tipz-page">
          <div className="tipz-card">
            <div className="tipz-card-content">
              <div className="tipz-skeleton" style={{ width: 80, height: 24, margin: "0 auto 28px" }} />
              <div className="tipz-skeleton" style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto 20px" }} />
              <div className="tipz-skeleton" style={{ width: 140, height: 28, margin: "0 auto 12px" }} />
              <div className="tipz-skeleton" style={{ width: 120, height: 24, borderRadius: 20, margin: "0 auto 24px" }} />
              <div className="tipz-skeleton" style={{ width: "100%", height: 80, borderRadius: 12, marginBottom: 20 }} />
              <div className="tipz-skeleton" style={{ width: "100%", height: 52, borderRadius: 12 }} />
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
          <div className="tipz-card">
            <div className="tipz-card-content">
              <div className="tipz-logo">TIPZ</div>

              <div className="tipz-notfound-avatar">
                <span style={{ fontSize: 36, color: colors.muted }}>?</span>
              </div>

              <h1 className="tipz-handle">@{handle}</h1>

              <div className="tipz-notfound-badge">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.error }} />
                <span style={{ color: colors.error, fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>
                  NOT REGISTERED
                </span>
              </div>

              <div className="tipz-info-box">
                <p style={{ color: colors.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  This creator hasn't joined yet. Let them know they can receive private, fee-free tips!
                </p>
              </div>

              <a
                href={`https://x.com/intent/tweet?text=Hey%20@${handle}%20you%20should%20join%20@tipz_cash%20to%20receive%20private%2C%20fee-free%20tips!`}
                target="_blank"
                rel="noopener noreferrer"
                className="tipz-btn-primary"
              >
                INVITE THEM ON X
              </a>

              <a href="/creators" className="tipz-btn-secondary">
                BROWSE OTHER CREATORS
              </a>

              <p className="tipz-tagline">0% FEES • PRIVATE • UNLINKABLE</p>
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
  // Mobile layout: edge-to-edge, inline avatar + handle
  if (isMobile) {
    return (
      <>
        <style>{responsiveStyles}</style>
        <div className="tipz-page tipz-mobile">
          <div className="tipz-card">
            <div className="tipz-card-content">
              {/* Header with back + logo */}
              <div className="tipz-mobile-header">
                <a href="/" className="tipz-mobile-back">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </a>
                <div className="tipz-mobile-logo">TIPZ</div>
              </div>

              {/* Profile: inline avatar + handle */}
              <div className="tipz-mobile-profile">
                <div className="tipz-avatar-wrap">
                  <div className="tipz-avatar-ring" />
                  <div className="tipz-avatar" style={{ backgroundColor: getAvatarColor(creator?.handle || handle) }}>
                    <span className="tipz-avatar-letter">
                      {creator?.handle?.[0] || "?"}
                    </span>
                  </div>
                </div>
                <div className="tipz-mobile-profile-info">
                  <h1 className="tipz-handle">@{creator?.handle}</h1>
                  <div className="tipz-verified">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.verified} strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="tipz-verified-text">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="tipz-mobile-content">
                <div className="tipz-value-box">
                  <div className="tipz-benefits">
                    <span className="tipz-benefit" style={{ color: colors.success }}>0% FEES</span>
                    <span className="tipz-benefit" style={{ color: colors.muted }}>•</span>
                    <span className="tipz-benefit" style={{ color: colors.primary }}>PRIVATE</span>
                    <span className="tipz-benefit" style={{ color: colors.muted }}>•</span>
                    <span className="tipz-benefit" style={{ color: colors.text }}>INSTANT</span>
                  </div>
                  <p className="tipz-value-text">
                    100% goes to @{creator?.handle}
                  </p>
                </div>

                <button
                  onClick={buttonConfig.action || undefined}
                  disabled={buttonConfig.disabled}
                  className="tipz-cta"
                >
                  {buttonConfig.text}
                  {!buttonConfig.disabled && <span>→</span>}
                </button>

                <p className="tipz-instruction">
                  {extensionInstalled
                    ? "Tap to send a private tip."
                    : "Add the free Chrome extension to tip."}
                </p>

                <div className="tipz-address">
                  <code className="tipz-address-text">
                    {truncateAddress(creator?.shielded_address || "")}
                  </code>
                  <button onClick={copyAddress} className="tipz-copy-btn" title="Copy address">
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop layout: centered card
  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="tipz-page">
        <div className="tipz-card">
          <div className="tipz-card-content">
            <div className="tipz-logo">TIPZ</div>

            <div className="tipz-avatar-wrap">
              <div className="tipz-avatar-ring" />
              <div className="tipz-avatar" style={{ backgroundColor: getAvatarColor(creator?.handle || handle) }}>
                <span className="tipz-avatar-letter">
                  {creator?.handle?.[0] || "?"}
                </span>
              </div>
            </div>

            <h1 className="tipz-handle">@{creator?.handle}</h1>

            <div className="tipz-verified">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.verified} strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="tipz-verified-text">VERIFIED SHIELDED</span>
            </div>

            <div className="tipz-value-box">
              <div className="tipz-benefits">
                <span className="tipz-benefit" style={{ color: colors.success }}>✓ 0% FEES</span>
                <span className="tipz-benefit" style={{ color: colors.primary }}>✓ PRIVATE</span>
                <span className="tipz-benefit" style={{ color: colors.text }}>✓ INSTANT</span>
              </div>
              <p className="tipz-value-text">
                100% of your tip goes to @{creator?.handle}. No middlemen.
              </p>
            </div>

            <button
              onClick={buttonConfig.action || undefined}
              disabled={buttonConfig.disabled}
              className="tipz-cta"
            >
              {buttonConfig.text}
              {!buttonConfig.disabled && <span>→</span>}
            </button>

            <p className="tipz-instruction">
              {extensionInstalled
                ? "Click above to send a private tip. Takes 10 seconds."
                : "Add the free Chrome extension, then tip with one click."}
            </p>

            <div className="tipz-address">
              <code className="tipz-address-text">
                {truncateAddress(creator?.shielded_address || "")}
              </code>
              <button onClick={copyAddress} className="tipz-copy-btn" title="Copy address">
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
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
