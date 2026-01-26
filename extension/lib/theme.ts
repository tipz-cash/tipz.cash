/**
 * TIPZ Brand Theme Design Tokens
 *
 * "Bloomberg Terminal meets Premium Fintech" aesthetic
 * with glassmorphism, gold accents, and sophisticated dark theme.
 */

export const colors = {
  // Backgrounds
  bg: "#050505",
  bgBase: "#08090a",
  surface: "#12141a",
  surfaceHover: "#1a1d24",

  // Primary (Gold/Amber)
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  primaryDark: "#CC8A1D",
  primaryGlow: "rgba(245, 166, 35, 0.15)",

  // Text
  textBright: "#F9FAFB",
  textWhite: "#F9FAFB",
  text: "#D1D5DB",
  muted: "#6B7280",

  // Status
  success: "#22C55E",
  error: "#EF4444",
  info: "#3B82F6",

  // Borders
  border: "#2a2f38",
  borderHover: "#3d4450",
  borderGold: "rgba(255, 215, 0, 0.4)",

  // Cards (glassmorphism)
  cardBg: "rgba(255, 255, 255, 0.02)",
  cardBorder: "rgba(255, 255, 255, 0.06)",
  cardBorderHover: "rgba(245, 166, 35, 0.3)",

  // Semantic aliases for backwards compatibility
  bgBlack: "#050505",
  bgCard: "#12141a",
  accentYellow: "#F5A623",
  borderSubtle: "#2a2f38",
  textMuted: "#6B7280",
} as const

export const fonts = {
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
} as const

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const

export const shadows = {
  card: "0 4px 16px rgba(0, 0, 0, 0.3)",
  cardHover: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(245, 166, 35, 0.1)",
  glow: "0 0 20px rgba(245, 166, 35, 0.3)",
} as const

export const transitions = {
  fast: "0.15s ease-out",
  normal: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const

// Legacy terminalTheme export for backwards compatibility
export const terminalTheme = {
  colors,
  fonts,
  get bgBlack() { return colors.bg },
  get bgCard() { return colors.surface },
  get accentYellow() { return colors.primary },
  get borderSubtle() { return colors.border },
  get borderHover() { return colors.borderHover },
  get textMuted() { return colors.muted },
} as const
