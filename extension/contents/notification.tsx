import type { PlasmoCSConfig } from "plasmo"
import { createRoot } from "react-dom/client"
import { useState, useEffect } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

// Notification container ID
const CONTAINER_ID = "tipz-notification-container"

// Theme colors (inline to avoid import issues in content script)
const colors = {
  bg: "#050505",
  primary: "#FFD700",
  primaryGlow: "rgba(255, 215, 0, 0.15)",
  primaryGlowStrong: "rgba(255, 215, 0, 0.4)",
  success: "#00FF94",
  successGlow: "rgba(0, 255, 148, 0.3)",
  text: "rgba(255, 255, 255, 0.85)",
  textWhite: "#FFFFFF",
  muted: "rgba(255, 255, 255, 0.6)",
  border: "rgba(255, 255, 255, 0.1)",
  borderGold: "rgba(255, 215, 0, 0.4)",
  cardBg: "rgba(26, 26, 26, 0.95)",
}

interface TipNotificationData {
  amount: string
  amountUsd?: string
  message?: string
  handle?: string
}

interface MessageNotificationData {
  text: string
}

// Tip Notification Component - Compact version
function TipNotification({ data, onClose }: { data: TipNotificationData; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, 6000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 2147483647,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        transform: isVisible && !isExiting ? "translateX(0)" : "translateX(120%)",
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          width: "260px",
          background: colors.cardBg,
          backdropFilter: "blur(24px)",
          borderRadius: "12px",
          border: `1px solid ${colors.borderGold}`,
          boxShadow: `0 4px 24px rgba(0, 0, 0, 0.4), 0 0 30px ${colors.primaryGlow}`,
          overflow: "hidden",
        }}
      >
        {/* Gold accent bar */}
        <div
          style={{
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 50%, transparent 100%)`,
          }}
        />

        <div style={{ padding: "14px 16px" }}>
          {/* Header row with amount */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  color: colors.primary,
                  fontWeight: 700,
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  textShadow: `0 0 12px ${colors.primaryGlow}`,
                  letterSpacing: "0.5px",
                }}
              >
                TIPZ
              </span>
              <span style={{ fontSize: "11px", color: colors.muted }}>Tip Received</span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "transparent",
                border: "none",
                color: colors.muted,
                cursor: "pointer",
                padding: "2px",
                display: "flex",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* USD Amount - Primary */}
          <div style={{ marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: colors.success,
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 20px ${colors.successGlow}`,
                lineHeight: 1,
              }}
            >
              +{data.amountUsd || "$0.00"}
            </span>
          </div>

          {/* ZEC Amount - Secondary */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: data.message ? "10px" : "6px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: colors.muted,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {parseFloat(data.amount).toFixed(4)} ZEC
            </span>
          </div>

          {/* Message if present */}
          {data.message && (
            <div
              style={{
                padding: "10px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "6px",
                border: `1px solid ${colors.border}`,
                marginBottom: "6px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: colors.text, lineHeight: 1.4 }}>
                "{data.message}"
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: colors.success,
                boxShadow: `0 0 6px ${colors.successGlow}`,
              }}
            />
            <span style={{ fontSize: "10px", color: colors.muted }}>Powered by Zcash</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Message Notification Component
function MessageNotification({ data, onClose }: { data: MessageNotificationData; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  // Truncate message for notification
  const displayText = data.text.length > 100 ? data.text.slice(0, 97) + "..." : data.text

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 2147483647,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        transform: isVisible && !isExiting ? "translateX(0)" : "translateX(120%)",
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          width: "300px",
          background: colors.cardBg,
          backdropFilter: "blur(24px)",
          borderRadius: "12px",
          border: `1px solid ${colors.borderGold}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${colors.primaryGlow}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 50%, transparent 100%)`,
          }}
        />

        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
              {/* Lock icon */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: colors.primaryGlow,
                  border: `1px solid ${colors.borderGold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: colors.primary,
                    marginBottom: "4px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Private Message
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: colors.text,
                    lineHeight: 1.4,
                  }}
                >
                  {displayText}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "transparent",
                border: "none",
                color: colors.muted,
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notification Manager
let notificationRoot: ReturnType<typeof createRoot> | null = null
let currentNotification: { type: string; data: any } | null = null

function showNotification(type: "tip" | "message", data: TipNotificationData | MessageNotificationData) {
  // Get or create container
  let container = document.getElementById(CONTAINER_ID)
  if (!container) {
    container = document.createElement("div")
    container.id = CONTAINER_ID
    document.body.appendChild(container)
  }

  // Create React root if needed
  if (!notificationRoot) {
    notificationRoot = createRoot(container)
  }

  currentNotification = { type, data }

  const handleClose = () => {
    currentNotification = null
    notificationRoot?.render(null)
  }

  if (type === "tip") {
    notificationRoot.render(<TipNotification data={data as TipNotificationData} onClose={handleClose} />)
  } else {
    notificationRoot.render(<MessageNotification data={data as MessageNotificationData} onClose={handleClose} />)
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("TIPZ Notification: Received message", message)

  if (message.type === "TIPZ_SHOW_TIP_NOTIFICATION") {
    showNotification("tip", message.data)
    sendResponse({ success: true })
  } else if (message.type === "TIPZ_SHOW_MESSAGE_NOTIFICATION") {
    showNotification("message", message.data)
    sendResponse({ success: true })
  }

  return true
})

console.log("TIPZ: Notification content script loaded")
