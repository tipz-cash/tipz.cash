"use client"

import { useState } from "react"
import { tokens, keyframes } from "./tipping/designTokens"
import { Creator, hashToHue } from "./CreatorCard"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const PRESET_AMOUNTS = [1, 5, 10, 25]

interface CreatorModalProps {
  creator: Creator
  onClose: () => void
}

export function CreatorModal({ creator, onClose }: CreatorModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5)
  const hue = hashToHue(creator.handle)

  const inviteUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
    `Hey @${creator.handle} you should join @tipz_cash to receive private, fee-free tips!`
  )}`

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={{
          width: "calc(100% - 32px)",
          maxWidth: "400px",
          background: tokens.glass.background,
          backdropFilter: tokens.glass.backdropFilter,
          WebkitBackdropFilter: tokens.glass.backdropFilter,
          borderTop: "1px solid rgba(255, 215, 0, 0.5)",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.8)",
          borderRadius: tokens.radius.xl,
          boxShadow: `${tokens.shadow.xl}, 0 0 60px rgba(255, 215, 0, 0.1)`,
          overflow: "hidden",
          padding: 0,
        }}
        className="!gap-0"
      >
        <style>{keyframes}</style>

        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Tip @{creator.handle}</DialogTitle>
        <DialogDescription className="sr-only">
          This creator isn&apos;t on TIPZ yet. You can invite them.
        </DialogDescription>

        {/* Content */}
        <div style={{ padding: tokens.space.lg }}>
          {/* Header: Avatar + Handle + Shield Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space.sm,
              marginBottom: tokens.space.lg,
              paddingBottom: tokens.space.md,
              borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "22%",
                background: `linear-gradient(135deg, hsl(${hue}, 50%, 35%) 0%, hsl(${hue}, 60%, 25%) 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  color: tokens.colors.textBright,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontFamily: tokens.font.sans,
                }}
              >
                {creator.handle[0] || "?"}
              </span>
            </div>

            {/* Handle + Shield Badge */}
            <div style={{ flex: "0 1 auto", minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: tokens.colors.textBright,
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: tokens.font.sans,
                }}
              >
                @{creator.handle}
                {/* Shield badge */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={tokens.colors.gold}
                  stroke="none"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="#050505"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Amount Selection - Visual only */}
          <div style={{ marginBottom: tokens.space.md }}>
            <div
              style={{
                display: "flex",
                gap: tokens.space.sm,
                flexWrap: "wrap",
              }}
            >
              {PRESET_AMOUNTS.map((amount) => {
                const isSelected = selectedAmount === amount

                return (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    style={{
                      padding: "14px 18px",
                      minHeight: "48px",
                      background: isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.05)",
                      border: isSelected
                        ? "1px solid transparent"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: tokens.radius.md,
                      color: isSelected ? "#050505" : tokens.colors.text,
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "var(--font-family-mono)",
                      cursor: "pointer",
                      boxShadow: isSelected
                        ? "0 0 24px rgba(255, 215, 0, 0.5), 0 0 8px rgba(255, 215, 0, 0.3)"
                        : "none",
                      transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
                    }}
                  >
                    ${amount}
                  </button>
                )
              })}

              {/* Custom placeholder */}
              <div
                style={{
                  flex: "1 1 80px",
                  minWidth: "80px",
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "14px 14px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: tokens.radius.md,
                }}
              >
                <span
                  style={{
                    color: tokens.colors.textMuted,
                    fontSize: "14px",
                    fontWeight: 500,
                    fontFamily: "var(--font-family-mono)",
                  }}
                >
                  $
                </span>
                <span
                  style={{
                    color: tokens.colors.textSubtle,
                    fontSize: "14px",
                    fontFamily: "var(--font-family-mono)",
                  }}
                >
                  Other
                </span>
              </div>
            </div>
          </div>

          {/* Disabled CTA Button */}
          <button
            disabled
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: tokens.space.sm,
              padding: "14px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: tokens.radius.md,
              color: tokens.colors.textMuted,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: tokens.font.sans,
              cursor: "not-allowed",
            }}
          >
            This creator isn't on TIPZ yet
          </button>

          {/* Invite on X link */}
          <div style={{ textAlign: "center", marginTop: tokens.space.md }}>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: tokens.colors.gold,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: tokens.font.sans,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: `opacity ${tokens.duration.fast}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.8"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1"
              }}
            >
              Invite on X<span style={{ transition: "transform 0.2s ease" }}>→</span>
            </a>
          </div>

          {/* Trust Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: tokens.space.lg,
              marginTop: tokens.space.lg,
              paddingTop: tokens.space.md,
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.colors.signalGreen}
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span
                style={{
                  color: tokens.colors.textSecondary,
                  fontSize: "12px",
                  fontFamily: tokens.font.sans,
                }}
              >
                Private
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.colors.signalGreen}
                strokeWidth="2"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span
                style={{
                  color: tokens.colors.textSecondary,
                  fontSize: "12px",
                  fontFamily: tokens.font.sans,
                }}
              >
                Instant
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.colors.signalGreen}
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4" y1="4" x2="20" y2="20" />
              </svg>
              <span
                style={{
                  color: tokens.colors.textSecondary,
                  fontSize: "12px",
                  fontFamily: tokens.font.sans,
                }}
              >
                0% fees
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
