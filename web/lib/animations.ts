// TIPZ Animation Library - Premium micro-interactions
// CSS keyframes for cards, reveals, and effects

export const animationKeyframes = `
  /* Fade and slide animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
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

  /* Shimmer and loading */
  @keyframes shimmer {
    0% { opacity: 0.5; }
    50% { opacity: 0.8; }
    100% { opacity: 0.5; }
  }

  /* Pulse animations */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  @keyframes pulse-badge {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
    }
  }

  /* Premium card animations */
  @keyframes borderSweep {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  @keyframes holographicShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes metallicShine {
    0% {
      background-position: -200% 0;
      opacity: 0;
    }
    50% { opacity: 1; }
    100% {
      background-position: 200% 0;
      opacity: 0;
    }
  }

  /* 3D tilt effect */
  @keyframes tiltIn {
    0% { transform: perspective(1000px) rotateX(0) rotateY(0); }
    100% { transform: perspective(1000px) rotateX(-2deg) rotateY(5deg); }
  }

  /* Glitch effect for broken/error states */
  @keyframes glitch {
    0%, 100% {
      transform: translate(0);
      filter: none;
    }
    20% {
      transform: translate(-2px, 1px);
      filter: hue-rotate(90deg);
    }
    40% {
      transform: translate(2px, -1px);
      filter: hue-rotate(-90deg);
    }
    60% {
      transform: translate(-1px, 2px);
    }
    80% {
      transform: translate(1px, -2px);
    }
  }

  @keyframes glitchText {
    0%, 100% {
      text-shadow: 0 0 0 transparent;
    }
    25% {
      text-shadow: -2px 0 #EF4444, 2px 0 #22C55E;
    }
    50% {
      text-shadow: 2px 0 #EF4444, -2px 0 #22C55E;
    }
    75% {
      text-shadow: -1px 0 #EF4444, 1px 0 #22C55E;
    }
  }

  /* Scan line for CRT effect */
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  /* Bar fill animations for stats */
  @keyframes bar-fill {
    from {
      transform: scaleX(0);
      opacity: 0;
    }
    to {
      transform: scaleX(1);
      opacity: 1;
    }
  }

  @keyframes bar-fill-success {
    from {
      transform: scaleX(0);
      opacity: 0;
    }
    to {
      transform: scaleX(1);
      opacity: 1;
    }
  }

  /* Number reveal */
  @keyframes number-fade {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Counter animation (for fee % going down) */
  @keyframes countDown {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(10px); }
  }

  /* Stamp effect */
  @keyframes stampIn {
    0% {
      transform: scale(2) rotate(-15deg);
      opacity: 0;
    }
    50% {
      transform: scale(0.9) rotate(-12deg);
      opacity: 1;
    }
    100% {
      transform: scale(1) rotate(-12deg);
      opacity: 0.8;
    }
  }

  /* Typewriter cursor */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Character entrance for typing effect */
  @keyframes char-enter {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Strikethrough animation */
  @keyframes strikethrough {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  /* Shake effect for emphasis */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }

  /* Celebration particles */
  @keyframes confetti {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) rotate(720deg);
      opacity: 0;
    }
  }

  /* Noise texture animation */
  @keyframes noise {
    0%, 100% { background-position: 0 0; }
    10% { background-position: -5% -10%; }
    20% { background-position: -15% 5%; }
    30% { background-position: 7% -25%; }
    40% { background-position: -5% 25%; }
    50% { background-position: -15% 10%; }
    60% { background-position: 15% 0%; }
    70% { background-position: 0% 15%; }
    80% { background-position: 3% 35%; }
    90% { background-position: -10% 10%; }
  }

  /* Flow pipeline light-up */
  @keyframes flowPulse {
    0% {
      opacity: 0.3;
      box-shadow: none;
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 20px currentColor;
    }
    100% {
      opacity: 0.3;
      box-shadow: none;
    }
  }

  /* Ring/halo effect */
  @keyframes ringPulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.3;
    }
  }

  /* Tip slide in from above */
  @keyframes tipSlideIn {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Progress bar shrink for toast auto-dismiss */
  @keyframes progressShrink {
    from { width: 100%; }
    to { width: 0; }
  }

  /* Particle burst for tip celebration */
  @keyframes particleBurst {
    0% { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; }
  }

  /* Gold border sweep for login card */
  @keyframes goldBorderSweep {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* Scale spring for avatar entrance */
  @keyframes scaleSpring {
    0% { transform: scale(0.85); opacity: 0; }
    60% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* Pulse ring for connected avatar */
  @keyframes avatarPulseRing {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(245, 166, 35, 0.4);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(245, 166, 35, 0);
    }
  }
`;

// Transition presets
export const transitions = {
  fast: "0.15s ease-out",
  normal: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  slow: "0.6s cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

// Easing functions
export const easings = {
  easeOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;
