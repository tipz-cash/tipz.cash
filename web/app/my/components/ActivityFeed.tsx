"use client"

import { colors } from "@/lib/colors"
import type { TipzData } from "@/lib/tipz"
import TipRow from "./TipRow"
import EmptyState from "./EmptyState"

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
  zecPrice: number
  animStyle: React.CSSProperties
  prefersReducedMotion: boolean
}

export default function ActivityFeed({
  tips,
  handle,
  zecPrice,
  animStyle,
  prefersReducedMotion,
}: ActivityFeedProps) {
  const labelAnim = prefersReducedMotion
    ? { opacity: 1 }
    : { animation: "fadeIn 0.3s ease-out forwards", animationDelay: "300ms", animationFillMode: "both" as const }

  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      paddingTop: "16px",
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
    }}>
      {/* Section label */}
      <div style={{
        fontSize: "11px",
        color: colors.muted,
        letterSpacing: "1px",
        marginBottom: "12px",
        fontFamily: "var(--font-family-mono)",
        ...labelAnim,
      }}>
        ACTIVITY{tips.length > 0 ? ` (${tips.length})` : ""}
      </div>

      {/* Empty state */}
      {tips.length === 0 && (
        <div style={{
          flex: 1,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          ...animStyle,
        }}>
          <EmptyState handle={handle} />
        </div>
      )}

      {/* Timeline feed */}
      {tips.length > 0 && (
        <div style={{
          flex: 1,
          position: "relative",
          border: `1px solid rgba(255, 255, 255, 0.06)`,
          borderRadius: "12px",
          overflow: "hidden",
          overflowY: "auto",
          maxHeight: "360px",
        }}>
          {/* Vertical timeline line */}
          <div style={{
            position: "absolute",
            left: "8px",
            top: "16px",
            bottom: "16px",
            width: "1px",
            background: colors.border,
          }} />

          {tips.map((tip, i) => (
            <TipRow
              key={tip.id}
              tip={tip}
              index={i}
              zecPrice={zecPrice}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      )}
    </div>
  )
}
