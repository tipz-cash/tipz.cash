"use client"

import { useState, useEffect, useCallback } from "react"
import { colors } from "@/lib/colors"
import { animationKeyframes } from "@/lib/animations"
import {
  hasPrivateKey,
  generateKeyPair,
  storePrivateKey,
  decryptTipData,
} from "@/lib/crypto-client"
import type { TipzData } from "@/lib/tipz"
import { useRealtimeTips } from "./hooks/useRealtimeTips"
import LoginCard from "./components/LoginCard"
import CommandHeader from "./components/CommandHeader"
import StatsGrid from "./components/StatsGrid"
import StampTools from "./components/StampTools"
import ActivityFeed from "./components/ActivityFeed"
import NotificationToast from "./components/NotificationToast"

// Nav styles
const navLinkStyle: React.CSSProperties = {
  color: colors.muted,
  textDecoration: "none",
  fontSize: "11px",
  letterSpacing: "1px",
  transition: "color 0.2s",
}

const activeLinkStyle: React.CSSProperties = {
  ...navLinkStyle,
  color: colors.primary,
}

// Types
interface Tip {
  id: string
  created_at: string
  status: string
  source_platform: string
  data: string | null
}

interface DecryptedTip extends Tip {
  decrypted?: TipzData
  decryptFailed?: boolean
  isNew?: boolean
}

const ERROR_MESSAGES: Record<string, string> = {
  not_registered: "This X account is not registered on TIPZ. Register first at tipz.cash/register.",
  expired: "Login session expired. Please try again.",
  csrf: "Security check failed. Please try again.",
  token_exchange: "Twitter login failed. Please try again.",
  user_lookup: "Could not verify your X account. Please try again.",
  missing_params: "Login was interrupted. Please try again.",
  not_configured: "Twitter login is not configured.",
  db_unavailable: "Database unavailable. Please try later.",
}

