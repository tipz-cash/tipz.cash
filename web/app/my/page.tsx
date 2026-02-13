"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { colors } from "@/lib/colors"
import { animationKeyframes, transitions } from "@/lib/animations"
import {
  hasPrivateKey,
  generateKeyPair,
  storePrivateKey,
  decryptTipData,
} from "@/lib/crypto-client"
import type { TipzData } from "@/lib/tipz"

// SVG Icons
function LockIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function LogOutIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

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
  const [tips, setTips] = useState<DecryptedTip[]>([])
  const [tipCount, setTipCount] = useState(0)
  const [keySetup, setKeySetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

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
        // Clean URL
        window.history.replaceState({}, "", "/my")
      }
    }
  }, [])

  const loadDashboard = useCallback(async (userHandle: string) => {
    // Key setup: generate if needed
    if (!hasPrivateKey()) {
      setKeySetup(true)
      try {
        const { publicKey, privateKey } = await generateKeyPair()
        storePrivateKey(privateKey)

        // Upload public key via session-authenticated /api/link
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

    // Fetch tips
    const [tipsRes, statsRes] = await Promise.all([
      fetch(`/api/tips/received?handle=${encodeURIComponent(userHandle)}&limit=50`),
      fetch(`/api/tips/stats?handle=${encodeURIComponent(userHandle)}`),
    ])

    const tipsData = await tipsRes.json()
    const statsData = await statsRes.json()

    setTipCount(statsData.tip_count || 0)

    // Decrypt tips client-side
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
    if (error) return // Don't check session if we have a URL error

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()

        if (data.authenticated) {
          setAuthenticated(true)
          setHandle(data.handle)
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
      setTips([])
      setTipCount(0)
    } finally {
      setLoggingOut(false)
    }
  }

  // Calculate totals from decryptable tips only
  const totalZec = tips.reduce((sum, t) => sum + (t.decrypted?.amount_zec || 0), 0)
  const totalUsd = tips.reduce((sum, t) => sum + (t.decrypted?.amount_usd || 0), 0)

  const animStyle = prefersReducedMotion ? { opacity: 1 } : {
    animation: "fadeInUp 0.4s ease-out forwards",
  }

  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      padding: "clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)",
      background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "24px",
            fontSize: "12px",
            color: colors.muted,
            textDecoration: "none",
            letterSpacing: "1px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          BACK TO HOME
        </Link>

        {/* Header */}
        <div style={{
          marginBottom: "32px",
          padding: "28px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "20px",
          ...animStyle,
        }}>
          <div style={{
            fontSize: "11px",
            color: colors.primary,
            letterSpacing: "2px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: colors.primary,
              borderRadius: "50%",
              boxShadow: `0 0 10px ${colors.primary}`,
              animation: prefersReducedMotion ? "none" : "pulse-glow 2s ease-in-out infinite",
            }} />
            CREATOR DASHBOARD
          </div>
          <h1 style={{
            margin: "0 0 8px",
            fontSize: "clamp(28px, 5vw, 38px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            color: colors.textBright,
          }}>
            <span style={{ color: colors.primary }}>{">"}</span> My Tipz
          </h1>
          {authenticated && (
            <p style={{ margin: 0, color: colors.muted, fontSize: "14px" }}>
              @{handle}
            </p>
          )}
        </div>

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
            ...animStyle,
          }}>
            {error}
          </div>
        )}

        {/* Not authenticated — Login button */}
        {!loading && !authenticated && (
          <div style={{
            padding: "48px 32px",
            textAlign: "center",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "16px",
            ...animStyle,
          }}>
            <div style={{ marginBottom: "24px" }}>
              <LockIcon size={32} color={colors.muted} />
            </div>
            <p style={{
              margin: "0 0 24px",
              color: colors.text,
              fontSize: "14px",
              lineHeight: 1.6,
            }}>
              Log in with your X account to view your tips, decrypted memos, and analytics.
            </p>
            <a
              href="/api/auth/twitter"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                fontSize: "15px",
                fontWeight: 600,
                color: colors.textBright,
                backgroundColor: "#1d9bf0",
                borderRadius: "8px",
                textDecoration: "none",
                transition: transitions.normal,
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <XIcon size={18} />
              Login with X
            </a>
            <p style={{
              margin: "20px 0 0",
              fontSize: "12px",
              color: colors.muted,
            }}>
              Not registered?{" "}
              <Link href="/register" style={{ color: colors.primary, textDecoration: "underline" }}>
                Claim your handle first
              </Link>
            </p>
          </div>
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

        {/* Authenticated — Dashboard */}
        {!loading && authenticated && !keySetup && (
          <>
            {/* Stats Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "24px",
              ...animStyle,
              animationDelay: prefersReducedMotion ? "0s" : "0.1s",
            }}>
              <div style={{
                padding: "20px 16px",
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "8px" }}>
                  TIPS
                </div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: colors.textBright }}>
                  {tipCount}
                </div>
              </div>
              <div style={{
                padding: "20px 16px",
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "8px" }}>
                  ZEC
                </div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: colors.primary }}>
                  {totalZec.toFixed(4)}
                </div>
              </div>
              <div style={{
                padding: "20px 16px",
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "8px" }}>
                  USD
                </div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: colors.success }}>
                  ${totalUsd.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Tips List */}
            <div style={{
              ...animStyle,
              animationDelay: prefersReducedMotion ? "0s" : "0.2s",
            }}>
              <div style={{
                fontSize: "11px",
                color: colors.muted,
                letterSpacing: "1px",
                marginBottom: "12px",
              }}>
                RECENT TIPS
              </div>

              {tips.length === 0 && (
                <div style={{
                  padding: "32px",
                  textAlign: "center",
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  color: colors.muted,
                  fontSize: "14px",
                }}>
                  No tips yet. Share your tip page to get started!
                  <div style={{ marginTop: "12px" }}>
                    <Link href={`/${handle}`} style={{
                      color: colors.primary,
                      textDecoration: "underline",
                      fontSize: "13px",
                    }}>
                      tipz.cash/{handle}
                    </Link>
                  </div>
                </div>
              )}

              {tips.map((tip, i) => (
                <div key={tip.id} style={{
                  padding: "16px 20px",
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  ...animStyle,
                  animationDelay: prefersReducedMotion ? "0s" : `${0.05 * i}s`,
                }}>
                  {tip.decrypted ? (
                    <>
                      <div>
                        <div style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: colors.textBright,
                          marginBottom: "4px",
                        }}>
                          {tip.decrypted.amount_zec.toFixed(4)} ZEC
                          <span style={{ color: colors.muted, fontWeight: 400, fontSize: "13px", marginLeft: "8px" }}>
                            ${tip.decrypted.amount_usd.toFixed(2)}
                          </span>
                        </div>
                        {tip.decrypted.memo && (
                          <div style={{
                            fontSize: "13px",
                            color: colors.text,
                            fontStyle: "italic",
                          }}>
                            &ldquo;{tip.decrypted.memo}&rdquo;
                          </div>
                        )}
                        <div style={{
                          fontSize: "11px",
                          color: colors.muted,
                          marginTop: "4px",
                        }}>
                          {formatDate(tip.created_at)} · {tip.source_platform}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <LockIcon size={16} color={colors.muted} />
                      <div>
                        <div style={{
                          fontSize: "14px",
                          color: colors.muted,
                          fontStyle: "italic",
                        }}>
                          [Encrypted Tip]
                        </div>
                        <div style={{
                          fontSize: "11px",
                          color: colors.muted,
                          marginTop: "2px",
                        }}>
                          {formatDate(tip.created_at)} · {tip.source_platform}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Logout */}
            <div style={{
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "center",
            }}>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  color: colors.muted,
                  backgroundColor: "transparent",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  cursor: loggingOut ? "not-allowed" : "pointer",
                  transition: transitions.fast,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.error
                  e.currentTarget.style.color = colors.error
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border
                  e.currentTarget.style.color = colors.muted
                }}
              >
                <LogOutIcon size={14} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        ${animationKeyframes}
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
