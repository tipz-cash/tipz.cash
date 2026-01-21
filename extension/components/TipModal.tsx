import { useState, useEffect } from "react"
import type { Creator } from "~lib/api"
import { usePayment } from "~hooks/usePayment"
import type { TransactionStatus, WalletType } from "~lib/payment"
import { shortenAddress, formatTokenAmount } from "~lib/payment"
import { colors, fonts } from "~lib/theme"

interface TipModalProps {
  creator: Creator | null
  handle: string
  isOpen: boolean
  onClose: () => void
}

const TIP_AMOUNTS = [0.01, 0.05, 0.1, 0.5, 1]

// Status messages for transaction flow
const statusMessages: Record<TransactionStatus, string> = {
  idle: "",
  connecting: "Connecting wallet...",
  connected: "Wallet connected",
  approving: "Approving transaction...",
  swapping: "Swapping to ZEC...",
  routing: "Routing to shielded address...",
  confirming: "Confirming transaction...",
  completed: "Tip sent successfully!",
  failed: "Transaction failed",
}

// Terminal window header dots
function TerminalHeader({ title }: { title: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 16px",
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      borderRadius: "12px 12px 0 0",
    }}>
      <div style={{ display: "flex", gap: "6px" }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27CA40" }} />
      </div>
      <span style={{ color: colors.muted, fontSize: "12px", fontFamily: fonts.mono, marginLeft: "8px" }}>
        {title}
      </span>
    </div>
  )
}

