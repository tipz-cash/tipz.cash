// TIPZ Color Palette - Premium dark terminal aesthetic
// Inspired by Bloomberg Terminal, Zcash.com, and premium fintech cards

export const colors = {
  // Backgrounds
  bg: "#08090a",
  bgGradientStart: "#08090a",
  bgGradientEnd: "#0d1117",
  pageBg: "#050505",
  surface: "#12141a",
  surfaceHover: "#1a1d24",
  surfaceLight: "#1e2128",

  // Primary (Gold/Amber)
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  primaryDark: "#CC8A1D",
  primaryGlow: "rgba(245, 166, 35, 0.15)",
  primaryGlowStrong: "rgba(245, 166, 35, 0.3)",
  goldGlow: "rgba(245, 166, 35, 0.1)",

  // Success (Green)
  success: "#22C55E",
  successHover: "#16A34A",
  successGlow: "rgba(34, 197, 94, 0.2)",

  // Error (Red)
  error: "#EF4444",
  errorHover: "#DC2626",
  errorGlow: "rgba(239, 68, 68, 0.15)",

  // Neutral
  muted: "#6B7280",
  border: "#2a2f38",
  borderHover: "#3d4450",
  text: "#D1D5DB",
  textBright: "#F9FAFB",

  // Card-specific
  cardBg: "rgba(255, 255, 255, 0.02)",
  cardBorder: "rgba(255, 255, 255, 0.06)",
  cardBorderHover: "rgba(245, 166, 35, 0.3)",

  // Gradients
  gradientGold: "linear-gradient(135deg, #F5A623 0%, #FFB84D 50%, #F5A623 100%)",
  gradientGoldSweep: "linear-gradient(90deg, transparent, #F5A623, transparent)",
  gradientHolographic:
    "linear-gradient(90deg, rgba(255,0,150,0.1), rgba(0,255,255,0.1), rgba(255,255,0,0.1), rgba(255,0,150,0.1))",
  gradientMetallic:
    "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
} as const

export type ColorKey = keyof typeof colors
