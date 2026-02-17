"use client"

import Link from "next/link"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"

function ShieldIcon({ size = 48, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

interface LoginCardProps {
  animStyle: React.CSSProperties
  prefersReducedMotion?: boolean
}

export default function LoginCard({ animStyle, prefersReducedMotion }: LoginCardProps) {
  const shieldAnim = prefersReducedMotion
    ? {}
    : { animation: "scaleSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both" }

  return (
    <div style={{
      padding: "48px 32px",
      textAlign: "center",
      background: "rgba(18, 20, 26, 0.85)",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(245, 166, 35, 0.12)",
      borderRadius: "12px",
      position: "relative",
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
      ...animStyle,
    }}>
      {/* Gold top accent — 3px */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        borderRadius: "12px 12px 0 0",
        backgroundSize: "200% 100%",
        animation: prefersReducedMotion ? "none" : "goldBorderSweep 3s ease-in-out infinite",
      }} />

      {/* Shield icon with glow */}
      <div style={{
        marginBottom: "24px",
        ...shieldAnim,
      }}>
        <div style={{
          display: "inline-block",
          filter: `drop-shadow(0 0 30px rgba(245, 166, 35, 0.15))`,
        }}>
          <ShieldIcon size={48} color={colors.primary} />
        </div>
      </div>

      {/* Heading */}
      <div style={{
        fontSize: "11px",
        color: colors.muted,
        letterSpacing: "3px",
        marginBottom: "16px",
        fontFamily: "var(--font-family-mono)",
      }}>
        YOUR COMMAND CENTER
      </div>

      <p style={{
        margin: "0 0 28px",
        color: colors.text,
        fontSize: "14px",
        lineHeight: 1.6,
        fontFamily: "var(--font-family)",
        maxWidth: "320px",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        Log in with your X account to view your tips, decrypted memos, and analytics.
      </p>

      {/* Muted CTA — surface button instead of Twitter blue */}
      <a
        href="/api/auth/twitter"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 28px",
          fontSize: "14px",
          fontWeight: 600,
          color: colors.textBright,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "8px",
          textDecoration: "none",
          transition: transitions.normal,
          border: `1px solid ${colors.border}`,
          cursor: "pointer",
          fontFamily: "var(--font-family-mono)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)"
          e.currentTarget.style.borderColor = colors.borderHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)"
          e.currentTarget.style.borderColor = colors.border
        }}
      >
        <XIcon size={16} />
        Login with X
      </a>

      <p style={{
        margin: "20px 0 0",
        fontSize: "12px",
        color: colors.muted,
        fontFamily: "var(--font-family)",
      }}>
        Not registered?{" "}
        <Link href="/register" style={{ color: colors.primary, textDecoration: "underline" }}>
          Claim your handle first
        </Link>
      </p>
    </div>
  )
}
