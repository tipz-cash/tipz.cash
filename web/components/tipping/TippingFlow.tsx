"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/hooks/useWallet"
import { useTipping } from "@/hooks/useTipping"
import { AmountSelector } from "./AmountSelector"
import { TokenSelector } from "./TokenSelector"
import { TransactionStatus } from "./TransactionStatus"
import { MessageTrench } from "./MessageTrench"
import { ZecDirectSend } from "./ZecDirectSend"
import { PaymentRow, LogoDisplay, type ExchangeOption } from "./PaymentMethodPicker"
import { openMeshTransfer } from "@/lib/mesh"
import { tokens, keyframes } from "./designTokens"
import type { WalletType, SupportedToken } from "@/lib/wallet"

// Animation variants for content transitions - fast and subtle
const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

interface TippingFlowProps {
  creatorHandle: string
  shieldedAddress: string
  isMobile?: boolean
  avatarColor?: string
  avatarUrl?: string
}

export function TippingFlow({ creatorHandle, shieldedAddress, isMobile = false, avatarColor = "#4B5563", avatarUrl }: TippingFlowProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [showZecDirect, setShowZecDirect] = useState(false)
  const [showPaymentPicker, setShowPaymentPicker] = useState(false)
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  const [pendingWalletType, setPendingWalletType] = useState<WalletType | null>(null)

  // Wallet hook
  const {
    walletState,
    isConnecting,
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
    quote,
    transaction,
    error: tippingError,
    zecPrice,
    privateMessage,
    depositAddress,
    swapStatus,
    isRealSwap,
    failedTipNotification,
    expand,
    sendTip,
    reset,
    retry,
    setAmount,
    setToken,
    setPrivateMessage,
    dismissFailedTipNotification,
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

  // When wallet connects after user selects a wallet type, show token selector
  useEffect(() => {
    if (walletState.isConnected && pendingWalletType) {
      setShowTokenSelector(true)
      setPendingWalletType(null)
    }
  }, [walletState.isConnected, pendingWalletType])

  // Check if amount is selected
  const hasAmount = selectedAmount !== null || (customAmount && parseFloat(customAmount) > 0)
  const displayAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0) || 0

  // Glass card container styles
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

  // Handler for exchange selection (Mesh)
  const handleExchangeSelect = (exchange: ExchangeOption) => {
    setShowPaymentPicker(false)
    openMeshTransfer(
      {
        destinationAddress: shieldedAddress,
        amountUsd: displayAmount,
        creatorHandle,
      },
      (result) => {
        if (result.success) {
          console.log("[TippingFlow] Mesh transfer success:", result)
          // Reset flow after success
          reset()
        } else {
          console.error("[TippingFlow] Mesh transfer error:", result.error)
        }
      }
    )
  }

  // Handler for wallet connection - auto-detects available wallet
  const handleWalletConnect = async () => {
    setShowPaymentPicker(false)

    if (walletState.isConnected) {
      // Already connected - show token selector
      setShowTokenSelector(true)
    } else {
      // Connect to auto-detected wallet
      setPendingWalletType("metamask") // Placeholder, will be overwritten by actual detection
      try {
        await connect() // Auto-detects available wallet
      } catch (error) {
        console.error("[TippingFlow] Wallet connect error:", error)
        setPendingWalletType(null)
      }
    }
  }

  // Handler for ZEC direct selection
  const handleZecSelect = () => {
    setShowPaymentPicker(false)
    setShowZecDirect(true)
  }

  // Handler for token selection - auto-trigger send
  const handleTokenSelect = (token: SupportedToken) => {
    setToken(token)
    // Auto-send after token selection with a small delay for state to update
    setTimeout(() => {
      sendTip()
      setShowTokenSelector(false)
    }, 100)
  }

  // Helper to get unique key for each view
  const getContentKey = () => {
    if (["signing", "processing", "success", "error", "refunded"].includes(flowState)) {
      return "transaction"
    }
    if (showZecDirect) return "zec-direct"
    if (showPaymentPicker) return "payment-picker"
    return "main"
  }

  const contentKey = getContentKey()

  // Render unified container with animated content
  return (
    <div style={{ ...cardStyles, minHeight: "420px" }}>
      {/* Failed tip notification banner */}
      {failedTipNotification && (
        <div
          style={{
            background: "rgba(255, 166, 0, 0.1)",
            borderBottom: `1px solid rgba(255, 166, 0, 0.3)`,
            padding: `${tokens.space.sm}px ${tokens.space.lg}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: tokens.space.sm,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tokens.colors.gold}
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <p style={{ color: tokens.colors.gold, fontSize: "11px", margin: 0, fontFamily: tokens.font.mono }}>
              Your tip to @{failedTipNotification.creatorHandle} was {failedTipNotification.reason}
            </p>
          </div>
          <button
            onClick={dismissFailedTipNotification}
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {contentKey === "transaction" && (
          <motion.div
            key="transaction"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.1 }}
            style={{ padding: tokens.space.lg }}
          >
            <TransactionStatus
              flowState={flowState}
              transaction={transaction}
              error={tippingError}
              creatorHandle={creatorHandle}
              onRetry={retry}
              onDone={reset}
              swapStatus={swapStatus}
              depositAddress={depositAddress}
              isRealSwap={isRealSwap}
              usdAmount={selectedAmount || (customAmount ? parseFloat(customAmount) : null)}
              networkFee={quote?.fees?.network}
            />
          </motion.div>
        )}

        {contentKey === "zec-direct" && (
          <motion.div
            key="zec-direct"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.1 }}
          >
            <ZecDirectSend
              shieldedAddress={shieldedAddress}
              creatorHandle={creatorHandle}
              amount={selectedAmount || (customAmount ? parseFloat(customAmount) : undefined)}
              zecPrice={zecPrice}
              onBack={() => setShowZecDirect(false)}
              onDone={() => {
                setShowZecDirect(false)
                reset()
              }}
            />
          </motion.div>
        )}

        {contentKey === "payment-picker" && (
          <motion.div
            key="payment-picker"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.1 }}
            style={{ padding: tokens.space.lg }}
          >
            {/* Header with back button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: tokens.space.lg,
                paddingBottom: tokens.space.md,
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div>
                <h3
                  style={{
                    color: tokens.colors.textBright,
                    fontSize: "18px",
                    fontWeight: 600,
                    fontFamily: tokens.font.sans,
                    margin: 0,
                  }}
                >
                  Choose payment
                </h3>
                <p
                  style={{
                    color: tokens.colors.textMuted,
                    fontSize: "14px",
                    fontFamily: tokens.font.sans,
                    margin: `${tokens.space.xs}px 0 0`,
                  }}
                >
                  <span style={{ color: tokens.colors.gold, fontWeight: 600, fontFamily: tokens.font.mono }}>
                    ${displayAmount.toFixed(2)}
                  </span>
                  <span style={{ color: tokens.colors.textSubtle }}> → </span>
                  <span style={{ color: tokens.colors.text }}>@{creatorHandle}</span>
                </p>
              </div>

              {/* Back button */}
              <button
                onClick={() => setShowPaymentPicker(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: tokens.radius.sm,
                  cursor: "pointer",
                  color: tokens.colors.textMuted,
                  transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>

            {/* Payment options */}
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.sm }}>
              {/* Exchange row */}
              <PaymentRow
                title="Exchange"
                description="Link Coinbase, Kraken, or Binance"
                onClick={() => handleExchangeSelect("coinbase")}
              >
                <LogoDisplay src="/icons/coinbase.svg" alt="Coinbase" />
                <LogoDisplay src="/icons/kraken.svg" alt="Kraken" />
                <LogoDisplay src="/icons/binance.svg" alt="Binance" />
              </PaymentRow>

              {/* Wallet row - auto-detects installed wallet */}
              <PaymentRow
                title="Wallet"
                description="Connect your crypto wallet"
                onClick={handleWalletConnect}
              >
                <LogoDisplay src="/icons/phantom.svg" alt="Phantom" />
                <LogoDisplay src="/icons/metamask.svg" alt="MetaMask" />
                <LogoDisplay src="/icons/rabby.svg" alt="Rabby" />
              </PaymentRow>

              {/* ZEC row */}
              <PaymentRow
                title="ZEC Direct"
                description="Send from any Zcash wallet"
                onClick={handleZecSelect}
              >
                <LogoDisplay src="/icons/zcash.svg" alt="Zcash" />
              </PaymentRow>
            </div>

            {/* Trust footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: tokens.space.lg,
                marginTop: tokens.space.lg,
                paddingTop: tokens.space.md,
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.signalGreen} strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span style={{ color: tokens.colors.textSecondary, fontSize: "12px", fontFamily: tokens.font.sans }}>
                  Private
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.signalGreen} strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span style={{ color: tokens.colors.textSecondary, fontSize: "12px", fontFamily: tokens.font.sans }}>
                  Instant
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.signalGreen} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
                <span style={{ color: tokens.colors.textSecondary, fontSize: "12px", fontFamily: tokens.font.sans }}>
                  0% fees
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {contentKey === "main" && (
          <motion.div
            key="main"
            ref={contentRef}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.1 }}
            style={{ padding: tokens.space.lg }}
          >
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
          {/* Avatar with inner white glow */}
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
              @{creatorHandle}
              {/* Shield badge */}
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

        {/* Amount Selection - always visible, always enabled */}
        <div style={{ marginBottom: tokens.space.md }}>
          <AmountSelector
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            onSelect={setAmount}
            zecPrice={zecPrice}
            disabled={false}
          />
        </div>

        {/* Message Trench - always visible, always enabled */}
        <div style={{ marginBottom: tokens.space.md }}>
          <MessageTrench
            value={privateMessage}
            onChange={setPrivateMessage}
            disabled={false}
          />
        </div>

        {/* Token Selector - shown after wallet connects (wallet flow) */}
        {showTokenSelector && walletState.isConnected && (
          <div
            style={{
              marginBottom: tokens.space.md,
              padding: tokens.space.md,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: tokens.radius.md,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tokens.space.sm }}>
              <span
                style={{
                  color: tokens.colors.textBright,
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: tokens.font.sans,
                }}
              >
                Select token to send
              </span>
              <button
                onClick={() => {
                  setShowTokenSelector(false)
                  disconnect()
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: tokens.colors.textMuted,
                  fontSize: "12px",
                  fontFamily: tokens.font.sans,
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                Cancel
              </button>
            </div>
            <TokenSelector
              selectedToken={selectedToken}
              tokens={availableTokens}
              balances={tokenBalances}
              onSelect={handleTokenSelect}
              compact
            />

            {/* Connected wallet indicator */}
            <div
              style={{
                marginTop: tokens.space.sm,
                display: "flex",
                alignItems: "center",
                gap: tokens.space.xs,
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: tokens.colors.signalGreen,
                }}
              />
              <span
                style={{
                  color: tokens.colors.textMuted,
                  fontSize: "11px",
                  fontFamily: tokens.font.mono,
                }}
              >
                {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
              </span>
            </div>
          </div>
        )}

        {/* Send Tip CTA Button */}
        {!showTokenSelector && (
          <button
            onClick={() => setShowPaymentPicker(true)}
            disabled={!hasAmount || flowState === "quoting"}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: tokens.space.sm,
              padding: "14px 20px",
              background:
                !hasAmount || flowState === "quoting"
                  ? "rgba(255, 255, 255, 0.1)"
                  : `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
              border: "none",
              borderRadius: tokens.radius.md,
              color: !hasAmount || flowState === "quoting" ? tokens.colors.textMuted : tokens.colors.bg,
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: tokens.font.sans,
              letterSpacing: "0.5px",
              cursor: !hasAmount || flowState === "quoting" ? "not-allowed" : "pointer",
              boxShadow:
                !hasAmount || flowState === "quoting"
                  ? "none"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)",
              transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
            }}
            onMouseEnter={(e) => {
              if (hasAmount && flowState !== "quoting") {
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 6px 20px rgba(255, 215, 0, 0.4)"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              if (hasAmount && flowState !== "quoting") {
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
                <span>Processing...</span>
              </>
            ) : isConnecting ? (
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
              <span>
                {hasAmount ? `Send $${displayAmount.toFixed(2)}` : "Select Amount"}
              </span>
            )}
          </button>
        )}

        {/* Error display */}
        {(tippingError || walletError) && (
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
              {tippingError || walletError}
            </p>
          </div>
        )}

        {/* Trust Footer */}
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
          </motion.div>
        )}
      </AnimatePresence>

      <style>{keyframes}</style>
    </div>
  )
}
