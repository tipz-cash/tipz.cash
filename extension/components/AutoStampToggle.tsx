import { colors, fonts, radius, transitions } from "~lib/theme"

interface AutoStampToggleProps {
  handle: string
  onStamp: () => void
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

/**
 * AutoStampToggle - Adds a TIPZ tip link toggle to X's tweet compose UI
 *
 * When enabled, appends `tipz.cash/{handle}` to the creator's tweet
 */
export function AutoStampToggle({ handle, onStamp, isEnabled, onToggle }: AutoStampToggleProps) {
  const tipUrl = `tipz.cash/${handle}`

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        borderRadius: radius.full,
        background: isEnabled ? colors.primaryGlow : "transparent",
        border: `1px solid ${isEnabled ? colors.primary : colors.border}`,
        boxShadow: isEnabled ? `0 0 16px ${colors.primaryGlow}` : "none",
        cursor: "pointer",
        transition: `all ${transitions.fast}`,
        userSelect: "none",
      }}
      onClick={() => {
        const newState = !isEnabled
        onToggle(newState)
        if (newState) {
          onStamp()
        }
      }}
      title={isEnabled ? `Will add ${tipUrl} to your tweet` : "Click to add your TIPZ link"}
    >
      {/* TIPZ icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isEnabled ? colors.primary : colors.muted}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>

      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: fonts.mono,
          color: isEnabled ? colors.primary : colors.muted,
          textShadow: isEnabled ? `0 0 12px ${colors.primaryGlow}` : "none",
        }}
      >
        TIPZ
      </span>

      {/* Toggle indicator */}
      <div
        style={{
          width: "32px",
          height: "18px",
          borderRadius: radius.full,
          backgroundColor: isEnabled ? colors.primary : colors.border,
          position: "relative",
          transition: `background-color ${transitions.fast}`,
          boxShadow: isEnabled ? `0 0 8px ${colors.primaryGlow}` : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "3px",
            left: isEnabled ? "16px" : "3px",
            width: "12px",
            height: "12px",
            borderRadius: radius.full,
            backgroundColor: isEnabled ? colors.bg : colors.muted,
            transition: `left ${transitions.fast}`,
            boxShadow: isEnabled ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
          }}
        />
      </div>
    </div>
  )
}

/**
 * Compact version of the toggle for inline use
 */
export function AutoStampBadge({ handle, onClick }: { handle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: fonts.mono,
        color: colors.primary,
        background: colors.primaryGlow,
        border: `1px solid ${colors.primary}`,
        borderRadius: radius.full,
        cursor: "pointer",
        transition: `all ${transitions.fast}`,
        boxShadow: `0 0 12px ${colors.primaryGlow}`,
      }}
      title={`Add tipz.cash/${handle} to tweet`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      TIPZ
    </button>
  )
}
