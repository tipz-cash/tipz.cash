"use client"

import Link from "next/link"
import { colors } from "@/lib/colors"
import { transitions } from "@/lib/animations"

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

const glassCard: React.CSSProperties = {
  padding: "48px 32px",
  textAlign: "center",
  background: "rgba(26, 26, 26, 0.6)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "12px",
  position: "relative",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
}

export default function LoginCard({ animStyle }: { animStyle: React.CSSProperties }) {
  return (
    <div style={{ ...glassCard, ...animStyle }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        borderRadius: "12px 12px 0 0",
      }} />
      <div style={{ marginBottom: "24px" }}>
        <LockIcon size={32} color={colors.muted} />
      </div>
      <p style={{
        margin: "0 0 24px",
        color: colors.text,
        fontSize: "14px",
        lineHeight: 1.6,
        fontFamily: "Inter, sans-serif",
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
        fontFamily: "Inter, sans-serif",
      }}>
        Not registered?{" "}
        <Link href="/register" style={{ color: colors.primary, textDecoration: "underline" }}>
          Claim your handle first
        </Link>
      </p>
    </div>
  )
}
