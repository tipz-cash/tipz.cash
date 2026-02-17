"use client"

import { useState, useEffect, useRef } from "react"
import { colors } from "@/lib/colors"

interface HeroStatProps {
  totalZec: number
  totalUsd: number
  tipCount: number
  zecPrice: number
  prefersReducedMotion: boolean
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function AnimatedCounter({ value, decimals, prefersReducedMotion }: { value: number; decimals: number; prefersReducedMotion: boolean }) {
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const prevValueRef = useRef(value)
  const duration = 1200

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    const fromValue = prevValueRef.current !== value ? prevValueRef.current : 0
    prevValueRef.current = value

    startRef.current = null

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      setDisplay(fromValue + (value - fromValue) * easedProgress)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, prefersReducedMotion])

  return <>{display.toFixed(decimals)}</>
}

export default function HeroStat({ totalZec, totalUsd, tipCount, zecPrice, prefersReducedMotion }: HeroStatProps) {
  const anim = (delay: string, animation: string) =>
    prefersReducedMotion ? { opacity: 1 } : { animation, animationDelay: delay, animationFillMode: "both" as const }

  const statCardStyle: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: "10px",
    padding: "12px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  }

  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "20px 0 0",
      ...anim("150ms", "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"),
    }}>
      {/* Hero ZEC counter — centered */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "clamp(32px, 4vw, 40px)",
          fontWeight: 700,
          color: colors.primary,
          fontFamily: "var(--font-family-mono)",
          textShadow: `0 0 40px rgba(245, 166, 35, 0.25)`,
          lineHeight: 1.1,
        }}>
          <AnimatedCounter value={totalZec} decimals={4} prefersReducedMotion={prefersReducedMotion} />
          <span style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            fontWeight: 400,
            color: colors.muted,
            marginLeft: "8px",
          }}>
            ZEC
          </span>
        </div>

        {/* Label */}
        <div style={{
          fontSize: "10px",
          color: colors.muted,
          letterSpacing: "2px",
          marginTop: "6px",
          fontFamily: "var(--font-family-mono)",
        }}>
          TOTAL EARNED
        </div>
      </div>

      {/* 3 stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginTop: "20px",
      }}>
        <div style={statCardStyle}>
          <div style={{
            fontSize: "18px",
            fontWeight: 600,
            color: colors.textBright,
            fontFamily: "var(--font-family-mono)",
          }}>
            {tipCount}
          </div>
          <div style={{
            fontSize: "10px",
            color: colors.muted,
            letterSpacing: "1px",
            fontFamily: "var(--font-family-mono)",
          }}>
            {tipCount === 1 ? "TIP" : "TIPS"} RECEIVED
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{
            fontSize: "18px",
            fontWeight: 600,
            color: colors.success,
            fontFamily: "var(--font-family-mono)",
          }}>
            $<AnimatedCounter value={totalUsd} decimals={2} prefersReducedMotion={prefersReducedMotion} />
          </div>
          <div style={{
            fontSize: "10px",
            color: colors.muted,
            letterSpacing: "1px",
            fontFamily: "var(--font-family-mono)",
          }}>
            USD VALUE
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{
            fontSize: "18px",
            fontWeight: 600,
            color: colors.textBright,
            fontFamily: "var(--font-family-mono)",
          }}>
            ${zecPrice > 0 ? zecPrice.toFixed(0) : "—"}
          </div>
          <div style={{
            fontSize: "10px",
            color: colors.muted,
            letterSpacing: "1px",
            fontFamily: "var(--font-family-mono)",
          }}>
            ZEC PRICE
          </div>
        </div>
      </div>
    </div>
  )
}
