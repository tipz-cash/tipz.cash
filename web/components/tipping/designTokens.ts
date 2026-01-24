// Premium Design Tokens for TIPZ Tipping Flow
// Aesthetic: Glass Card - Premium glass morphism with golden accents

export const tokens = {
  // Colors - Glass Card palette
  colors: {
    // Base surfaces - pure void background with glass surfaces
    bg: "#050505",
    surface: "rgba(26, 26, 26, 0.6)",
    surfaceElevated: "rgba(32, 32, 32, 0.7)",
    surfaceHover: "rgba(255, 255, 255, 0.05)",

    // Borders - golden ridge accents
    border: "rgba(255, 255, 255, 0.1)",
    borderSubtle: "rgba(255, 255, 255, 0.05)",
    borderHover: "rgba(255, 255, 255, 0.15)",
    borderFocus: "#FFD700",
    borderSelected: "#FFD700",

    // Primary - Brighter gold
    gold: "#FFD700",
    goldMuted: "rgba(255, 215, 0, 0.4)",
    primary: "#FFD700",
    primaryHover: "#FFA500",
    primaryMuted: "rgba(255, 215, 0, 0.15)",
    primaryGlow: "rgba(255, 215, 0, 0.4)",
    primaryGlowSubtle: "rgba(255, 215, 0, 0.15)",

    // Success - Signal green for trust indicators
    signalGreen: "#00FF94",
    success: "#00FF94",
    successMuted: "rgba(0, 255, 148, 0.1)",
    successBorder: "rgba(0, 255, 148, 0.25)",
    successGlow: "rgba(0, 255, 148, 0.35)",

    // Error - Softer red
    error: "#EF4444",
    errorMuted: "rgba(239, 68, 68, 0.08)",
    errorBorder: "rgba(239, 68, 68, 0.25)",
    errorGlow: "rgba(239, 68, 68, 0.3)",

    // Info - Blue for non-critical states (like "no wallet")
    info: "#3B82F6",
    infoMuted: "rgba(59, 130, 246, 0.1)",
    infoBorder: "rgba(59, 130, 246, 0.25)",

    // Text hierarchy
    textBright: "#FFFFFF",
    textPrimary: "#FFFFFF",
    text: "rgba(255, 255, 255, 0.85)",
    textMuted: "rgba(255, 255, 255, 0.6)",
    textSecondary: "rgba(255, 255, 255, 0.6)",
    textSubtle: "rgba(255, 255, 255, 0.4)",
  },

  // Spacing - tighter for compact layout
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    squircle: "22%",
    full: 9999,
  },

  // Shadows - Subtle depth system (less dramatic)
  shadow: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.2)",
    md: "0 2px 8px rgba(0, 0, 0, 0.25)",
    lg: "0 4px 16px rgba(0, 0, 0, 0.3)",
    xl: "0 8px 32px rgba(0, 0, 0, 0.35)",

    // Inset shadows for depth
    inset: "inset 0 1px 2px rgba(0, 0, 0, 0.15)",
    insetSubtle: "inset 0 1px 1px rgba(0, 0, 0, 0.08)",

    // Glow effects - RESERVED FOR PRIMARY CTA ONLY
    glow: {
      gold: "0 0 20px rgba(255, 215, 0, 0.3)",
      goldSubtle: "0 0 10px rgba(255, 215, 0, 0.15)",
      goldIntense: "0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)",
      goldSelected: "0 0 20px rgba(255, 215, 0, 0.3)", // For selected amount pills
      success: "0 0 12px rgba(0, 255, 148, 0.3)",
      successIntense: "0 0 20px rgba(0, 255, 148, 0.4)",
      error: "0 0 12px rgba(239, 68, 68, 0.25)",
    },
  },

  // Glass card styles
  glass: {
    background: "rgba(26, 26, 26, 0.6)",
    backgroundHover: "rgba(32, 32, 32, 0.7)",
    blur: "blur(24px)",
    saturate: "saturate(150%)",
    backdropFilter: "blur(24px) saturate(150%)",
    borderTop: "1px solid rgba(255, 215, 0, 0.4)", // Golden ridge
    borderShadow: "0 1px 0 rgba(0, 0, 0, 0.5)", // Shadow bottom
  },

  // Easing curves
  ease: {
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    springSubtle: "cubic-bezier(0.25, 1.25, 0.5, 1)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    smoothOut: "cubic-bezier(0, 0, 0.2, 1)",
    smoothIn: "cubic-bezier(0.4, 0, 1, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // Durations
  duration: {
    instant: 100,
    fast: 150,
    base: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
  },

  // Typography
  font: {
    mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  // Z-index layers
  zIndex: {
    base: 1,
    dropdown: 100,
    modal: 200,
    tooltip: 300,
  },
} as const

// CSS helper for gradient borders (golden accents)
export const gradientBorder = (opacity = 0.15) => `
  linear-gradient(
    135deg,
    rgba(255, 215, 0, ${opacity}) 0%,
    rgba(255, 255, 255, ${opacity * 0.5}) 50%,
    rgba(255, 215, 0, ${opacity}) 100%
  )
`

// CSS helper for glass card container styles - only top gold highlight + bottom shadow
export const cardContainerStyles = {
  background: tokens.glass.background,
  backdropFilter: tokens.glass.backdropFilter,
  WebkitBackdropFilter: tokens.glass.backdropFilter,
  borderRadius: tokens.radius.xl,
  borderTop: "1px solid rgba(255, 215, 0, 0.5)", // Golden ridge
  borderLeft: "none",
  borderRight: "none",
  borderBottom: "1px solid rgba(0, 0, 0, 0.8)", // Shadow bottom
  boxShadow: `${tokens.shadow.lg}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
  overflow: "hidden" as const,
}

// CSS helper for premium button styles (golden gradient with inset highlight)
export const primaryButtonStyles = {
  background: `linear-gradient(135deg, #FFD700 0%, #FFA500 100%)`,
  color: tokens.colors.bg,
  border: "none",
  borderRadius: tokens.radius.md,
  fontFamily: tokens.font.mono,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(255, 215, 0, 0.3)`,
  transition: `all ${tokens.duration.base}ms ${tokens.ease.smooth}`,
}

// CSS helper for chip/tag styles (glass pill style with white selected)
export const chipStyles = {
  default: {
    background: "rgba(255, 255, 255, 0.05)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: tokens.radius.md,
    boxShadow: "none",
    transition: `all ${tokens.duration.fast}ms ${tokens.ease.smooth}`,
  },
  hover: {
    background: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    boxShadow: "none",
    transform: "translateY(-1px)",
  },
  active: {
    transform: "scale(0.98)",
  },
  selected: {
    background: "#FFFFFF",
    color: "#050505",
    borderColor: "transparent",
    boxShadow: tokens.shadow.glow.goldSelected,
  },
}

// Keyframe animation definitions
export const keyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3);
    }
  }

  @keyframes pulseRing {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(255, 215, 0, 0);
    }
  }

  @keyframes auroraDrift {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-30%, -40%) scale(1.2);
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes successBurst {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes connectPulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(0, 255, 148, 0.4);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(0, 255, 148, 0);
    }
  }

  @keyframes stepGlow {
    0%, 100% {
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
    }
    50% {
      box-shadow: 0 0 16px rgba(255, 215, 0, 0.8);
    }
  }

  @keyframes breathingGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.2);
    }
  }

  @keyframes rotateClockwise {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes rotateCounterClockwise {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes radarSweep {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes beamPulse {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.3; }
  }

  @keyframes messageFade {
    0% { opacity: 0; transform: translateY(8px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-8px); }
  }
`

export default tokens
