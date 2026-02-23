"use client"

import { type SupportedToken, type TokenBalance, formatTokenAmount } from "@/lib/wallet"
import { tokens, keyframes } from "./designTokens"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TokenSelectorProps {
  selectedToken: SupportedToken | null
  tokens: SupportedToken[]
  balances: Record<string, TokenBalance>
  onSelect: (token: SupportedToken) => void
  disabled?: boolean
  compact?: boolean
  currentChainId?: number | null
  isSwitchingChain?: boolean
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
  const getBalance = (symbol: string, chainId: number): string => {
    const tokenKey = `${symbol}-${chainId}`
    const balance = balances[tokenKey]
    if (!balance) return "--"
    return formatTokenAmount(balance.amount, 4)
  }

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
    if (a.chainId !== b.chainId) return a.chainId - b.chainId
    return a.symbol.localeCompare(b.symbol)
  })

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

  // Build compound value key for Radix Select
  const getTokenKey = (token: SupportedToken) => `${token.symbol}-${token.chainId}`
  const selectedValue = selectedToken ? getTokenKey(selectedToken) : undefined

  const handleValueChange = (value: string) => {
    const token = sortedTokens.find((t) => getTokenKey(t) === value)
    if (token) onSelect(token)
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={disabled || isSwitchingChain}
      >
        <SelectTrigger
          className="h-auto border-white/10 bg-white/5 hover:bg-white/8 focus:ring-amber-500/50 data-[state=open]:border-amber-500"
          style={{
            width: "100%",
            minHeight: "48px",
            padding: compact ? "12px 14px" : tokens.space.md + "px",
            borderRadius: tokens.radius.md,
            opacity: disabled ? 0.5 : 1,
            cursor: isSwitchingChain ? "wait" : disabled ? "not-allowed" : "pointer",
          }}
        >
          <SelectValue placeholder={compact ? "Token" : "Select token"}>
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
                    <span
                      style={{ color: tokens.colors.textSubtle, fontWeight: 400, fontSize: "11px" }}
                    >
                      {" "}
                      on {getChainName(selectedToken.chainId)}
                    </span>
                    <span style={{ color: tokens.colors.textMuted, fontWeight: 400 }}>
                      {" · "}
                      {getBalance(selectedToken.symbol, selectedToken.chainId)}
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
                      <span
                        style={{
                          color: tokens.colors.textSubtle,
                          fontWeight: 400,
                          fontSize: "11px",
                          marginLeft: "6px",
                        }}
                      >
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
              <span
                style={{
                  color: tokens.colors.textMuted,
                  fontSize: "14px",
                  fontFamily: tokens.font.sans,
                }}
              >
                {compact ? "Token" : "Select token"}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          className="border-white/10 bg-[rgba(26,26,26,0.95)] backdrop-blur-[24px]"
          style={{
            maxHeight: "200px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            borderRadius: tokens.radius.md,
          }}
        >
          {sortedTokens.map((token) => {
            const tokenKey = getTokenKey(token)
            const isSelected =
              selectedToken?.symbol === token.symbol && selectedToken?.chainId === token.chainId
            const isDifferentChain = isOnDifferentChain(token.chainId)

            return (
              <SelectItem
                key={tokenKey}
                value={tokenKey}
                className="cursor-pointer py-3 px-3 focus:bg-white/5 data-[highlighted]:bg-white/5"
                style={{
                  minHeight: "48px",
                  background: isSelected ? "rgba(255, 215, 0, 0.15)" : undefined,
                  opacity: isSwitchingChain ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm, width: "100%" }}>
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
                  <div style={{ textAlign: "left", flex: 1 }}>
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
                    <div
                      style={{
                        color: tokens.colors.textMuted,
                        fontSize: "11px",
                        fontFamily: tokens.font.sans,
                      }}
                    >
                      {token.name}
                      <span
                        style={{
                          color: isDifferentChain ? tokens.colors.gold : tokens.colors.textSubtle,
                          marginLeft: "4px",
                        }}
                      >
                        · {getChainName(token.chainId)}
                      </span>
                    </div>
                  </div>

                  {/* Balance or Switch indicator */}
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
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
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <style>{keyframes}</style>
    </div>
  )
}
