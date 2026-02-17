"use client"

import { useState } from "react"
import { shortenAddress, type WalletState, type WalletType } from "@/lib/wallet"
import { tokens, keyframes } from "./designTokens"

interface WalletConnectProps {
  walletState: WalletState
  isConnecting: boolean
  isAvailable: boolean
  detectedWallet: WalletType | null
  error: string | null
  onConnect: (walletType?: WalletType) => void
  onDisconnect: () => void
  isMobile?: boolean
}

// Reordered: Rabby first
const WALLET_OPTIONS: {
  type: WalletType
  name: string
  icon: string
  gradient: string
  description: string
  badge?: string
}[] = [
  {
    type: "rabby",
    name: "Rabby",
    icon: "/icons/rabby.png",
    gradient: "linear-gradient(135deg, #7B3FE4, #8C5CF2)",
    description: "Best for security & simulation",
    badge: "Most Popular"
  },
  {
    type: "metamask",
    name: "MetaMask",
    icon: "/icons/metamask.svg",
    gradient: "linear-gradient(135deg, #E2761B, #F5841F)",
    description: "Most widely used"
  },
  {
    type: "phantom" as WalletType,
    name: "Phantom",
    icon: "/icons/phantom.png",
    gradient: "linear-gradient(135deg, #AB9FF2, #7C3AED)",
    description: "Solana wallet"
  },
]