export default function MyTipzPage() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [handle, setHandle] = useState("")
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [tips, setTips] = useState<DecryptedTip[]>([])
  const [tipCount, setTipCount] = useState(0)
  const [keySetup, setKeySetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toastTips, setToastTips] = useState<Array<{ id: string; decrypted?: TipzData; status: string }>>([])

  // Real-time tips
  const { status: connectionStatus, newTips, clearNewTips } = useRealtimeTips(
    authenticated ? creatorId : null
  )

  // Merge real-time tips into feed + show toasts
  useEffect(() => {
    if (newTips.length === 0) return

    const processNewTips = async () => {
      const decryptedNew: DecryptedTip[] = await Promise.all(
        newTips.map(async (tip): Promise<DecryptedTip> => {
          if (!tip.data) return { ...tip, isNew: true }
          try {
            const data = await decryptTipData(tip.data)
            return { ...tip, decrypted: data, isNew: true }
          } catch {
            return { ...tip, decryptFailed: true, isNew: true }
          }
        })
      )

      // Add to toast queue
      setToastTips((prev) => [
        ...decryptedNew.map((t) => ({ id: t.id, decrypted: t.decrypted, status: t.status })),
        ...prev,
      ])

      // Prepend to activity feed
      setTips((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const unique = decryptedNew.filter((t) => !existingIds.has(t.id))
        return [...unique, ...prev]
      })

      setTipCount((prev) => prev + decryptedNew.length)
      clearNewTips()
    }

    processNewTips()
  }, [newTips, clearNewTips])

  // Reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mq.matches)
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [])

  // Check for error in URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const errCode = params.get("error")
      if (errCode) {
        setError(ERROR_MESSAGES[errCode] || "Login failed. Please try again.")
        setLoading(false)
        window.history.replaceState({}, "", "/my")
      }
    }
  }, [])

  const loadDashboard = useCallback(async (userHandle: string) => {
    if (!hasPrivateKey()) {
      setKeySetup(true)
      try {
        const { publicKey, privateKey } = await generateKeyPair()
        storePrivateKey(privateKey)
        const linkRes = await fetch("/api/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey }),
        })
        if (!linkRes.ok) {
          console.warn("[my] Failed to upload public key:", await linkRes.text())
        }
      } catch (err) {
        console.error("[my] Key generation failed:", err)
      }
      setKeySetup(false)
    }

    const [tipsRes, statsRes] = await Promise.all([
      fetch(`/api/tips/received?handle=${encodeURIComponent(userHandle)}&limit=50`),
      fetch(`/api/tips/stats?handle=${encodeURIComponent(userHandle)}`),
    ])

    const tipsData = await tipsRes.json()
    const statsData = await statsRes.json()

    setTipCount(statsData.tip_count || 0)

    const rawTips: Tip[] = tipsData.tips || []
    const decrypted: DecryptedTip[] = await Promise.all(
      rawTips.map(async (tip): Promise<DecryptedTip> => {
        if (!tip.data) return { ...tip }
        try {
          const data = await decryptTipData(tip.data)
          return { ...tip, decrypted: data }
        } catch {
          return { ...tip, decryptFailed: true }
        }
      })
    )

    setTips(decrypted)
  }, [])

  // Check session on mount
  useEffect(() => {
    if (error) return

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()

        if (data.authenticated) {
          setAuthenticated(true)
          setHandle(data.handle)
          setCreatorId(data.creatorId || null)
          await loadDashboard(data.handle)
        }
      } catch (err) {
        console.error("[my] Session check failed:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [error, loadDashboard])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setAuthenticated(false)
      setHandle("")
      setCreatorId(null)
      setTips([])
      setTipCount(0)
    } finally {
      setLoggingOut(false)
    }
  }

  const handleDismissToast = (id: string) => {
    setToastTips((prev) => prev.filter((t) => t.id !== id))
  }

  // Calculate totals
  const totalZec = tips.reduce((sum, t) => sum + (t.decrypted?.amount_zec || 0), 0)
  const totalUsd = tips.reduce((sum, t) => sum + (t.decrypted?.amount_usd || 0), 0)

  const animStyle: React.CSSProperties = prefersReducedMotion
    ? { opacity: 1 }
    : { animation: "fadeInUp 0.4s ease-out forwards" }

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.pageBg,
      color: colors.text,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Notification Toasts */}
      <NotificationToast
        tips={toastTips}
        onDismiss={handleDismissToast}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Sticky Navigation */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: `${colors.pageBg}ee`,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div className="header-inner" style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <span style={{
              color: colors.primary,
              fontWeight: 700,
              fontSize: "18px",
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: `0 0 20px ${colors.primaryGlow}`,
            }}>[TIPZ]</span>
            <span style={{
              color: colors.muted,
              fontSize: "10px",
              letterSpacing: "1px",
              padding: "2px 6px",
              border: `1px solid ${colors.border}`,
              borderRadius: "2px",
            }}>BETA</span>
          </a>

          <nav className="desktop-nav" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <a href="/creators" style={navLinkStyle}>CREATORS</a>
            <a href="/manifesto" style={navLinkStyle}>MANIFESTO</a>
            <a href="/docs" style={navLinkStyle}>DOCS</a>
            <span style={{ color: colors.border }}>|</span>
            <a href="/my" style={activeLinkStyle}>MY TIPZ</a>
            <a
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: `linear-gradient(135deg, ${colors.primary} 0%, #e89b1c 40%, ${colors.primaryHover} 100%)`,
                color: colors.bg,
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "0.5px",
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: "8px",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: `0 0 20px ${colors.primaryGlow}, 0 4px 12px rgba(0,0,0,0.3)`,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Claim Your Tipz ID
            </a>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 200,
            }}
          />
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "280px",
            background: colors.surface,
            borderLeft: `1px solid ${colors.border}`,
            zIndex: 201,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                alignSelf: "flex-end",
                background: "transparent",
                border: "none",
                color: colors.text,
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px",
                lineHeight: 1,
                marginBottom: "16px",
              }}
            >
              &times;
            </button>
            <a href="/my" onClick={() => setMobileMenuOpen(false)} style={{ ...activeLinkStyle, fontSize: "14px", padding: "12px 0" }}>MY TIPZ</a>
            <a href="/creators" onClick={() => setMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: "14px", padding: "12px 0" }}>CREATORS</a>
            <a href="/manifesto" onClick={() => setMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: "14px", padding: "12px 0" }}>MANIFESTO</a>
            <a href="/docs" onClick={() => setMobileMenuOpen(false)} style={{ ...navLinkStyle, fontSize: "14px", padding: "12px 0" }}>DOCS</a>
            <div style={{ marginTop: "16px" }}>
              <a
                href="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #e89b1c 40%, ${colors.primaryHover} 100%)`,
                  color: colors.bg,
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Claim Your Tipz ID
              </a>
            </div>
          </div>
        </>
      )}

      {/* Page Content */}
      <main style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)",
      }}>
        <div style={{ width: "100%", maxWidth: "600px" }}>

          {/* Loading */}
          {loading && (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: colors.muted,
              fontSize: "14px",
            }}>
              <span style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                border: `2px solid ${colors.border}`,
                borderTopColor: colors.primary,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                marginBottom: "12px",
              }} />
              <div>Loading...</div>
            </div>
          )}

          {/* Error from OAuth redirect */}
          {error && !loading && (
            <div style={{
              marginBottom: "24px",
              padding: "16px 20px",
              backgroundColor: colors.errorGlow,
              border: `1px solid ${colors.error}`,
              borderRadius: "12px",
              fontSize: "14px",
              color: colors.error,
              fontFamily: "Inter, sans-serif",
              ...animStyle,
            }}>
              {error}
            </div>
          )}

          {/* Not authenticated — Login */}
          {!loading && !authenticated && (
            <LoginCard animStyle={animStyle} />
          )}

          {/* Key setup in progress */}
          {keySetup && (
            <div style={{
              marginBottom: "24px",
              padding: "16px 20px",
              backgroundColor: colors.goldGlow,
              border: `1px solid ${colors.primaryGlow}`,
              borderRadius: "12px",
              fontSize: "13px",
              color: colors.text,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <span style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: `2px solid ${colors.border}`,
                borderTopColor: colors.primary,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }} />
              Generating encryption keys...
            </div>
          )}

          {/* Authenticated — Command Center */}
          {!loading && authenticated && !keySetup && (
            <>
              <CommandHeader
                handle={handle}
                connectionStatus={connectionStatus}
                loggingOut={loggingOut}
                onLogout={handleLogout}
                animStyle={animStyle}
              />

              <StatsGrid
                tipCount={tipCount}
                totalZec={totalZec}
                totalUsd={totalUsd}
                animStyle={animStyle}
                prefersReducedMotion={prefersReducedMotion}
              />

              <StampTools
                handle={handle}
                animStyle={animStyle}
                prefersReducedMotion={prefersReducedMotion}
              />

              <ActivityFeed
                tips={tips}
                handle={handle}
                animStyle={animStyle}
                prefersReducedMotion={prefersReducedMotion}
              />
            </>
          )}
        </div>
      </main>

      <style>{`
        ${animationKeyframes}
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .desktop-nav {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .header-inner {
            padding: 16px;
          }
          .desktop-nav {
            display: none;
          }
          .mobile-menu-btn {
            display: flex;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
