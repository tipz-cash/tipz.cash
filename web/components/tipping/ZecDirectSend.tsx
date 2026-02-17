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
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate ZEC amount from USD
  const zecAmount = amount && zecPrice ? amount / zecPrice : undefined

  // Generate QR code on mount
  useEffect(() => {
    async function generateQR() {
      try {
        // Include amount in QR if specified
        const qr = await generateZecQR(
          shieldedAddress,
          zecAmount,
          `Tip for @${creatorHandle} via TIPZ`,
          {
            width: 280,
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
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Failed to copy payment link")
    }
  }, [shieldedAddress, zecAmount, creatorHandle])

  return (
    <div style={{ padding: tokens.space.lg }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space.sm,
          marginBottom: tokens.space.lg,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: tokens.colors.textMuted,
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
        <div>
          <h3
            style={{
              color: tokens.colors.textBright,
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: tokens.font.sans,
              margin: 0,
            }}
          >
            Send ZEC Directly
          </h3>
          <p
            style={{
              color: tokens.colors.textMuted,
              fontSize: "12px",
              fontFamily: tokens.font.sans,
              margin: 0,
            }}
          >
            Scan with Zashi, Ywallet, or any ZEC wallet
          </p>
        </div>
      </div>

      {/* Amount Display (if specified) */}
      {amount && zecAmount && (
        <div
          style={{
            background: "rgba(255, 215, 0, 0.1)",
            border: `1px solid rgba(255, 215, 0, 0.2)`,
            borderRadius: tokens.radius.md,
            padding: `${tokens.space.sm}px ${tokens.space.md}px`,
            marginBottom: tokens.space.md,
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: tokens.colors.gold,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: tokens.font.mono,
            }}
          >
            {zecAmount.toFixed(4)} ZEC
          </span>
          <span
            style={{
              color: tokens.colors.textMuted,
              fontSize: "12px",
              fontFamily: tokens.font.sans,
              marginLeft: tokens.space.sm,
            }}
          >
            (${amount.toFixed(2)})
          </span>
        </div>
      )}

      {/* QR Code */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: tokens.radius.lg,
          padding: tokens.space.md,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: tokens.space.md,
        }}
      >
        {error ? (
          <div
            style={{
              width: "min(280px, calc(100vw - 64px))",
              height: "min(280px, calc(100vw - 64px))",
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
              width: "min(280px, calc(100vw - 64px))",
              height: "min(280px, calc(100vw - 64px))",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "min(280px, calc(100vw - 64px))",
              height: "min(280px, calc(100vw - 64px))",
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

      {/* Address Display */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderRadius: tokens.radius.md,
          padding: tokens.space.md,
          marginBottom: tokens.space.md,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: tokens.space.xs,
          }}
        >
          <span
            style={{
              color: tokens.colors.textMuted,
              fontSize: "11px",
              fontFamily: tokens.font.mono,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Shielded Address
          </span>
          <button
            onClick={copyAddress}
            style={{
              background: "none",
              border: "none",
              color: copied ? tokens.colors.success : tokens.colors.gold,
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: tokens.font.mono,
              padding: "2px 4px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <p
          style={{
            color: tokens.colors.text,
            fontSize: "11px",
            fontFamily: tokens.font.mono,
            margin: 0,
            wordBreak: "break-all",
            lineHeight: 1.4,
          }}
        >
          {shieldedAddress}
        </p>
      </div>

      {/* Instructions */}
      <div
        style={{
          background: "rgba(0, 255, 148, 0.05)",
          border: `1px solid rgba(0, 255, 148, 0.15)`,
          borderRadius: tokens.radius.md,
          padding: tokens.space.md,
          marginBottom: tokens.space.lg,
        }}
      >
        <div style={{ display: "flex", gap: tokens.space.sm }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={tokens.colors.success}
            strokeWidth="2"
            style={{ flexShrink: 0, marginTop: "2px" }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <p
              style={{
                color: tokens.colors.textBright,
                fontSize: "12px",
                fontFamily: tokens.font.sans,
                fontWeight: 500,
                margin: 0,
                marginBottom: "4px",
              }}
            >
              100% Private Transaction
            </p>
            <p
              style={{
                color: tokens.colors.textMuted,
                fontSize: "11px",
                fontFamily: tokens.font.sans,
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Sending to a shielded address ensures your tip is completely private.
              No blockchain observer can see the sender, amount, or recipient.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: tokens.space.sm }}>
        <button
          onClick={copyUri}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: tokens.space.sm,
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.05)",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            borderRadius: tokens.radius.md,
            color: tokens.colors.text,
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: tokens.font.sans,
            cursor: "pointer",
            transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy Payment Link
        </button>
        <button
          onClick={onDone}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: tokens.space.sm,
            padding: "12px 16px",
            background: `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
            border: "none",
            borderRadius: tokens.radius.md,
            color: tokens.colors.bg,
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: tokens.font.sans,
            cursor: "pointer",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)",
            transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
          }}
        >
          Done
        </button>
      </div>

      {/* Wallet Recommendations */}
      <div
        style={{
          marginTop: tokens.space.lg,
          paddingTop: tokens.space.md,
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <p
          style={{
            color: tokens.colors.textMuted,
            fontSize: "11px",
            fontFamily: tokens.font.sans,
            margin: 0,
            marginBottom: tokens.space.sm,
            textAlign: "center",
          }}
        >
          Need a ZEC wallet?
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: tokens.space.md }}>
          <a
            href="https://electriccoin.co/zashi/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: tokens.colors.gold,
              fontSize: "12px",
              fontFamily: tokens.font.sans,
              textDecoration: "none",
            }}
          >
            Zashi (iOS/Android)
          </a>
          <a
            href="https://ywallet.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: tokens.colors.gold,
              fontSize: "12px",
              fontFamily: tokens.font.sans,
              textDecoration: "none",
            }}
          >
            Ywallet (All Platforms)
          </a>
        </div>
      </div>

      <style>{keyframes}</style>
    </div>
  )
}
