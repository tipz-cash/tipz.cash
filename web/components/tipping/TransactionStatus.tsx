"use client"

import { useState, useEffect } from "react"
import { type TipTransaction, formatTokenAmount } from "@/lib/wallet"
import { type TippingFlowState, type SwapStatusType } from "@/hooks/useTipping"
import { useTextScramble } from "@/hooks/useTextScramble"
import { tokens, keyframes } from "./designTokens"

interface TransactionStatusProps {
  flowState: TippingFlowState
  transaction: TipTransaction | null
  error: string | null
  creatorHandle: string
  onRetry: () => void
  onDone: () => void
  // New: Real swap status fields
  swapStatus?: SwapStatusType | null
  depositAddress?: string | null
  isRealSwap?: boolean
  // USD amount and fees for receipt
  usdAmount?: number | null
  networkFee?: string | null
}

// Message phases for the Private Tunnel experience
const TUNNEL_PHASES = [
  { primary: "Establishing Secure Channel...", subtext: "Your identity is being scrubbed" },
  { primary: "Bypassing Platform Fees...", subtext: "100% goes to the creator" },
  { primary: "Delivering to @{handle}...", subtext: "Arriving intact" },
] as const

// Real swap phases based on NEAR Intents status
const REAL_SWAP_PHASES: Record<SwapStatusType, { primary: string; subtext: string }> = {
  PENDING_DEPOSIT: { primary: "Awaiting Deposit...", subtext: "Send funds to complete the swap" },
  PROCESSING: { primary: "Delivering ZEC...", subtext: "Your tip is being routed to the creator" },
  SUCCESS: { primary: "Delivered!", subtext: "ZEC arrived in creator's wallet" },
  REFUNDED: { primary: "Swap Refunded", subtext: "Funds returned to your wallet" },
  FAILED: { primary: "Swap Failed", subtext: "Please try again" },
  EXPIRED: { primary: "Quote Expired", subtext: "Please get a new quote" },
}

