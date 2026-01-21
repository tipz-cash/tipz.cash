/**
 * Terminal Theme Design Tokens
 *
 * Shared design tokens matching the terminal homepage aesthetic.
 * Used across all extension components for visual consistency.
 */

export const terminalTheme = {
  colors: {
    bg: "#0A0A0A",
    surface: "#1A1A1A",
    primary: "#F5A623",
    primaryHover: "#FFB84D",
    success: "#00FF00",
    error: "#FF4444",
    muted: "#888888",
    border: "#333333",
    text: "#E0E0E0",
    textWhite: "#FFFFFF",
  },
  fonts: {
    mono: "'JetBrains Mono', monospace",
  },
  // Semantic aliases for backwards compatibility
  get bgBlack() {
    return this.colors.bg;
  },
  get bgCard() {
    return this.colors.bg;
  },
  get accentYellow() {
    return this.colors.primary;
  },
  get borderSubtle() {
    return this.colors.border;
  },
  get borderHover() {
    return this.colors.border;
  },
  get textMuted() {
    return this.colors.muted;
  },
} as const;

// Flat colors export for direct destructuring
export const colors = {
  bg: terminalTheme.colors.bg,
  bgBlack: terminalTheme.colors.bg,
  bgCard: terminalTheme.colors.bg,
  surface: terminalTheme.colors.surface,
  primary: terminalTheme.colors.primary,
  primaryHover: terminalTheme.colors.primaryHover,
  accentYellow: terminalTheme.colors.primary,
  success: terminalTheme.colors.success,
  error: terminalTheme.colors.error,
  muted: terminalTheme.colors.muted,
  textMuted: terminalTheme.colors.muted,
  border: terminalTheme.colors.border,
  borderSubtle: terminalTheme.colors.border,
  borderHover: terminalTheme.colors.border,
  text: terminalTheme.colors.text,
  textWhite: terminalTheme.colors.textWhite,
} as const;

export const fonts = {
  mono: terminalTheme.fonts.mono,
} as const;
