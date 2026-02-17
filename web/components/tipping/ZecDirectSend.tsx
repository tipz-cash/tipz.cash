"use client"

import { useState, useEffect, useCallback } from "react"
import { generateZecQR, createZcashUri } from "@/lib/qrcode"
import { tokens, keyframes } from "./designTokens"

interface ZecDirectSendProps {
  shieldedAddress: string
  creatorHandle: string
  amount?: number // USD amount selected
  zecPrice?: number | null
  onBack: () => void
  onDone: () => void
}

export function ZecDirectSend({
  shieldedAddress,
  creatorHandle,
  amount,
  zecPrice,
  onBack,
  onDone,
}: ZecDirectSendProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate ZEC amount from USD
  const zecAmount = amount && zecPrice ? amount / zecPrice : undefined

  // Truncated address: first 4 + "…" + last 8
  const truncatedAddress =
    shieldedAddress.length > 16
      ? `${shieldedAddress.slice(0, 4)}…${shieldedAddress.slice(-8)}`
      : shieldedAddress

  // Generate QR code on mount
  useEffect(() => {
    async function generateQR() {
      try {
        const qr = await generateZecQR(
          shieldedAddress,
          zecAmount,
          `Tip for @${creatorHandle} via TIPZ`,
          {
            width: 240,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "M",
          }
        )
        setQrDataUrl(qr)
      } catch (err) {
        console.error("[ZecDirectSend] Failed to generate QR:", err)
        setError("Failed to generate QR code")
      }
    }
    generateQR()
  }, [shieldedAddress, zecAmount, creatorHandle])

  // Copy address to clipboard
  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shieldedAddress)
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000)
    } catch {
      setError("Failed to copy address")
    }
  }, [shieldedAddress])

  // Copy full URI to clipboard
  const copyUri = useCallback(async () => {
    try {
      const uri = createZcashUri(
        shieldedAddress,
        zecAmount,
        `Tip for @${creatorHandle} via TIPZ`
      )
      await navigator.clipboard.writeText(uri)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      setError("Failed to copy payment link")
    }
  }, [shieldedAddress, zecAmount, creatorHandle])

  const qrSize = "min(240px, calc(100vw - 80px))"

  return (
    <div style={{ padding: tokens.space.lg }}>
      {/* 1. Header — Back arrow only */}
      <div style={{ marginBottom: tokens.space.md }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: tokens.colors.textMuted,
            cursor: "pointer",
            padding: "10px",
            margin: "-10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* 2. Amount display — Floating centered text */}
      {amount && zecAmount && (
        <div
          style={{
            textAlign: "center",
            marginBottom: tokens.space.md,
          }}
        >
          <span
            style={{
              color: tokens.colors.gold,
              fontSize: "20px",
              fontWeight: 600,
              fontFamily: tokens.font.mono,
            }}
          >
            {zecAmount.toFixed(4)} ZEC
          </span>
          <br />
          <span
            style={{
              color: tokens.colors.textMuted,
              fontSize: "13px",
              fontFamily: tokens.font.sans,
              fontWeight: 400,
            }}
          >
            (${amount.toFixed(2)} USD)
          </span>
        </div>
      )}

      {/* 3. QR code hero — with green breathing glow */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: tokens.space.md,
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: tokens.radius.lg,
            padding: "16px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "shieldBreathe 6s ease-in-out infinite",
          }}
        >
          {error ? (
            <div
              style={{
                width: qrSize,
                height: qrSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: tokens.colors.error,
                fontSize: "14px",
                fontFamily: tokens.font.sans,
              }}
            >
              {error}
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="ZEC payment QR code"
              style={{
                width: qrSize,
                height: qrSize,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: qrSize,
                height: qrSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: `2px solid ${tokens.colors.gold}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Scan instruction */}
      <p
        style={{
          textAlign: "center",
          color: tokens.colors.textMuted,
          fontSize: "12px",
          fontFamily: tokens.font.sans,
          margin: 0,
          marginBottom: tokens.space.md,
        }}
      >
        Scan with Zodl or any ZEC wallet
      </p>

      {/* 5. Privacy centerpiece — Compact status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: tokens.space.md,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={tokens.colors.success}
          stroke="none"
          style={{
            filter: `drop-shadow(0 0 4px ${tokens.colors.successGlow})`,
          }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span
          style={{
            color: tokens.colors.success,
            fontSize: "12px",
            fontFamily: tokens.font.mono,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          SHIELDED
        </span>
        <span
          style={{
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.2)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            color: tokens.colors.textMuted,
            fontSize: "12px",
            fontFamily: tokens.font.sans,
          }}
        >
          End-to-end private
        </span>
      </div>

      {/* 6. Collapsed address row */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: `1px solid rgba(255, 255, 255, 0.08)`,
          borderRadius: tokens.radius.md,
          padding: `${tokens.space.sm}px ${tokens.space.md}px`,
          marginBottom: tokens.space.md,
        }}
      >
        {/* Truncated row with expand + copy */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              flex: 1,
              color: tokens.colors.textMuted,
              fontSize: "12px",
              fontFamily: tokens.font.mono,
            }}
          >
            {truncatedAddress}
          </span>

          {/* Expand toggle */}
          <button
            onClick={() => setShowFullAddress(!showFullAddress)}
            style={{
              background: "none",
              border: "none",
              color: tokens.colors.textMuted,
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: `transform ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
              transform: showFullAddress ? "rotate(180deg)" : "rotate(0deg)",
            }}
            aria-label={showFullAddress ? "Collapse address" : "Expand address"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Copy address */}
          <button
            onClick={copyAddress}
            style={{
              background: "none",
              border: "none",
              color: addressCopied ? tokens.colors.success : tokens.colors.textMuted,
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Copy address"
          >
            {addressCopied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>

        {/* Expanded full address */}
        {showFullAddress && (
          <p
            style={{
              color: tokens.colors.textSubtle,
              fontSize: "11px",
              fontFamily: tokens.font.mono,
              margin: 0,
              marginTop: tokens.space.sm,
              wordBreak: "break-all",
              lineHeight: 1.4,
            }}
          >
            {shieldedAddress}
          </p>
        )}
      </div>

      {/* 7. Copy payment link — Text link */}
      <div
        style={{
          textAlign: "center",
          marginBottom: tokens.space.lg,
        }}
      >
        <button
          onClick={copyUri}
          style={{
            background: "none",
            border: "none",
            color: linkCopied ? tokens.colors.success : tokens.colors.textMuted,
            fontSize: "12px",
            fontFamily: tokens.font.sans,
            cursor: "pointer",
            textDecoration: linkCopied ? "none" : "underline",
            padding: "4px 8px",
            transition: `color ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
          }}
          onMouseEnter={(e) => {
            if (!linkCopied) e.currentTarget.style.color = tokens.colors.gold
          }}
          onMouseLeave={(e) => {
            if (!linkCopied) e.currentTarget.style.color = tokens.colors.textMuted
          }}
        >
          {linkCopied ? "Payment link copied \u2713" : "Copy payment link"}
        </button>
      </div>

      {/* 8. Done button — "I've Sent It" */}
      <button
        onClick={onDone}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 16px",
          background: `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
          border: "none",
          borderRadius: tokens.radius.md,
          color: tokens.colors.bg,
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: tokens.font.sans,
          cursor: "pointer",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)",
          transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
        }}
      >
        I've Sent It
      </button>

      {/* 9. Wallet recommendation — Single condensed line */}
      <p
        style={{
          textAlign: "center",
          fontSize: "11px",
          fontFamily: tokens.font.sans,
          color: tokens.colors.textSubtle,
          margin: 0,
          marginTop: tokens.space.md,
        }}
      >
        Need a wallet?{" "}
        <a
          href="https://zodl.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: tokens.colors.textMuted,
            textDecoration: "none",
            transition: `color ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = tokens.colors.gold
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = tokens.colors.textMuted
          }}
        >
          Zodl
        </a>
      </p>

      <style>{keyframes}</style>
    </div>
  )
}