export function TipModal({ creator, handle, isOpen, onClose }: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(0.05)
  const [customAmount, setCustomAmount] = useState("")
  const [view, setView] = useState<"amount" | "wallet" | "processing" | "success" | "error">("amount")

  const {
    wallet,
    availableWallets,
    isConnecting,
    transaction,
    transactionStatus,
    supportedTokens,
    selectedToken,
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
        setCustomAmount("")
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

  const currentAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  const handleTip = async () => {
    if (!creator) return

    if (!wallet.isConnected) {
      setView("wallet")
      return
    }

    await tip(currentAmount.toString(), creator.shielded_address, handle)
  }

  const handleConnectWallet = async (walletType: WalletType) => {
    await connect(walletType)
    if (!error) {
      setView("amount")
    }
  }

  const handleClose = () => {
    resetTransaction()
    onClose()
  }

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    backdropFilter: "blur(4px)",
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
    transition: "all 0.2s ease",
    fontFamily: fonts.mono,
  })

  // Creator Not Registered View
  if (!creator) {
    return (
      <div style={overlayStyle} onClick={handleClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="[TIPZ] // ERROR" />
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
    return (
      <div style={overlayStyle} onClick={handleClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="[TIPZ] // CONNECT_WALLET" />
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
    return (
      <div style={overlayStyle}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="[TIPZ] // PROCESSING" />
          <div style={modalContentStyle}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              {/* Spinner */}
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                border: `3px solid ${colors.border}`,
                borderTopColor: colors.primary,
                margin: "0 auto 24px",
                animation: "spin 1s linear infinite",
              }}/>

              <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>
                {statusMessages[transactionStatus] || "Processing..."}
              </h2>
              <p style={{ margin: 0, color: colors.muted, fontSize: "13px" }}>
                Sending {currentAmount} ZEC to @{handle}
              </p>

              {/* Progress steps */}
              <div style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
                gap: "8px",
              }}>
                {["approving", "swapping", "routing", "confirming"].map((step, i) => {
                  const steps: TransactionStatus[] = ["approving", "swapping", "routing", "confirming"]
                  const currentIndex = steps.indexOf(transactionStatus)
                  const isActive = i <= currentIndex

                  return (
                    <div
                      key={step}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: isActive ? colors.primary : colors.border,
                        transition: "background-color 0.3s ease",
                      }}
                    />
                  )
                })}
              </div>
            </div>

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    )
  }

  // Success View
  if (view === "success") {
    return (
      <div style={overlayStyle} onClick={handleClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="[TIPZ] // SUCCESS" />
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
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>

              <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>
                Tip Sent!
              </h2>
              <p style={{ margin: "0 0 4px", color: colors.muted, fontSize: "13px" }}>
                You sent {transaction?.toAmount || currentAmount} ZEC to @{handle}
              </p>
              <p style={{ margin: 0, color: colors.muted, fontSize: "12px" }}>
                They'll receive it privately via Zcash shielded transfer.
              </p>

              {transaction?.txHash && (
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
                  }}
                >
                  View Transaction
                </a>
              )}
            </div>

            <button onClick={handleClose} style={buttonPrimaryStyle}>
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error View
  if (view === "error") {
    return (
      <div style={overlayStyle} onClick={handleClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <TerminalHeader title="[TIPZ] // ERROR" />
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
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>

              <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600 }}>
                Transaction Failed
              </h2>
              <p style={{ margin: 0, color: colors.muted, fontSize: "13px" }}>
                {error || transaction?.error || "Something went wrong. Please try again."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  clearError()
                  resetTransaction()
                  setView("amount")
                }}
                style={buttonSecondaryStyle}
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

  // Main Amount Selection View
  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <TerminalHeader title={`[TIPZ] // TIP_@${handle.toUpperCase()}`} />
        <div style={modalContentStyle}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 600 }}>
                Tip @{handle}
              </h2>
              <p style={{ margin: 0, color: colors.muted, fontSize: "12px" }}>
                Send a private tip in ZEC
              </p>
            </div>
            <button
              onClick={handleClose}
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

          {/* Wallet Connection Status */}
          {wallet.isConnected ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px",
              backgroundColor: colors.surface,
              borderRadius: "4px",
              marginBottom: "16px",
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: colors.success,
                }}/>
                <span style={{ fontSize: "12px", color: colors.muted }}>
                  {shortenAddress(wallet.address || "", 6)}
                </span>
              </div>
              <button
                onClick={disconnect}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.muted,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: fonts.mono,
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView("wallet")}
              style={{
                ...buttonSecondaryStyle,
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="14" rx="2"/>
                <path d="M22 10H2M6 14h.01"/>
              </svg>
              Connect Wallet
            </button>
          )}

          {/* Token Selector (if connected) */}
          {wallet.isConnected && supportedTokens.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: colors.muted }}>
                Pay with
              </label>
              <select
                value={selectedToken?.symbol || ""}
                onChange={(e) => {
                  const token = supportedTokens.find((t) => t.symbol === e.target.value)
                  if (token) selectToken(token)
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "13px",
                  backgroundColor: colors.bg,
                  color: colors.textWhite,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: fonts.mono,
                }}
              >
                {supportedTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Selection */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: colors.muted }}>
              Amount
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {TIP_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount("")
                  }}
                  style={amountButtonStyle(selectedAmount === amount && !customAmount)}
                >
                  {amount} ZEC
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="number"
              placeholder="Custom amount (ZEC)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="0.001"
              step="0.001"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "13px",
                backgroundColor: colors.bg,
                color: colors.textWhite,
                border: `1px solid ${colors.border}`,
                borderRadius: "4px",
                boxSizing: "border-box",
                fontFamily: fonts.mono,
              }}
            />
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
            disabled={!currentAmount || currentAmount <= 0}
            style={{
              ...buttonPrimaryStyle,
              opacity: !currentAmount || currentAmount <= 0 ? 0.5 : 1,
              cursor: !currentAmount || currentAmount <= 0 ? "not-allowed" : "pointer",
            }}
          >
            {wallet.isConnected
              ? `Send ${formatTokenAmount(currentAmount.toString(), 8)} ZEC`
              : "Connect Wallet to Tip"}
          </button>

          {/* Privacy Notice */}
          <p style={{
            margin: "12px 0 0",
            fontSize: "11px",
            color: colors.muted,
            textAlign: "center",
          }}>
            Tips are sent via Zcash shielded transactions for privacy.
          </p>
        </div>
      </div>
    </div>
  )
}
