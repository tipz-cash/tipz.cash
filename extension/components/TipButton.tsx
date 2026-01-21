import type { Creator } from "~lib/api"
import { colors, fonts } from "~lib/theme"

interface TipButtonProps {
  creator: Creator | null
  handle: string
  onTip: () => void
}

export function TipButton({ creator, handle, onTip }: TipButtonProps) {
  const isRegistered = !!creator

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onTip()
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "6px 12px",
        fontSize: "13px",
        fontWeight: 600,
        color: isRegistered ? colors.bg : colors.muted,
        backgroundColor: isRegistered ? colors.primary : "transparent",
        border: isRegistered ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
        borderRadius: "9999px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: fonts.mono,
        boxShadow: isRegistered ? `0 0 12px rgba(245, 166, 35, 0.3)` : "none",
      }}
      title={isRegistered ? `Tip @${handle}` : `@${handle} is not registered for TIPZ`}
      onMouseEnter={(e) => {
        if (isRegistered) {
          e.currentTarget.style.boxShadow = "0 0 20px rgba(245, 166, 35, 0.5)"
          e.currentTarget.style.transform = "scale(1.05)"
        } else {
          e.currentTarget.style.borderColor = colors.muted
          e.currentTarget.style.color = colors.textWhite
        }
      }}
      onMouseLeave={(e) => {
        if (isRegistered) {
          e.currentTarget.style.boxShadow = "0 0 12px rgba(245, 166, 35, 0.3)"
          e.currentTarget.style.transform = "scale(1)"
        } else {
          e.currentTarget.style.borderColor = colors.border
          e.currentTarget.style.color = colors.muted
        }
      }}
    >
      {/* Dollar sign icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
      <span>TIP</span>
    </button>
  )
}
