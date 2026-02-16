"use client"

import { colors } from "@/lib/colors"

interface ConnectionIndicatorProps {
  status: "disconnected" | "connecting" | "connected"
}

const statusConfig = {
  connected: { color: colors.success, label: "Live" },
  connecting: { color: colors.primary, label: "Connecting" },
  disconnected: { color: colors.muted, label: "Offline" },
}

export default function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  const config = statusConfig[status]

  return (
    <span
      title={config.label}
      style={{
        display: "inline-block",
        width: "8px",
        height: "8px",
        background: config.color,
        borderRadius: "50%",
        boxShadow: status === "connected" ? `0 0 10px ${config.color}` : "none",
        animation: status === "connecting" ? "pulse 1.5s ease-in-out infinite" : "none",
      }}
    />
  )
}
