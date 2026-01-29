/**
 * TIPZ Brand Theme Design Tokens
 *
 * Matches the main TIPZ website (tipz.cash) design system
 * Clean, terminal-inspired with gold accents
 */

export const colors = {
  // Base surfaces - pure black background matching website
  bg: "#000000",
  bgBase: "#000000",
  surface: "#1a1a1a",
  surfaceHover: "#222222",
  surfaceSolid: "#1a1a1a",

  // Primary (Gold) - exact match to website --accent-yellow
  primary: "#F4B728",
  primaryHover: "#fcd34d",
  primaryMuted: "rgba(244, 183, 40, 0.6)",
  primaryGlow: "rgba(244, 183, 40, 0.12)",
  primaryGlowStrong: "rgba(244, 183, 40, 0.4)",

  // Secondary (Purple) - for encryption/privacy indicators
  purple: "#8B5CF6",
  purpleGlow: "rgba(139, 92, 246, 0.15)",

  // Text hierarchy - matching website
  textBright: "#FFFFFF",
  textWhite: "#FFFFFF",
  text: "#FFFFFF",
  muted: "#888888",
  textSubtle: "#666666",

  // Status - matching website
  success: "#22c55e",
  successGlow: "rgba(34, 197, 94, 0.25)",
  error: "#ef4444",
  errorGlow: "rgba(239, 68, 68, 0.1)",

  // Borders - matching website
  border: "#1a1a1a",
  borderHover: "#333333",
  borderGold: "rgba(244, 183, 40, 0.3)",

  // Cards - matching website
  cardBg: "#1a1a1a",
  cardBorder: "#1a1a1a",

  // Semantic aliases for backwards compatibility
  bgBlack: "#000000",
  bgCard: "#1a1a1a",
  accentYellow: "#F4B728",
  borderSubtle: "#1a1a1a",
  textMuted: "#888888",
} as const

export const fonts = {
  // Monospace - JetBrains Mono as per TIPZ brand guidelines
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  // Body - Inter as per website
  sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  // Display/hero numbers
  display: "'JetBrains Mono', 'SF Mono', monospace",
} as const

// Clear typographic hierarchy matching website
export const typography = {
  hero: { size: "36px", weight: 600, family: fonts.display },
  h1: { size: "20px", weight: 600, family: fonts.sans },
  h2: { size: "14px", weight: 500, family: fonts.sans },
  section: { size: "11px", weight: 500, family: fonts.sans, transform: "uppercase", tracking: "-0.02em" },
  body: { size: "13px", weight: 400, family: fonts.sans },
  small: { size: "11px", weight: 400, family: fonts.sans },
  mono: { size: "13px", weight: 500, family: fonts.mono },
} as const

export const radius = {
  xs: "6px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
} as const

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
  md: "0 2px 8px rgba(0, 0, 0, 0.4)",
  lg: "0 8px 32px rgba(0, 0, 0, 0.5)",
  // Glows matching website
  heroGlow: "0 0 40px rgba(244, 183, 40, 0.3)",
  successGlow: "0 0 20px rgba(34, 197, 94, 0.25)",
  newItemGlow: "0 0 20px rgba(244, 183, 40, 0.3)",
} as const

export const glass = {
  background: "#1a1a1a",
  backdropFilter: "blur(20px) saturate(120%)",
  borderTop: "1px solid rgba(244, 183, 40, 0.3)",
} as const

// Transitions matching website CSS variables
export const transitions = {
  fast: "150ms ease",
  normal: "200ms ease",
  spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  slide: "300ms ease",
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

export default { colors, fonts, typography, radius, shadows, glass, transitions }
