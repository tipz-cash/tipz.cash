"use client"

import { useState, useRef, useEffect } from "react"
import { type SupportedToken, type TokenBalance, formatTokenAmount } from "@/lib/wallet"
import { tokens, keyframes } from "./designTokens"

interface TokenSelectorProps {
  selectedToken: SupportedToken | null
  tokens: SupportedToken[]
  balances: Record<string, TokenBalance>
  onSelect: (token: SupportedToken) => void
  disabled?: boolean
  compact?: boolean
}

export function TokenSelector({
  selectedToken,
  tokens: availableTokens,
  balances,
  onSelect,
  disabled = false,
  compact = false,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)
  const [openUpward, setOpenUpward] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle dropdown positioning and scroll into view
  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = dropdownRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - buttonRect.bottom - 20
      const spaceAbove = buttonRect.top - 20

      // Open upward if not enough space below but enough above
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setOpenUpward(true)
      } else {
        setOpenUpward(false)
      }

      // Scroll the dropdown into view after a short delay
      setTimeout(() => {
        if (dropdownRef.current) {
          dropdownRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          })
        }
      }, 50)
    }
  }, [isOpen])

  const handleSelect = (token: SupportedToken) => {
    onSelect(token)
    setIsOpen(false)
  }

  const getBalance = (symbol: string): string => {
    const balance = balances[symbol]
    if (!balance) return "--"
    return formatTokenAmount(balance.amount, 4)
  }

  if (availableTokens.length === 0) {
    return (
      <div
        style={{
          padding: tokens.space.md,
          background: "rgba(255, 255, 255, 0.05)",
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderRadius: tokens.radius.md,
          color: tokens.colors.textMuted,
          fontSize: "13px",
          textAlign: "center",
          fontFamily: tokens.font.mono,
        }}
      >
        Connect wallet to see tokens
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Selected Token Button - glass pill style */}
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: compact ? "12px 14px" : tokens.space.md,
          background: isOpen ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.05)",
          border: `1px solid ${isOpen ? tokens.colors.gold : "rgba(255, 255, 255, 0.1)"}`,
          borderRadius: tokens.radius.md,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          boxShadow: "none",
          transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
        }}
      >
        {selectedToken ? (
          <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
            {/* Token Logo */}
            {selectedToken.logoUrl ? (
              <img
                src={selectedToken.logoUrl}
                alt={selectedToken.symbol}
                style={{
                  width: compact ? "20px" : "28px",
                  height: compact ? "20px" : "28px",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <div
                style={{
                  width: compact ? "20px" : "28px",
                  height: compact ? "20px" : "28px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryHover} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: compact ? "9px" : "11px",
                  fontWeight: 700,
                  color: tokens.colors.bg,
                  fontFamily: tokens.font.mono,
                }}
              >
                {selectedToken.symbol[0]}
              </div>
            )}
            {/* Compact: symbol + balance inline. Full: symbol + balance stacked */}
            {compact ? (
              <span
                style={{
                  color: tokens.colors.textBright,
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: tokens.font.mono,
                }}
              >
                {selectedToken.symbol}
                <span style={{ color: tokens.colors.textMuted, fontWeight: 400 }}>
                  {" · "}{getBalance(selectedToken.symbol)}
                </span>
              </span>
            ) : (
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    color: tokens.colors.textBright,
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: tokens.font.mono,
                  }}
                >
                  {selectedToken.symbol}
                </div>
                <div
                  style={{
                    color: tokens.colors.textMuted,
                    fontSize: "11px",
                    fontFamily: tokens.font.sans,
                  }}
                >
                  Balance: {getBalance(selectedToken.symbol)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: tokens.colors.textMuted, fontSize: "14px", fontFamily: tokens.font.sans }}>
            {compact ? "Token" : "Select token"}
          </span>
        )}

        {/* Chevron with rotation */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.colors.textMuted}
          strokeWidth="2"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: `transform ${tokens.duration.base}ms ${tokens.ease.spring}`,
            marginLeft: compact ? "4px" : "0",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown - glass style */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            ...(openUpward
              ? { bottom: "calc(100% + 4px)" }
              : { top: "calc(100% + 4px)" }),
            left: 0,
            right: 0,
            minWidth: compact ? "160px" : undefined,
            maxWidth: "calc(100vw - 32px)",
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            borderRadius: tokens.radius.md,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            overflow: "hidden",
            animation: openUpward
              ? "slideUp 150ms ease-out"
              : "slideDown 150ms ease-out",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {availableTokens.map((token, index) => {
            const isSelected = selectedToken?.symbol === token.symbol
            const isHovered = hoveredToken === token.symbol

            return (
              <button
                key={token.symbol}
                onClick={() => handleSelect(token)}
                onMouseEnter={() => setHoveredToken(token.symbol)}
                onMouseLeave={() => setHoveredToken(null)}
                style={{
                  width: "100%",
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: isSelected
                    ? "rgba(255, 215, 0, 0.15)"
                    : isHovered
                    ? "rgba(255, 255, 255, 0.05)"
                    : "transparent",
                  border: "none",
                  borderBottom: index < availableTokens.length - 1 ? `1px solid rgba(255, 255, 255, 0.05)` : "none",
                  cursor: "pointer",
                  transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
                  {/* Token Logo */}
                  {token.logoUrl ? (
                    <img
                      src={token.logoUrl}
                      alt={token.symbol}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryHover} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: tokens.colors.bg,
                        fontFamily: tokens.font.mono,
                      }}
                    >
                      {token.symbol[0]}
                    </div>
                  )}
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{
                        color: tokens.colors.textBright,
                        fontSize: "13px",
                        fontWeight: 500,
                        fontFamily: tokens.font.mono,
                      }}
                    >
                      {token.symbol}
                    </div>
                    <div style={{ color: tokens.colors.textMuted, fontSize: "11px", fontFamily: tokens.font.sans }}>
                      {token.name}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
                  {/* Balance with tabular nums */}
                  <span
                    style={{
                      color: tokens.colors.text,
                      fontSize: "12px",
                      fontFamily: tokens.font.mono,
                      fontFeatureSettings: "'tnum' 1",
                    }}
                  >
                    {getBalance(token.symbol)}
                  </span>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: tokens.colors.gold,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#050505"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <style>{`
        ${keyframes}
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
