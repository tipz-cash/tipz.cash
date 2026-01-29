import React, { useState, useEffect, useMemo } from "react"
import "~styles.css"
import { getLinkedCreator, clearLinkedCreator, onLinkedCreatorChange, type CreatorIdentity } from "~lib/identity"
import { getReceivedTips, getRevenueStats, type ReceivedTip, type RevenueStats } from "~lib/api"
import { colors, fonts, typography, radius, shadows, glass, transitions } from "~lib/theme"
import { sanitizeMessage, truncateText } from "~lib/sanitize"

// Stored message type from background.ts
interface StoredMessage {
  depositAddress: string
  text: string
  receivedAt: number
  amountZec?: string
  amountUsd?: string
}

// Unified activity item for the feed
interface ActivityItem {
  id: string
  type: "tip" | "message"
  amount?: string
  amountUsd?: string
  message?: string
  timestamp: number
}

const WEB_URL = process.env.PLASMO_PUBLIC_API_URL || "https://tipz.cash"

// In-popup tip notification
interface PopupNotification {
  type: "tip" | "message"
  amount?: string
  amountUsd?: string
  message?: string
  text?: string
}

// Compact header with logo and status
function Header({ identity }: { identity: CreatorIdentity | null }) {
  return (
    <div style={{
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${colors.border}`,
    }}>
      {/* Logo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        <span style={{
          width: "6px",
          height: "6px",
          borderRadius: radius.full,
          backgroundColor: colors.primary,
          boxShadow: shadows.newItemGlow,
        }} />
        <span style={{
          color: colors.primary,
          fontWeight: 600,
          fontSize: "15px",
          fontFamily: fonts.mono,
          letterSpacing: "0.5px",
        }}>
          TIPZ
        </span>
      </div>

      {/* Status */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        {identity && (
          <span style={{
            fontSize: "12px",
            color: colors.muted,
            fontFamily: fonts.sans,
          }}>
            @{identity.handle}
          </span>
        )}
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: radius.full,
          backgroundColor: identity ? colors.success : colors.muted,
          animation: identity ? "statusPulse 2s ease-in-out infinite" : "none",
        }} />
      </div>
    </div>
  )
}

// Hero stat - Total earnings prominently displayed
function HeroStat({ stats, isLoading }: { stats: RevenueStats | null; isLoading: boolean }) {
  const totalUsd = stats?.total_usd || "$0.00"
  const totalZec = stats ? parseFloat(stats.total_zec).toFixed(4) : "0.0000"

  if (isLoading) {
    return (
      <div style={{
        padding: "32px 20px 24px",
        textAlign: "center",
      }}>
        <div style={{
          width: "120px",
          height: "40px",
          background: `linear-gradient(90deg, ${colors.border} 25%, rgba(255,255,255,0.06) 50%, ${colors.border} 75%)`,
          backgroundSize: "200% 100%",
          borderRadius: radius.sm,
          margin: "0 auto 8px",
          animation: "shimmer 1.5s ease-in-out infinite",
        }} />
        <div style={{
          width: "80px",
          height: "16px",
          background: `linear-gradient(90deg, ${colors.border} 25%, rgba(255,255,255,0.06) 50%, ${colors.border} 75%)`,
          backgroundSize: "200% 100%",
          borderRadius: radius.xs,
          margin: "0 auto",
          animation: "shimmer 1.5s ease-in-out infinite",
        }} />
      </div>
    )
  }

  return (
    <div style={{
      padding: "32px 20px 24px",
      textAlign: "center",
      animation: "fadeIn 0.3s ease-out",
    }}>
      {/* TIPZ Earnings label */}
      <div style={{
        fontSize: "11px",
        fontWeight: 500,
        fontFamily: fonts.sans,
        color: colors.muted,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "8px",
      }}>
        TIPZ EARNINGS
      </div>
      {/* Hero amount */}
      <div style={{
        fontSize: typography.hero.size,
        fontWeight: typography.hero.weight,
        fontFamily: typography.hero.family,
        color: colors.primary,
        animation: "heroGlow 3s ease-in-out infinite",
        marginBottom: "4px",
        letterSpacing: "-0.5px",
      }}>
        {totalUsd}
      </div>
      {/* ZEC equivalent */}
      <div style={{
        fontSize: "13px",
        fontFamily: fonts.mono,
        color: colors.muted,
        fontWeight: 400,
      }}>
        ≈ {totalZec} ZEC
      </div>
      {/* Privacy message */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        marginTop: "12px",
        fontSize: "10px",
        color: colors.muted,
      }}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.purple}
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span>Direct ZEC stays private</span>
      </div>
    </div>
  )
}

// Quick action pill button
function ActionPill({
  icon,
  label,
  onClick,
  isActive = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 14px",
        fontSize: "12px",
        fontWeight: 500,
        fontFamily: fonts.sans,
        color: isActive ? colors.bg : colors.text,
        background: isActive
          ? colors.primary
          : isHovered
          ? colors.surfaceHover
          : colors.surface,
        border: `1px solid ${isActive ? colors.primary : colors.border}`,
        borderRadius: radius.full,
        cursor: "pointer",
        transition: `all ${transitions.fast}`,
        transform: isHovered && !isActive ? "scale(1.02)" : "scale(1)",
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// Quick actions row
function QuickActions({
  onStampClick,
  onShareClick,
  stampActive,
}: {
  onStampClick: () => void
  onShareClick: () => void
  stampActive: boolean
}) {
  return (
    <div style={{
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      padding: "0 20px 20px",
    }}>
      <ActionPill
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        }
        label="Stamp"
        onClick={onStampClick}
        isActive={stampActive}
      />
      <ActionPill
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        }
        label="Share"
        onClick={onShareClick}
      />
    </div>
  )
}

// Section divider with label
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "0 20px",
      marginBottom: "12px",
    }}>
      <span style={{
        fontSize: typography.section.size,
        fontWeight: typography.section.weight,
        fontFamily: typography.section.family,
        textTransform: "uppercase" as const,
        letterSpacing: typography.section.tracking,
        color: colors.muted,
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: "1px",
        background: `linear-gradient(90deg, ${colors.border} 0%, transparent 100%)`,
      }} />
    </div>
  )
}

// Unified activity feed item
function ActivityFeedItem({
  item,
  index,
}: {
  item: ActivityItem
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Calculate relative time
  const now = Date.now()
  const diffMs = now - item.timestamp
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let relativeTime: string
  if (diffMins < 1) {
    relativeTime = "now"
  } else if (diffMins < 60) {
    relativeTime = `${diffMins}m ago`
  } else if (diffHours < 24) {
    relativeTime = `${diffHours}h ago`
  } else if (diffDays < 7) {
    relativeTime = `${diffDays}d ago`
  } else {
    relativeTime = new Date(item.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  // Sanitize message for display
  const displayMessage = item.message
    ? truncateText(sanitizeMessage(item.message), 80)
    : null

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "12px 14px",
        background: isHovered ? colors.surfaceHover : "transparent",
        borderRadius: radius.sm,
        transition: `all ${transitions.fast}`,
        animation: "staggerFadeIn 0.3s ease-out forwards",
        animationDelay: `${index * 50}ms`,
        opacity: 0,
      }}
    >
      {/* Top row: Amount + Time */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: displayMessage ? "6px" : 0,
      }}>
        <span style={{
          fontSize: "15px",
          fontWeight: 600,
          fontFamily: fonts.mono,
          color: colors.success,
        }}>
          +{item.amountUsd || "$0.00"}
        </span>
        <span style={{
          fontSize: "11px",
          fontFamily: fonts.sans,
          color: colors.textSubtle,
        }}>
          {relativeTime}
        </span>
      </div>

      {/* Message row */}
      {displayMessage && (
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "6px",
        }}>
          {/* Lock icon for encrypted */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.purple}
            strokeWidth="2"
            style={{ flexShrink: 0, marginTop: "2px" }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span style={{
            fontSize: "12px",
            fontFamily: fonts.sans,
            color: colors.text,
            fontStyle: "italic",
            lineHeight: 1.4,
          }}>
            "{displayMessage}"
          </span>
        </div>
      )}
    </div>
  )
}

// Activity feed container
function ActivityFeed({
  tips,
  localTips,
  messages,
  isLoading,
  handle,
}: {
  tips: ReceivedTip[]
  localTips: LocalTip[]
  messages: StoredMessage[]
  isLoading: boolean
  handle: string
}) {
  // State for copy button in empty state
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle")

  // Merge tips, local tips, and messages into unified activity feed
  const activityItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = []
    const seenIds = new Set<string>()

    // Add local tips first (most recent, realtime)
    localTips.forEach((tip) => {
      if (!seenIds.has(tip.id)) {
        seenIds.add(tip.id)
        items.push({
          id: tip.id,
          type: "tip",
          amount: tip.amount,
          amountUsd: tip.amountUsd,
          message: tip.message,
          timestamp: tip.receivedAt,
        })
      }
    })

    // Add API tips (avoid duplicates)
    tips.forEach((tip) => {
      if (!seenIds.has(tip.id)) {
        seenIds.add(tip.id)
        items.push({
          id: tip.id,
          type: "tip",
          amount: tip.amount,
          amountUsd: `$${(parseFloat(tip.amount) * 50).toFixed(2)}`, // Approximate USD
          timestamp: new Date(tip.created_at).getTime(),
        })
      }
    })

    // Add messages
    messages.forEach((msg, idx) => {
      items.push({
        id: `msg-${msg.depositAddress}-${idx}`,
        type: "message",
        amount: msg.amountZec,
        amountUsd: msg.amountUsd || "$0.00",
        message: msg.text,
        timestamp: msg.receivedAt,
      })
    })

    // Sort by timestamp descending
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8)
  }, [tips, localTips, messages])

  if (isLoading) {
    return (
      <div style={{ padding: "0 20px" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: "12px 14px",
              marginBottom: "4px",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}>
              <div style={{
                width: "60px",
                height: "16px",
                background: `linear-gradient(90deg, ${colors.border} 25%, rgba(255,255,255,0.06) 50%, ${colors.border} 75%)`,
                backgroundSize: "200% 100%",
                borderRadius: radius.xs,
                animation: "shimmer 1.5s ease-in-out infinite",
              }} />
              <div style={{
                width: "40px",
                height: "12px",
                background: `linear-gradient(90deg, ${colors.border} 25%, rgba(255,255,255,0.06) 50%, ${colors.border} 75%)`,
                backgroundSize: "200% 100%",
                borderRadius: radius.xs,
                animation: "shimmer 1.5s ease-in-out infinite",
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activityItems.length === 0) {
    const tipUrl = `tipz.cash/${handle}`

    const handleCopy = async () => {
      await navigator.clipboard.writeText(`https://${tipUrl}`)
      setCopyStatus("copied")
      setTimeout(() => setCopyStatus("idle"), 2000)
    }

    const handleShare = () => {
      window.open(`https://${tipUrl}`, "_blank")
    }

    return (
      <div style={{
        padding: "24px 20px",
        textAlign: "center",
      }}>
        {/* Mini tip card preview */}
        <div style={{
          padding: "16px",
          background: colors.surface,
          border: `1px solid ${colors.borderGold}`,
          borderRadius: radius.md,
          marginBottom: "16px",
          boxShadow: `0 0 20px ${colors.primaryGlow}`,
          animation: "cardGlow 3s ease-in-out infinite",
        }}>
          {/* URL */}
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: fonts.mono,
            color: colors.primary,
            marginBottom: "8px",
          }}>
            {tipUrl}
          </div>

          {/* Divider line */}
          <div style={{
            height: "1px",
            background: colors.border,
            margin: "8px 0",
          }} />

          {/* Privacy tagline */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "11px",
            color: colors.muted,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span>Private tips welcome</span>
          </div>
        </div>

        {/* Encouraging text */}
        <p style={{
          fontSize: "13px",
          color: colors.muted,
          fontFamily: fonts.sans,
          margin: "0 0 16px",
        }}>
          Ready to receive tips
        </p>

        {/* Action buttons */}
        <div style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
        }}>
          <button
            onClick={handleCopy}
            style={{
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: fonts.sans,
              color: copyStatus === "copied" ? colors.success : colors.text,
              background: colors.surface,
              border: `1px solid ${copyStatus === "copied" ? colors.success : colors.border}`,
              borderRadius: radius.sm,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: `all ${transitions.fast}`,
            }}
          >
            {copyStatus === "copied" ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy URL
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            style={{
              padding: "10px 16px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: fonts.sans,
              color: colors.bg,
              background: colors.primary,
              border: "none",
              borderRadius: radius.sm,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            Share
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: "0 6px",
      maxHeight: "200px",
      overflowY: "auto",
    }}>
      {activityItems.map((item, index) => (
        <ActivityFeedItem key={item.id} item={item} index={index} />
      ))}
    </div>
  )
}

