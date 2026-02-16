"use client"

import { useState, useEffect, useMemo } from "react"
import { colors } from "@/lib/colors"
import type { TipzData } from "@/lib/tipz"

interface ToastTip {
  id: string
  decrypted?: TipzData
  status: string
}

interface NotificationToastProps {
  tips: ToastTip[]
  onDismiss: (id: string) => void
  prefersReducedMotion: boolean
}

export default function NotificationToast({
  tips,
  onDismiss,
  prefersReducedMotion,
}: NotificationToastProps) {
  if (tips.length === 0) return null

  return (
    <div style={{
      position: "fixed",
      top: "80px",
      right: "16px",
      zIndex: 150,
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      maxWidth: "340px",
      width: "100%",
    }}>
      {tips.map((tip) => (
        <ToastCard
          key={tip.id}
          tip={tip}
          onDismiss={() => onDismiss(tip.id)}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  )
}

function Particle({ delay, tx, ty }: { delay: string; tx: string; ty: string }) {
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      background: colors.primary,
      "--tx": tx,
      "--ty": ty,
      animation: `particleBurst 0.6s ease-out ${delay} both`,
      pointerEvents: "none",
    } as React.CSSProperties} />
  )
}

function ToastCard({
  tip,
  onDismiss,
  prefersReducedMotion,
}: {
  tip: ToastTip
  onDismiss: () => void
  prefersReducedMotion: boolean
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 6000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const animationStyle = prefersReducedMotion
    ? { opacity: visible ? 1 : 0 }
    : {
        animation: visible
          ? "slideInRight 0.3s ease-out forwards"
          : "slideOutRight 0.3s ease-in forwards",
      }

  // Generate random particle positions
  const particles = useMemo(() => {
    if (prefersReducedMotion) return []
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() * 0.5)
      const dist = 20 + Math.random() * 20
      return {
        key: i,
        delay: `${Math.random() * 0.1}s`,
        tx: `${Math.cos(angle) * dist}px`,
        ty: `${Math.sin(angle) * dist}px`,
      }
    })
  }, [prefersReducedMotion])

  return (
    <div
      onClick={onDismiss}
      style={{
        background: "rgba(26, 26, 26, 0.85)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "12px",
        padding: "16px",
        cursor: "pointer",
        position: "relative",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
        ...animationStyle,
      }}
    >
      {/* Gold top accent */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        borderRadius: "12px 12px 0 0",
      }} />

      {/* Particle burst */}
      {particles.length > 0 && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {particles.map((p) => (
            <Particle key={p.key} delay={p.delay} tx={p.tx} ty={p.ty} />
          ))}
        </div>
      )}

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}>
        <span style={{
          display: "inline-block",
          width: "6px",
          height: "6px",
          background: tip.status === "confirmed" ? colors.success : colors.primary,
          borderRadius: "50%",
          boxShadow: `0 0 8px ${tip.status === "confirmed" ? colors.success : colors.primary}`,
        }} />
        <span style={{
          fontSize: "11px",
          color: colors.muted,
          letterSpacing: "1px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          NEW TIP
        </span>
      </div>

      {tip.decrypted ? (
        <>
          <div style={{
            fontSize: "20px",
            fontWeight: 700,
            color: colors.success,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: "2px",
            animation: prefersReducedMotion ? "none" : "tipSlideIn 0.3s ease-out",
          }}>
            ${tip.decrypted.amount_usd.toFixed(2)}
          </div>
          <div style={{
            fontSize: "13px",
            color: colors.primary,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {tip.decrypted.amount_zec.toFixed(4)} ZEC
          </div>
          {tip.decrypted.memo && (
            <div style={{
              fontSize: "13px",
              color: colors.text,
              fontFamily: "Inter, sans-serif",
              fontStyle: "italic",
              marginTop: "8px",
            }}>
              &ldquo;{tip.decrypted.memo}&rdquo;
            </div>
          )}
        </>
      ) : (
        <div style={{
          fontSize: "14px",
          color: colors.muted,
          fontStyle: "italic",
        }}>
          Encrypted tip received
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "2px",
        borderRadius: "0 0 12px 12px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          background: colors.primary,
          animation: prefersReducedMotion ? "none" : "progressShrink 6s linear forwards",
          transformOrigin: "left",
        }} />
      </div>
    </div>
  )
}
