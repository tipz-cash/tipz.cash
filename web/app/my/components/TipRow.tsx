"use client"

import { colors } from "@/lib/colors"
import type { TipzData } from "@/lib/tipz"

function LockIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

interface DecryptedTip {
  id: string
  created_at: string
  status: string
  source_platform: string
  data: string | null
  amount_zec: number | null
  amount_usd: number | null
  decrypted?: TipzData
  decryptFailed?: boolean
  isNew?: boolean
}

interface TipRowProps {
  tip: DecryptedTip
  index: number
  zecPrice: number
  prefersReducedMotion: boolean
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

export default function TipRow({ tip, index, zecPrice, prefersReducedMotion }: TipRowProps) {
  const isNew = tip.isNew

  const animStyle = prefersReducedMotion
    ? { opacity: 1 }
    : {
        animation: `tipSlideIn 0.3s ease-out forwards`,
        animationDelay: `${0.03 * index}s`,
        animationFillMode: "both" as const,
      }

  return (
    <div style={{
      position: "relative",
      paddingLeft: "28px",
      paddingRight: "16px",
      paddingTop: "16px",
      paddingBottom: "16px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
      borderLeft: isNew ? `2px solid ${colors.primary}` : "2px solid transparent",
      background: isNew ? "rgba(245, 166, 35, 0.03)" : "transparent",
      transition: "background 5s ease-out, border-color 5s ease-out",
      ...animStyle,
    }}>
      {/* Timeline dot */}
      <div style={{
        position: "absolute",
        left: "4px",
        top: "22px",
        width: "9px",
        height: "9px",
        borderRadius: "50%",
        background: isNew ? colors.primary : colors.border,
        boxShadow: isNew ? `0 0 8px ${colors.primaryGlow}` : "none",
      }} />

      {tip.decrypted ? (
        /* State 1: Fully decrypted — show amounts + memo */
        <div>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}>
            <div>
              <span style={{
                fontSize: "15px",
                fontWeight: 600,
                color: colors.textBright,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {tip.decrypted.amount_zec.toFixed(4)} ZEC
              </span>
              <span style={{
                color: colors.success,
                fontWeight: 400,
                fontSize: "13px",
                marginLeft: "8px",
              }}>
                ${tip.decrypted.amount_usd.toFixed(2)}
              </span>
            </div>
            <span style={{
              fontSize: "11px",
              color: colors.muted,
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "nowrap",
            }}>
              {formatDate(tip.created_at)}
            </span>
          </div>
          {tip.decrypted.memo && (
            <div style={{
              fontSize: "13px",
              color: colors.text,
              fontFamily: "Inter, sans-serif",
              fontStyle: "italic",
              marginTop: "4px",
            }}>
              &ldquo;{tip.decrypted.memo}&rdquo;
            </div>
          )}
          <div style={{
            fontSize: "11px",
            color: colors.muted,
            marginTop: "4px",
            fontFamily: "'JetBrains Mono', monospace",
            opacity: 0.7,
          }}>
            via {tip.source_platform}
          </div>
        </div>
      ) : tip.amount_zec != null ? (
        /* State 2: Plaintext amounts available, memo still locked */
        <div>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}>
            <div>
              <span style={{
                fontSize: "15px",
                fontWeight: 600,
                color: colors.textBright,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {tip.amount_zec.toFixed(4)} ZEC
              </span>
              <span style={{
                color: colors.success,
                fontWeight: 400,
                fontSize: "13px",
                marginLeft: "8px",
              }}>
                ${(tip.amount_usd ?? tip.amount_zec * zecPrice).toFixed(2)}
              </span>
            </div>
            <span style={{
              fontSize: "11px",
              color: colors.muted,
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "nowrap",
            }}>
              {formatDate(tip.created_at)}
            </span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            color: colors.muted,
            marginTop: "4px",
            fontStyle: "italic",
            opacity: 0.7,
          }}>
            <LockIcon size={12} color={colors.muted} />
            memo encrypted
          </div>
          <div style={{
            fontSize: "11px",
            color: colors.muted,
            marginTop: "2px",
            fontFamily: "'JetBrains Mono', monospace",
            opacity: 0.7,
          }}>
            via {tip.source_platform}
          </div>
        </div>
      ) : (
        /* State 3: Fully encrypted — no amounts available */
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <LockIcon size={14} color={colors.muted} />
          <div>
            <div style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "8px",
            }}>
              <span style={{
                fontSize: "14px",
                color: colors.muted,
                fontStyle: "italic",
                opacity: 0.7,
              }}>
                [Encrypted]
              </span>
              <span style={{
                fontSize: "11px",
                color: colors.muted,
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: "nowrap",
              }}>
                {formatDate(tip.created_at)}
              </span>
            </div>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              marginTop: "2px",
              fontFamily: "'JetBrains Mono', monospace",
              opacity: 0.7,
            }}>
              via {tip.source_platform}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
