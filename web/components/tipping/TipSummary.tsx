"use client"

import { useState } from "react"
import { type SwapQuote, formatTokenAmount, formatUsdValue } from "@/lib/wallet"
import { tokens, keyframes } from "./designTokens"

interface TipSummaryProps {
  quote: SwapQuote
  creatorHandle: string
  isExpired: boolean
  onConfirm: () => void
  onBack: () => void
  isLoading?: boolean
}

export function TipSummary({
  quote,
  creatorHandle,
  isExpired,
  onConfirm,
  onBack,
  isLoading = false,
}: TipSummaryProps) {
  const [isHovered, setIsHovered] = useState(false)
  const estimatedMinutes = Math.ceil(quote.estimatedTime / 60)

  return (
    <div style={{ width: "100%" }}>
      {/* Header with back button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: tokens.space.lg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
          <button
            onClick={onBack}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              background: "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.sm,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tokens.colors.textMuted}
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span
            style={{
              color: tokens.colors.textMuted,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "1.5px",
              fontFamily: tokens.font.mono,
            }}
          >
            CONFIRM TIP
          </span>
        </div>
      </div>

      {/* Main Amount Card - Sending */}
      <div
        style={{
          padding: tokens.space.lg,
          background: "rgba(255, 255, 255, 0.02)",
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.radius.lg,
          marginBottom: tokens.space.md,
        }}
      >
        <div
          style={{
            color: tokens.colors.textMuted,
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "1.5px",
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.sm,
          }}
        >
          SENDING
        </div>
        <div
          style={{
            color: tokens.colors.textBright,
            fontSize: "28px",
            fontWeight: 700,
            fontFamily: tokens.font.mono,
            letterSpacing: "-0.5px",
            marginBottom: tokens.space.xs,
          }}
        >
          {formatTokenAmount(quote.fromAmount, 6)} {quote.fromToken.symbol}
        </div>

        {/* Route indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.xs,
            marginTop: tokens.space.md,
            padding: `${tokens.space.sm}px ${tokens.space.md}px`,
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: tokens.radius.sm,
            width: "fit-content",
          }}
        >
          {quote.route.map((hop, i) => (
            <span
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space.xs,
              }}
            >
              {i > 0 && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={tokens.colors.textMuted}
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
              <span
                style={{
                  color: tokens.colors.text,
                  fontSize: "11px",
                  fontFamily: tokens.font.mono,
                  fontWeight: 500,
                }}
              >
                {hop}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Receiving Card */}
      <div
        style={{
          padding: tokens.space.lg,
          background: tokens.colors.successMuted,
          border: `1px solid ${tokens.colors.successBorder}`,
          borderRadius: tokens.radius.lg,
          marginBottom: tokens.space.lg,
        }}
      >
        <div
          style={{
            color: tokens.colors.success,
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "1.5px",
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.sm,
          }}
        >
          RECEIVING
        </div>
        <div
          style={{
            color: tokens.colors.success,
            fontSize: "28px",
            fontWeight: 700,
            fontFamily: tokens.font.mono,
            letterSpacing: "-0.5px",
            marginBottom: tokens.space.xs,
          }}
        >
          {formatTokenAmount(quote.toAmount, 6)} ZEC
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.xs,
            color: tokens.colors.textMuted,
            fontSize: "13px",
            fontFamily: tokens.font.mono,
          }}
        >
          <span>to</span>
          <span style={{ color: tokens.colors.primary, fontWeight: 600 }}>@{creatorHandle}</span>
        </div>
      </div>

      {/* Fee Details - Refined */}
      <div
        style={{
          padding: tokens.space.md,
          background: "rgba(255, 255, 255, 0.02)",
          border: `1px solid ${tokens.colors.borderSubtle}`,
          borderRadius: tokens.radius.md,
          marginBottom: tokens.space.md,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: tokens.space.sm,
          }}
        >
          <span style={{ color: tokens.colors.textMuted, fontSize: "12px", fontFamily: tokens.font.mono }}>
            Swap spread
          </span>
          <span
            style={{
              color: tokens.colors.text,
              fontSize: "12px",
              fontFamily: tokens.font.mono,
              fontFeatureSettings: "'tnum' 1",
            }}
          >
            ~3-4% (included in rate)
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: tokens.space.sm,
          }}
        >
          <span style={{ color: tokens.colors.textMuted, fontSize: "12px", fontFamily: tokens.font.mono }}>
            TIPZ fee
          </span>
          <span
            style={{
              color: tokens.colors.success,
              fontSize: "12px",
              fontFamily: tokens.font.mono,
              fontFeatureSettings: "'tnum' 1",
            }}
          >
            $0.00
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: tokens.space.sm,
            borderTop: `1px solid ${tokens.colors.borderSubtle}`,
          }}
        >
          <span style={{ color: tokens.colors.textMuted, fontSize: "12px", fontFamily: tokens.font.mono }}>
            Est. time
          </span>
          <span style={{ color: tokens.colors.text, fontSize: "12px", fontFamily: tokens.font.mono }}>
            ~{estimatedMinutes} min
          </span>
        </div>
      </div>

      {/* Expired Warning */}
      {isExpired && (
        <div
          style={{
            padding: `${tokens.space.sm}px ${tokens.space.md}px`,
            background: tokens.colors.errorMuted,
            border: `1px solid ${tokens.colors.errorBorder}`,
            borderRadius: tokens.radius.md,
            marginBottom: tokens.space.md,
            display: "flex",
            alignItems: "center",
            gap: tokens.space.sm,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={tokens.colors.error}
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ color: tokens.colors.error, fontSize: "12px", fontFamily: tokens.font.mono }}>
            Quote expired. Will refresh on confirm.
          </span>
        </div>
      )}

      {/* Privacy Notice - Enhanced */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space.sm,
          padding: `${tokens.space.sm + 2}px ${tokens.space.md}px`,
          background: tokens.colors.successMuted,
          border: `1px solid ${tokens.colors.successBorder}`,
          borderRadius: tokens.radius.md,
          marginBottom: tokens.space.lg,
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: tokens.colors.success,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: tokens.shadow.glow.success,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <div style={{ color: tokens.colors.success, fontSize: "12px", fontWeight: 600, fontFamily: tokens.font.mono }}>
            Shielded Transaction
          </div>
          <div style={{ color: tokens.colors.textMuted, fontSize: "10px", fontFamily: tokens.font.mono }}>
            Routed through NEAR Intents for privacy
          </div>
        </div>
      </div>

      {/* Confirm Button - Premium treatment */}
      <button
        onClick={onConfirm}
        disabled={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space.sm,
          padding: "18px",
          background: isLoading
            ? tokens.colors.border
            : `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryHover} 100%)`,
          border: "none",
          borderRadius: tokens.radius.md,
          color: isLoading ? tokens.colors.textMuted : tokens.colors.bg,
          fontSize: "15px",
          fontWeight: 700,
          fontFamily: tokens.font.mono,
          letterSpacing: "0.5px",
          cursor: isLoading ? "not-allowed" : "pointer",
          boxShadow: isLoading
            ? tokens.shadow.sm
            : isHovered
            ? `${tokens.shadow.glow.goldIntense}, ${tokens.shadow.lg}`
            : `${tokens.shadow.glow.gold}, ${tokens.shadow.md}`,
          transform: isHovered && !isLoading ? "translateY(-2px)" : "translateY(0)",
          transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
        }}
      >
        {isLoading ? (
          <>
            <div
              style={{
                width: "18px",
                height: "18px",
                border: "2px solid rgba(0, 0, 0, 0.2)",
                borderTopColor: tokens.colors.textMuted,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>PROCESSING...</span>
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>CONFIRM TIP</span>
          </>
        )}
      </button>

      <style>{keyframes}</style>
    </div>
  )
}
