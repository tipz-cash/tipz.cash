"use client"

import { useRef, useEffect } from "react"
import { useWallet } from "@/hooks/useWallet"
import { useTipping } from "@/hooks/useTipping"
import { AmountSelector } from "./AmountSelector"
import { TokenSelector } from "./TokenSelector"
import { WalletConnect } from "./WalletConnect"
import { TransactionStatus } from "./TransactionStatus"
import { MessageTrench } from "./MessageTrench"
import { tokens, keyframes } from "./designTokens"

interface TippingFlowProps {
  creatorHandle: string
  shieldedAddress: string
  isMobile?: boolean
  avatarColor?: string
  avatarUrl?: string
}

export function TippingFlow({ creatorHandle, shieldedAddress, isMobile = false, avatarColor = "#4B5563", avatarUrl }: TippingFlowProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Wallet hook
  const {
    walletState,
    isConnecting,
    isAvailable,
    detectedWallet,
    error: walletError,
    connect,
    disconnect,
  } = useWallet()

  // Tipping hook
  const {
    flowState,
    selectedAmount,
    customAmount,
    selectedToken,
    availableTokens,
    tokenBalances,
    transaction,
    error: tippingError,
    zecPrice,
    privateMessage,
    expand,
    sendTip,
    reset,
    retry,
    setAmount,
    setToken,
    setPrivateMessage,
  } = useTipping({
    creatorHandle,
    shieldedAddress,
    walletAddress: walletState.address,
    chainId: walletState.chainId,
    isWalletConnected: walletState.isConnected,
  })

  // Auto-expand on mount
  useEffect(() => {
    if (flowState === "idle") {
      expand()
    }
  }, [flowState, expand])

  // Check if amount is selected
  const hasAmount = selectedAmount !== null || (customAmount && parseFloat(customAmount) > 0)
  const displayAmount = selectedAmount || customAmount || ""

  // Glass card container styles - only top gold highlight + bottom shadow
  const cardStyles = {
    width: "100%",
    background: tokens.glass.background,
    backdropFilter: tokens.glass.backdropFilter,
    WebkitBackdropFilter: tokens.glass.backdropFilter,
    borderTop: "1px solid rgba(255, 215, 0, 0.5)",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.8)",
    borderRadius: tokens.radius.xl,
    boxShadow: tokens.shadow.lg,
  }

  // Render processing/success/error states
  if (flowState === "signing" || flowState === "processing" || flowState === "success" || flowState === "error") {
    return (
      <div style={cardStyles}>
        <div style={{ padding: tokens.space.lg }}>
          <TransactionStatus
            flowState={flowState}
            transaction={transaction}
            error={tippingError}
            creatorHandle={creatorHandle}
            onRetry={retry}
            onDone={reset}
          />
        </div>
        <style>{keyframes}</style>
      </div>
    )
  }

  // Render main card - compact layout with integrated header
  return (
    <div style={cardStyles}>
      <div ref={contentRef} style={{ padding: tokens.space.lg }}>
        {/* Compact Header: Avatar + Handle + Shield Badge */}
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
          {/* Avatar with inner white glow - no outer box/ring */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "22%",
              backgroundColor: avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={creatorHandle}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: "18px",
                  color: tokens.colors.textBright,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontFamily: tokens.font.sans,
                }}
              >
                {creatorHandle[0] || "?"}
              </span>
            )}
          </div>

          {/* Handle + Shield Badge fused to name */}
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
              @{creatorHandle}
              {/* Shield badge fused to name - Gold for trust/verification */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={tokens.colors.gold}
                stroke="none"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" stroke="#050505" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount Selection - always visible */}
        <div style={{ marginBottom: tokens.space.md }}>
          <AmountSelector
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            onSelect={setAmount}
            zecPrice={zecPrice}
            disabled={!walletState.isConnected}
          />
        </div>

        {/* Message Trench - always visible */}
        <div style={{ marginBottom: tokens.space.md }}>
          <MessageTrench
            value={privateMessage}
            onChange={setPrivateMessage}
            disabled={!walletState.isConnected}
          />
        </div>

        {/* Wallet not connected - show connect button in place of send button */}
        {!walletState.isConnected ? (
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: tokens.colors.textMuted,
                fontSize: "13px",
                fontFamily: tokens.font.sans,
                marginBottom: tokens.space.md,
              }}
            >
              Connect wallet to tip
            </p>

            {/* Gold Connect Button */}
            <button
              onClick={() => connect()}
              disabled={isConnecting}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: tokens.space.sm,
                padding: "14px 20px",
                background: isConnecting
                  ? "rgba(255, 255, 255, 0.1)"
                  : `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
                border: "none",
                borderRadius: tokens.radius.md,
                color: isConnecting ? tokens.colors.textMuted : tokens.colors.bg,
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: tokens.font.sans,
                letterSpacing: "0.5px",
                cursor: isConnecting ? "not-allowed" : "pointer",
                boxShadow: isConnecting
                  ? "none"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)",
                transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
              }}
            >
              {isConnecting ? (
                <>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      border: `2px solid rgba(0, 0, 0, 0.2)`,
                      borderTopColor: tokens.colors.bg,
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Connect Wallet</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {/* No wallet help link */}
            <a
              href="https://rabby.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: tokens.space.md,
                color: tokens.colors.textMuted,
                fontSize: "12px",
                fontFamily: tokens.font.sans,
                textDecoration: "none",
              }}
            >
              No wallet? Get one →
            </a>

            {/* Wallet error */}
            {walletError && (
              <div
                style={{
                  marginTop: tokens.space.md,
                  padding: `${tokens.space.sm}px ${tokens.space.md}px`,
                  background: tokens.colors.errorMuted,
                  border: `1px solid ${tokens.colors.errorBorder}`,
                  borderRadius: tokens.radius.sm,
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
                <p style={{ color: tokens.colors.error, fontSize: "12px", margin: 0, fontFamily: tokens.font.sans }}>
                  {walletError}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Token Selector - separate row above button */}
            <div style={{ marginBottom: tokens.space.md, position: "relative", zIndex: 10 }}>
              <TokenSelector
                selectedToken={selectedToken}
                tokens={availableTokens}
                balances={tokenBalances}
                onSelect={setToken}
                compact
              />
            </div>

            {/* Pay Button - full-width edge-to-edge */}
            <button
              onClick={sendTip}
              disabled={!hasAmount || !selectedToken || flowState === "quoting"}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: tokens.space.sm,
                padding: "14px 20px",
                background:
                  !hasAmount || !selectedToken || flowState === "quoting"
                    ? "rgba(255, 255, 255, 0.1)"
                    : `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
                border: "none",
                borderRadius: tokens.radius.md,
                color: !hasAmount || !selectedToken || flowState === "quoting" ? tokens.colors.textMuted : tokens.colors.bg,
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: tokens.font.sans,
                letterSpacing: "0.5px",
                cursor: !hasAmount || !selectedToken || flowState === "quoting" ? "not-allowed" : "pointer",
                boxShadow:
                  !hasAmount || !selectedToken || flowState === "quoting"
                    ? "none"
                    : "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)",
                transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
              }}
              onMouseEnter={(e) => {
                if (hasAmount && selectedToken && flowState !== "quoting") {
                  e.currentTarget.style.transform = "translateY(-1px)"
                  e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 6px 20px rgba(255, 215, 0, 0.4)"
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                if (hasAmount && selectedToken && flowState !== "quoting") {
                  e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)"
                }
              }}
            >
              {flowState === "quoting" ? (
                <>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      border: `2px solid rgba(0, 0, 0, 0.2)`,
                      borderTopColor: tokens.colors.bg,
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <span>SENDING...</span>
                </>
              ) : (
                <span>
                  {hasAmount ? `Send $${parseFloat(String(displayAmount)).toFixed(2)}` : "SELECT AMOUNT"}
                </span>
              )}
            </button>

            {/* Error */}
            {tippingError && (
              <div
                style={{
                  marginTop: tokens.space.md,
                  padding: `${tokens.space.sm}px ${tokens.space.md}px`,
                  background: tokens.colors.errorMuted,
                  border: `1px solid ${tokens.colors.errorBorder}`,
                  borderRadius: tokens.radius.sm,
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
                <p style={{ color: tokens.colors.error, fontSize: "12px", margin: 0, fontFamily: tokens.font.sans }}>
                  {tippingError}
                </p>
              </div>
            )}
          </>
        )}

        {/* Trust Footer - always visible */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? tokens.space.md : tokens.space.lg,
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
            <span style={{ color: tokens.colors.textSecondary, fontSize: "12px", fontFamily: tokens.font.sans }}>
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
            <span style={{ color: tokens.colors.textSecondary, fontSize: "12px", fontFamily: tokens.font.sans }}>
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
            <span style={{ color: tokens.colors.textSecondary, fontSize: "12px", fontFamily: tokens.font.sans }}>
              0% fees
            </span>
          </div>
        </div>
      </div>

      <style>{keyframes}</style>
    </div>
  )
}