export function TransactionStatus({
  flowState,
  transaction,
  error,
  creatorHandle,
  onRetry,
  onDone,
  swapStatus,
  depositAddress,
  isRealSwap,
  usdAmount,
  networkFee,
}: TransactionStatusProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [messagePhase, setMessagePhase] = useState(0)
  const [addressCopied, setAddressCopied] = useState(false)

  // Cycle through message phases during processing (demo mode)
  useEffect(() => {
    if ((flowState === "signing" || flowState === "processing") && !isRealSwap) {
      const interval = setInterval(() => {
        setMessagePhase((prev) => (prev + 1) % TUNNEL_PHASES.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [flowState, isRealSwap])

  // Get current message based on mode
  let currentMessage: { primary: string; subtext: string }
  if (isRealSwap && swapStatus) {
    currentMessage = REAL_SWAP_PHASES[swapStatus] || TUNNEL_PHASES[0]
  } else {
    currentMessage = TUNNEL_PHASES[messagePhase]
  }
  const primaryText = currentMessage.primary.replace("{handle}", creatorHandle)
  const subtextText = currentMessage.subtext

  // Text scramble effect
  const scrambledPrimary = useTextScramble(primaryText, 400)
  const scrambledSubtext = useTextScramble(subtextText, 300)

  const copyIntentId = async () => {
    if (transaction?.intentId) {
      await navigator.clipboard.writeText(transaction.intentId)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const copyDepositAddress = async () => {
    if (depositAddress) {
      await navigator.clipboard.writeText(depositAddress)
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000)
    }
  }

  // Processing state - "The Private Tunnel"
  if (flowState === "signing" || flowState === "processing") {
    return (
      <div style={{ width: "100%", textAlign: "center", padding: `${tokens.space.xl}px 0`, position: "relative" }}>
        {/* Vertical Light Beam (behind shield) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "2px",
            height: "100%",
            background: `linear-gradient(to bottom, transparent, ${tokens.colors.primaryMuted}, transparent)`,
            animation: "beamPulse 2s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        {/* Hero Shield with Cryptex Rings */}
        <div
          style={{
            width: "120px",
            height: "120px",
            margin: "0 auto 32px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Outer rotating ring (clockwise) */}
          <svg
            style={{
              position: "absolute",
              inset: "-8px",
              width: "136px",
              height: "136px",
              animation: "rotateClockwise 8s linear infinite",
            }}
            viewBox="0 0 136 136"
          >
            <circle
              cx="68"
              cy="68"
              r="64"
              fill="none"
              stroke={tokens.colors.goldMuted}
              strokeWidth="1"
              strokeDasharray="8 12"
            />
          </svg>

          {/* Inner rotating ring (counter-clockwise) */}
          <svg
            style={{
              position: "absolute",
              inset: "4px",
              width: "112px",
              height: "112px",
              animation: "rotateCounterClockwise 6s linear infinite",
            }}
            viewBox="0 0 112 112"
          >
            <circle
              cx="56"
              cy="56"
              r="52"
              fill="none"
              stroke={tokens.colors.goldMuted}
              strokeWidth="1"
              strokeDasharray="4 8"
            />
          </svg>

          {/* Shield container with breathing glow */}
          <div
            style={{
              position: "absolute",
              inset: "16px",
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${tokens.colors.primaryMuted}, rgba(255, 215, 0, 0.05))`,
              border: `2px solid ${tokens.colors.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "breathingGlow 3s ease-in-out infinite",
              overflow: "hidden",
            }}
          >
            {/* Radar sweep overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `conic-gradient(from 0deg, transparent 0deg, ${tokens.colors.primaryGlow} 30deg, transparent 60deg)`,
                animation: "radarSweep 2s linear infinite",
                opacity: 0.5,
              }}
            />

            {/* Shield Icon */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tokens.colors.gold}
              strokeWidth="1.5"
              style={{ position: "relative", zIndex: 1 }}
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" stroke={tokens.colors.success} strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Single Status Line (Carousel with scramble effect) */}
        <div style={{ minHeight: "60px", marginBottom: tokens.space.lg }}>
          <h3
            style={{
              color: tokens.colors.textBright,
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: tokens.font.mono,
              marginBottom: tokens.space.xs,
              letterSpacing: "0.5px",
            }}
          >
            {scrambledPrimary}
          </h3>
          <p
            style={{
              color: tokens.colors.textMuted,
              fontSize: "12px",
              fontFamily: tokens.font.mono,
              letterSpacing: "0.3px",
            }}
          >
            {scrambledSubtext}
          </p>
        </div>

        {/* Real Swap: Show swap status indicator */}
        {isRealSwap && swapStatus && (
          <div style={{ marginBottom: tokens.space.lg }}>
            {/* Progress Steps */}
            <div style={{ display: "flex", justifyContent: "center", gap: tokens.space.md, marginBottom: tokens.space.md }}>
              {["PENDING_DEPOSIT", "PROCESSING", "SUCCESS"].map((step, index) => {
                const isActive = swapStatus === step
                const isPast =
                  (step === "PENDING_DEPOSIT" && (swapStatus === "PROCESSING" || swapStatus === "SUCCESS")) ||
                  (step === "PROCESSING" && swapStatus === "SUCCESS")

                return (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: isPast
                          ? tokens.colors.success
                          : isActive
                          ? tokens.colors.gold
                          : "rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: isActive ? `2px solid ${tokens.colors.gold}` : "none",
                        boxShadow: isActive ? `0 0 12px ${tokens.colors.goldMuted}` : "none",
                      }}
                    >
                      {isPast ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span style={{ color: isActive ? tokens.colors.bg : tokens.colors.textMuted, fontSize: "10px", fontWeight: 700 }}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    {index < 2 && (
                      <div
                        style={{
                          width: "40px",
                          height: "2px",
                          background: isPast ? tokens.colors.success : "rgba(255, 255, 255, 0.1)",
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Status Labels */}
            <div style={{ display: "flex", justifyContent: "center", gap: "60px" }}>
              <span style={{ color: tokens.colors.textMuted, fontSize: "10px", fontFamily: tokens.font.mono }}>DEPOSIT</span>
              <span style={{ color: tokens.colors.textMuted, fontSize: "10px", fontFamily: tokens.font.mono }}>PROCESS</span>
              <span style={{ color: tokens.colors.textMuted, fontSize: "10px", fontFamily: tokens.font.mono }}>COMPLETE</span>
            </div>
          </div>
        )}

        {/* Footer Privacy Note */}
        <p
          style={{
            color: tokens.colors.textSubtle,
            fontSize: "11px",
            fontFamily: tokens.font.mono,
            letterSpacing: "0.3px",
          }}
        >
          This transaction is invisible to the public.
        </p>

        <style>{keyframes}</style>
      </div>
    )
  }

  // Delivering state - Honest messaging while ZEC is in transit
  if (flowState === "delivering" && transaction) {
    const zecAmount = parseFloat(formatTokenAmount(transaction.toAmount, 6))
    const estimatedUsd = transaction.usdAmount || usdAmount || parseFloat(transaction.fromAmount) || zecAmount * 40

    return (
      <div style={{ width: "100%", textAlign: "center", padding: `${tokens.space.xl}px 0`, position: "relative" }}>
        {/* Vertical Light Beam */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "2px",
            height: "100%",
            background: `linear-gradient(to bottom, transparent, ${tokens.colors.primaryMuted}, transparent)`,
            animation: "beamPulse 2s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        {/* Hero: Flying Shield */}
        <div
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Outer pulsing ring */}
          <div
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              border: `2px solid ${tokens.colors.gold}`,
              animation: "breathingGlow 2s ease-in-out infinite",
            }}
          />

          {/* Shield container */}
          <div
            style={{
              position: "absolute",
              inset: "8px",
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${tokens.colors.primaryMuted}, rgba(255, 215, 0, 0.05))`,
              border: `2px solid ${tokens.colors.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${tokens.colors.goldMuted}`,
            }}
          >
            {/* Shield Icon */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tokens.colors.gold}
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4m0 4h.01" stroke={tokens.colors.gold} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Status Header */}
        <h3
          style={{
            color: tokens.colors.gold,
            fontSize: "18px",
            fontWeight: 700,
            fontFamily: tokens.font.mono,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: tokens.space.xs,
          }}
        >
          DELIVERING ZEC
        </h3>

        {/* Amount Info */}
        <p
          style={{
            color: tokens.colors.textMuted,
            fontSize: "13px",
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.sm,
          }}
        >
          ~{zecAmount.toFixed(4)} ZEC (${estimatedUsd.toFixed(2)}) to <span style={{ color: tokens.colors.textBright }}>@{creatorHandle}</span>
        </p>

        {/* Progress Steps */}
        <div style={{ marginBottom: tokens.space.lg }}>
          <div style={{ display: "flex", justifyContent: "center", gap: tokens.space.md, marginBottom: tokens.space.sm }}>
            {/* Step 1: Deposit - Complete */}
            <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: tokens.colors.success,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "2px",
                  background: tokens.colors.success,
                }}
              />
            </div>

            {/* Step 2: Delivering - Active */}
            <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: tokens.colors.gold,
                  border: `2px solid ${tokens.colors.gold}`,
                  boxShadow: `0 0 12px ${tokens.colors.goldMuted}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "breathingGlow 1.5s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: tokens.colors.bg,
                  }}
                />
              </div>
              <div
                style={{
                  width: "40px",
                  height: "2px",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>

            {/* Step 3: Confirmed - Pending */}
            <div>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: tokens.colors.textMuted, fontSize: "10px", fontWeight: 700 }}>3</span>
              </div>
            </div>
          </div>

          {/* Status Labels */}
          <div style={{ display: "flex", justifyContent: "center", gap: "50px" }}>
            <span style={{ color: tokens.colors.success, fontSize: "10px", fontFamily: tokens.font.mono }}>SENT</span>
            <span style={{ color: tokens.colors.gold, fontSize: "10px", fontFamily: tokens.font.mono }}>DELIVERING</span>
            <span style={{ color: tokens.colors.textMuted, fontSize: "10px", fontFamily: tokens.font.mono }}>CONFIRMED</span>
          </div>
        </div>

        {/* Key Message: You can close this page */}
        <div
          style={{
            background: "rgba(255, 215, 0, 0.08)",
            border: `1px solid ${tokens.colors.goldMuted}`,
            borderRadius: tokens.radius.md,
            padding: `${tokens.space.md}px ${tokens.space.lg}px`,
            marginBottom: tokens.space.lg,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: tokens.space.sm, marginBottom: tokens.space.xs }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.gold} strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" stroke={tokens.colors.gold} strokeWidth="2" />
            </svg>
            <span style={{ color: tokens.colors.gold, fontSize: "12px", fontWeight: 600, fontFamily: tokens.font.mono }}>
              You can close this page
            </span>
          </div>
          <p
            style={{
              color: tokens.colors.textMuted,
              fontSize: "11px",
              fontFamily: tokens.font.mono,
              margin: 0,
            }}
          >
            We're tracking your tip. @{creatorHandle} will be notified when it arrives.
          </p>
        </div>

        {/* Done button to dismiss */}
        <button
          onClick={onDone}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: "100%",
            padding: "14px",
            background: isHovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
            border: `1px solid rgba(255, 255, 255, ${isHovered ? 0.3 : 0.2})`,
            borderRadius: tokens.radius.md,
            color: tokens.colors.textBright,
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: tokens.font.mono,
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
          }}
        >
          CLOSE
        </button>

        <style>{keyframes}</style>
      </div>
    )
  }

  // Success state - "The Shielded Receipt"
  if (flowState === "success" && transaction) {
    // Calculate amounts from transaction (stored at time of tip) or props as fallback
    const zecAmount = parseFloat(formatTokenAmount(transaction.toAmount, 6))
    // Prefer transaction.usdAmount (stored at tip time), then props, then estimate
    const estimatedUsd = transaction.usdAmount || usdAmount || parseFloat(transaction.fromAmount) || zecAmount * 40
    // Prefer transaction.networkFee (stored at tip time), then props, then minimal estimate
    const displayNetworkFee = transaction.networkFee ? parseFloat(transaction.networkFee) : (networkFee ? parseFloat(networkFee) : 0.01)
    const platformFee = 0.00
    const savedFees = (estimatedUsd * 0.029 + 0.30).toFixed(2) // Typical card processing

    return (
      <div style={{ width: "100%", textAlign: "center", padding: `${tokens.space.lg}px 0` }}>
        {/* Hero: Locking Shield Animation */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            position: "relative",
          }}
        >
          {/* Shield body */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "shieldLock 1s ease-out forwards",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: "drop-shadow(0 0 12px rgba(34, 197, 94, 0.5))" }}
            >
              {/* Shield body */}
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                fill="rgba(34, 197, 94, 0.15)"
                stroke={tokens.colors.success}
                strokeWidth="1.5"
              />
              {/* Checkmark */}
              <path
                d="M9 12l2 2 4-4"
                fill="none"
                stroke={tokens.colors.success}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "shackleDrop 0.5s ease-out 0.3s forwards" }}
              />
            </svg>
          </div>
          {/* Success flash overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: tokens.colors.success,
              opacity: 0,
              animation: "greenFlash 0.3s ease-out 0.5s forwards",
            }}
          />
        </div>

        {/* Header: ZEC DELIVERED */}
        <h3
          style={{
            color: tokens.colors.success,
            fontSize: "18px",
            fontWeight: 700,
            fontFamily: tokens.font.mono,
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: tokens.space.xs,
          }}
        >
          ZEC DELIVERED
        </h3>
        <p
          style={{
            color: tokens.colors.textMuted,
            fontSize: "12px",
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.xs,
          }}
        >
          ~{zecAmount.toFixed(4)} ZEC has arrived in <span style={{ color: tokens.colors.textBright }}>@{creatorHandle}</span>'s wallet
        </p>
        <p
          style={{
            color: tokens.colors.textSubtle,
            fontSize: "11px",
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.lg,
          }}
        >
          Your tip is complete and confirmed
        </p>

        {/* Receipt Table */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: tokens.radius.md,
            padding: tokens.space.md,
            marginBottom: tokens.space.md,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Row 1: Amount Sent */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: tokens.space.sm }}>
            <span style={{ color: tokens.colors.textMuted, fontSize: "11px", fontFamily: tokens.font.mono, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              AMOUNT SENT
            </span>
            <span style={{ color: tokens.colors.textBright, fontSize: "11px", fontFamily: tokens.font.mono, fontWeight: 600 }}>
              ${estimatedUsd.toFixed(2)}
            </span>
          </div>

          {/* Row 2: Network Fee */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: tokens.space.sm }}>
            <span style={{ color: tokens.colors.textMuted, fontSize: "11px", fontFamily: tokens.font.mono, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              NETWORK FEE
            </span>
            <span style={{ color: tokens.colors.textMuted, fontSize: "11px", fontFamily: tokens.font.mono }}>
              ${displayNetworkFee.toFixed(2)}
            </span>
          </div>

          {/* Row 3: Platform Fee - THE FLEX */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: tokens.space.sm }}>
            <span style={{ color: tokens.colors.textMuted, fontSize: "11px", fontFamily: tokens.font.mono, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              PLATFORM FEE
            </span>
            <span style={{ color: tokens.colors.success, fontSize: "11px", fontFamily: tokens.font.mono, fontWeight: 700 }}>
              $0.00
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.1)", margin: `${tokens.space.sm}px 0` }} />

          {/* Row 4: Privacy Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: tokens.colors.textMuted, fontSize: "11px", fontFamily: tokens.font.mono, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              PRIVACY
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                background: "rgba(0, 255, 148, 0.15)",
                borderRadius: "4px",
                color: tokens.colors.success,
                fontSize: "9px",
                fontWeight: 700,
                fontFamily: tokens.font.mono,
                letterSpacing: "1px",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              SEALED
            </span>
          </div>
        </div>

        {/* Privacy Note */}
        <p
          style={{
            color: tokens.colors.textSubtle,
            fontSize: "10px",
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.lg,
          }}
        >
          Zero platform fees. Zero trace. ~${savedFees} saved vs. card processing.
        </p>

        {/* Done Button - Hollow outline style */}
        <button
          onClick={onDone}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: "100%",
            padding: "14px",
            background: isHovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
            border: `1px solid rgba(255, 255, 255, ${isHovered ? 0.3 : 0.2})`,
            borderRadius: tokens.radius.md,
            color: tokens.colors.textBright,
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: tokens.font.mono,
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
          }}
        >
          DONE
        </button>

        {/* Block Explorer Link */}
        <div style={{ marginTop: tokens.space.md, position: "relative" }}>
          <button
            onClick={() => {
              // Show tooltip instead of navigating
              const tooltip = document.getElementById("explorer-tooltip")
              if (tooltip) {
                tooltip.style.opacity = "1"
                tooltip.style.transform = "translateX(-50%) translateY(0)"
                setTimeout(() => {
                  tooltip.style.opacity = "0"
                  tooltip.style.transform = "translateX(-50%) translateY(4px)"
                }, 3000)
              }
            }}
            style={{
              background: "none",
              border: "none",
              color: tokens.colors.textMuted,
              fontSize: "11px",
              fontFamily: tokens.font.mono,
              cursor: "pointer",
              textDecoration: "underline",
              textDecorationColor: "rgba(255, 255, 255, 0.2)",
              textUnderlineOffset: "2px",
            }}
          >
            View on Block Explorer
          </button>
          {/* Tooltip */}
          <div
            id="explorer-tooltip"
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%) translateY(4px)",
              background: tokens.colors.surface,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.sm,
              padding: `${tokens.space.sm}px ${tokens.space.md}px`,
              width: "260px",
              opacity: 0,
              pointerEvents: "none",
              transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
              zIndex: 10,
            }}
          >
            <p style={{ color: tokens.colors.textMuted, fontSize: "10px", fontFamily: tokens.font.mono, margin: 0, lineHeight: 1.5 }}>
              This transaction is shielded. The explorer will not show the sender, receiver, or amount.
            </p>
            {/* Arrow */}
            <div
              style={{
                position: "absolute",
                bottom: "-5px",
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: "8px",
                height: "8px",
                background: tokens.colors.surface,
                borderRight: `1px solid ${tokens.colors.border}`,
                borderBottom: `1px solid ${tokens.colors.border}`,
              }}
            />
          </div>
        </div>

        <style>{`
          ${keyframes}

          @keyframes shieldLock {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes shackleDrop {
            0% {
              transform: translateY(-4px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes lockFlash {
            0% {
              fill: ${tokens.colors.success};
            }
            100% {
              fill: ${tokens.colors.gold};
            }
          }

          @keyframes greenFlash {
            0% {
              opacity: 0.4;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(1.5);
            }
          }
        `}</style>
      </div>
    )
  }

  // Refunded state
  if (flowState === "refunded") {
    return (
      <div style={{ width: "100%", textAlign: "center", padding: `${tokens.space.lg}px 0` }}>
        {/* Refund Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "rgba(255, 166, 0, 0.15)",
            border: `2px solid ${tokens.colors.gold}`,
            boxShadow: `0 0 20px rgba(255, 166, 0, 0.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "scaleIn 0.3s ease",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.gold} strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
        </div>

        {/* Refund Message */}
        <h3
          style={{
            color: tokens.colors.gold,
            fontSize: "18px",
            fontWeight: 700,
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.sm,
          }}
        >
          Swap Refunded
        </h3>
        <p
          style={{
            color: tokens.colors.textMuted,
            fontSize: "13px",
            fontFamily: tokens.font.mono,
            maxWidth: "280px",
            margin: `0 auto ${tokens.space.lg}px auto`,
            lineHeight: 1.5,
          }}
        >
          {error || "Your funds have been returned to your wallet. No fees were charged."}
        </p>

        {/* Action Button */}
        <button
          onClick={onDone}
          style={{
            width: "100%",
            padding: "14px",
            background: "transparent",
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radius.md,
            color: tokens.colors.text,
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: tokens.font.mono,
            cursor: "pointer",
            transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
          }}
        >
          Try Again
        </button>

        <style>{keyframes}</style>
      </div>
    )
  }

  // Error state
  if (flowState === "error") {
    const isRetryable = !error?.includes("cancelled") && !error?.includes("rejected") && !error?.includes("Insufficient")

    return (
      <div style={{ width: "100%", textAlign: "center", padding: `${tokens.space.lg}px 0` }}>
        {/* Error Icon with Glow */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: tokens.colors.errorMuted,
            border: `2px solid ${tokens.colors.error}`,
            boxShadow: tokens.shadow.glow.error,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "scaleIn 0.3s ease",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.error} strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        {/* Error Message */}
        <h3
          style={{
            color: tokens.colors.error,
            fontSize: "18px",
            fontWeight: 700,
            fontFamily: tokens.font.mono,
            marginBottom: tokens.space.sm,
          }}
        >
          {error?.includes("cancelled") || error?.includes("rejected")
            ? "Transaction Cancelled"
            : "Transaction Failed"}
        </h3>
        <p
          style={{
            color: tokens.colors.textMuted,
            fontSize: "13px",
            fontFamily: tokens.font.mono,
            maxWidth: "280px",
            margin: `0 auto ${tokens.space.lg}px auto`,
            lineHeight: 1.5,
          }}
        >
          {error || "Something went wrong. Please try again."}
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: tokens.space.sm }}>
          <button
            onClick={onDone}
            style={{
              flex: 1,
              padding: "14px",
              background: "transparent",
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radius.md,
              color: tokens.colors.text,
              fontSize: "14px",
              fontWeight: 500,
              fontFamily: tokens.font.mono,
              cursor: "pointer",
              transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
            }}
          >
            Close
          </button>
          {isRetryable && (
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                padding: "14px",
                background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryHover} 100%)`,
                border: "none",
                borderRadius: tokens.radius.md,
                color: tokens.colors.bg,
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: tokens.font.mono,
                cursor: "pointer",
                boxShadow: tokens.shadow.glow.goldSubtle,
                transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
              }}
            >
              Try Again
            </button>
          )}
        </div>

        <style>{keyframes}</style>
      </div>
    )
  }

  // Fallback
  return null
}
