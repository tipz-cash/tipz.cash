// Responsive utilities for mobile-first design
// TIPZ Mobile Optimization

// Breakpoint constants (mobile-first: min-width)
export const breakpoints = {
  xs: 375, // iPhone SE, small phones
  sm: 428, // iPhone 14 Pro Max, larger phones
  md: 768, // Tablets portrait
  lg: 1024, // Tablets landscape, small laptops
  xl: 1280, // Desktops
} as const

// Max-width breakpoints (for @media max-width queries)
export const maxBreakpoints = {
  xs: 374, // Below iPhone SE
  sm: 427, // Below iPhone 14 Pro Max
  md: 767, // Below tablets
  lg: 1023, // Below laptops
} as const

// Touch target constants (WCAG 2.1 compliant)
export const touchTargets = {
  minimum: 44, // WCAG minimum (44x44px)
  comfortable: 48, // Recommended for touch
  large: 56, // Primary CTA buttons
} as const

// Fluid spacing using clamp()
// Format: clamp(min, preferred, max)
export const fluidSpacing = {
  // Section padding: 32px on mobile, scales to 80px on desktop
  sectionPadding: "clamp(32px, 8vw, 80px)",
  // Container padding: 16px on mobile, scales to 48px on desktop
  containerPadding: "clamp(16px, 4vw, 48px)",
  // Card padding: 16px on mobile, scales to 32px on desktop
  cardPadding: "clamp(16px, 3vw, 32px)",
  // Header padding: 12px on mobile, scales to 24px on desktop
  headerPadding: "clamp(12px, 2vw, 24px)",
  // Gap for grid/flex: 16px on mobile, scales to 24px on desktop
  gap: "clamp(16px, 3vw, 24px)",
} as const

// Grid minmax values for responsive grids
export const gridMinmax = {
  // Card grid: 2 columns on small phones, more on larger
  cardGrid: {
    xs: "minmax(140px, 1fr)", // 2 columns on 375px
    sm: "minmax(160px, 1fr)", // 2 columns on small phones
    md: "minmax(200px, 1fr)", // 2-3 columns on tablets
    lg: "minmax(240px, 1fr)", // 3-4 columns on desktop
  },
} as const

// Font sizes that prevent iOS zoom (16px minimum for inputs)
export const fontSizes = {
  inputMobile: "16px", // Prevents iOS zoom on focus
  bodyMobile: "14px",
  smallMobile: "12px",
  captionMobile: "11px",
} as const

// Helper to generate media query string
export function mediaQuery(type: "min" | "max", breakpoint: number): string {
  return `@media (${type}-width: ${breakpoint}px)`
}

// Helper to check if touch device (for use in styles)
export const touchDeviceQuery = "@media (hover: none) and (pointer: coarse)"

// Helper to check for reduced motion preference
export const reducedMotionQuery = "@media (prefers-reduced-motion: reduce)"
