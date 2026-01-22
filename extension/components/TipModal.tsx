import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import type { Creator } from "~lib/api"
import { usePayment } from "~hooks/usePayment"
import type { TransactionStatus, WalletType } from "~lib/payment"
import { shortenAddress, formatTokenAmount, isDemoMode, blockSessionRestoration } from "~lib/payment"
import { colors, fonts } from "~lib/theme"

interface TipModalProps {
  creator: Creator | null
  handle: string
  isOpen: boolean
  onClose: () => void
}

// USD-denominated tip amounts
const TIP_AMOUNTS_USD = [1, 5, 10, 25]

// Animation styles
const animationStyles = `
  @keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes modalFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes modalSlideOut {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes successPop {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes checkDraw {
    0% { stroke-dashoffset: 24; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes progressPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
`;

// Status messages for transaction flow
const statusMessages: Record<TransactionStatus, string> = {
  idle: "",
  connecting: "Connecting wallet...",
  connected: "Wallet connected",
  approving: "Approving transaction...",
  swapping: "Processing payment...",
  routing: "Routing to shielded address...",
  confirming: "Confirming transaction...",
  completed: "Tip sent successfully!",
  failed: "Transaction failed",
}

// Terminal window header with close button
function TerminalHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      borderRadius: "12px 12px 0 0",
    }}>
      <span style={{ color: colors.muted, fontSize: "12px", fontFamily: fonts.mono }}>
        {title}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: colors.muted,
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.border
            e.currentTarget.style.color = colors.textWhite
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = colors.muted
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export function TipModal({ creator, handle, isOpen, onClose }: TipModalProps) {
  const [selectedAmountUsd, setSelectedAmountUsd] = useState(5) // Default $5
  const [customAmountUsd, setCustomAmountUsd] = useState("")
  const [view, setView] = useState<"amount" | "wallet" | "processing" | "success" | "error">("amount")
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showAssetDropdown, setShowAssetDropdown] = useState(false)
  const [forceConnect, setForceConnect] = useState(false)

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS animation
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    }
  }, [isOpen])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  const {
    wallet,
    availableWallets,
    isConnecting,
    transaction,
    transactionStatus,
    supportedTokens,
    selectedToken,
    tokenBalances,
    error,
    connect,
    disconnect,
    selectToken,
    tip,
    clearError,
    resetTransaction,
  } = usePayment()

  // Reset view when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow animation
      setTimeout(() => {
        setView("amount")
        setCustomAmountUsd("")
        setForceConnect(false)
        resetTransaction()
      }, 200)
    }
  }, [isOpen, resetTransaction])

  // Update view based on transaction status
  useEffect(() => {
    if (transactionStatus === "completed") {
      setView("success")
    } else if (transactionStatus === "failed") {
      setView("error")
    } else if (transactionStatus !== "idle" && transactionStatus !== "connected") {
      setView("processing")
    }
  }, [transactionStatus])

  if (!isOpen) return null

  // Create portal container if it doesn't exist
  let portalContainer = document.getElementById("tipz-modal-root")
  if (!portalContainer) {
    portalContainer = document.createElement("div")
    portalContainer.id = "tipz-modal-root"
    portalContainer.style.cssText = "position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;"
    document.body.appendChild(portalContainer)
  }

  const currentAmountUsd = customAmountUsd ? parseFloat(customAmountUsd) : selectedAmountUsd

  const handleTip = async () => {
    if (!creator) return

    if (!wallet.isConnected) {
      setView("wallet")
      return
    }

    // Pass USD amount - the payment system handles conversion
    await tip(currentAmountUsd.toString(), creator.shielded_address, handle)
  }

  const handleConnectWallet = async (walletType: WalletType) => {
    console.log("TIPZ: handleConnectWallet called", { walletType, forceConnect })
    await connect(walletType, forceConnect)
    setForceConnect(false) // Reset flag after connecting
    if (!error) {
      setView("amount")
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    // Wait for animation to complete
    setTimeout(() => {
      setIsClosing(false)
      setIsVisible(false)
      resetTransaction()
      onClose()
    }, 200)
  }

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2147483647, // Maximum z-index
    backdropFilter: "blur(4px)",
    animation: isClosing ? "modalFadeOut 0.2s ease-out forwards" : "modalFadeIn 0.25s ease-out forwards",
    pointerEvents: "auto", // Enable clicks through portal container
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    width: "380px",
    maxWidth: "90vw",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    color: colors.textWhite,
    fontFamily: fonts.mono,
    overflow: "hidden",
    animation: isClosing ? "modalSlideOut 0.2s ease-out forwards" : "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
  }

  const modalContentStyle: React.CSSProperties = {
    padding: "20px",
  }

  const buttonPrimaryStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    fontSize: "14px",
    fontWeight: 600,
    color: colors.bg,
    backgroundColor: colors.primary,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: fonts.mono,
  }

  const buttonSecondaryStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    fontSize: "14px",
    fontWeight: 500,
    color: colors.textWhite,
    backgroundColor: "transparent",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: fonts.mono,
  }

  const amountButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 500,
    color: isSelected ? colors.bg : colors.textWhite,
    backgroundColor: isSelected ? colors.primary : "transparent",
    border: `1px solid ${isSelected ? colors.primary : colors.border}`,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: fonts.mono,
    transform: isSelected ? "scale(1.02)" : "scale(1)",
    boxShadow: isSelected ? `0 0 12px rgba(245, 166, 35, 0.3)` : "none",
  })

  // Helper to wrap content in portal
  const renderInPortal = (content: React.ReactNode) => {
    return createPortal(content, portalContainer!)
  }

  // Creator Not Registered View
  if (!creator) {
    return renderInPortal(
      <div style={overlayStyle} onClick={handleClose}>
        <style>{animationStyles}</style>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="Error" onClose={handleClose} />
          <div style={modalContentStyle}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
                backgroundColor: colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: `1px solid ${colors.border}`,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>
                Creator Not Registered
              </h2>
              <p style={{ margin: 0, color: colors.muted, fontSize: "13px", lineHeight: "1.5" }}>
                @{handle} hasn't registered for TIPZ yet.
                <br />Share TIPZ with them so they can receive private tips!
              </p>
            </div>
            <button onClick={handleClose} style={buttonPrimaryStyle}>
              Got it
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Wallet Selection View
  if (view === "wallet") {
    return renderInPortal(
      <div style={overlayStyle} onClick={handleClose}>
        <style>{animationStyles}</style>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="Connect Wallet" onClose={handleClose} />
          <div style={modalContentStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                Connect Wallet
              </h2>
              <button
                onClick={() => setView("amount")}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.muted,
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: "rgba(255, 68, 68, 0.1)",
                border: `1px solid ${colors.error}`,
                borderRadius: "4px",
                padding: "12px",
                marginBottom: "16px",
                color: colors.error,
                fontSize: "12px",
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {availableWallets.includes("metamask") && (
                <button
                  onClick={() => handleConnectWallet("metamask")}
                  disabled={isConnecting}
                  style={{
                    ...buttonSecondaryStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask"
                    style={{ width: "24px", height: "24px" }}
                  />
                  MetaMask
                </button>
              )}

              {availableWallets.includes("rabby") && (
                <button
                  onClick={() => handleConnectWallet("rabby")}
                  disabled={isConnecting}
                  style={{
                    ...buttonSecondaryStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 1000 1000" fill="none">
                    <path d="M500 1000C776.142 1000 1000 776.142 1000 500C1000 223.858 776.142 0 500 0C223.858 0 0 223.858 0 500C0 776.142 223.858 1000 500 1000Z" fill="#8697FF"/>
                    <path d="M741.5 467.5C755.833 481.833 762.5 498.5 762.5 517.5C762.5 536.5 755.833 553.167 742.5 567.5L567.5 742.5C553.167 755.833 536.5 762.5 517.5 762.5C498.5 762.5 481.833 755.833 467.5 741.5L292.5 566.5C279.167 553.167 272.5 537.5 272.5 519.5C272.5 501.5 279.5 485.5 293.5 471.5L399.5 365.5C340.5 349.5 297.5 295.5 297.5 232C297.5 155.5 359.5 93.5 436 93.5H564C640.5 93.5 702.5 155.5 702.5 232C702.5 295.5 659.5 349.5 600.5 365.5L741.5 467.5Z" fill="white"/>
                  </svg>
                  Rabby
                </button>
              )}

              {availableWallets.includes("walletconnect") && (
                <button
                  onClick={() => handleConnectWallet("walletconnect")}
                  disabled={isConnecting}
                  style={{
                    ...buttonSecondaryStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.primary}>
                    <path d="M6.75 8.25c3.04-2.91 7.96-2.91 11 0l.37.35a.38.38 0 010 .54l-1.25 1.2a.2.2 0 01-.27 0l-.5-.48c-2.12-2.03-5.56-2.03-7.68 0l-.54.52a.2.2 0 01-.27 0l-1.25-1.2a.38.38 0 010-.54l.4-.39zm13.58 2.47l1.11 1.07a.38.38 0 010 .54l-5.02 4.82a.4.4 0 01-.55 0l-3.56-3.42a.1.1 0 00-.14 0l-3.57 3.42a.4.4 0 01-.54 0l-5.02-4.82a.38.38 0 010-.54l1.11-1.07a.4.4 0 01.55 0l3.56 3.42a.1.1 0 00.14 0l3.57-3.42a.4.4 0 01.54 0l3.57 3.42a.1.1 0 00.14 0l3.56-3.42a.4.4 0 01.55 0z"/>
                  </svg>
                  WalletConnect
                </button>
              )}

              {availableWallets.includes("coinbase") && (
                <button
                  onClick={() => handleConnectWallet("coinbase")}
                  disabled={isConnecting}
                  style={{
                    ...buttonSecondaryStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    opacity: isConnecting ? 0.5 : 1,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.primary}>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  Coinbase Wallet
                </button>
              )}
            </div>

            {isConnecting && (
              <p style={{
                margin: "16px 0 0",
                color: colors.muted,
                fontSize: "12px",
                textAlign: "center",
              }}>
                Connecting...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Processing View
  if (view === "processing") {
    return renderInPortal(
      <div style={overlayStyle}>
        <style>{animationStyles}</style>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="Processing..." onClose={handleClose} />
          <div style={modalContentStyle}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              {/* Spinner */}
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                border: `3px solid ${colors.border}`,
                borderTopColor: colors.primary,
                borderRightColor: colors.primary,
                margin: "0 auto 24px",
                animation: "spin 0.8s cubic-bezier(0.5, 0.15, 0.5, 0.85) infinite",
              }}/>

              <h2 style={{
                margin: "0 0 8px",
                fontSize: "16px",
                fontWeight: 600,
                transition: "opacity 0.3s ease",
              }}>
                {statusMessages[transactionStatus] || "Processing..."}
              </h2>
              <p style={{ margin: 0, color: colors.muted, fontSize: "13px" }}>
                Sending ${currentAmountUsd} to @{handle}
              </p>

              {/* Progress steps with animated dots */}
              <div style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
              }}>
                {["approving", "swapping", "routing", "confirming"].map((step, i) => {
                  const steps: TransactionStatus[] = ["approving", "swapping", "routing", "confirming"]
                  const currentIndex = steps.indexOf(transactionStatus)
                  const isActive = i <= currentIndex
                  const isCurrent = i === currentIndex

                  return (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: isCurrent ? "10px" : "8px",
                          height: isCurrent ? "10px" : "8px",
                          borderRadius: "50%",
                          backgroundColor: isActive ? colors.primary : colors.border,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          animation: isCurrent ? "progressPulse 1s ease-in-out infinite" : "none",
                          boxShadow: isCurrent ? `0 0 8px ${colors.primary}` : "none",
                        }}
                      />
                      {i < 3 && (
                        <div style={{
                          width: "20px",
                          height: "2px",
                          backgroundColor: i < currentIndex ? colors.primary : colors.border,
                          transition: "background-color 0.3s ease",
                        }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Step labels */}
              <div style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "center",
                gap: "8px",
              }}>
                {["Approve", "Swap", "Route", "Confirm"].map((label, i) => {
                  const steps: TransactionStatus[] = ["approving", "swapping", "routing", "confirming"]
                  const currentIndex = steps.indexOf(transactionStatus)
                  const isActive = i <= currentIndex

                  return (
                    <span
                      key={label}
                      style={{
                        fontSize: "10px",
                        color: isActive ? colors.primary : colors.muted,
                        transition: "color 0.3s ease",
                        minWidth: "50px",
                      }}
                    >
                      {label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success View
  if (view === "success") {
    return renderInPortal(
      <div style={overlayStyle} onClick={handleClose}>
        <style>{animationStyles}</style>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="Tip Sent" onClose={handleClose} />
          <div style={modalContentStyle}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
                backgroundColor: "rgba(0, 255, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: `1px solid ${colors.success}`,
                animation: "successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2.5">
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    style={{ opacity: 0.5 }}
                  />
                  <polyline
                    points="22,4 12,14.01 9,11.01"
                    style={{
                      strokeDasharray: 24,
                      strokeDashoffset: 24,
                      animation: "checkDraw 0.4s ease-out 0.2s forwards",
                    }}
                  />
                </svg>
              </div>

              <h2 style={{
                margin: "0 0 8px",
                fontSize: "16px",
                fontWeight: 600,
                animation: "modalFadeIn 0.3s ease-out 0.1s both",
              }}>
                Tip Sent!
              </h2>
              <p style={{
                margin: "0 0 4px",
                color: colors.muted,
                fontSize: "13px",
                animation: "modalFadeIn 0.3s ease-out 0.2s both",
              }}>
                You sent ${currentAmountUsd} to @{handle}
              </p>
              <p style={{
                margin: 0,
                color: colors.muted,
                fontSize: "12px",
                animation: "modalFadeIn 0.3s ease-out 0.25s both",
              }}>
                {isDemoMode() ? "Demo transaction" : "Delivered privately"}
              </p>

              {isDemoMode() && (
                <div style={{
                  marginTop: "12px",
                  padding: "6px 12px",
                  backgroundColor: "rgba(245, 166, 35, 0.1)",
                  border: `1px solid ${colors.primary}`,
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: colors.primary,
                  animation: "modalFadeIn 0.3s ease-out 0.3s both",
                }}>
                  Demo Mode - No real funds transferred
                </div>
              )}

              {transaction?.txHash && !isDemoMode() && (
                <a
                  href={`https://explorer.zcha.in/transactions/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    color: colors.primary,
                    fontSize: "12px",
                    textDecoration: "none",
                    fontFamily: fonts.mono,
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  View Transaction
                </a>
              )}
            </div>

            <button
              onClick={handleClose}
              style={{
                ...buttonPrimaryStyle,
                animation: "modalFadeIn 0.3s ease-out 0.3s both",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error View
  if (view === "error") {
    return renderInPortal(
      <div style={overlayStyle} onClick={handleClose}>
        <style>{animationStyles}</style>
        <div style={{
          ...modalStyle,
          animation: "shake 0.5s ease-out, modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="Error" onClose={handleClose} />
          <div style={modalContentStyle}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: `1px solid ${colors.error}`,
                animation: "successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>

              <h2 style={{
                margin: "0 0 8px",
                fontSize: "16px",
                fontWeight: 600,
                animation: "modalFadeIn 0.3s ease-out 0.1s both",
              }}>
                Transaction Failed
              </h2>
              <p style={{
                margin: 0,
                color: colors.muted,
                fontSize: "13px",
                animation: "modalFadeIn 0.3s ease-out 0.2s both",
              }}>
                {error || transaction?.error || "Something went wrong. Please try again."}
              </p>
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              animation: "modalFadeIn 0.3s ease-out 0.3s both",
            }}>
              <button
                onClick={() => {
                  clearError()
                  resetTransaction()
                  setView("amount")
                }}
                style={{
                  ...buttonSecondaryStyle,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary
                  e.currentTarget.style.color = colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border
                  e.currentTarget.style.color = colors.textWhite
                }}
              >
                Try Again
              </button>
              <button onClick={handleClose} style={buttonPrimaryStyle}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handler for changing wallet
  const handleChangeWallet = async () => {
    console.log("TIPZ: handleChangeWallet called - blocking session restoration")
    // Block session restoration BEFORE disconnect to prevent race conditions
    blockSessionRestoration()
    await disconnect()
    console.log("TIPZ: Disconnected, setting forceConnect=true")
    setForceConnect(true) // Flag that next connect should force account picker
    setView("wallet")
  }

  // Main Amount Selection View
  return renderInPortal(
    <div style={overlayStyle} onClick={handleClose}>
      <style>{animationStyles}</style>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <TerminalHeader title={`Tip @${handle}`} onClose={handleClose} />
        <div style={modalContentStyle}>
          {/* Connected Wallet Info */}
          {wallet.isConnected && wallet.address && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "4px",
              marginBottom: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: colors.success,
                }} />
                <span style={{
                  fontSize: "12px",
                  color: colors.textWhite,
                  fontFamily: fonts.mono,
                }}>
                  {shortenAddress(wallet.address, 4)}
                </span>
              </div>
              <button
                onClick={handleChangeWallet}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.muted,
                  fontSize: "11px",
                  fontFamily: fonts.mono,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.border
                  e.currentTarget.style.color = colors.textWhite
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = colors.muted
                }}
              >
                Change
              </button>
            </div>
          )}

          {/* Amount Selection - USD Denominated */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
            {TIP_AMOUNTS_USD.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmountUsd(amount)
                  setCustomAmountUsd("")
                }}
                style={amountButtonStyle(selectedAmountUsd === amount && !customAmountUsd)}
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              backgroundColor: "rgba(255, 68, 68, 0.1)",
              border: `1px solid ${colors.error}`,
              borderRadius: "4px",
              padding: "12px",
              marginBottom: "16px",
              color: colors.error,
              fontSize: "12px",
            }}>
              {error}
              <button
                onClick={clearError}
                style={{
                  float: "right",
                  background: "none",
                  border: "none",
                  color: colors.error,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleTip}
            disabled={!currentAmountUsd || currentAmountUsd <= 0}
            style={{
              ...buttonPrimaryStyle,
              opacity: !currentAmountUsd || currentAmountUsd <= 0 ? 0.5 : 1,
              cursor: !currentAmountUsd || currentAmountUsd <= 0 ? "not-allowed" : "pointer",
            }}
          >
            Send ${currentAmountUsd} tip
          </button>

          {/* Collapsed Asset Selector */}
          {wallet.isConnected && supportedTokens.length > 0 && (
            <div style={{ marginTop: "16px", position: "relative" }}>
              <button
                onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  background: "none",
                  border: "none",
                  color: colors.muted,
                  fontSize: "12px",
                  fontFamily: fonts.mono,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                Paying from {selectedToken?.symbol || "..."} · {selectedToken ? parseFloat(tokenBalances.get(selectedToken.symbol) || "0").toFixed(2) : "0.00"}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: showAssetDropdown ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
              {showAssetDropdown && (
                <div style={{
                  position: "absolute",
                  bottom: "100%",
                  left: 0,
                  right: 0,
                  marginBottom: "4px",
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  zIndex: 10,
                  maxHeight: "200px",
                  overflowY: "auto",
                }}>
                  {supportedTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        selectToken(token)
                        setShowAssetDropdown(false)
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "13px",
                        backgroundColor: selectedToken?.symbol === token.symbol ? colors.bg : "transparent",
                        color: colors.textWhite,
                        border: "none",
                        borderBottom: `1px solid ${colors.border}`,
                        fontFamily: fonts.mono,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{token.symbol}</span>
                      <span style={{ color: colors.muted }}>
                        {parseFloat(tokenBalances.get(token.symbol) || "0").toFixed(4)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Privacy Notice */}
          <p style={{
            margin: "12px 0 0",
            fontSize: "11px",
            color: colors.muted,
            textAlign: "center",
          }}>
            {isDemoMode() ? (
              <span style={{ color: colors.primary }}>Demo Mode</span>
            ) : (
              "Delivered privately"
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
