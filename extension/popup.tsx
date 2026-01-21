import { useState, useEffect } from "react"
import { usePayment } from "~hooks/usePayment"
import { shortenAddress, getTransactionHistory, type TipTransaction } from "~lib/payment"
import { colors, fonts } from "~lib/theme"

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"

// Terminal-style TIPZ Logo Component
function Logo() {
  return (
    <span style={{
      color: colors.primary,
      fontWeight: 700,
      fontSize: "16px",
      fontFamily: fonts.mono,
    }}>
      [TIPZ]
    </span>
  )
}

// Shield icon for privacy emphasis
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

// Status indicator component
function StatusIndicator({ isActive }: { isActive: boolean }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}>
      <div style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: isActive ? colors.success : colors.error,
      }}/>
      <span style={{ fontSize: "11px", color: colors.muted, fontFamily: fonts.mono }}>
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  )
}

// Recent tip item component
function RecentTipItem({ tx }: { tx: TipTransaction }) {
  const date = new Date(tx.createdAt)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      backgroundColor: colors.surface,
      borderRadius: "4px",
      border: `1px solid ${colors.border}`,
    }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 500, fontFamily: fonts.mono }}>
          @{tx.recipientHandle}
        </div>
        <div style={{ fontSize: "11px", color: colors.muted, fontFamily: fonts.mono }}>
          {formattedDate}
        </div>
      </div>
      <div style={{
        fontSize: "13px",
        fontWeight: 600,
        color: colors.primary,
        fontFamily: fonts.mono,
      }}>
        {tx.toAmount} ZEC
      </div>
    </div>
  )
}

function IndexPopup() {
  const { wallet, isConnecting, connect, disconnect, availableWallets } = usePayment()
  const [recentTips, setRecentTips] = useState<TipTransaction[]>([])
  const [activeTab, setActiveTab] = useState<"home" | "history">("home")

  // Load recent tips on mount
  useEffect(() => {
    getTransactionHistory().then((history) => {
      setRecentTips(history.slice(0, 5))
    })
  }, [])

  const buttonPrimaryStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "14px 24px",
    fontSize: "14px",
    fontWeight: 600,
    color: colors.bg,
    backgroundColor: colors.primary,
    border: "none",
    borderRadius: "4px",
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 200ms ease",
    boxSizing: "border-box",
    fontFamily: fonts.mono,
  }

  const buttonSecondaryStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px",
    fontSize: "13px",
    fontWeight: 500,
    color: colors.textWhite,
    backgroundColor: "transparent",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 200ms ease",
    textDecoration: "none",
    fontFamily: fonts.mono,
  }

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "8px",
    fontSize: "12px",
    fontWeight: 500,
    color: isActive ? colors.textWhite : colors.muted,
    backgroundColor: isActive ? colors.surface : "transparent",
    border: isActive ? `1px solid ${colors.border}` : "1px solid transparent",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: fonts.mono,
  })

  return (
    <div
      style={{
        width: "320px",
        backgroundColor: colors.bg,
        fontFamily: fonts.mono,
        color: colors.textWhite,
      }}
    >
      {/* Header */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Logo />
            <span style={{ color: colors.muted, fontSize: "11px", fontFamily: fonts.mono }}>
              v0.1.0
            </span>
          </div>
          <StatusIndicator isActive={true} />
        </div>

        {/* Wallet Connection */}
        {wallet.isConnected ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            backgroundColor: colors.surface,
            borderRadius: "4px",
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: colors.success,
              }}/>
              <span style={{ fontSize: "12px", fontFamily: fonts.mono }}>
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
                fontSize: "11px",
                padding: "4px 8px",
                fontFamily: fonts.mono,
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              // Try MetaMask first, fallback to WalletConnect
              const walletType = availableWallets.includes("metamask")
                ? "metamask"
                : "walletconnect"
              connect(walletType)
            }}
            disabled={isConnecting}
            style={{
              ...buttonSecondaryStyle,
              opacity: isConnecting ? 0.5 : 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="14" rx="2"/>
              <path d="M22 10H2M6 14h.01"/>
            </svg>
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{
        padding: "12px 20px 0",
        display: "flex",
        gap: "8px",
      }}>
        <button
          onClick={() => setActiveTab("home")}
          style={tabStyle(activeTab === "home")}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={tabStyle(activeTab === "history")}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px" }}>
        {activeTab === "home" ? (
          <>
            {/* Info card */}
            <div style={{
              backgroundColor: colors.surface,
              borderRadius: "4px",
              padding: "14px",
              marginBottom: "16px",
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(245, 166, 35, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${colors.primary}`,
                }}>
                  <ShieldIcon />
                </div>
                <p style={{
                  margin: 0,
                  fontSize: "12px",
                  color: colors.text,
                  lineHeight: 1.5,
                  fontFamily: fonts.mono,
                }}>
                  Look for the <span style={{ color: colors.primary, fontWeight: 500 }}>TIP</span> button on tweets and Substack articles to send private tips.
                </p>
              </div>
            </div>

            {/* Recent Tips Preview */}
            {recentTips.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}>
                  <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 600, fontFamily: fonts.mono }}>
                    Recent Tips
                  </h3>
                  <button
                    onClick={() => setActiveTab("history")}
                    style={{
                      background: "none",
                      border: "none",
                      color: colors.primary,
                      cursor: "pointer",
                      fontSize: "11px",
                      padding: 0,
                      fontFamily: fonts.mono,
                    }}
                  >
                    View all
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recentTips.slice(0, 2).map((tx) => (
                    <RecentTipItem key={tx.id} tx={tx} />
                  ))}
                </div>
              </div>
            )}

            {/* Primary CTA */}
            <a
              href={`${API_URL}/design/v4-terminal#register`}
              target="_blank"
              rel="noopener noreferrer"
              style={buttonPrimaryStyle}
            >
              Register as Creator
            </a>

            {/* Secondary link */}
            <div style={{
              marginTop: "12px",
              textAlign: "center",
            }}>
              <a
                href={`${API_URL}/design/v4-terminal`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.muted,
                  fontSize: "11px",
                  textDecoration: "none",
                  fontFamily: fonts.mono,
                }}
              >
                Learn more about TIPZ
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Transaction History */}
            <h3 style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 600, fontFamily: fonts.mono }}>
              Tip History
            </h3>
            {recentTips.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentTips.map((tx) => (
                  <RecentTipItem key={tx.id} tx={tx} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "24px 16px",
                color: colors.muted,
              }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ margin: "0 auto 12px", opacity: 0.5 }}
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <p style={{ margin: 0, fontSize: "13px", fontFamily: fonts.mono }}>No tips yet</p>
                <p style={{ margin: "4px 0 0", fontSize: "11px", fontFamily: fonts.mono }}>
                  Your tip history will appear here
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "14px 20px",
        borderTop: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: colors.success,
          }} />
          <span style={{ fontSize: "11px", color: colors.muted, fontFamily: fonts.mono }}>
            Powered by Zcash
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <a
            href="https://github.com/tipz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.muted, fontSize: "11px", textDecoration: "none", fontFamily: fonts.mono }}
          >
            GitHub
          </a>
          <a
            href={`${API_URL}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.muted, fontSize: "11px", textDecoration: "none", fontFamily: fonts.mono }}
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