export function WalletConnect({
  walletState,
  isConnecting,
  isAvailable,
  detectedWallet,
  error,
  onConnect,
  onDisconnect,
  isMobile = false,
}: WalletConnectProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [hoveredWallet, setHoveredWallet] = useState<WalletType | null>(null)

  // Mobile deep link for MetaMask
  const handleMobileConnect = () => {
    const currentUrl = window.location.href
    const deepLink = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, "")}`
    window.location.href = deepLink
  }

  const handleWalletSelect = (walletType: WalletType) => {
    setIsDrawerOpen(false)
    onConnect(walletType)
  }

  // Connected state - glass style with signal green
  if (walletState.isConnected && walletState.address) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "rgba(0, 255, 148, 0.1)",
          border: `1px solid rgba(0, 255, 148, 0.25)`,
          borderRadius: tokens.radius.md,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
          {/* Status dot */}
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: tokens.colors.signalGreen,
            }}
          />
          <div>
            <div
              style={{
                color: tokens.colors.textBright,
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: tokens.font.mono,
              }}
            >
              {shortenAddress(walletState.address)}
            </div>
            <div
              style={{
                color: tokens.colors.textMuted,
                fontSize: "11px",
                fontFamily: tokens.font.sans,
              }}
            >
              {walletState.balance
                ? `${parseFloat(walletState.balance.amount).toFixed(4)} ${walletState.balance.symbol}`
                : "Connected"}
            </div>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          style={{
            padding: "6px 10px",
            background: "rgba(255, 255, 255, 0.05)",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            borderRadius: tokens.radius.sm,
            color: tokens.colors.textMuted,
            fontSize: "11px",
            fontFamily: tokens.font.sans,
            cursor: "pointer",
            transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = tokens.colors.error
            e.currentTarget.style.color = tokens.colors.error
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            e.currentTarget.style.color = tokens.colors.textMuted
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
          }}
        >
          Disconnect
        </button>
        <style>{keyframes}</style>
      </div>
    )
  }

  // No wallet available - softer info styling instead of error
  if (!isAvailable) {
    if (isMobile) {
      return (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: tokens.colors.textMuted,
              fontSize: "13px",
              fontFamily: tokens.font.sans,
              marginBottom: tokens.space.md,
            }}
          >
            Connect your wallet to send a tip
          </p>
          <button
            onClick={handleMobileConnect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: tokens.space.sm,
              padding: "14px 20px",
              background: `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
              border: "none",
              borderRadius: tokens.radius.md,
              color: "#050505",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: tokens.font.sans,
              cursor: "pointer",
              boxShadow: isHovered
                ? "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 6px 20px rgba(255, 215, 0, 0.4)"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)",
              transform: isHovered ? "translateY(-1px)" : "translateY(0)",
              transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
            }}
          >
            <span>Open in MetaMask</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>

          {/* Normie lifeline */}
          <a
            href="https://rabby.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: "11px",
              color: tokens.colors.textMuted,
              marginTop: "12px",
              textDecoration: "none",
            }}
          >
            New to crypto? Create a wallet.
          </a>
          <style>{keyframes}</style>
        </div>
      )
    }

    // Desktop: glass info styling
    return (
      <div
        style={{
          padding: tokens.space.lg,
          background: "rgba(59, 130, 246, 0.1)",
          border: `1px solid rgba(59, 130, 246, 0.25)`,
          borderRadius: tokens.radius.md,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            margin: "0 auto 12px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.info} strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        </div>
        <p
          style={{
            color: tokens.colors.text,
            fontSize: "14px",
            fontFamily: tokens.font.sans,
            marginBottom: tokens.space.md,
          }}
        >
          No wallet detected
        </p>
        <a
          href="https://rabby.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: tokens.space.xs,
            color: tokens.colors.gold,
            fontSize: "13px",
            fontFamily: tokens.font.sans,
            textDecoration: "none",
            padding: `${tokens.space.sm}px ${tokens.space.md}px`,
            background: "rgba(255, 215, 0, 0.15)",
            borderRadius: tokens.radius.md,
            transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
          }}
        >
          Install Rabby Wallet
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        <style>{keyframes}</style>
      </div>
    )
  }

  // Connecting state - glass style
  if (isConnecting) {
    return (
      <div
        style={{
          padding: tokens.space.lg,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            margin: "0 auto 12px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `2px solid rgba(255, 255, 255, 0.1)`,
              borderTopColor: tokens.colors.gold,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <p
          style={{
            color: tokens.colors.textMuted,
            fontSize: "13px",
            fontFamily: tokens.font.sans,
          }}
        >
          Connecting...
        </p>
        <style>{keyframes}</style>
      </div>
    )
  }

  // Error state - glass style
  if (error) {
    return (
      <div
        style={{
          padding: "10px 12px",
          background: "rgba(239, 68, 68, 0.08)",
          border: `1px solid rgba(239, 68, 68, 0.25)`,
          borderRadius: tokens.radius.md,
          marginBottom: tokens.space.md,
          display: "flex",
          alignItems: "center",
          gap: tokens.space.sm,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.error} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ color: tokens.colors.error, fontSize: "12px", fontFamily: tokens.font.sans, margin: 0 }}>
          {error}
        </p>
        <style>{keyframes}</style>
      </div>
    )
  }

  // Ignition button + Drawer pattern
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          color: tokens.colors.textMuted,
          fontSize: "13px",
          fontFamily: tokens.font.sans,
          marginBottom: tokens.space.md,
        }}
      >
        Connect your wallet to send a tip
      </p>

      {/* Ignition Button - Hollow/transparent with pulse */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space.md,
          padding: "14px 20px",
          background: isHovered ? "rgba(255, 215, 0, 0.08)" : "transparent",
          border: `1px solid ${isHovered ? tokens.colors.gold : "rgba(255, 255, 255, 0.2)"}`,
          borderRadius: tokens.radius.md,
          color: isHovered ? tokens.colors.gold : tokens.colors.text,
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: tokens.font.sans,
          cursor: "pointer",
          transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
          animation: isHovered ? "none" : "ignitionPulse 2s ease-in-out infinite",
        }}
      >
        {/* Greyscale wallet logos */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {WALLET_OPTIONS.map((wallet) => (
            <img
              key={wallet.type}
              src={wallet.icon}
              alt={wallet.name}
              width={20}
              height={20}
              style={{
                borderRadius: "4px",
                filter: isHovered ? "none" : "grayscale(100%)",
                opacity: isHovered ? 1 : 0.6,
                transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
              }}
            />
          ))}
        </div>
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
      </button>

      {/* Normie lifeline */}
      <a
        href="https://rabby.io"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          fontSize: "11px",
          color: tokens.colors.textMuted,
          marginTop: "12px",
          textDecoration: "none",
        }}
      >
        New to crypto? Create a wallet.
      </a>

      {/* Bottom Sheet Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
              animation: "fadeIn 200ms ease-out",
            }}
          />

          {/* Drawer */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: tokens.colors.surface,
              borderTopLeftRadius: tokens.radius.xl,
              borderTopRightRadius: tokens.radius.xl,
              padding: tokens.space.lg,
              paddingBottom: "env(safe-area-inset-bottom, 20px)",
              zIndex: 101,
              animation: "slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Drawer handle */}
            <div
              style={{
                width: "36px",
                height: "4px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "2px",
                margin: "0 auto 16px",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: tokens.space.lg,
              }}
            >
              <h3
                style={{
                  color: tokens.colors.textBright,
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: tokens.font.sans,
                  margin: 0,
                }}
              >
                Select Payment Method
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: tokens.colors.textMuted,
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Wallet Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.sm }}>
              {WALLET_OPTIONS.map((wallet) => (
                <button
                  key={wallet.type}
                  onClick={() => handleWalletSelect(wallet.type)}
                  onMouseEnter={() => setHoveredWallet(wallet.type)}
                  onMouseLeave={() => setHoveredWallet(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.space.md,
                    padding: "14px 16px",
                    background: hoveredWallet === wallet.type
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${hoveredWallet === wallet.type
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: tokens.radius.md,
                    cursor: "pointer",
                    transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
                    textAlign: "left",
                  }}
                >
                  {/* Wallet icon */}
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    width={40}
                    height={40}
                    style={{
                      borderRadius: "10px",
                      flexShrink: 0,
                    }}
                  />

                  {/* Wallet info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: tokens.space.sm,
                        marginBottom: "2px",
                      }}
                    >
                      <span
                        style={{
                          color: tokens.colors.textBright,
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: tokens.font.sans,
                        }}
                      >
                        {wallet.name}
                      </span>
                      {wallet.badge && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 6px",
                            background: "rgba(0, 255, 148, 0.15)",
                            borderRadius: "4px",
                            color: tokens.colors.signalGreen,
                            fontSize: "9px",
                            fontWeight: 600,
                            fontFamily: tokens.font.sans,
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                          }}
                        >
                          <span style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: tokens.colors.signalGreen
                          }} />
                          {wallet.badge}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        color: tokens.colors.textMuted,
                        fontSize: "12px",
                        fontFamily: tokens.font.sans,
                      }}
                    >
                      {wallet.description}
                    </span>
                  </div>

                  {/* Arrow */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={tokens.colors.textMuted}
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}

              {/* WalletConnect option */}
              <button
                onClick={() => handleWalletSelect("walletconnect" as WalletType)}
                onMouseEnter={() => setHoveredWallet("walletconnect" as WalletType)}
                onMouseLeave={() => setHoveredWallet(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space.md,
                  padding: "14px 16px",
                  background: hoveredWallet === "walletconnect"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${hoveredWallet === "walletconnect"
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(255, 255, 255, 0.08)"}`,
                  borderRadius: tokens.radius.md,
                  cursor: "pointer",
                  transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
                  textAlign: "left",
                }}
              >
                {/* WalletConnect icon */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3B99FC, #2D7DD2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  WC
                </div>

                {/* WalletConnect info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: tokens.colors.textBright,
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: tokens.font.sans,
                      marginBottom: "2px",
                    }}
                  >
                    WalletConnect
                  </div>
                  <span
                    style={{
                      color: tokens.colors.textMuted,
                      fontSize: "12px",
                      fontFamily: tokens.font.sans,
                    }}
                  >
                    Scan QR code
                  </span>
                </div>

                {/* Arrow */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={tokens.colors.textMuted}
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Normie lifeline in drawer */}
            <div
              style={{
                marginTop: tokens.space.lg,
                paddingTop: tokens.space.md,
                borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
                textAlign: "center",
              }}
            >
              <a
                href="https://rabby.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  color: tokens.colors.textMuted,
                  textDecoration: "none",
                }}
              >
                New to crypto? <span style={{ color: tokens.colors.gold }}>Create a wallet</span>
              </a>
            </div>
          </div>
        </>
      )}

      <style>{`
        ${keyframes}

        @keyframes ignitionPulse {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.2);
          }
          50% {
            border-color: rgba(255, 215, 0, 0.4);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
