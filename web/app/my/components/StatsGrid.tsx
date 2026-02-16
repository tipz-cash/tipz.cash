"use client"

import { colors } from "@/lib/colors"

interface StatsGridProps {
  tipCount: number
  totalZec: number
  totalUsd: number
  animStyle: React.CSSProperties
  prefersReducedMotion: boolean
}

const glassCard: React.CSSProperties = {
  background: "rgba(26, 26, 26, 0.6)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "12px",
  position: "relative",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
  padding: "24px 16px",
  textAlign: "center",
}

interface StatCardProps {
  label: string
  value: string
  valueColor: string
  accentColor: string
}

function StatCard({ label, value, valueColor, accentColor }: StatCardProps) {
  return (
    <div style={glassCard}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        borderRadius: "12px 12px 0 0",
      }} />
      <div style={{
        fontSize: "11px",
        color: colors.muted,
        letterSpacing: "1px",
        marginBottom: "8px",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "24px",
        fontWeight: 700,
        color: valueColor,
      }}>
        {value}
      </div>
    </div>
  )
}

export default function StatsGrid({
  tipCount,
  totalZec,
  totalUsd,
  animStyle,
  prefersReducedMotion,
}: StatsGridProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      marginBottom: "24px",
      ...animStyle,
      animationDelay: prefersReducedMotion ? "0s" : "0.1s",
    }}>
      <StatCard
        label="TIPS"
        value={String(tipCount)}
        valueColor={colors.textBright}
        accentColor={colors.muted}
      />
      <StatCard
        label="ZEC"
        value={totalZec.toFixed(4)}
        valueColor={colors.primary}
        accentColor={colors.primary}
      />
      <StatCard
        label="USD"
        value={`$${totalUsd.toFixed(2)}`}
        valueColor={colors.success}
        accentColor={colors.success}
      />
    </div>
  )
}
