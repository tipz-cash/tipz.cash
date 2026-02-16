"use client"

import Link from "next/link"
import { colors } from "@/lib/colors"
import type { TipzData } from "@/lib/tipz"

interface DecryptedTip {
  id: string
  created_at: string
  status: string
  source_platform: string
  data: string | null
  decrypted?: TipzData
  decryptFailed?: boolean
  isNew?: boolean
}

interface ActivityFeedProps {
  tips: DecryptedTip[]
  handle: string
  animStyle: React.CSSProperties
  prefersReducedMotion: boolean
}

function LockIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

const glassCard: React.CSSProperties = {
  background: "rgba(26, 26, 26, 0.6)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "12px",
  position: "relative",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
}

export default function ActivityFeed({
  tips,
  handle,
  animStyle,
  prefersReducedMotion,
}: ActivityFeedProps) {
  return (
    <div style={{
      ...animStyle,
      animationDelay: prefersReducedMotion ? "0s" : "0.25s",
    }}>
      <div style={{
        fontSize: "11px",
        color: colors.muted,
        letterSpacing: "1px",
        marginBottom: "12px",
      }}>
        ACTIVITY
      </div>

      {tips.length === 0 && (
        <div style={{
          ...glassCard,
          padding: "32px",
          textAlign: "center",
        }}>
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${colors.muted}, transparent)`,
            borderRadius: "12px 12px 0 0",
          }} />
          <div style={{
            color: colors.muted,
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            marginBottom: "12px",
          }}>
            No tips yet. Share your tip page to get started!
          </div>
          <Link href={`/${handle}`} style={{
            color: colors.primary,
            textDecoration: "underline",
            fontSize: "13px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            tipz.cash/{handle}
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {tips.map((tip, i) => (
          <div
            key={tip.id}
            style={{
              ...glassCard,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderColor: tip.isNew ? "rgba(245, 166, 35, 0.2)" : "rgba(255, 255, 255, 0.06)",
              ...animStyle,
              animationDelay: prefersReducedMotion ? "0s" : `${0.05 * i}s`,
            }}
          >
            {tip.decrypted ? (
              <div>
                <div style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: colors.textBright,
                  marginBottom: "4px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {tip.decrypted.amount_zec.toFixed(4)} ZEC
                  <span style={{
                    color: colors.success,
                    fontWeight: 400,
                    fontSize: "13px",
                    marginLeft: "8px",
                  }}>
                    ${tip.decrypted.amount_usd.toFixed(2)}
                  </span>
                </div>
                {tip.decrypted.memo && (
                  <div style={{
                    fontSize: "13px",
                    color: colors.text,
                    fontFamily: "Inter, sans-serif",
                    fontStyle: "italic",
                  }}>
                    &ldquo;{tip.decrypted.memo}&rdquo;
                  </div>
                )}
                <div style={{
                  fontSize: "11px",
                  color: colors.muted,
                  marginTop: "4px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {formatDate(tip.created_at)}
                  <span style={{ margin: "0 6px", opacity: 0.4 }}>&middot;</span>
                  {tip.source_platform}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <LockIcon size={16} color={colors.muted} />
                <div>
                  <div style={{
                    fontSize: "14px",
                    color: colors.muted,
                    fontStyle: "italic",
                  }}>
                    [Encrypted]
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: colors.muted,
                    marginTop: "2px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {formatDate(tip.created_at)}
                    <span style={{ margin: "0 6px", opacity: 0.4 }}>&middot;</span>
                    {tip.source_platform}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
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
