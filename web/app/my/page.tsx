"use client"

import { useState, useEffect, useCallback } from "react"
import { colors } from "@/lib/colors"
import { animationKeyframes } from "@/lib/animations"
import SiteHeader from "@/components/SiteHeader"
import { LetterGridBackground } from "@/components/LetterGridBackground"
import {
  hasPrivateKey,
  generateKeyPair,
  storePrivateKey,
  decryptTipData,
} from "@/lib/crypto-client"
import type { TipzData } from "@/lib/tipz"
import { useRealtimeTips } from "./hooks/useRealtimeTips"
import LoginCard from "./components/LoginCard"
import ProfileHeader from "./components/ProfileHeader"
import HeroStat from "./components/HeroStat"
import StampTools from "./components/StampTools"
import ActivityFeed from "./components/ActivityFeed"
import NotificationToast from "./components/NotificationToast"

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

// Skeleton loading component
function DashboardSkeleton() {
  return (
    <div style={{ opacity: 1 }}>
      {/* Avatar skeleton */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: colors.border,
          animation: "shimmer 1.5s ease-in-out infinite",
          marginBottom: "16px",
        }} />
        <div style={{
          width: "140px",
          height: "20px",
          borderRadius: "4px",
          background: colors.border,
          animation: "shimmer 1.5s ease-in-out infinite",
          marginBottom: "8px",
        }} />
        <div style={{
          width: "80px",
          height: "12px",
          borderRadius: "4px",
          background: colors.border,
          animation: "shimmer 1.5s ease-in-out infinite",
        }} />
      </div>

      {/* Hero stat skeleton */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          width: "200px",
          height: "40px",
          borderRadius: "4px",
          background: colors.border,
          animation: "shimmer 1.5s ease-in-out infinite",
          margin: "0 auto 8px",
        }} />
        <div style={{
          width: "100px",
          height: "12px",
          borderRadius: "4px",
          background: colors.border,
          animation: "shimmer 1.5s ease-in-out infinite",
          margin: "0 auto",
        }} />
      </div>

      {/* Stamp tiles skeleton */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
        marginBottom: "24px",
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            height: "72px",
            borderRadius: "10px",
            background: colors.border,
            animation: "shimmer 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>

      {/* Activity skeleton */}
      <div style={{
        width: "60px",
        height: "12px",
        borderRadius: "4px",
        background: colors.border,
        animation: "shimmer 1.5s ease-in-out infinite",
        marginBottom: "12px",
      }} />
      <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            padding: "16px 20px",
            borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.03)" : "none",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}>
            <div style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: colors.border,
              animation: "shimmer 1.5s ease-in-out infinite",
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                width: "120px",
                height: "14px",
                borderRadius: "4px",
                background: colors.border,
                animation: "shimmer 1.5s ease-in-out infinite",
                marginBottom: "6px",
              }} />
              <div style={{
                width: "80px",
                height: "10px",
                borderRadius: "4px",
                background: colors.border,
                animation: "shimmer 1.5s ease-in-out infinite",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MyTipzPage() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [handle, setHandle] = useState("")
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [tips, setTips] = useState<DecryptedTip[]>([])
  const [tipCount, setTipCount] = useState(0)
  const [keySetup, setKeySetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [toastTips, setToastTips] = useState<Array<{ id: string; decrypted?: TipzData; status: string }>>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [zecPrice, setZecPrice] = useState<number>(0)
  const [showBackground, setShowBackground] = useState(false)

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
      setUnreadCount((prev) => prev + decryptedNew.length)
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

  // Tab title notification
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) TIPZ` : "TIPZ"
  }, [unreadCount])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setUnreadCount(0)
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [])

  // Lazy-load background to prioritize dashboard content
  useEffect(() => {
    const timer = setTimeout(() => setShowBackground(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch live ZEC price
  useEffect(() => {
    fetch("/api/zec-price")
      .then(res => res.json())
      .then(data => setZecPrice(data.price))
      .catch(() => setZecPrice(27.50))
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

    // Fetch tips, stats, and creator profile in parallel
    const [tipsRes, statsRes, creatorRes] = await Promise.all([
      fetch(`/api/tips/received?handle=${encodeURIComponent(userHandle)}&limit=5`),
      fetch(`/api/tips/stats?handle=${encodeURIComponent(userHandle)}`),
      fetch(`/api/creator?platform=x&handle=${encodeURIComponent(userHandle)}`),
    ])

    const tipsData = await tipsRes.json()
    const statsData = await statsRes.json()
    const creatorData = await creatorRes.json()

    setTipCount(statsData.tip_count || 0)
    setAvatarUrl(creatorData.creator?.avatar_url || null)

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
      setAvatarUrl(null)
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
  const totalUsd = totalZec * zecPrice

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
      {/* Matrix letter grid background */}
      {showBackground && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <LetterGridBackground />
        </div>
      )}

      {/* Notification Toasts */}
      <NotificationToast
        tips={toastTips}
        onDismiss={handleDismissToast}
        prefersReducedMotion={prefersReducedMotion}
      />

      <SiteHeader activePage="my" />

      {/* Page Content */}
      <main style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)",
        paddingTop: "80px",
      }}>
        <div
          className="my-dashboard-card"
          style={{
            width: "100%",
            maxWidth: "440px",
            position: "relative",
            background: colors.pageBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "16px",
            padding: "clamp(16px, 4vw, 24px)",
            overflow: "hidden",
          }}
        >

          {/* Loading Skeleton */}
          {loading && <DashboardSkeleton />}

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
            <LoginCard animStyle={animStyle} prefersReducedMotion={prefersReducedMotion} />
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
              <ProfileHeader
                handle={handle}
                avatarUrl={avatarUrl}
                connectionStatus={connectionStatus}
                loggingOut={loggingOut}
                onLogout={handleLogout}
                prefersReducedMotion={prefersReducedMotion}
              />

              <HeroStat
                totalZec={totalZec}
                totalUsd={totalUsd}
                tipCount={tipCount}
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
                zecPrice={zecPrice}
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
        .my-dashboard-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
          border-radius: inherit;
        }
        .my-dashboard-card > * {
          position: relative;
          z-index: 1;
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