// Collapsible image stamp tool
function ImageStampTool({
  handle,
  isOpen,
  onClose,
}: {
  handle: string
  isOpen: boolean
  onClose: () => void
}) {
  const [image, setImage] = useState<string | null>(null)
  const [stampedImage, setStampedImage] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle")
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const tipUrl = `tipz.cash/${handle}`

  // Handle paste from clipboard
  useEffect(() => {
    if (!isOpen) return

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              setImage(e.target?.result as string)
              setStampedImage(null)
            }
            reader.readAsDataURL(file)
          }
          break
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isOpen])

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setStampedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Stamp the image when loaded
  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const largerDim = Math.max(img.width, img.height)
      const stampWidthTarget = largerDim * 0.18
      const fontSize = Math.max(16, Math.min(48, stampWidthTarget / 8))
      const padding = fontSize * 0.6
      const margin = fontSize * 1.2
      const borderRadius = fontSize * 0.35
      const borderWidth = Math.max(2, fontSize * 0.12)

      ctx.font = `600 ${fontSize}px "JetBrains Mono", "SF Mono", monospace`
      const textWidth = ctx.measureText(tipUrl).width
      const boxWidth = textWidth + padding * 2
      const boxHeight = fontSize + padding * 2
      const x = img.width - boxWidth - margin
      const y = img.height - boxHeight - margin

      ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
      ctx.beginPath()
      ctx.roundRect(x, y, boxWidth, boxHeight, borderRadius)
      ctx.fill()

      ctx.strokeStyle = "#F4B728"
      ctx.lineWidth = borderWidth
      ctx.stroke()

      ctx.fillStyle = "#F4B728"
      ctx.textBaseline = "middle"
      ctx.fillText(tipUrl, x + padding, y + boxHeight / 2)

      setStampedImage(canvas.toDataURL("image/png"))
    }
    img.src = image
  }, [image, tipUrl])

  // Copy stamped image to clipboard
  const handleCopy = async () => {
    if (!stampedImage || !canvasRef.current) return

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Failed to create blob"))
        }, "image/png")
      })

      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])

      setStatus("copied")
      setTimeout(() => setStatus("idle"), 2000)
    } catch (e) {
      console.error("TIPZ: Copy failed", e)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  // Clear and close
  const handleClose = () => {
    setImage(null)
    setStampedImage(null)
    setStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div style={{
      padding: "16px 20px",
      borderTop: `1px solid ${colors.border}`,
      animation: "fadeInUp 0.2s ease-out",
    }}>
      {/* Header with close */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}>
        <span style={{
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: fonts.sans,
          color: colors.text,
        }}>
          Stamp Image
        </span>
        <button
          onClick={handleClose}
          style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            color: colors.muted,
            cursor: "pointer",
            borderRadius: radius.xs,
            transition: `all ${transitions.fast}`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {!image ? (
        // Upload area
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "20px",
            background: colors.surface,
            border: `1px dashed ${colors.borderGold}`,
            borderRadius: radius.md,
            textAlign: "center",
            cursor: "pointer",
            transition: `all ${transitions.fast}`,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primary}
            strokeWidth="1.5"
            style={{ margin: "0 auto 10px", display: "block" }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <div style={{
            fontSize: "13px",
            fontWeight: 500,
            color: colors.primary,
            fontFamily: fonts.sans,
            marginBottom: "4px",
          }}>
            Paste or Upload
          </div>
          <div style={{
            fontSize: "11px",
            color: colors.muted,
            fontFamily: fonts.sans,
          }}>
            Ctrl+V to paste
          </div>
        </div>
      ) : (
        // Preview and copy
        <>
          <div style={{
            position: "relative",
            marginBottom: "10px",
            borderRadius: radius.sm,
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
          }}>
            {stampedImage && (
              <img
                src={stampedImage}
                alt="Stamped preview"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            )}
          </div>
          <button
            onClick={handleCopy}
            disabled={!stampedImage}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              padding: "12px",
              fontSize: "13px",
              fontWeight: 600,
              color: colors.bg,
              background: status === "copied"
                ? colors.success
                : colors.primary,
              border: "none",
              borderRadius: radius.sm,
              cursor: stampedImage ? "pointer" : "default",
              fontFamily: fonts.sans,
              transition: `all ${transitions.fast}`,
            }}
          >
            {status === "copied" ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copied! Paste to X
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy Stamped Image
              </>
            )}
          </button>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  )
}

