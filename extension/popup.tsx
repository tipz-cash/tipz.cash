import { useState, useEffect } from "react"
import { getLinkedCreator, clearLinkedCreator, onLinkedCreatorChange, type CreatorIdentity } from "~lib/identity"
import { getReceivedTips, getRevenueStats, type ReceivedTip, type RevenueStats } from "~lib/api"
import { colors, fonts, radius, shadows, transitions } from "~lib/theme"

const WEB_URL = process.env.PLASMO_PUBLIC_API_URL || "https://tipz.cash"

// Terminal-style TIPZ Logo Component with glow effect
function Logo() {
  return (
    <span style={{
      color: colors.primary,
      fontWeight: 700,
      fontSize: "16px",
      fontFamily: fonts.mono,
      textShadow: `0 0 20px ${colors.primaryGlow}`,
      letterSpacing: "0.5px",
    }}>
      [TIPZ]
    </span>
  )
}

// Linked status indicator with pulse animation
function LinkedStatus({ identity }: { identity: CreatorIdentity | null }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}>
      <div style={{
        width: "8px",
        height: "8px",
        borderRadius: radius.full,
        backgroundColor: identity ? colors.success : colors.muted,
        animation: identity ? "statusPulse 2s ease-in-out infinite" : "none",
      }}/>
      <span style={{ fontSize: "11px", color: colors.muted, fontFamily: fonts.mono }}>
        {identity ? `@${identity.handle}` : "Not Linked"}
      </span>
    </div>
  )
}

// Revenue stat card with glassmorphism
function StatCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div style={{
      flex: 1,
      padding: "16px",
      background: colors.cardBg,
      backdropFilter: "blur(16px)",
      borderRadius: radius.lg,
      border: `1px solid ${colors.cardBorder}`,
      borderTop: `1px solid ${colors.borderGold}`,
      boxShadow: shadows.card,
      transition: `all ${transitions.normal}`,
    }}>
      <div style={{
        fontSize: "10px",
        color: colors.muted,
        fontFamily: fonts.mono,
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "20px",
        fontWeight: 600,
        color: colors.primary,
        fontFamily: fonts.mono,
        textShadow: `0 0 20px ${colors.primaryGlow}`,
      }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: "10px", color: colors.muted, fontFamily: fonts.mono, marginTop: "4px" }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

// Recent tip item with hover state
function RecentTipItem({ tip }: { tip: ReceivedTip }) {
  const date = new Date(tip.created_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 14px",
      background: colors.cardBg,
      backdropFilter: "blur(12px)",
      borderRadius: radius.md,
      border: `1px solid ${colors.cardBorder}`,
      transition: `all ${transitions.fast}`,
    }}>
      <div>
        <div style={{
          fontSize: "13px",
          fontWeight: 500,
          fontFamily: fonts.mono,
          color: colors.textWhite
        }}>
          Tip received
        </div>
        <div style={{ fontSize: "11px", color: colors.muted, fontFamily: fonts.mono }}>
          {formattedDate}
        </div>
      </div>
      <div style={{
        fontSize: "14px",
        fontWeight: 600,
        color: colors.success,
        fontFamily: fonts.mono,
      }}>
        +{tip.amount} ZEC
      </div>
    </div>
  )
}

