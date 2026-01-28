"use client"

import { useState, useCallback, useEffect } from "react"
import { isMeshAvailable, openMeshTransfer, type MeshTransferResult } from "@/lib/mesh"
import { tokens } from "./designTokens"

interface MeshPayButtonProps {
  destinationAddress: string
  creatorHandle: string
  amountUsd: number | null
  onSuccess: (result: MeshTransferResult) => void
  onError: (error: string) => void
  disabled?: boolean
}

export function MeshPayButton({
  destinationAddress,
  creatorHandle,
  amountUsd,
  onSuccess,
  onError,
  disabled = false,
}: MeshPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isMeshReady, setIsMeshReady] = useState(false)

  // Check if Mesh is available on mount
  useEffect(() => {
    setIsMeshReady(isMeshAvailable())
  }, [])

  const handleClick = useCallback(async () => {
    if (!amountUsd || amountUsd <= 0) {
      onError("Please select an amount first")
      return
    }

    setIsLoading(true)

    try {
      await openMeshTransfer(
        {
          destinationAddress,
          amountUsd,
          creatorHandle,
        },
        (result) => {
          setIsLoading(false)
          if (result.success) {
            onSuccess(result)
          } else {
            onError(result.error || "Transfer failed")
          }
        }
      )
    } catch (error: any) {
      setIsLoading(false)
      onError(error.message || "Failed to open Mesh")
    }
  }, [destinationAddress, amountUsd, creatorHandle, onSuccess, onError])

  // Don't render if Mesh is not configured
  if (!isMeshReady) {
    return null
  }

  const isDisabled = disabled || isLoading || !amountUsd

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.space.sm,
        padding: "12px 16px",
        background: isDisabled
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(255, 255, 255, 0.08)",
        border: `1px solid ${isDisabled ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.15)"}`,
        borderRadius: tokens.radius.md,
        color: isDisabled ? tokens.colors.textMuted : tokens.colors.text,
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: tokens.font.sans,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
        }
      }}
    >
      {isLoading ? (
        <>
          <div
            style={{
              width: "14px",
              height: "14px",
              border: `2px solid rgba(255, 255, 255, 0.2)`,
              borderTopColor: tokens.colors.textBright,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>Opening Mesh...</span>
        </>
      ) : (
        <>
          {/* Mesh-style icon (exchange/card symbol) */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span>Pay with Exchange or Card</span>
        </>
      )}
    </button>
  )
}