// Not linked view - prompts creator to register/link
function NotLinkedView() {
  return (
    <div style={{
      padding: "40px 24px",
      textAlign: "center",
      animation: "fadeIn 0.3s ease-out",
    }}>
      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: radius.lg,
        background: colors.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        border: `1px solid ${colors.borderGold}`,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      <h2 style={{
        margin: "0 0 8px",
        fontSize: "18px",
        fontWeight: 600,
        color: colors.textBright,
        fontFamily: fonts.sans,
      }}>
        Link Your Account
      </h2>

      <p style={{
        margin: "0 0 24px",
        fontSize: "13px",
        color: colors.muted,
        fontFamily: fonts.sans,
        lineHeight: 1.5,
      }}>
        Register on TIPZ to receive private tips and track earnings.
      </p>

      <a
        href={`${WEB_URL}/register`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          width: "100%",
          padding: "14px",
          fontSize: "14px",
          fontWeight: 600,
          color: colors.bg,
          background: colors.primary,
          border: "none",
          borderRadius: radius.md,
          textAlign: "center",
          textDecoration: "none",
          fontFamily: fonts.sans,
          transition: `all ${transitions.fast}`,
        }}
      >
        Register Now
      </a>

      <button
        onClick={() => {
          chrome.tabs.create({ url: WEB_URL })
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          width: "100%",
          marginTop: "10px",
          padding: "12px",
          fontSize: "13px",
          fontWeight: 500,
          color: colors.text,
          backgroundColor: "transparent",
          border: `1px solid ${colors.border}`,
          borderRadius: radius.md,
          cursor: "pointer",
          fontFamily: fonts.sans,
          transition: `all ${transitions.fast}`,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Link Existing Account
      </button>

      <p style={{
        margin: "16px 0 0",
        fontSize: "11px",
        color: colors.textSubtle,
        fontFamily: fonts.sans,
      }}>
        Visit tipz.cash to link your account
      </p>
    </div>
  )
}

// Local tip type from background
interface LocalTip {
  id: string
  amount: string
  amountUsd: string
  message?: string
  receivedAt: number
}

// Creator dashboard view
function CreatorDashboard({ identity }: { identity: CreatorIdentity }) {
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [recentTips, setRecentTips] = useState<ReceivedTip[]>([])
  const [localTips, setLocalTips] = useState<LocalTip[]>([])
  const [messages, setMessages] = useState<StoredMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stampOpen, setStampOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      try {
        const [statsData, tipsData] = await Promise.all([
          getRevenueStats(identity.handle),
          getReceivedTips(identity.handle, 10),
        ])

        setStats(statsData)
        setRecentTips(tipsData.tips)
      } catch (e) {
        console.error("TIPZ: Failed to load dashboard data", e)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Fetch messages from background
    chrome.runtime.sendMessage({ type: "GET_MESSAGES" }, (response) => {
      if (response?.messages) {
        setMessages(response.messages)
      }
    })

    // Fetch local tips from background
    chrome.runtime.sendMessage({ type: "GET_LOCAL_TIPS" }, (response) => {
      if (response?.tips) {
        setLocalTips(response.tips)
      }
    })

    // Listen for new tips in realtime
    const handleNewTip = (message: any) => {
      if (message.type === "TIPZ_NEW_TIP_RECEIVED") {
        const tip = message.data
        const newLocalTip: LocalTip = {
          id: tip.id,
          amount: tip.amount,
          amountUsd: tip.amountUsd || `$${(parseFloat(tip.amount) * 50).toFixed(2)}`,
          message: tip.message,
          receivedAt: Date.now(),
        }
        setLocalTips((prev) => [newLocalTip, ...prev])

        // Also refresh stats
        getRevenueStats(identity.handle).then(setStats).catch(console.error)
      }
    }

    chrome.runtime.onMessage.addListener(handleNewTip)
    return () => {
      chrome.runtime.onMessage.removeListener(handleNewTip)
    }
  }, [identity.handle])

  const handleUnlink = async () => {
    if (confirm("Are you sure you want to unlink your account?")) {
      await clearLinkedCreator()
    }
  }

  const handleShare = () => {
    window.open(`${WEB_URL}/${identity.handle}`, "_blank")
  }

  return (
    <div>
      {/* Hero stat */}
      <HeroStat stats={stats} isLoading={isLoading} />

      {/* Quick actions */}
      <QuickActions
        onStampClick={() => setStampOpen(!stampOpen)}
        onShareClick={handleShare}
        stampActive={stampOpen}
      />

      {/* Image stamp tool (collapsible) */}
      <ImageStampTool
        handle={identity.handle}
        isOpen={stampOpen}
        onClose={() => setStampOpen(false)}
      />

      {/* Activity section */}
      <SectionDivider label="Activity" />
      <ActivityFeed
        tips={recentTips}
        localTips={localTips}
        messages={messages}
        isLoading={isLoading}
        handle={identity.handle}
      />

      {/* Footer actions */}
      <div style={{
        padding: "16px 20px",
        borderTop: `1px solid ${colors.border}`,
        marginTop: "12px",
      }}>
        <button
          onClick={handleUnlink}
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            fontSize: "11px",
            color: colors.textSubtle,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: fonts.sans,
            transition: `color ${transitions.fast}`,
          }}
        >
          Unlink account
        </button>
      </div>
    </div>
  )
}

