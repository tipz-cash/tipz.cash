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
import { PaymentRow, LogoDisplay } from "./PaymentMethodPicker"
import { TipHistory } from "./TipHistory"
import { tokens, keyframes } from "./designTokens"
import type { WalletType, SupportedToken } from "@/lib/wallet"
import { isValidPublicKey } from "@/lib/message-encryption"

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
  publicKey?: JsonWebKey  // Creator's public key for message encryption
}

export function TippingFlow({ creatorHandle, shieldedAddress, isMobile = false, avatarColor = "#4B5563", avatarUrl, publicKey }: TippingFlowProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [showZecDirect, setShowZecDirect] = useState(false)
  const [showPaymentPicker, setShowPaymentPicker] = useState(false)
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [pendingWalletType, setPendingWalletType] = useState<WalletType | null>(null)
  const [chainSwitchError, setChainSwitchError] = useState<string | null>(null)

  // Wallet hook
  const {
    walletState,
    isConnecting,
    isSwitchingChain,
    error: walletError,
    connect,
    disconnect,
    switchChain,
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
    pendingTipNotification,
    executeWarning,
    expand,
    sendTip,
    reset,
    retry,
    setAmount,
    setToken,
    setPrivateMessage,
    dismissFailedTipNotification,
    dismissPendingTipNotification,
    dismissExecuteWarning,
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

  // Reset token selector when wallet disconnects (but not during chain switch)
  useEffect(() => {
    if (!walletState.isConnected && showTokenSelector && !isSwitchingChain) {
      setShowTokenSelector(false)
    }
  }, [walletState.isConnected, showTokenSelector, isSwitchingChain])

  // Auto-select equivalent token when chain changes externally
  useEffect(() => {
    if (walletState.chainId && selectedToken && selectedToken.chainId !== walletState.chainId) {
      // (Skip for Solana since it uses a different chainId system)
      if (selectedToken.chainId !== 501 && walletState.chainId !== 501) {
        // Try to find the same token symbol on the new chain
        const equivalent = availableTokens.find(
          t => t.symbol === selectedToken.symbol && t.chainId === walletState.chainId
        )
        if (equivalent) {
          setToken(equivalent)
        } else {
          // Fallback: native token on new chain (first match)
          const fallback = availableTokens.find(t => t.chainId === walletState.chainId)
          setToken(fallback || null)
        }
      }
    }
  }, [walletState.chainId, selectedToken, setToken, availableTokens])

  // Clear chain switch error when token selector opens/closes
  useEffect(() => {
    if (showTokenSelector) {
      setChainSwitchError(null)
    }
  }, [showTokenSelector])

  // Check if amount is selected (minimum $1)
  const hasAmount = selectedAmount !== null || (customAmount && parseFloat(customAmount) >= 1)
  const displayAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0) || 0

  // Can the creator receive encrypted messages?
  const canReceiveMessages = isValidPublicKey(publicKey)


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

  // Handler for wallet connection - shows wallet selector
  const handleWalletConnect = async () => {
    setShowPaymentPicker(false)

    if (walletState.isConnected) {
      // Already connected - show token selector
      setShowTokenSelector(true)
    } else {
      // Show wallet selector drawer
      setShowWalletSelector(true)
    }
  }

  // Handler for wallet type selection
  const handleWalletTypeSelect = async (walletType: WalletType) => {
    setShowWalletSelector(false)
    setPendingWalletType(walletType)
    try {
      await connect(walletType)
    } catch (error) {
      console.error("[TippingFlow] Wallet connect error:", error)
      setPendingWalletType(null)
    }
  }

  // Handler for ZEC direct selection
  const handleZecSelect = () => {
    setShowPaymentPicker(false)
    setShowZecDirect(true)
  }

  // Handler for token selection - handles chain switching if needed
  const handleTokenSelect = async (token: SupportedToken) => {
    setChainSwitchError(null)

    // Check if token is on a different chain (ignore for Solana/501)
    const needsChainSwitch = token.chainId !== walletState.chainId && token.chainId !== 501 && walletState.chainId !== 501

    if (needsChainSwitch) {
      try {
        const switched = await switchChain(token.chainId)
        if (!switched) {
          const chainNames: Record<number, string> = {
            1: "Ethereum",
            137: "Polygon",
            42161: "Arbitrum",
            10: "Optimism",
          }
          setChainSwitchError(`Please switch to ${chainNames[token.chainId] || `Chain ${token.chainId}`} in your wallet`)
          return
        }
        // Successfully switched - select the token and close
        setToken(token)
        setShowTokenSelector(false)
        return
      } catch (error) {
        console.error("[TippingFlow] Chain switch error:", error)
        setChainSwitchError("Failed to switch chain. Please try manually.")
        return
      }
    }

    // Token is on current chain - select it and close selector
    setToken(token)
    setShowTokenSelector(false)
  }

  // Helper to get unique key for each view
  const getContentKey = () => {
    if (["signing", "processing", "delivering", "success", "error", "refunded"].includes(flowState)) {
      return "transaction"
    }
    if (showZecDirect) return "zec-direct"
    if (showPaymentPicker) return "payment-picker"
    if (showWalletSelector) return "wallet-selector"
    return "main"
  }

  const contentKey = getContentKey()

  // Render unified container with animated content
  return (
    <div style={{ ...cardStyles }}>
      {/* Pending tip notification banner */}
      {pendingTipNotification && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.08)",
            borderBottom: `1px solid rgba(34, 197, 94, 0.2)`,
            padding: `${tokens.space.sm}px ${tokens.space.lg}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: tokens.space.sm,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: tokens.colors.success,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <p style={{ color: tokens.colors.success, fontSize: "11px", margin: 0, fontFamily: tokens.font.mono }}>
              Delivering {pendingTipNotification.amount} {pendingTipNotification.tokenSymbol} to @{pendingTipNotification.creatorHandle}...
            </p>
          </div>
          <button
            onClick={dismissPendingTipNotification}
            style={{
              background: "none",
              border: "none",
              color: tokens.colors.textMuted,
              cursor: "pointer",
              padding: "16px",
              minWidth: "44px",
              minHeight: "44px",
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
              padding: "16px",
              minWidth: "44px",
              minHeight: "44px",
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
              executeWarning={executeWarning}
              onDismissExecuteWarning={dismissExecuteWarning}
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

              {/* Back button - 44px touch target for accessibility */}
              <button
                onClick={() => setShowPaymentPicker(false)}
                style={{
                  width: "44px",
                  height: "44px",
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: tokens.radius.md,
                  cursor: "pointer",
                  color: tokens.colors.textMuted,
                  transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>

            {/* Payment options */}
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.sm }}>
              {/* Wallet row - auto-detects installed wallet */}
              <PaymentRow
                title="Wallet"
                description="Connect your crypto wallet"
                onClick={handleWalletConnect}
              >
                <LogoDisplay src="/icons/phantom.png" alt="Phantom" />
                <LogoDisplay src="/icons/metamask.svg" alt="MetaMask" />
                <LogoDisplay src="/icons/rabby.png" alt="Rabby" />
              </PaymentRow>

              {/* ZEC row — fully private, visually differentiated */}
              <PaymentRow
                title="ZEC Direct"
                description={
                  <>
                    Send from any Zcash wallet
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.signalGreen} strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span style={{ color: tokens.colors.signalGreen, fontSize: "11px", fontFamily: tokens.font.sans, fontWeight: 500 }}>
                        Fully private
                      </span>
                    </span>
                  </>
                }
                onClick={handleZecSelect}
              >
                <LogoDisplay src="/icons/zcash.svg" alt="Zcash" size={40} />
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

        {contentKey === "wallet-selector" && (
          <motion.div
            key="wallet-selector"
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
                  Select wallet
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

              {/* Close button - 44px touch target for accessibility */}
              <button
                onClick={() => setShowWalletSelector(false)}
                style={{
                  width: "44px",
                  height: "44px",
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: tokens.radius.md,
                  cursor: "pointer",
                  color: tokens.colors.textMuted,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Wallet options using PaymentRow style */}
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.sm }}>
              {/* Rabby */}
              <PaymentRow
                title="Rabby"
                description="EVM chains"
                onClick={() => handleWalletTypeSelect("rabby")}
              >
                <LogoDisplay src="/icons/rabby.png" alt="Rabby" />
              </PaymentRow>

              {/* MetaMask */}
              <PaymentRow
                title="MetaMask"
                description="EVM chains"
                onClick={() => handleWalletTypeSelect("metamask")}
              >
                <LogoDisplay src="/icons/metamask.svg" alt="MetaMask" />
              </PaymentRow>

              {/* Phantom */}
              <PaymentRow
                title="Phantom"
                description="Solana"
                onClick={() => handleWalletTypeSelect("phantom")}
              >
                <LogoDisplay src="/icons/phantom.png" alt="Phantom" />
              </PaymentRow>
            </div>

            {/* Trust footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: tokens.space.lg,
                marginTop: tokens.space.xl,
                paddingTop: tokens.space.md,
                borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
                flexWrap: "wrap",
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
            style={{
              display: isMobile ? "flex" : "block",
              flexDirection: "column",
              minHeight: isMobile ? "calc(100dvh - 120px)" : "auto",
            }}
          >
            {/* Scrollable content area */}
            <div style={{
              flex: isMobile ? 1 : undefined,
              overflowY: isMobile ? "auto" : undefined,
              padding: tokens.space.lg,
              paddingBottom: isMobile ? tokens.space.sm : tokens.space.lg,
            }}>
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

        {/* Amount Selection - always visible, disabled during quoting */}
        <div style={{
          marginBottom: tokens.space.md,
          opacity: flowState === "quoting" ? 0.7 : 1,
          pointerEvents: flowState === "quoting" ? "none" : "auto",
          transition: `opacity ${tokens.duration.base}ms ${tokens.ease.smooth}`,
        }}>
          <AmountSelector
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            onSelect={setAmount}
            zecPrice={zecPrice}
            disabled={flowState === "quoting"}
          />
        </div>

        {/* Quote Loading Skeleton - shown during quote fetch */}
        {flowState === "quoting" && (
          <div
            style={{
              marginBottom: tokens.space.md,
              padding: tokens.space.md,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: tokens.radius.md,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm, marginBottom: tokens.space.sm }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255, 215, 0, 0.3)",
                  borderTopColor: tokens.colors.gold,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span style={{ color: tokens.colors.textMuted, fontSize: "13px", fontFamily: tokens.font.sans }}>
                Getting best rate...
              </span>
            </div>
            {/* Shimmer skeleton bar */}
            <div
              style={{
                height: "8px",
                background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        {/* Message Trench - only show if creator can receive messages */}
        <div style={{ marginBottom: tokens.space.md }}>
          <MessageTrench
            value={privateMessage}
            onChange={setPrivateMessage}
            disabled={false}
            canReceiveMessages={canReceiveMessages}
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
                  padding: "12px 16px",
                  minHeight: "44px",
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
              currentChainId={walletState.chainId}
              isSwitchingChain={isSwitchingChain}
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

        {/* Tip history */}
        <TipHistory />

        {/* Selected token indicator - clickable to change */}
        {walletState.isConnected && selectedToken && !showTokenSelector && (
          <div
            style={{
              marginBottom: tokens.space.md,
              padding: `${tokens.space.sm}px ${tokens.space.md}px`,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: tokens.radius.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
              <img
                src={selectedToken.logoUrl}
                alt={selectedToken.symbol}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                }}
              />
              <span
                style={{
                  color: tokens.colors.textBright,
                  fontSize: "14px",
                  fontWeight: 500,
                  fontFamily: tokens.font.sans,
                }}
              >
                {selectedToken.symbol}
              </span>
              <span
                style={{
                  color: tokens.colors.textMuted,
                  fontSize: "12px",
                  fontFamily: tokens.font.mono,
                }}
              >
                on {
                  {
                    1: "Ethereum",
                    137: "Polygon",
                    42161: "Arbitrum",
                    10: "Optimism",
                    "solana": "Solana"
                  }[selectedToken.chainId] || `Chain ${selectedToken.chainId}`
                }
              </span>
            </div>
            <button
              onClick={() => setShowTokenSelector(true)}
              style={{
                background: "none",
                border: "none",
                color: tokens.colors.gold,
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: tokens.font.sans,
                cursor: "pointer",
                padding: "12px 16px",
                minHeight: "44px",
                transition: `color ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFD700"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = tokens.colors.gold
              }}
            >
              Change
            </button>
          </div>
        )}

            </div>
            {/* End scrollable content area */}

            {/* Sticky CTA Footer - thumb zone optimized */}
            <div style={{
              position: isMobile ? "sticky" : "relative",
              bottom: 0,
              padding: tokens.space.lg,
              paddingBottom: isMobile ? `max(${tokens.space.lg}px, env(safe-area-inset-bottom))` : tokens.space.lg,
              background: isMobile ? tokens.glass.background : "transparent",
              backdropFilter: isMobile ? tokens.glass.backdropFilter : "none",
              WebkitBackdropFilter: isMobile ? tokens.glass.backdropFilter : "none",
              borderTop: isMobile ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
            }}>
        {/* Send Tip CTA Button */}
        <button
          onClick={() => {
            if (walletState.isConnected && selectedToken) {
              // Wallet connected and token selected - send the tip
              sendTip()
            } else if (walletState.isConnected) {
              // Wallet connected but no token - show token selector
              setShowTokenSelector(true)
            } else {
              // No wallet - show payment picker to display all options
              setShowPaymentPicker(true)
            }
          }}
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
                {!hasAmount
                  ? "Select Amount"
                  : walletState.isConnected && selectedToken
                    ? `Send $${displayAmount.toFixed(2)} with ${selectedToken.symbol}`
                    : `Send $${displayAmount.toFixed(2)}`
                }
              </span>
            )}
          </button>

        {/* Error display */}
        {(tippingError || walletError || chainSwitchError) && (
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
              {chainSwitchError || tippingError || walletError}
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
            </div>
            {/* End sticky CTA footer */}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{keyframes}</style>
    </div>
  )
}
