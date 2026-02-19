"use client"

import { useState } from "react"
import Image from "next/image"
import { tokens } from "./designTokens"

// Types for payment methods
export type WalletOption = "phantom" | "metamask" | "rabby"
export type ExchangeOption = "coinbase" | "kraken" | "binance"

// Payment method row component - horizontal layout with text left, icons right
// Uses div when no onClick (children handle clicks), button when onClick provided
export function PaymentRow({
  title,
  description,
  children,
  onClick,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const sharedStyles = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.space.md,
    padding: `${tokens.space.md}px ${tokens.space.lg}px`,
    background: isHovered ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.02)",
    border: `1px solid ${isHovered ? "rgba(255, 215, 0, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
    borderRadius: tokens.radius.lg,
    cursor: onClick ? "pointer" : "default",
    transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
    textAlign: "left" as const,
  }

  const content = (
    <>
      {/* Left side - text content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: tokens.space.sm }}>
          <span
            style={{
              color: isHovered ? tokens.colors.textBright : tokens.colors.text,
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: tokens.font.sans,
              transition: `color ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
            }}
          >
            {title}
          </span>
          {/* Arrow indicator - only show when clickable */}
          {onClick && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isHovered ? tokens.colors.gold : tokens.colors.textSubtle}
              strokeWidth="2"
              style={{
                transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
                transform: isHovered ? "translateX(2px)" : "translateX(0)",
                opacity: isHovered ? 1 : 0.6,
              }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </div>
        <span
          style={{
            color: tokens.colors.textSubtle,
            fontSize: "12px",
            fontFamily: tokens.font.sans,
            lineHeight: 1.3,
          }}
        >
          {description}
        </span>
      </div>

      {/* Right side - icons */}
      <div style={{ display: "flex", gap: tokens.space.sm, flexShrink: 0 }}>{children}</div>
    </>
  )

  // Use div when children have their own click handlers (to avoid nested buttons)
  if (!onClick) {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={sharedStyles}
      >
        {content}
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={sharedStyles}
    >
      {content}
    </button>
  )
}

// Individual logo button (for wallet row where each logo is clickable)
export function LogoButton({
  src,
  alt,
  onClick,
}: {
  src: string
  alt: string
  onClick: (e: React.MouseEvent) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "36px",
        height: "36px",
        padding: 0,
        background: "transparent",
        border: `1.5px solid ${isHovered ? "rgba(255, 215, 0, 0.5)" : "transparent"}`,
        borderRadius: tokens.radius.sm,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
        transform: isHovered ? "scale(1.08)" : "scale(1)",
        boxShadow: isHovered ? "0 0 12px rgba(255, 215, 0, 0.2)" : "none",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={32}
        height={32}
        style={{
          borderRadius: "6px",
          display: "block",
        }}
      />
    </button>
  )
}

// Static logo display (for exchange row where the whole row is clickable)
export function LogoDisplay({ src, alt, size = 32 }: { src: string; alt: string; size?: number }) {
  const containerSize = size + 4
  return (
    <div
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{
          borderRadius: "6px",
          display: "block",
        }}
      />
    </div>
  )
}