// Popup notification overlay
function PopupNotificationOverlay({
  notification,
  onClose,
}: {
  notification: PopupNotification | null
  onClose: () => void
}) {
  if (!notification) return null

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(8, 9, 10, 0.9)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
      animation: "fadeIn 0.2s ease-out",
    }}>
      <div style={{
        background: colors.surfaceSolid,
        borderRadius: radius.lg,
        border: `1px solid ${colors.borderGold}`,
        boxShadow: shadows.heroGlow,
        padding: "24px",
        textAlign: "center",
        width: "100%",
        maxWidth: "260px",
        animation: "scaleIn 0.25s ease-out",
      }}>
        {notification.type === "tip" ? (
          <>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: fonts.sans,
            }}>
              Tip Received
            </div>
            <div style={{
              fontSize: "36px",
              fontWeight: 700,
              color: colors.success,
              fontFamily: fonts.display,
              marginBottom: "4px",
            }}>
              +{notification.amountUsd || "$0.00"}
            </div>
            <div style={{
              fontSize: "13px",
              color: colors.muted,
              fontFamily: fonts.mono,
              marginBottom: notification.message ? "16px" : "20px",
            }}>
              {parseFloat(notification.amount || "0").toFixed(4)} ZEC
            </div>
            {notification.message && (
              <div style={{
                padding: "10px 12px",
                background: colors.surface,
                borderRadius: radius.sm,
                border: `1px solid ${colors.border}`,
                marginBottom: "20px",
              }}>
                <p style={{
                  margin: 0,
                  fontSize: "12px",
                  color: colors.text,
                  fontStyle: "italic",
                  fontFamily: fonts.sans,
                }}>
                  "{notification.message}"
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: radius.md,
              background: colors.purpleGlow,
              border: `1px solid ${colors.purple}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div style={{
              fontSize: "14px",
              fontWeight: 600,
              color: colors.purple,
              marginBottom: "8px",
              fontFamily: fonts.sans,
            }}>
              Private Message
            </div>
            <p style={{
              margin: "0 0 20px",
              fontSize: "13px",
              color: colors.text,
              lineHeight: 1.5,
              fontFamily: fonts.sans,
            }}>
              {notification.text}
            </p>
          </>
        )}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "13px",
            fontWeight: 600,
            color: colors.bg,
            background: colors.primary,
            border: "none",
            borderRadius: radius.md,
            cursor: "pointer",
            fontFamily: fonts.sans,
            transition: `all ${transitions.fast}`,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

function IndexPopup() {
  const [linkedCreator, setLinkedCreator] = useState<CreatorIdentity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState<PopupNotification | null>(null)

  useEffect(() => {
    // Load initial state
    getLinkedCreator().then((identity) => {
      setLinkedCreator(identity)
      setIsLoading(false)
    })

    // Listen for changes
    const unsubscribe = onLinkedCreatorChange((identity) => {
      setLinkedCreator(identity)
    })

    // Listen for tip/message notifications while popup is open
    const handleMessage = (message: any) => {
      if (message.type === "TIPZ_SHOW_TIP_NOTIFICATION") {
        setNotification({ type: "tip", ...message.data })
      } else if (message.type === "TIPZ_SHOW_MESSAGE_NOTIFICATION") {
        setNotification({ type: "message", ...message.data })
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      unsubscribe()
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  return (
    <div
      style={{
        width: "340px",
        minHeight: "400px",
        backgroundColor: colors.bg,
        fontFamily: fonts.sans,
        color: colors.textBright,
        position: "relative",
      }}
    >
      {/* Notification overlay */}
      <PopupNotificationOverlay
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Header */}
      <Header identity={linkedCreator} />

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{
            width: "24px",
            height: "24px",
            border: `2px solid ${colors.border}`,
            borderTopColor: colors.primary,
            borderRadius: radius.full,
            animation: "spin 0.8s linear infinite",
            margin: "0 auto",
          }} />
        </div>
      ) : linkedCreator ? (
        <CreatorDashboard identity={linkedCreator} />
      ) : (
        <NotLinkedView />
      )}

      {/* Footer */}
      <div style={{
        padding: "12px 20px",
        borderTop: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: colors.surface,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <div style={{
            width: "5px",
            height: "5px",
            borderRadius: radius.full,
            backgroundColor: colors.success,
          }} />
          <span style={{
            fontSize: "10px",
            color: colors.muted,
            fontFamily: fonts.sans,
          }}>
            Powered by Zcash
          </span>
        </div>
        <button
          onClick={() => window.open(`${WEB_URL}/privacy`, "_blank")}
          style={{
            fontSize: "10px",
            color: colors.muted,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: fonts.sans,
            transition: `color ${transitions.fast}`,
          }}
        >
          Privacy
        </button>
      </div>
    </div>
  )
}

export default IndexPopup
