"use client"

import { useState, useEffect } from "react"
import { tokens, keyframes } from "./designTokens"

interface AmountSelectorProps {
  selectedAmount: number | null
  customAmount: string
  onSelect: (amount: number | null, custom?: string) => void
  zecPrice: number | null
  disabled?: boolean
}

const PRESET_AMOUNTS = [1, 5, 10, 25, 50]

export function AmountSelector({
  selectedAmount,
  customAmount,
  onSelect,
  zecPrice,
  disabled = false,
}: AmountSelectorProps) {
  const [isCustom, setIsCustom] = useState(false)
  const [inputValue, setInputValue] = useState(customAmount)
  const [hoveredAmount, setHoveredAmount] = useState<number | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Sync input value with customAmount prop
  useEffect(() => {
    setInputValue(customAmount)
    if (customAmount && !selectedAmount) {
      setIsCustom(true)
    }
  }, [customAmount, selectedAmount])

  const handlePresetClick = (amount: number) => {
    if (disabled) return
    // Haptic feedback for tactile response on mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10)
    }
    setIsCustom(false)
    setInputValue("")
    onSelect(amount)
  }

  const handleCustomClick = () => {
    if (disabled) return
    // Haptic feedback for tactile response on mobile
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10)
    }
    setIsCustom(true)
    onSelect(null, inputValue)
  }

  const handleInputChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, "")
    // Prevent multiple decimal points
    const parts = cleaned.split(".")
    const formatted = parts.length > 2
      ? parts[0] + "." + parts.slice(1).join("")
      : cleaned

    setInputValue(formatted)
    onSelect(null, formatted)
  }

  // Calculate ZEC equivalent
  const getZecEquivalent = (usdAmount: number): string => {
    if (!zecPrice || zecPrice <= 0) return "..."
    return (usdAmount / zecPrice).toFixed(4)
  }

  const currentUsdAmount = selectedAmount || parseFloat(inputValue) || 0
  const isCustomTooLow = isCustom && inputValue && parseFloat(inputValue) > 0 && parseFloat(inputValue) < 1

  return (
    <div style={{ width: "100%" }}>
      {/* Preset Amount Row */}
      <div
        style={{
          display: "flex",
          gap: tokens.space.sm,
        }}
      >
        {PRESET_AMOUNTS.map((amount) => {
          const isSelected = selectedAmount === amount && !isCustom
          const isHovered = hoveredAmount === amount

          return (
            <button
              key={amount}
              onClick={() => handlePresetClick(amount)}
              onMouseEnter={() => setHoveredAmount(amount)}
              onMouseLeave={() => setHoveredAmount(null)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: "14px 0",
                minHeight: "48px",
                background: isSelected
                  ? "#FFFFFF"
                  : isHovered
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(255, 255, 255, 0.05)",
                border: isSelected
                  ? "1px solid transparent"
                  : `1px solid ${isHovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}`,
                borderRadius: tokens.radius.md,
                color: isSelected ? "#050505" : tokens.colors.text,
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-family-mono)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                boxShadow: isSelected ? "0 0 24px rgba(255, 215, 0, 0.5), 0 0 8px rgba(255, 215, 0, 0.3)" : "none",
                transform: isHovered && !isSelected ? "translateY(-1px)" : "translateY(0)",
                transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
              }}
            >
              ${amount}
            </button>
          )
        })}
      </div>

      {/* Custom Amount Input - full width below presets */}
      <div
        onClick={handleCustomClick}
        style={{
          width: "100%",
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "14px 14px",
          marginTop: tokens.space.sm,
          background: isCustom && inputValue
            ? "#FFFFFF"
            : isFocused
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(255, 255, 255, 0.05)",
          border: isCustom && inputValue
            ? "1px solid transparent"
            : `1px solid ${isFocused ? tokens.colors.gold : "rgba(255, 255, 255, 0.1)"}`,
          borderRadius: tokens.radius.md,
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.5 : 1,
          boxShadow: isCustom && inputValue ? "0 0 24px rgba(255, 215, 0, 0.5), 0 0 8px rgba(255, 215, 0, 0.3)" : "none",
          transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            color: isCustom && inputValue ? "#050505" : tokens.colors.textMuted,
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "var(--font-family-mono)",
          }}
        >
          $
        </span>

        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsCustom(true)
            setIsFocused(true)
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Other"
          disabled={disabled}
          style={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: isCustom && inputValue ? "#050505" : tokens.colors.textBright,
            fontSize: "14px",
            fontFamily: "var(--font-family-mono)",
            fontWeight: 600,
          }}
        />

        {inputValue && isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setInputValue("")
              onSelect(null, "")
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              minWidth: "44px",
              minHeight: "44px",
              marginRight: "-10px",
              marginTop: "-10px",
              marginBottom: "-10px",
              background: "transparent",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                background: "rgba(0, 0, 0, 0.15)",
                borderRadius: "50%",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#050505"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Minimum amount warning */}
      {isCustomTooLow && (
        <p
          style={{
            marginTop: tokens.space.sm,
            color: tokens.colors.gold,
            fontSize: "12px",
            fontFamily: tokens.font.sans,
          }}
        >
          Minimum tip is $1
        </p>
      )}

      <style>{keyframes}</style>
    </div>
  )
}