// Loading skeleton
function TipSkeleton() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 14px",
      background: colors.cardBg,
      borderRadius: radius.md,
      border: `1px solid ${colors.cardBorder}`,
    }}>
      <div>
        <div style={{
          width: "80px",
          height: "13px",
          backgroundColor: colors.border,
          borderRadius: radius.sm,
          marginBottom: "6px",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
        <div style={{
          width: "50px",
          height: "11px",
          backgroundColor: colors.border,
          borderRadius: radius.sm,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      </div>
      <div style={{
        width: "60px",
        height: "13px",
        backgroundColor: colors.border,
        borderRadius: radius.sm,
        animation: "pulse 1.5s ease-in-out infinite",
      }} />
    </div>
  )
}

// Not linked view - prompts creator to register/link
function NotLinkedView() {
  return (
    <div style={{ padding: "24px 20px", textAlign: "center" }}>
      <div style={{
        width: "64px",
        height: "64px",
        borderRadius: radius.lg,
        background: colors.cardBg,
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: shadows.card,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      <h2 style={{
        margin: "0 0 10px",
        fontSize: "16px",
        fontWeight: 600,
        color: colors.textWhite,
        fontFamily: fonts.mono,
      }}>
        Link Your Account
      </h2>

      <p style={{
        margin: "0 0 24px",
        fontSize: "13px",
        color: colors.muted,
        fontFamily: fonts.sans,
        lineHeight: 1.5,
      }}>
        Register on TIPZ to start receiving private tips and track your earnings.
      </p>

      <a
        href={`${WEB_URL}/register`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          width: "100%",
          padding: "14px 24px",
          fontSize: "14px",
          fontWeight: 600,
          color: colors.bg,
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          border: "none",
          borderRadius: radius.lg,
          textAlign: "center",
          textDecoration: "none",
          cursor: "pointer",
          fontFamily: fonts.mono,
          boxSizing: "border-box",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(245,166,35,0.15)",
          transition: `all ${transitions.fast}`,
        }}
      >
        Register Now
      </a>

      {/* Link Existing Account Button */}
      <button
        onClick={() => {
          chrome.tabs.create({ url: WEB_URL })
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          width: "100%",
          marginTop: "12px",
          padding: "12px 16px",
          fontSize: "13px",
          fontWeight: 500,
          color: colors.textWhite,
          backgroundColor: "transparent",
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          cursor: "pointer",
          fontFamily: fonts.mono,
          boxSizing: "border-box",
          transition: `all ${transitions.fast}`,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Link Existing Account
      </button>

      <p style={{
        margin: "16px 0 0",
        fontSize: "11px",
        color: colors.muted,
        fontFamily: fonts.sans,
        textAlign: "center",
      }}>
        Visit tipz.cash to link your account
      </p>
    </div>
  )
}

// Creator dashboard view
function CreatorDashboard({ identity }: { identity: CreatorIdentity }) {
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [recentTips, setRecentTips] = useState<ReceivedTip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        const [statsData, tipsData] = await Promise.all([
          getRevenueStats(identity.handle),
          getReceivedTips(identity.handle, 5)
        ])

        setStats(statsData)
        setRecentTips(tipsData.tips)
      } catch (e) {
        setError("Failed to load data")
        console.error("TIPZ: Failed to load dashboard data", e)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [identity.handle])

  const handleUnlink = async () => {
    if (confirm("Are you sure you want to unlink your account?")) {
      await clearLinkedCreator()
    }
  }

  return (
    <div style={{ padding: "16px 20px 20px" }}>
      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <StatCard
          label="TOTAL EARNED"
          value={stats ? `${parseFloat(stats.total_zec).toFixed(4)}` : "-.----"}
          subtext="ZEC"
        />
        <StatCard
          label="TIPS"
          value={stats ? stats.tip_count.toString() : "-"}
          subtext="received"
        />
      </div>

      {/* USD Value */}
      {stats && parseFloat(stats.total_zec) > 0 && (
        <div style={{
          padding: "12px 14px",
          background: colors.primaryGlow,
          border: `1px solid ${colors.borderGold}`,
          borderRadius: radius.md,
          marginBottom: "16px",
          textAlign: "center",
        }}>
          <span style={{ fontSize: "12px", color: colors.text, fontFamily: fonts.mono }}>
            ≈ {stats.total_usd}
          </span>
        </div>
      )}

      {/* Recent Tips */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}>
          <h3 style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: fonts.mono,
            color: colors.muted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            Recent Tips
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {isLoading ? (
            <>
              <TipSkeleton />
              <TipSkeleton />
            </>
          ) : error ? (
            <div style={{
              padding: "14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${colors.error}`,
              borderRadius: radius.md,
              fontSize: "12px",
              color: colors.error,
              textAlign: "center",
              fontFamily: fonts.mono,
            }}>
              {error}
            </div>
          ) : recentTips.length > 0 ? (
            recentTips.map((tip) => (
              <RecentTipItem key={tip.id} tip={tip} />
            ))
          ) : (
            <div style={{
              padding: "24px 14px",
              background: colors.cardBg,
              borderRadius: radius.md,
              border: `1px solid ${colors.cardBorder}`,
              fontSize: "12px",
              color: colors.muted,
              textAlign: "center",
              fontFamily: fonts.mono,
            }}>
              No tips yet. Share your tip page to start earning!
            </div>
          )}
        </div>
      </div>

      {/* Share Tip Page - Secondary button */}
      <a
        href={`${WEB_URL}/${identity.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          width: "100%",
          padding: "12px 16px",
          fontSize: "13px",
          fontWeight: 500,
          color: colors.textWhite,
          backgroundColor: "transparent",
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          cursor: "pointer",
          textDecoration: "none",
          fontFamily: fonts.mono,
          boxSizing: "border-box",
          transition: `all ${transitions.fast}`,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
        View Tip Page
      </a>

      {/* Unlink */}
      <button
        onClick={handleUnlink}
        style={{
          display: "block",
          width: "100%",
          marginTop: "12px",
          padding: "10px",
          fontSize: "11px",
          color: colors.muted,
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: fonts.mono,
          transition: `color ${transitions.fast}`,
        }}
      >
        Unlink account
      </button>
    </div>
  )
}

function IndexPopup() {
  const [linkedCreator, setLinkedCreator] = useState<CreatorIdentity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load initial state
    getLinkedCreator().then((identity) => {
      setLinkedCreator(identity)
      setIsLoading(false)
    })

    // Listen for changes
    const unsubscribe = onLinkedCreatorChange((identity) => {
      setLinkedCreator(identity)
    })

    return unsubscribe
  }, [])

  return (
    <div
      style={{
        width: "320px",
        backgroundColor: colors.bg,
        fontFamily: fonts.mono,
        color: colors.textWhite,
      }}
    >
      {/* Gold accent bar at top */}
      <div style={{
        height: "2px",
        background: "linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)",
      }} />

      {/* Header with glassmorphism */}
      <div style={{
        padding: "20px",
        background: "rgba(18, 20, 26, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Logo />
            <span style={{
              color: colors.muted,
              fontSize: "11px",
              fontFamily: fonts.mono,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Creator
            </span>
          </div>
          <LinkedStatus identity={linkedCreator} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <div style={{
            width: "24px",
            height: "24px",
            border: `2px solid ${colors.border}`,
            borderTopColor: colors.primary,
            borderRadius: radius.full,
            animation: "spin 0.8s linear infinite",
            margin: "0 auto",
          }} />
        </div>
      ) : linkedCreator ? (
        <CreatorDashboard identity={linkedCreator} />
      ) : (
        <NotLinkedView />
      )}

      {/* Footer */}
      <div style={{
        padding: "14px 20px",
        borderTop: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: colors.bgBase,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: radius.full,
            backgroundColor: colors.success,
          }} />
          <span style={{ fontSize: "11px", color: colors.muted, fontFamily: fonts.mono }}>
            Powered by Zcash
          </span>
        </div>
        <div style={{ display: "flex", gap: "14px" }}>
          <a
            href="https://github.com/tipz"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.muted,
              fontSize: "11px",
              textDecoration: "none",
              fontFamily: fonts.mono,
              transition: `color ${transitions.fast}`,
            }}
          >
            GitHub
          </a>
          <a
            href={`${WEB_URL}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.muted,
              fontSize: "11px",
              textDecoration: "none",
              fontFamily: fonts.mono,
              transition: `color ${transitions.fast}`,
            }}
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
