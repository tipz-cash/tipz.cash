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
  currentChainId?: number | null  // Current connected chain for showing "switch" indicators
  isSwitchingChain?: boolean  // Whether a chain switch is in progress
}

export function TokenSelector({
  selectedToken,
  tokens: availableTokens,
  balances,
  onSelect,
  disabled = false,
  compact = false,
  currentChainId = null,
  isSwitchingChain = false,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)
  const [openUpward, setOpenUpward] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking/tapping outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
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

  const getBalance = (symbol: string, chainId: number): string => {
    // Use the compound key format: symbol-chainId
    const tokenKey = `${symbol}-${chainId}`
    const balance = balances[tokenKey]
    if (!balance) return "--"
    return formatTokenAmount(balance.amount, 4)
  }

  // Check if token is on a different chain than the currently connected one
  const isOnDifferentChain = (tokenChainId: number): boolean => {
    if (!currentChainId) return false
    return tokenChainId !== currentChainId
  }

  // Group tokens: current chain first, then other chains
  const sortedTokens = [...availableTokens].sort((a, b) => {
    const aOnCurrent = a.chainId === currentChainId
    const bOnCurrent = b.chainId === currentChainId
    if (aOnCurrent && !bOnCurrent) return -1
    if (!aOnCurrent && bOnCurrent) return 1
    // Within same group, sort by chainId then symbol
    if (a.chainId !== b.chainId) return a.chainId - b.chainId
    return a.symbol.localeCompare(b.symbol)
  })

  // Map chainId to human-readable chain name
  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      42161: "Arbitrum",
      10: "Optimism",
    }
    return chainNames[chainId] || `Chain ${chainId}`
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
            {/* Compact: symbol + chain + balance inline. Full: symbol + chain + balance stacked */}
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
                <span style={{ color: tokens.colors.textSubtle, fontWeight: 400, fontSize: "11px" }}>
                  {" "}on {getChainName(selectedToken.chainId)}
                </span>
                <span style={{ color: tokens.colors.textMuted, fontWeight: 400 }}>
                  {" · "}{getBalance(selectedToken.symbol, selectedToken.chainId)}
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
                  <span style={{ color: tokens.colors.textSubtle, fontWeight: 400, fontSize: "11px", marginLeft: "6px" }}>
                    on {getChainName(selectedToken.chainId)}
                  </span>
                </div>
                <div
                  style={{
                    color: tokens.colors.textMuted,
                    fontSize: "11px",
                    fontFamily: tokens.font.sans,
                  }}
                >
                  Balance: {getBalance(selectedToken.symbol, selectedToken.chainId)}
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
          {sortedTokens.map((token, index) => {
            // Use compound key for uniqueness across chains
            const tokenKey = `${token.symbol}-${token.chainId}`
            const isSelected = selectedToken?.symbol === token.symbol && selectedToken?.chainId === token.chainId
            const isHovered = hoveredToken === tokenKey
            const isDifferentChain = isOnDifferentChain(token.chainId)

            return (
              <button
                key={tokenKey}
                onClick={() => handleSelect(token)}
                onMouseEnter={() => setHoveredToken(tokenKey)}
                onMouseLeave={() => setHoveredToken(null)}
                disabled={isSwitchingChain}
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
                  borderBottom: index < sortedTokens.length - 1 ? `1px solid rgba(255, 255, 255, 0.05)` : "none",
                  cursor: isSwitchingChain ? "wait" : "pointer",
                  opacity: isSwitchingChain ? 0.7 : 1,
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
                        opacity: isDifferentChain ? 0.7 : 1,
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
                        opacity: isDifferentChain ? 0.7 : 1,
                      }}
                    >
                      {token.symbol[0]}
                    </div>
                  )}
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{
                        color: isDifferentChain ? tokens.colors.text : tokens.colors.textBright,
                        fontSize: "13px",
                        fontWeight: 500,
                        fontFamily: tokens.font.mono,
                      }}
                    >
                      {token.symbol}
                    </div>
                    <div style={{ color: tokens.colors.textMuted, fontSize: "11px", fontFamily: tokens.font.sans }}>
                      {token.name}
                      <span style={{ color: isDifferentChain ? tokens.colors.gold : tokens.colors.textSubtle, marginLeft: "4px" }}>
                        · {getChainName(token.chainId)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
                  {/* Show balance for current chain tokens, "Switch" for others */}
                  {isDifferentChain ? (
                    <span
                      style={{
                        color: tokens.colors.gold,
                        fontSize: "11px",
                        fontFamily: tokens.font.sans,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 1l4 4-4 4" />
                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                        <path d="M7 23l-4-4 4-4" />
                        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                      </svg>
                      Switch
                    </span>
                  ) : (
                    <span
                      style={{
                        color: tokens.colors.text,
                        fontSize: "12px",
                        fontFamily: tokens.font.mono,
                        fontFeatureSettings: "'tnum' 1",
                      }}
                    >
                      {getBalance(token.symbol, token.chainId)}
                    </span>
                  )}

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
