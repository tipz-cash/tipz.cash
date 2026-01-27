"use client";

import { useEffect, useState, useRef, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Plain [TIPZ] text logo used throughout

// Color palette - refined for depth and atmosphere
const colors = {
  bg: "#08090a",
  bgGradientStart: "#08090a",
  bgGradientEnd: "#0d1117",
  surface: "#12141a",
  surfaceHover: "#1a1d24",
  surfaceLight: "#1e2128",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  primaryGlow: "rgba(245, 166, 35, 0.15)",
  primaryGlowStrong: "rgba(245, 166, 35, 0.3)",
  success: "#22C55E",
  successGlow: "rgba(34, 197, 94, 0.2)",
  error: "#EF4444",
  errorGlow: "rgba(239, 68, 68, 0.15)",
  muted: "#6B7280",
  border: "#2a2f38",
  borderHover: "#3d4450",
  text: "#D1D5DB",
  textBright: "#F9FAFB",
};

const chapters = [
  { id: "hero", num: "01", title: "THE PROMISE" },
  { id: "broken", num: "02", title: "WHY TIPPING IS BROKEN" },
  { id: "solution", num: "03", title: "THE SOLUTION" },
  { id: "proof", num: "04", title: "PROOF" },
  { id: "how-it-works", num: "05", title: "HOW IT WORKS" },
  { id: "creator-tools", num: "06", title: "CREATOR TOOLS" },
  { id: "any-token", num: "07", title: "ANY TOKEN" },
  { id: "faq", num: "08", title: "FAQ" },
  { id: "join", num: "09", title: "JOIN" },
];

// Check for reduced motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Hook for responsive breakpoint detection
function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// Hook for count-up animation
function useCountUp(target: number, duration: number = 2500, delay: number = 400) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    // Add delay before animation starts
    const delayTimer = setTimeout(() => {
      const startTime = performance.now();
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        setCount(Math.round(easedProgress * target));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [hasStarted, target, duration, delay, prefersReducedMotion]);

  return { ref, count };
}

// Hook for count-down animation (100 → 0)
function useCountDown(duration: number = 2500, delay: number = 400) {
  const [count, setCount] = useState(100);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    if (prefersReducedMotion) {
      setCount(0);
      return;
    }

    // Add delay before animation starts
    const delayTimer = setTimeout(() => {
      const startTime = performance.now();
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        setCount(Math.round(100 - (easedProgress * 100)));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [hasStarted, duration, delay, prefersReducedMotion]);

  return { ref, count };
}

// Hook for parallax scroll effect
function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.scrollY * speed);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, prefersReducedMotion]);

  return offset;
}

// Typing effect hook
function useTypingEffect(text: string, speed: number = 50, delay: number = 0) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    let index = 0;
    setDisplayText("");
    setIsComplete(false);

    const startTimer = setTimeout(() => {
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, speed, delay, prefersReducedMotion]);

  return { displayText, isComplete };
}

// Premium typing effect hook with human-like rhythm
function usePremiumTypingEffect(
  text: string,
  options: {
    baseSpeed?: number;
    varianceRange?: number;
    pauseOnSpace?: number;
    pauseOnPunctuation?: number;
    accelerationCurve?: boolean;
    initialDelay?: number;
  } = {}
) {
  const {
    baseSpeed = 55,
    varianceRange = 25,
    pauseOnSpace = 80,
    pauseOnPunctuation = 150,
    accelerationCurve = true,
    initialDelay = 400,
  } = options;

  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [newCharIndex, setNewCharIndex] = useState(-1);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    let index = 0;
    setDisplayText("");
    setIsComplete(false);
    setNewCharIndex(-1);

    // Track all timer IDs for proper cleanup
    const timerIds: NodeJS.Timeout[] = [];

    const getNextDelay = (char: string, position: number) => {
      // Base speed with random variance for organic feel
      let delay = baseSpeed + (Math.random() - 0.5) * varianceRange * 2;

      // Acceleration curve: starts 40% slower, speeds up mid-sentence
      if (accelerationCurve) {
        const progress = position / text.length;
        // Slow start, fast middle, slight deceleration at end
        const curveMultiplier =
          progress < 0.2
            ? 1.4 - progress * 2 // 1.4 -> 1.0 in first 20%
            : progress > 0.8
            ? 0.95 + (progress - 0.8) * 0.5 // slight slowdown at end
            : 1.0;
        delay *= curveMultiplier;
      }

      // Natural pauses on word boundaries
      if (char === " ") {
        delay += pauseOnSpace;
      }

      // Dramatic pauses on punctuation
      if ([",", ".", "!", "?", ";", ":"].includes(char)) {
        delay += pauseOnPunctuation;
      }

      return delay;
    };

    const typeNextChar = () => {
      if (index < text.length) {
        const currentChar = text[index];
        setDisplayText(text.slice(0, index + 1));
        setNewCharIndex(index);
        index++;

        const delay = getNextDelay(currentChar, index);
        const timerId = setTimeout(typeNextChar, delay);
        timerIds.push(timerId);
      } else {
        setIsComplete(true);
        setNewCharIndex(-1);
      }
    };

    const startTimer = setTimeout(() => {
      typeNextChar();
    }, initialDelay);
    timerIds.push(startTimer);

    // Clear ALL timers on cleanup to prevent memory leaks
    return () => timerIds.forEach(clearTimeout);
  }, [text, baseSpeed, varianceRange, pauseOnSpace, pauseOnPunctuation, accelerationCurve, initialDelay, prefersReducedMotion]);

  return { displayText, isComplete, newCharIndex };
}

// Intersection Observer hook for scroll animations
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Typing effect that triggers on view
function useTypingOnView(text: string, speed: number = 35) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    let observer: IntersectionObserver | null = null;

    // Use requestAnimationFrame to ensure layout is complete before checking visibility
    const checkVisibility = () => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        setIsInView(true);
      } else {
        // Only set up observer if not already visible
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer?.disconnect();
            }
          },
          { threshold: 0.05 } // Very low threshold for reliable triggering
        );
        observer.observe(element);
      }
    };

    // Wait for next frame to ensure layout is complete
    requestAnimationFrame(checkVisibility);

    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || hasStarted) return;

    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      setHasStarted(true);
      return;
    }

    setHasStarted(true);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [isInView, hasStarted, text, speed, prefersReducedMotion]);

  return { ref, displayText, isComplete, hasStarted };
}

// ZEC price ticker component
function ZecTicker() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch("/api/zec-price");
        const data = await res.json();
        setPrice(data.price);
      } catch {
        setPrice(27.50);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      color: colors.muted,
      fontSize: "11px",
      letterSpacing: "1px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      ZEC {price ? `$${price.toFixed(2)}` : "—"}
    </span>
  );
}

// Typing heading component for chapter titles
function TypingHeading({
  prefix,
  prefixColor,
  text,
  suffix,
  suffixColor,
  style,
}: {
  prefix?: string;
  prefixColor?: string;
  text: string;
  suffix?: string;
  suffixColor?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Intersection observer - trigger animation when scrolled into view
  useEffect(() => {
    if (!ref.current || hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasTriggered]);

  // Start typing animation once triggered
  useEffect(() => {
    if (!hasTriggered) return;

    let index = 0;
    const timer = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [hasTriggered, text]);

  // Blink cursor until complete
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <h2
      ref={ref}
      style={{
        fontSize: "32px",
        fontWeight: 600,
        marginBottom: "32px",
        lineHeight: 1.3,
        color: colors.textBright,
        ...style,
      }}
    >
      {prefix && <span style={{ color: prefixColor || colors.success }}>{prefix}</span>}
      {prefix && " "}
      {displayText}
      {!isComplete && (
        <span style={{ color: colors.primary, opacity: cursorVisible ? 1 : 0 }}>█</span>
      )}
      {isComplete && suffix && (
        <span style={{ color: suffixColor || colors.primary }}>{suffix}</span>
      )}
    </h2>
  );
}

// Hook to track current chapter
function useCurrentChapter() {
  const [currentChapter, setCurrentChapter] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    chapters.forEach((chapter, index) => {
      const element = document.getElementById(chapter.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setCurrentChapter(index);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return currentChapter;
}

// Terminal-style reveal component
function TerminalReveal({
  children,
  delay = 0,
  showCursor = false,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  showCursor?: boolean;
  style?: React.CSSProperties;
}) {
  const { ref, isInView } = useInView(0.15);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [isInView, delay, prefersReducedMotion]);

  useEffect(() => {
    if (!showCursor || !visible) return;
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, [showCursor, visible]);

  const shouldAnimate = !prefersReducedMotion;

  return (
    <div
      ref={ref}
      style={{
        opacity: shouldAnimate ? (visible ? 1 : 0) : 1,
        transform: shouldAnimate ? (visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)") : "none",
        transition: shouldAnimate ? "opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        ...style,
      }}
    >
      {children}
      {showCursor && visible && (
        <span style={{ color: colors.primary, opacity: cursorVisible ? 1 : 0, marginLeft: "2px" }}>_</span>
      )}
    </div>
  );
}

// Animated tip notification that triggers on scroll
function TipNotification() {
  const { ref, isInView } = useInView(0.3);
  const [stage, setStage] = useState(0); // 0: hidden, 1: pop-in, 2: header, 3: amount, 4: subtitle, 5: complete
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setStage(5);
      return;
    }

    // Staggered animation timeline
    const timers = [
      setTimeout(() => setStage(1), 1200),  // Pop-in starts
      setTimeout(() => setStage(2), 1400),  // Header fades in
      setTimeout(() => setStage(3), 1700),  // Amount bounces in
      setTimeout(() => setStage(4), 2100),  // Subtitle fades in
      setTimeout(() => setStage(5), 2400),  // All complete, glow starts
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [isInView, prefersReducedMotion]);

  const shouldAnimate = !prefersReducedMotion;

  return (
    <div
      ref={ref}
      className={stage >= 5 ? "tip-notification-glow" : ""}
      style={{
        position: "absolute",
        top: "12%",
        right: "-8%",
        background: "linear-gradient(145deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 165, 0, 0.15) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 215, 0, 0.5)",
        borderRadius: "16px",
        padding: "16px 22px",
        zIndex: 10,
        opacity: shouldAnimate ? (stage >= 1 ? 1 : 0) : 1,
        transform: shouldAnimate
          ? stage === 0
            ? "scale(0.8) translateY(-20px)"
            : stage === 1
              ? "scale(1.08) translateY(4px)"
              : "scale(1) translateY(0)"
          : "none",
        transition: shouldAnimate
          ? stage === 1
            ? "opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "opacity 0.2s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "none",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
        opacity: shouldAnimate ? (stage >= 2 ? 1 : 0) : 1,
        transform: shouldAnimate ? (stage >= 2 ? "translateY(0)" : "translateY(8px)") : "none",
        transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span style={{ color: "#FFD700", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" }}>
          TIP RECEIVED
        </span>
      </div>

      {/* Amount with shimmer */}
      <div
        className={stage >= 3 ? "tip-amount-shimmer" : ""}
        style={{
          color: "#fff",
          fontSize: "28px",
          fontWeight: 800,
          lineHeight: 1,
          opacity: shouldAnimate ? (stage >= 3 ? 1 : 0) : 1,
          transform: shouldAnimate
            ? stage < 3
              ? "scale(0.5)"
              : stage === 3
                ? "scale(1.15)"
                : "scale(1)"
            : "none",
          transition: stage === 3
            ? "opacity 0.2s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "opacity 0.2s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        +$25.00
      </div>

      {/* Subtitle */}
      <div style={{
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: "10px",
        marginTop: "6px",
        opacity: shouldAnimate ? (stage >= 4 ? 1 : 0) : 1,
        transform: shouldAnimate ? (stage >= 4 ? "translateY(0)" : "translateY(6px)") : "none",
        transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
      }}>
        Shielded • Just now
      </div>
    </div>
  );
}

// Iron Man Morph - Hero animation that transforms link preview into payment terminal
// 4-phase animation: Tweet → Card → Processing → Receipt

// Memoized constants (defined outside component to avoid recreation)
const IRONMAN_SPRING_CONFIG = { type: "spring" as const, stiffness: 120, damping: 20 };
const IRONMAN_BASE_WIDTH = 460;
const IRONMAN_BASE_HEIGHT = 580;
const IRONMAN_TWEET_WIDTH = 400;
const IRONMAN_CARD_WIDTH = 340;

function IronManMorph({ isVisible, scale = 1 }: { isVisible: boolean; scale?: number }) {
  // 4-phase animation: 0=tweet, 1=card, 2=processing, 3=receipt
  const [phase, setPhase] = useState(0);
  const [sendButtonClicked, setSendButtonClicked] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Animation timeline - 7 second loop matching the motion script
  // Phase 0: The Hook (0-2s) - Tweet context with cursor animation
  // Phase 1: The Expansion + Input (2-3.5s) - Card morphs, user clicks Send
  // Phase 2: The Scrub (3.5-5s) - Processing with "identity scrubbed" message
  // Phase 3: The Payoff (5-7s) - Receipt with SEALED badge
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, visible: false, hovering: null as string | null });

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    const LOOP_DURATION = 7000;

    const timeline = [
      { phase: 0, delay: 0 },       // The Hook (2.0s)
      { phase: 1, delay: 2000 },    // The Expansion + Input (1.5s)
      { phase: 2, delay: 3500 },    // The Scrub (1.5s)
      { phase: 3, delay: 5000 },    // The Payoff (2.0s)
      { phase: 0, delay: LOOP_DURATION },   // Loop reset
    ];

    // Track all timer IDs for proper cleanup
    let timerIds: NodeJS.Timeout[] = [];

    const clearAllTimers = () => {
      timerIds.forEach(clearTimeout);
      timerIds = [];
    };

    const runTimeline = () => {
      // Clear previous timers before starting new ones
      clearAllTimers();

      timeline.forEach(({ phase: p, delay }) => {
        timerIds.push(setTimeout(() => setPhase(p), delay));
      });

      // Cursor animation during The Hook (phase 0)
      // 0-1s: Static pause (cursor hidden)
      // 1-1.4s: Cursor appears, moves to $5 chip (in link preview card)
      // 1.4-1.7s: Hover $5 chip (glow effect)
      // 1.7-2s: Move to Send button, hover
      // Tweet 2 with link preview starts around y=180, link preview at y=230
      // Chips row inside link preview at ~y=280, Send button at ~y=380
      timerIds.push(setTimeout(() => setCursorPosition({ x: 80, y: 200, visible: true, hovering: null }), 1000));
      timerIds.push(setTimeout(() => setCursorPosition({ x: 140, y: 285, visible: true, hovering: '$5' }), 1200));
      timerIds.push(setTimeout(() => setCursorPosition({ x: 175, y: 365, visible: true, hovering: 'send' }), 1700));
      timerIds.push(setTimeout(() => setCursorPosition({ x: 0, y: 0, visible: false, hovering: null }), 2000));

      // Button click effect just before processing phase (at 3.2s)
      timerIds.push(setTimeout(() => setSendButtonClicked(true), 3200));
      timerIds.push(setTimeout(() => setSendButtonClicked(false), 3500));
    };

    // Initial run
    runTimeline();

    // Continuous loop
    const loopInterval = setInterval(runTimeline, LOOP_DURATION);

    return () => {
      clearInterval(loopInterval);
      clearAllTimers();
    };
  }, [isVisible, prefersReducedMotion]);

  const shouldAnimate = !prefersReducedMotion;

  // Use memoized constants
  const springConfig = IRONMAN_SPRING_CONFIG;
  const tweetWidth = IRONMAN_TWEET_WIDTH;
  const cardWidth = IRONMAN_CARD_WIDTH;

  const width = IRONMAN_BASE_WIDTH * scale;
  const height = IRONMAN_BASE_HEIGHT * scale;

  // Glass card styles - memoized to avoid recreation on every render
  const glassCard = useMemo(() => ({
    background: "rgba(26, 26, 26, 0.6)",
    backdropFilter: "blur(24px) saturate(150%)",
    WebkitBackdropFilter: "blur(24px) saturate(150%)",
    borderTop: "1px solid rgba(255, 215, 0, 0.5)",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.8)",
    boxShadow: scale < 1
      ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
      : "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    borderRadius: `${24 * scale}px`,
  }), [scale]);

  return (
    <div style={{
      position: "relative",
      width: `${width}px`,
      height: `${height}px`,
    }}>
      {/* Background Tweet Layer - opacity/scale only (no blur for GPU perf) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: phase >= 1 ? 0.15 : 1,
          transform: phase >= 1 ? "scale(0.95)" : "scale(1)",
          transition: shouldAnimate ? "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          willChange: shouldAnimate ? "opacity, transform" : "auto",
        }}
      >
        {/* Tweet Thread Container - Single connected card */}
        <div style={{
          backgroundColor: "#000000",
          border: "1px solid rgb(47, 51, 54)",
          borderRadius: `${16 * scale}px`,
          padding: `${16 * scale}px`,
          width: `${tweetWidth * scale}px`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          {/* Tweet 1: The Hook */}
          <div style={{ display: "flex", gap: `${12 * scale}px` }}>
            {/* Avatar Column with Thread Line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <img
                src="https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg"
                alt="Naval"
                style={{
                  width: `${40 * scale}px`,
                  height: `${40 * scale}px`,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              {/* Thread Line connecting to Tweet 2 */}
              <div style={{
                width: `${2 * scale}px`,
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                marginTop: `${4 * scale}px`,
                minHeight: `${60 * scale}px`,
              }} />
            </div>
            {/* Tweet 1 Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: `${4 * scale}px` }}>
                  <span style={{ fontWeight: 700, fontSize: `${15 * scale}px`, color: "#E7E9EA" }}>Naval</span>
                  <svg width={18 * scale} height={18 * scale} viewBox="0 0 22 22" fill="none">
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" fill="#1D9BF0"/>
                  </svg>
                </div>
                <svg width={20 * scale} height={20 * scale} viewBox="0 0 24 24" fill="#E7E9EA" style={{ opacity: 0.6 }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: `${4 * scale}px`, color: "rgb(113, 118, 123)", fontSize: `${15 * scale}px` }}>
                <span>@naval</span>
                <span>·</span>
                <span>3h</span>
              </div>
              <p style={{ fontSize: `${15 * scale}px`, lineHeight: 1.5, color: "#E7E9EA", margin: `${12 * scale}px 0 ${12 * scale}px 0` }}>
                Privacy is the only luxury they can't inflate.
              </p>
              {/* Engagement Bar - on Tweet 1 */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: `${12 * scale}px`,
                borderTop: "1px solid rgb(47, 51, 54)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: `${6 * scale}px`, color: "rgb(113, 118, 123)", fontSize: `${13 * scale}px` }}>
                  <svg width={18 * scale} height={18 * scale} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                  </svg>
                  <span>1.2K</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: `${6 * scale}px`, color: "rgb(113, 118, 123)", fontSize: `${13 * scale}px` }}>
                  <svg width={18 * scale} height={18 * scale} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                  </svg>
                  <span>4.8K</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: `${6 * scale}px`, color: "rgb(113, 118, 123)", fontSize: `${13 * scale}px` }}>
                  <svg width={18 * scale} height={18 * scale} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                  </svg>
                  <span>32K</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: `${6 * scale}px`, color: "rgb(113, 118, 123)", fontSize: `${13 * scale}px` }}>
                  <svg width={18 * scale} height={18 * scale} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                  </svg>
                  <span>2.1M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tweet 2: The Delivery */}
          <div style={{ display: "flex", gap: `${12 * scale}px`, marginTop: `${4 * scale}px` }}>
            {/* Avatar */}
            <img
              src="https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg"
              alt="Naval"
              style={{
                width: `${40 * scale}px`,
                height: `${40 * scale}px`,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            {/* Tweet 2 Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: `${4 * scale}px` }}>
                <span style={{ fontWeight: 700, fontSize: `${15 * scale}px`, color: "#E7E9EA" }}>Naval</span>
                <svg width={18 * scale} height={18 * scale} viewBox="0 0 22 22" fill="none">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" fill="#1D9BF0"/>
                </svg>
                <span style={{ color: "rgb(113, 118, 123)", fontSize: `${15 * scale}px` }}>·</span>
                <span style={{ color: "rgb(113, 118, 123)", fontSize: `${15 * scale}px` }}>3h</span>
              </div>
              <p style={{ fontSize: `${15 * scale}px`, lineHeight: 1.5, color: "#E7E9EA", margin: `${8 * scale}px 0 ${12 * scale}px 0` }}>
                Shielded tips open here 👇
              </p>

              {/* Link Preview Card (click effect on phase 1) - Wall-to-Wall Dense Terminal */}
              <motion.div
                style={{
                  position: "relative",
                  background: "rgba(18, 18, 18, 0.95)",
                  borderRadius: `${10 * scale}px`,
                  width: "100%",
                  height: `${(tweetWidth - 32) / 1.91 * scale}px`,
                  cursor: "pointer",
                  overflow: "hidden",
                  boxShadow: `inset 0 1px 0 0 rgba(255, 235, 160, 0.25), 0 8px 24px rgba(0, 0, 0, 0.4)`,
                }}
                animate={{
                  scale: phase === 1 ? [1, 0.98, 1] : 1,
                  opacity: phase === 1 ? [1, 0.9, 1] : 1,
                }}
                transition={{
                  duration: 0.15,
                  times: [0, 0.5, 1],
                }}
              >
                {/* Wall-to-Wall Dense Content */}
                <div style={{
                  position: "relative",
                  height: "100%",
                  padding: `${12 * scale}px`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}>
                  {/* Top Section: Identity + Trust */}
                  <div style={{ display: "flex", flexDirection: "column", gap: `${3 * scale}px` }}>
                    {/* Row 1 - Identity: Avatar + Handle (MASSIVE HEADLINE) */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: `${8 * scale}px`,
                    }}>
                      {/* Avatar - Squircle */}
                      <img
                        src="https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg"
                        alt="Naval"
                        style={{
                          width: `${24 * scale}px`,
                          height: `${24 * scale}px`,
                          borderRadius: `${6 * scale}px`,
                          objectFit: "cover",
                          flexShrink: 0,
                          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                        }}
                      />

                      {/* @naval - EXTRA BOLD HEADLINE */}
                      <div style={{
                        fontSize: `${20 * scale}px`,
                        fontWeight: 800,
                        color: "#FFFFFF",
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "-1px",
                      }}>
                        @naval
                      </div>
                    </div>

                    {/* Row 2 - Trust: The Green Points (wider spacing) */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: `${14 * scale}px`,
                      marginLeft: `${32 * scale}px`,
                    }}>
                      {/* Shield - Private */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
                        <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span style={{ fontSize: `${7 * scale}px`, fontWeight: 600, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>
                          Private
                        </span>
                      </div>

                      {/* Lightning - Instant */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
                        <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <span style={{ fontSize: `${7 * scale}px`, fontWeight: 600, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>
                          Instant
                        </span>
                      </div>

                      {/* Ban/Circle - 0% fees */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
                        <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        <span style={{ fontSize: `${7 * scale}px`, fontWeight: 600, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>
                          0% fees
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Controls - 4-Stack Layout */}
                  <div style={{ display: "flex", flexDirection: "column", gap: `${5 * scale}px` }}>
                    {/* Row 1 - Chips: FULL WIDTH KEYBOARD */}
                    <div style={{
                      display: "flex",
                      width: "100%",
                      gap: `${4 * scale}px`,
                    }}>
                      {[
                        { amount: "$1", selected: false },
                        { amount: "$5", selected: true },
                        { amount: "$10", selected: false },
                        { amount: "$25", selected: false },
                      ].map((chip) => {
                        const isHovered = chip.amount === "$5" && cursorPosition.hovering === "$5";
                        return (
                          <div
                            key={chip.amount}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: `${28 * scale}px`,
                              borderRadius: `${4 * scale}px`,
                              fontSize: `${10 * scale}px`,
                              fontWeight: 700,
                              fontFamily: "'JetBrains Mono', monospace",
                              transition: "all 0.15s ease-out",
                              ...(chip.selected
                                ? {
                                    backgroundColor: isHovered ? "#FFFFFF" : "#FFFFFF",
                                    color: "#050505",
                                    boxShadow: isHovered
                                      ? "0 0 24px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), 0 0 8px rgba(255, 255, 255, 0.9)"
                                      : "0 0 16px rgba(255, 215, 0, 0.5), 0 0 6px rgba(255, 215, 0, 0.3)",
                                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                                  }
                                : {
                                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                                    color: "rgba(255, 255, 255, 0.5)",
                                  }),
                            }}
                          >
                            {chip.amount}
                          </div>
                        );
                      })}
                    </div>

                    {/* Row 2 - Private Note: MESSAGE TRENCH */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      height: `${26 * scale}px`,
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      borderRadius: `${4 * scale}px`,
                      padding: `0 ${8 * scale}px`,
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}>
                      {/* Left: Placeholder text */}
                      <span style={{
                        color: "rgba(255, 255, 255, 0.4)",
                        fontSize: `${7 * scale}px`,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        Add a private note...
                      </span>

                      {/* Right: ENCRYPTED badge */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: `${2 * scale}px`,
                        padding: `${2 * scale}px ${4 * scale}px`,
                        background: "rgba(0, 255, 148, 0.1)",
                        borderRadius: `${3 * scale}px`,
                      }}>
                        <svg width={6 * scale} height={6 * scale} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span style={{
                          color: "#10B981",
                          fontSize: `${5 * scale}px`,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: "0.5px",
                        }}>
                          ENCRYPTED
                        </span>
                      </div>
                    </div>

                    {/* Row 3 - Token Selector: NETWORK DROPDOWN */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      height: `${26 * scale}px`,
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      borderRadius: `${4 * scale}px`,
                      padding: `0 ${8 * scale}px`,
                      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}>
                      {/* Left: ETH Token */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${4 * scale}px` }}>
                        {/* ETH Diamond Icon */}
                        <div style={{
                          width: `${12 * scale}px`,
                          height: `${12 * scale}px`,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #627EEA 0%, #3C3C3D 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <svg width={7 * scale} height={7 * scale} viewBox="0 0 256 417" fill="none">
                            <path fill="#fff" fillOpacity="0.6" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                            <path fill="#fff" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
                          </svg>
                        </div>
                        <span style={{
                          color: "#FFFFFF",
                          fontSize: `${8 * scale}px`,
                          fontWeight: 600,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          ETH
                        </span>
                      </div>

                      {/* Right: Balance + Chevron */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${4 * scale}px` }}>
                        <span style={{
                          color: "rgba(255, 255, 255, 0.5)",
                          fontSize: `${6 * scale}px`,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          0.0998
                        </span>
                        <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>

                    {/* Row 4 - Send Button: FULL WIDTH ANCHOR */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: `${28 * scale}px`,
                      background: cursorPosition.hovering === "send"
                        ? "linear-gradient(180deg, #FFE066 0%, #FFB020 50%, #E8850A 100%)"
                        : "linear-gradient(180deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
                      borderRadius: `${4 * scale}px`,
                      fontSize: `${9 * scale}px`,
                      fontWeight: 700,
                      color: "#050505",
                      fontFamily: "'JetBrains Mono', monospace",
                      boxShadow: cursorPosition.hovering === "send"
                        ? "inset 0 2px 0 rgba(255, 255, 255, 0.5), 0 6px 20px rgba(255, 215, 0, 0.7), 0 0 30px rgba(255, 215, 0, 0.4)"
                        : "inset 0 2px 0 rgba(255, 255, 255, 0.4), 0 4px 12px rgba(255, 215, 0, 0.5)",
                      transform: cursorPosition.hovering === "send" ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.15s ease-out",
                    }}>
                      Send $5.00
                    </div>
                  </div>
                </div>

                {/* Domain Badge - Twitter-style, fades out on expand */}
                <motion.div
                  style={{
                    position: "absolute",
                    bottom: `${6 * scale}px`,
                    left: `${6 * scale}px`,
                    background: "rgba(0, 0, 0, 0.75)",
                    borderRadius: `${10 * scale}px`,
                    padding: `${3 * scale}px ${8 * scale}px`,
                    display: "flex",
                    alignItems: "center",
                    gap: `${4 * scale}px`,
                  }}
                  animate={{
                    opacity: phase === 0 ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width={10 * scale} height={10 * scale} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: `${9 * scale}px`,
                    fontWeight: 500,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}>
                    tipz.cash
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Card - visible in phases 1, 2, 3 (stays in place through entire flow) */}
      <motion.div
        style={{
          position: "absolute",
          bottom: `${40 * scale}px`,
          right: "0px",
          width: `${cardWidth * scale}px`,
          ...glassCard,
          padding: `${16 * scale}px`,
          transformOrigin: "top left",
          zIndex: 10,
          pointerEvents: "none",
        }}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{
          scale: phase >= 1 ? 1 : 0.1,
          opacity: phase >= 1 ? 1 : 0,
        }}
        transition={shouldAnimate ? {
          opacity: { duration: 0.2 },
          scale: { delay: 0.2, ...springConfig }
        } : { duration: 0 }}
      >
        {/* Header: Avatar + Handle + Shield Badge - Compact style */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: `${8 * scale}px`,
          marginBottom: `${10 * scale}px`,
          paddingBottom: `${8 * scale}px`,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          opacity: phase >= 1 && phase <= 2 ? 1 : 0,
          transform: phase >= 1 && phase <= 2 ? "translateX(0)" : "translateX(-30px)",
          transition: shouldAnimate ? "all 0.3s ease-out 0.1s" : "none",
        }}>
          {/* Avatar - squircle with inner glow */}
          <img
            src="https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg"
            alt="Naval"
            style={{
              width: `${48 * scale}px`,
              height: `${48 * scale}px`,
              borderRadius: "22%",
              objectFit: "cover",
              boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
              flexShrink: 0,
            }}
          />
          {/* Handle + Shield */}
          <div style={{ display: "flex", alignItems: "center", gap: `${4 * scale}px` }}>
            <span style={{
              color: "#FFFFFF",
              fontSize: `${16 * scale}px`,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              @naval
            </span>
            {/* Gold shield badge */}
            <svg width={12 * scale} height={12 * scale} viewBox="0 0 24 24" fill="#FFD700" stroke="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" stroke="#050505" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Amount Selector Pills - Full width keyboard style */}
        <div style={{
          display: "flex",
          gap: `${6 * scale}px`,
          width: "100%",
          marginBottom: `${10 * scale}px`,
          opacity: phase >= 1 && phase <= 2 ? 1 : 0,
          transform: phase >= 1 && phase <= 2 ? "translateX(0)" : "translateX(-30px)",
          transition: shouldAnimate ? "all 0.3s ease-out 0.15s" : "none",
        }}>
          {[1, 5, 10, 25].map((amount) => {
            const isSelected = amount === 5;
            return (
              <div
                key={amount}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: `${44 * scale}px`,
                  background: isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.06)",
                  border: isSelected ? "none" : "none",
                  borderRadius: `${8 * scale}px`,
                  color: isSelected ? "#050505" : "rgba(255, 255, 255, 0.5)",
                  fontSize: `${15 * scale}px`,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: isSelected ? "0 0 20px rgba(255, 215, 0, 0.5), 0 0 8px rgba(255, 215, 0, 0.3)" : "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                ${amount}
              </div>
            );
          })}
        </div>

        {/* Message Trench - Matching OG style */}
        <div style={{
          width: "100%",
          height: `${40 * scale}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${12 * scale}px`,
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: `${8 * scale}px`,
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
          marginBottom: `${10 * scale}px`,
          opacity: phase >= 1 && phase <= 2 ? 1 : 0,
          transform: phase >= 1 && phase <= 2 ? "translateX(0)" : "translateX(-30px)",
          transition: shouldAnimate ? "all 0.3s ease-out 0.2s" : "none",
        }}>
          <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: `${13 * scale}px`, fontFamily: "'JetBrains Mono', monospace" }}>
            Add a private note...
          </span>
          {/* ENCRYPTED badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: `${3 * scale}px`,
            padding: `${3 * scale}px ${6 * scale}px`,
            background: "rgba(0, 255, 148, 0.1)",
            borderRadius: `${6 * scale}px`,
            flexShrink: 0,
          }}>
            <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{ color: "#00FF94", fontSize: `${7 * scale}px`, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.5px" }}>
              ENCRYPTED
            </span>
          </div>
        </div>

        {/* Token Selector - Matching OG style */}
        <div style={{
          width: "100%",
          height: `${40 * scale}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${12 * scale}px`,
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: `${8 * scale}px`,
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          marginBottom: `${10 * scale}px`,
          opacity: phase >= 1 && phase <= 2 ? 1 : 0,
          transform: phase >= 1 && phase <= 2 ? "translateX(0)" : "translateX(-30px)",
          transition: shouldAnimate ? "all 0.3s ease-out 0.25s" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: `${8 * scale}px` }}>
            {/* ETH logo */}
            <div style={{
              width: `${24 * scale}px`,
              height: `${24 * scale}px`,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #627EEA 0%, #3C3C3D 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width={10 * scale} height={10 * scale} viewBox="0 0 256 417" fill="none">
                <path fill="#fff" fillOpacity="0.6" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                <path fill="#fff" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
              </svg>
            </div>
            <span style={{ color: "#FFFFFF", fontSize: `${14 * scale}px`, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              ETH
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: `${6 * scale}px` }}>
            <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${10 * scale}px`, fontFamily: "'JetBrains Mono', monospace" }}>
              0.0998
            </span>
            <svg width={12 * scale} height={12 * scale} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Send Button - Matching OG style with vertical gold gradient */}
        <motion.div
          style={{
            opacity: phase >= 1 && phase <= 2 ? 1 : 0,
            transform: phase >= 1 && phase <= 2 ? "translateX(0)" : "translateX(-30px)",
            transition: shouldAnimate ? "opacity 0.3s ease-out 0.3s, transform 0.3s ease-out 0.3s" : "none",
          }}
          animate={{
            scale: sendButtonClicked ? 0.95 : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          <button
            style={{
              width: "100%",
              height: `${44 * scale}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: sendButtonClicked
                ? "linear-gradient(180deg, #E5C240 0%, #D98F0A 50%, #C06A05 100%)"
                : "linear-gradient(180deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
              border: "none",
              borderRadius: `${8 * scale}px`,
              color: "#050505",
              fontSize: `${15 * scale}px`,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.5px",
              boxShadow: sendButtonClicked
                ? "inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(255, 215, 0, 0.3)"
                : "inset 0 2px 0 rgba(255, 255, 255, 0.4), 0 8px 24px rgba(255, 215, 0, 0.5)",
              transition: "background 0.1s ease, box-shadow 0.1s ease",
            }}
          >
            Send $5.00
          </button>
        </motion.div>

        {/* Trust Footer - Compact style */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: `${12 * scale}px`,
          marginTop: `${10 * scale}px`,
          paddingTop: `${8 * scale}px`,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          opacity: phase >= 1 && phase <= 2 ? 1 : 0,
          transform: phase >= 1 && phase <= 2 ? "translateX(0)" : "translateX(-30px)",
          transition: shouldAnimate ? "all 0.3s ease-out 0.35s" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
            <svg width={10 * scale} height={10 * scale} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: `${9 * scale}px`, fontFamily: "'JetBrains Mono', monospace" }}>Private</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
            <svg width={10 * scale} height={10 * scale} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: `${9 * scale}px`, fontFamily: "'JetBrains Mono', monospace" }}>Instant</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
            <svg width={10 * scale} height={10 * scale} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="4" y1="4" x2="20" y2="20" />
            </svg>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: `${9 * scale}px`, fontFamily: "'JetBrains Mono', monospace" }}>0% fees</span>
          </div>
        </div>

        {/* Processing Overlay - Phase 2: The Private Tunnel */}
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5, 5, 5, 0.98)",
                borderRadius: `${24 * scale}px`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Vertical Light Beam (behind shield) */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "2px",
                  height: "100%",
                  background: "linear-gradient(to bottom, transparent, rgba(255, 215, 0, 0.3), transparent)",
                }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Hero Shield with Cryptex Rings */}
              <div style={{
                width: `${80 * scale}px`,
                height: `${80 * scale}px`,
                position: "relative",
                marginBottom: `${16 * scale}px`,
              }}>
                {/* Outer rotating ring (clockwise) */}
                <motion.svg
                  style={{
                    position: "absolute",
                    inset: `${-6 * scale}px`,
                    width: `${92 * scale}px`,
                    height: `${92 * scale}px`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  viewBox="0 0 92 92"
                >
                  <circle
                    cx="46"
                    cy="46"
                    r="42"
                    fill="none"
                    stroke="rgba(255, 215, 0, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="6 10"
                  />
                </motion.svg>

                {/* Inner rotating ring (counter-clockwise) */}
                <motion.svg
                  style={{
                    position: "absolute",
                    inset: `${4 * scale}px`,
                    width: `${72 * scale}px`,
                    height: `${72 * scale}px`,
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  viewBox="0 0 72 72"
                >
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    stroke="rgba(255, 215, 0, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                </motion.svg>

                {/* Shield container with breathing glow */}
                <motion.div
                  style={{
                    position: "absolute",
                    inset: `${12 * scale}px`,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.03))",
                    border: "2px solid #FFD700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                  animate={{ boxShadow: ["0 0 20px rgba(255, 215, 0, 0.2)", "0 0 40px rgba(255, 215, 0, 0.4)", "0 0 20px rgba(255, 215, 0, 0.2)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Radar sweep overlay */}
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "conic-gradient(from 0deg, transparent 0deg, rgba(255, 215, 0, 0.3) 30deg, transparent 60deg)",
                      opacity: 0.5,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Shield Icon */}
                  <svg
                    width={28 * scale}
                    height={28 * scale}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="1.5"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" stroke="#00FF94" strokeWidth="2" />
                  </svg>
                </motion.div>
              </div>

              {/* Status Text */}
              <motion.div
                style={{ textAlign: "center" }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div style={{
                  color: "#FFFFFF",
                  fontSize: `${12 * scale}px`,
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.5px",
                  marginBottom: `${4 * scale}px`,
                }}>
                  Establishing Secure Channel...
                </div>
                <div style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: `${9 * scale}px`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  Your identity is being scrubbed
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Content - Phase 3: The Shielded Receipt (slides in from right) */}
        <AnimatePresence>
          {phase === 3 && (
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: `${16 * scale}px`,
                textAlign: "center" as const,
              }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Locking Shield Animation */}
              <div
                style={{
                  width: `${56 * scale}px`,
                  height: `${56 * scale}px`,
                  marginBottom: `${12 * scale}px`,
                  position: "relative",
                }}
              >
                <svg
                  width={56 * scale}
                  height={56 * scale}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.5))" }}
                >
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    fill="rgba(255, 215, 0, 0.15)"
                    stroke="#FFD700"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9 11V8a3 3 0 0 1 6 0v3"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <rect x="8" y="11" width="8" height="6" rx="1" fill="#FFD700" />
                </svg>
              </div>

              {/* PAYMENT SECURE Header */}
              <div style={{
                color: "#FFD700",
                fontSize: `${10 * scale}px`,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: `${4 * scale}px`,
              }}>
                PAYMENT SECURE
              </div>
              <div style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: `${9 * scale}px`,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: `${12 * scale}px`,
              }}>
                to <span style={{ color: "#FFFFFF" }}>@naval</span>
              </div>

              {/* Receipt Table */}
              <div style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: `${8 * scale}px`,
                padding: `${10 * scale}px`,
                marginBottom: `${10 * scale}px`,
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: `${6 * scale}px` }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    AMOUNT SENT
                  </span>
                  <span style={{ color: "#FFFFFF", fontSize: `${8 * scale}px`, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    $5.00
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: `${6 * scale}px` }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    NETWORK FEE
                  </span>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "'JetBrains Mono', monospace" }}>
                    $0.01
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: `${6 * scale}px` }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    PLATFORM FEE
                  </span>
                  <span style={{ color: "#00FF94", fontSize: `${8 * scale}px`, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    $0.00
                  </span>
                </div>
                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.1)", margin: `${6 * scale}px 0` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    PRIVACY
                  </span>
                  <motion.span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: `${3 * scale}px`,
                      padding: `${2 * scale}px ${6 * scale}px`,
                      background: "rgba(0, 255, 148, 0.15)",
                      borderRadius: `${3 * scale}px`,
                      color: "#00FF94",
                      fontSize: `${7 * scale}px`,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "1px",
                    }}
                    initial={{ scale: 1, boxShadow: "0 0 0px rgba(0, 255, 148, 0)" }}
                    animate={{
                      scale: [1, 1.15, 1],
                      boxShadow: [
                        "0 0 0px rgba(0, 255, 148, 0)",
                        "0 0 20px rgba(0, 255, 148, 0.6)",
                        "0 0 0px rgba(0, 255, 148, 0)",
                      ],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <svg width={6 * scale} height={6 * scale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    SEALED
                  </motion.span>
                </div>
              </div>

              {/* Savings Note */}
              <div style={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: `${7 * scale}px`,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                You saved ~$0.45 in processing fees.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Animated Cursor - visible during Hook phase */}
      {cursorPosition.visible && phase === 0 && (
        <motion.div
          style={{
            position: "absolute",
            width: `${20 * scale}px`,
            height: `${20 * scale}px`,
            pointerEvents: "none",
            zIndex: 100,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          }}
          initial={{ opacity: 0, x: 50, y: 100 }}
          animate={{
            opacity: 1,
            x: cursorPosition.x * scale,
            y: cursorPosition.y * scale,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
          }}
        >
          {/* macOS-style cursor */}
          <svg width={20 * scale} height={20 * scale} viewBox="0 0 24 24" fill="none">
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86h8.29a.5.5 0 0 0 .35-.85L5.85 2.86a.5.5 0 0 0-.35.35z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

// Code block line-by-line reveal
function CodeBlockReveal({
  lines,
  isInView,
  lineDelay = 60,
}: {
  lines: string[];
  isInView: boolean;
  lineDelay?: number;
}) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [cursorLine, setCursorLine] = useState<number>(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setVisibleLines(lines.length);
      return;
    }

    let currentLine = 0;
    const timer = setInterval(() => {
      if (currentLine < lines.length) {
        currentLine++;
        setVisibleLines(currentLine);
        setCursorLine(currentLine - 1);
      } else {
        clearInterval(timer);
      }
    }, lineDelay);

    return () => clearInterval(timer);
  }, [isInView, lines.length, lineDelay, prefersReducedMotion]);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <pre
      style={{
        fontSize: "11px",
        color: colors.muted,
        lineHeight: 1.6,
        margin: 0,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {lines.slice(0, visibleLines).map((line, i) => (
        <div key={i}>
          {line}
          {i === cursorLine && visibleLines < lines.length && (
            <span style={{ color: colors.primary, opacity: cursorVisible ? 1 : 0 }}>_</span>
          )}
        </div>
      ))}
    </pre>
  );
}

// Cursor component with glow effect
// Enhanced Cursor component with spring entrance and dynamic glow
function Cursor({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShow((s) => !s), 530);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;
  return (
    <span
      className="typing-cursor"
      style={{
        color: colors.primary,
        opacity: show ? 1 : 0,
        textShadow: show ? `0 0 10px ${colors.primaryGlow}, 0 0 20px ${colors.primaryGlowStrong}` : "none",
        transition: "opacity 0.1s ease, text-shadow 0.2s ease",
      }}
    >
      █
    </span>
  );
}

// Premium cursor with spring entrance and dynamic glow intensity
function PremiumCursor({
  visible,
  typingComplete = false,
  intensity = 1,
}: {
  visible: boolean;
  typingComplete?: boolean;
  intensity?: number;
}) {
  const [show, setShow] = useState(true);
  const [entered, setEntered] = useState(false);

  // Spring entrance
  useEffect(() => {
    if (visible && !entered) {
      // Small delay for spring entrance
      const timer = setTimeout(() => setEntered(true), 50);
      return () => clearTimeout(timer);
    }
  }, [visible, entered]);

  // Faster blink while typing (400ms), relaxes after (530ms)
  useEffect(() => {
    const blinkSpeed = typingComplete ? 530 : 400;
    const interval = setInterval(() => setShow((s) => !s), blinkSpeed);
    return () => clearInterval(interval);
  }, [typingComplete]);

  if (!visible) return null;

  // Dynamic glow based on intensity (0.15 → 0.40)
  const glowOpacity = 0.15 + intensity * 0.25;
  const glowSpread = 10 + intensity * 20;

  return (
    <span
      className="typing-cursor-premium"
      style={{
        display: "inline-block",
        color: colors.primary,
        // Minimum opacity 0.3 for softer blink
        opacity: show ? 1 : 0.3,
        textShadow: show
          ? `0 0 ${glowSpread}px rgba(245, 166, 35, ${glowOpacity}), 0 0 ${glowSpread * 2}px rgba(245, 166, 35, ${glowOpacity * 0.6})`
          : "none",
        transition: "opacity 0.1s ease, text-shadow 0.2s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: entered ? "scaleY(1) translateY(0)" : "scaleY(0.6) translateY(4px)",
        transformOrigin: "bottom",
      }}
    >
      █
    </span>
  );
}

// Animated character component for micro drop-in animation
const AnimatedCharacter = memo(function AnimatedCharacter({
  char,
  index,
  isNew,
  isTipzChar,
}: {
  char: string;
  index: number;
  isNew: boolean;
  isTipzChar: boolean;
}) {
  // Handle newline characters as actual line breaks
  if (char === "\n") {
    return <br />;
  }

  return (
    <span
      style={{
        display: "inline-block",
        animation: isNew ? "char-enter 0.15s ease-out forwards" : "none",
        color: isTipzChar ? colors.primary : "inherit",
        // Extra amber glow for "tipz" characters
        filter: isNew
          ? isTipzChar
            ? `drop-shadow(0 0 8px ${colors.primaryGlowStrong})`
            : `drop-shadow(0 0 4px rgba(255,255,255,0.3))`
          : "none",
        transition: "filter 0.3s ease",
      }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  );
});

// HeroTitle component - orchestrates the entire premium typing animation
function HeroTitle({
  text,
  isMobile,
  onComplete,
}: {
  text: string;
  isMobile: boolean;
  onComplete: () => void;
}) {
  const [containerVisible, setContainerVisible] = useState(false);
  const [completionFlash, setCompletionFlash] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { displayText, isComplete, newCharIndex } = usePremiumTypingEffect(text, {
    baseSpeed: 55,
    varianceRange: 25,
    pauseOnSpace: 80,
    pauseOnPunctuation: 150,
    accelerationCurve: true,
    initialDelay: prefersReducedMotion ? 0 : 400,
  });

  // Compute glow intensity directly (no state needed)
  const glowIntensity = text.length > 0 ? displayText.length / text.length : 0;

  // Container entrance (100ms delay, fades in)
  useEffect(() => {
    if (prefersReducedMotion) {
      setContainerVisible(true);
      return;
    }
    const timer = setTimeout(() => setContainerVisible(true), 100);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Completion flash effect
  useEffect(() => {
    if (isComplete && !prefersReducedMotion) {
      setCompletionFlash(true);
      const flashTimer = setTimeout(() => setCompletionFlash(false), 400);
      onComplete(); // Fire immediately, no delay
      return () => {
        clearTimeout(flashTimer);
      };
    } else if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete, prefersReducedMotion]);

  // Find "TIPZ" indices for highlighting
  const tipzStartIndex = text.toLowerCase().indexOf("tipz");
  const isTipzChar = (index: number) => {
    return tipzStartIndex !== -1 && index >= tipzStartIndex && index < tipzStartIndex + 4;
  };

  // Dynamic text-shadow that intensifies as typing progresses
  const baseGlow = 40 + glowIntensity * 40; // 40px → 80px
  const flashGlow = completionFlash ? 100 : baseGlow;

  return (
    <div
      style={{
        opacity: containerVisible ? 1 : 0,
        transform: containerVisible ? "translateY(0)" : "translateY(8px)",
        transition: prefersReducedMotion
          ? "none"
          : "opacity 0.4s ease-out, transform 0.4s ease-out",
      }}
    >
      <h1
        style={{
          fontSize: isMobile ? "clamp(32px, 8vw, 48px)" : "clamp(48px, 5vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-0.035em",
          lineHeight: 1.1,
          margin: 0,
          color: colors.textBright,
          whiteSpace: "pre-line",
          textShadow: `0 0 ${flashGlow}px ${colors.primaryGlow}, 0 0 ${flashGlow / 2}px rgba(255,255,255,0.1)`,
          transition: completionFlash ? "text-shadow 0.15s ease-out" : "text-shadow 0.3s ease",
          willChange: prefersReducedMotion ? "auto" : "filter",
        }}
      >
        {prefersReducedMotion ? (
          // Reduced motion: show text directly with tipz highlighted
          <>
            {text.split("").map((char, index) =>
              char === "\n" ? (
                <br key={index} />
              ) : (
                <span
                  key={index}
                  style={{ color: isTipzChar(index) ? colors.primary : "inherit" }}
                >
                  {char}
                </span>
              )
            )}
          </>
        ) : (
          // Full animation: character-by-character with effects
          // Let AnimatedCharacter handle newlines naturally as <br/> elements
          <>
            {displayText.split("").map((char, index) => (
              <AnimatedCharacter
                key={index}
                char={char}
                index={index}
                isNew={index === newCharIndex}
                isTipzChar={isTipzChar(index)}
              />
            ))}
            <PremiumCursor
              visible={!isComplete}
              typingComplete={isComplete}
              intensity={glowIntensity}
            />
          </>
        )}
      </h1>
    </div>
  );
}

// Counting stat component with animation
function CountingStat({
  value,
  suffix = "",
  prefix = "",
  label,
  color,
  glowColor,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color: string;
  glowColor: string;
}) {
  const { ref, count } = useCountUp(value, 1200);

  return (
    <div ref={ref} className="stat-hover" style={{ cursor: "default" }}>
      <div style={{
        fontSize: "32px",
        fontWeight: 800,
        color,
        marginBottom: "4px",
        textShadow: `0 0 20px ${glowColor}`,
      }}>
        {prefix}{count}{suffix}
      </div>
      <div style={{ fontSize: "12px", color: colors.muted, letterSpacing: "1px" }}>{label}</div>
    </div>
  );
}

// Chapter Indicator - Enhanced with glow
function ChapterIndicator({ currentChapter }: { currentChapter: number }) {
  return (
    <div
      className="chapter-indicator"
      style={{
        position: "fixed",
        right: "32px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {chapters.map((chapter, index) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "1px",
              color: index === currentChapter ? colors.primary : colors.muted,
              opacity: index === currentChapter ? 1 : 0,
              transform: index === currentChapter ? "translateX(0)" : "translateX(10px)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              whiteSpace: "nowrap",
              textShadow: index === currentChapter ? `0 0 10px ${colors.primaryGlow}` : "none",
            }}
          >
            {chapter.num}
          </span>
          <div
            style={{
              width: index === currentChapter ? "32px" : "8px",
              height: index === currentChapter ? "3px" : "2px",
              backgroundColor: index === currentChapter ? colors.primary : colors.border,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: index === currentChapter ? `0 0 10px ${colors.primaryGlow}` : "none",
              borderRadius: "2px",
            }}
          />
        </a>
      ))}
    </div>
  );
}

// Section wrapper with smooth scroll snap
function SnapSection({
  children,
  id,
  style,
}: {
  children: React.ReactNode;
  id: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      style={{
        minHeight: "100vh",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// Staggered items component with enhanced animations
function StaggeredItems({
  items,
  renderItem,
  baseDelay = 80,
  columns = 3,
}: {
  items: { step: string; title: string; desc: string; icon?: string }[];
  renderItem: (item: { step: string; title: string; desc: string; icon?: string }, visible: boolean, index: number) => React.ReactNode;
  baseDelay?: number;
  columns?: number;
}) {
  const { ref, isInView } = useInView(0.15);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(items.length).fill(false));
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      setVisibleItems(new Array(items.length).fill(true));
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i < items.length; i++) {
      // Non-linear stagger: first items appear faster, later ones slower
      const easeInStagger = Math.pow(i / items.length, 0.7) * items.length;
      const delay = easeInStagger * baseDelay;

      const timer = setTimeout(() => {
        setVisibleItems(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay);
      timers.push(timer);
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [isInView, items.length, baseDelay, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "24px",
      }}
    >
      {items.map((item, i) => renderItem(item, visibleItems[i], i))}
    </div>
  );
}

// Helper to render text with "tipz" in primary color
function renderWithTipzHighlight(text: string, primaryColor: string) {
  const tipzIndex = text.toLowerCase().indexOf("tipz");
  if (tipzIndex === -1) return text;

  const before = text.slice(0, tipzIndex);
  const tipz = text.slice(tipzIndex, tipzIndex + 4);
  const after = text.slice(tipzIndex + 4);

  return (
    <>
      {before}
      <span style={{ color: primaryColor }}>{tipz}</span>
      {after}
    </>
  );
}

export default function HomePage() {
  const heroText = "Private TIPZ\nfor creators";
  const [heroAnimationReady, setHeroAnimationReady] = useState(false);
  const [tweetVisible, setTweetVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentChapter = useCurrentChapter();
  const isMobile = useIsMobile(768);
  const parallaxOffset = useParallax(0.3);
  const parallaxOffsetSlow = useParallax(0.15);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Animated counters for damage report
  const { ref: feeRef, count: feeCount } = useCountUp(39, 2500, 400);
  const { ref: privacyRef, count: privacyCount } = useCountDown(2500, 400);

  // Gate button/modal animations until tweet is visible
  useEffect(() => {
    if (heroAnimationReady) {
      // Tweet becomes visible 400ms after heroAnimationReady
      const timer = setTimeout(() => setTweetVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [heroAnimationReady]);

  const contentPadding: React.CSSProperties = {
    padding: "0 48px",
    maxWidth: "900px",
    margin: "0 auto",
    width: "100%",
  };

  return (
    <div
      className="main-container"
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 50%, ${colors.bgGradientStart} 100%)`,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
        overflowY: "auto",
        overflowX: "hidden",
        scrollSnapType: isMobile ? "none" : "y proximity",
        scrollBehavior: "smooth",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* Atmospheric overlays */}
      <div className="noise-overlay" />
      {/* Fixed Header - Enhanced */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: `${colors.bg}f0`,
        backdropFilter: "blur(12px)",
        zIndex: 100,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div className="header-inner" style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <span style={{
              color: colors.primary,
              fontWeight: 700,
              fontSize: "18px",
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: `0 0 20px ${colors.primaryGlow}`,
            }}>[TIPZ]</span>
            <span style={{
              color: colors.muted,
              fontSize: "10px",
              letterSpacing: "1px",
              padding: "2px 6px",
              border: `1px solid ${colors.border}`,
              borderRadius: "2px",
            }}>BETA</span>
          </a>
          <nav className="desktop-nav" style={{ gap: "32px", alignItems: "center" }}>
            <ZecTicker />
            <span style={{ color: colors.border }}>|</span>
            <a href="/creators" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>CREATORS</a>
            <a href="/manifesto" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>MANIFESTO</a>
            <a href="/docs" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>DOCS</a>
            <a
              href="/register"
              className="cta-primary"
              style={{
                color: colors.bg,
                backgroundColor: colors.primary,
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "1px",
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: "8px",
              }}
            >START EARNING</a>
          </nav>
          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 200,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "280px",
              maxWidth: "80vw",
              background: colors.bg,
              borderLeft: `1px solid ${colors.border}`,
              zIndex: 201,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                alignSelf: "flex-end",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                marginBottom: "16px",
              }}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
              <ZecTicker />
            </div>
            <a href="/creators" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "16px 0", color: colors.text, textDecoration: "none", fontSize: "14px", letterSpacing: "1px", borderBottom: `1px solid ${colors.border}` }}>CREATORS</a>
            <a href="/manifesto" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "16px 0", color: colors.text, textDecoration: "none", fontSize: "14px", letterSpacing: "1px", borderBottom: `1px solid ${colors.border}` }}>MANIFESTO</a>
            <a href="/docs" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "16px 0", color: colors.text, textDecoration: "none", fontSize: "14px", letterSpacing: "1px", borderBottom: `1px solid ${colors.border}` }}>DOCS</a>
            <a href="/register" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", marginTop: "16px", padding: "16px", color: colors.bg, backgroundColor: colors.primary, textDecoration: "none", fontSize: "14px", letterSpacing: "1px", fontWeight: 600, borderRadius: "8px", textAlign: "center" }}>START EARNING</a>
          </div>
        </>
      )}

      {/* Chapter Indicator */}
      <ChapterIndicator currentChapter={currentChapter} />

      {/* Chapter 1: Hero - The Promise */}
      <SnapSection id="hero" style={{ padding: "0 48px", overflow: "hidden", position: "relative" }}>
        {/* Atmospheric background effects - reduced for cleaner look */}
        <div style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}>
          {/* Subtle gradient orb - top right with parallax + idle float */}
          <div style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.primaryGlow} 0%, transparent 70%)`,
            filter: "blur(100px)",
            opacity: 0.6,
            transform: `translateY(${parallaxOffset}px)`,
            willChange: "transform",
            animation: prefersReducedMotion ? "none" : "idle-float 6s ease-in-out infinite",
          }} />
          {/* Grid pattern overlay with slower parallax */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${colors.border}15 1px, transparent 1px), linear-gradient(90deg, ${colors.border}15 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            opacity: 0.2,
            transform: `translateY(${parallaxOffsetSlow}px)`,
            willChange: "transform",
          }} />
        </div>

        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? "32px" : "64px",
          position: "relative",
          zIndex: 1,
          paddingTop: isMobile ? "40px" : "20px",
        }}>
          {/* Left side: Copy + CTA */}
          <div style={{
            flex: 1,
            maxWidth: isMobile ? "100%" : "500px",
            textAlign: isMobile ? "center" : "left",
            paddingTop: isMobile ? "0" : "60px",
          }}>
            {/* Main headline */}
            <div style={{ marginBottom: "24px" }}>
              <HeroTitle
                text={heroText}
                isMobile={isMobile}
                onComplete={() => setHeroAnimationReady(true)}
              />
            </div>

            {/* Sub-copy */}
            <TerminalReveal delay={heroAnimationReady ? 0 : 99999}>
              <p style={{
                fontSize: "14px",
                lineHeight: 1.7,
                marginBottom: "32px",
                letterSpacing: "0.02em",
                color: colors.text,
              }}>
                No fees. No friction. No trace.
              </p>
            </TerminalReveal>

            {/* CTA Button */}
            <TerminalReveal delay={heroAnimationReady ? 200 : 99999}>
              <div style={{ position: "relative", marginBottom: isMobile ? "0" : "0" }}>
                <a
                  href="/register"
                  className="cta-hero"
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "16px",
                    background: `linear-gradient(135deg, ${colors.primary} 0%, #e89b1c 40%, ${colors.primaryHover} 100%)`,
                    backgroundSize: "200% 200%",
                    color: colors.bg,
                    padding: "18px 40px",
                    fontWeight: 700,
                    fontSize: "15px",
                    textDecoration: "none",
                    borderRadius: "14px",
                    border: "none",
                    boxShadow: `
                      0 0 40px ${colors.primaryGlowStrong},
                      0 0 60px ${colors.primaryGlow},
                      inset 0 2px 0 rgba(255,255,255,0.25),
                      inset 0 -2px 0 rgba(0,0,0,0.1),
                      0 10px 40px rgba(0,0,0,0.5)
                    `,
                    animation: "cta-gradient-shift 4s ease-in-out infinite",
                    letterSpacing: "0.04em",
                  }}
                >
                  {/* Inner highlight */}
                  <span style={{
                    position: "absolute",
                    top: "1px",
                    left: "2px",
                    right: "2px",
                    height: "50%",
                    borderRadius: "12px 12px 100% 100%",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }} />

                  <span style={{ position: "relative", zIndex: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                    Start Earning TIPZ
                  </span>
                </a>
              </div>
            </TerminalReveal>

            {/* Platform icons - silver watermark style, matches CTA button width */}
            <TerminalReveal delay={heroAnimationReady ? 400 : 99999}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "200px",
                marginTop: "32px",
                marginLeft: isMobile ? "auto" : "25px",
                marginRight: isMobile ? "auto" : "0",
                opacity: 0.4,
              }}>
                {/* X (Twitter) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#FFFFFF" }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                {/* Substack */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#FFFFFF" }}>
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
                {/* YouTube */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#FFFFFF" }}>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
            </TerminalReveal>
          </div>

          {/* Right side: Demo Animation */}
          <TerminalReveal delay={heroAnimationReady ? 400 : 99999}>
            <div style={{
              position: "relative",
              flexShrink: 0,
            }}>
              {/* Glow behind the graphic */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "300px" : "500px",
                height: isMobile ? "300px" : "500px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${colors.primaryGlowStrong} 0%, transparent 60%)`,
                filter: "blur(60px)",
                zIndex: 0,
                animation: prefersReducedMotion ? "none" : "idle-glow-pulse 4s ease-in-out infinite",
              }} />

              {/* Iron Man Morph Animation - scaled for mobile */}
              <IronManMorph isVisible={tweetVisible} scale={isMobile ? 0.6 : 1} />
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 2: Why Tipping is Broken */}
      <SnapSection id="broken" style={{ padding: "0 48px" }}>
        {/* Diagonal noise texture overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
          pointerEvents: "none",
          opacity: 0.5,
        }} />


        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.error,
              letterSpacing: "2px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <span style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: colors.error,
                borderRadius: "50%",
                animation: "pulse 1.5s ease-in-out infinite",
                boxShadow: `0 0 10px ${colors.error}`,
              }} />
              CHAPTER 02: WHY TIPPING IS BROKEN
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix=">"
            prefixColor={colors.error}
            text="Tips are taxed and tracked."
            style={{ fontSize: isMobile ? "32px" : "40px" }}
          />

          <TerminalReveal delay={100}>
            <p style={{
              color: colors.muted,
              fontSize: "16px",
              marginTop: "-16px",
              marginBottom: "40px",
            }}>
            </p>
          </TerminalReveal>

          {/* Damage Report Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
            marginTop: "32px",
            alignItems: "stretch",
          }}>
            {/* DAMAGE REPORT: PLATFORMS */}
            <TerminalReveal delay={200} style={{ height: "100%" }}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.error}50`,
                borderRadius: "12px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* Pulsing border glow */}
                <div style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${colors.error}20, transparent, ${colors.error}10)`,
                  animation: prefersReducedMotion ? "none" : "idle-border-glow 3s ease-in-out infinite",
                  pointerEvents: "none",
                }} />

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  position: "relative",
                }}>
                  <span style={{
                    color: colors.error,
                    fontSize: "16px",
                    display: "inline-block",
                    animation: prefersReducedMotion ? "none" : "idle-breathe 2s ease-in-out infinite",
                  }}>&#9888;</span>
                  <span style={{
                    fontSize: "10px",
                    color: colors.error,
                    letterSpacing: "2px",
                    fontWeight: 700,
                  }}>
                    DAMAGE REPORT: PLATFORMS
                  </span>
                </div>

                <p style={{
                  color: colors.textBright,
                  fontSize: "18px",
                  fontWeight: 500,
                  lineHeight: 1.5,
                  margin: "0 0 20px 0",
                  position: "relative",
                  fontStyle: "italic",
                }}>
                  &ldquo;For every $5 tip, creators lose almost $2.&rdquo;
                </p>

                {/* Animated progress bar */}
                <motion.div
                  ref={feeRef}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ position: "relative", marginBottom: "12px" }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "11px",
                  }}>
                    <span style={{ color: colors.muted }}>FEE EXTRACTION</span>
                    <span style={{ color: colors.error, fontWeight: 700 }}>{feeCount}% LOST</span>
                  </div>
                  <div style={{
                    height: "8px",
                    background: colors.bg,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${feeCount}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${colors.error}, ${colors.error}80)`,
                      borderRadius: "4px",
                      boxShadow: feeCount > 0 ? `0 0 12px ${colors.error}60` : "none",
                    }} />
                  </div>
                </motion.div>

                {/* $5 Tip Breakdown box */}
                <div style={{
                  background: `${colors.error}08`,
                  border: `1px solid ${colors.error}30`,
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "12px",
                }}>
                  <div style={{
                    fontSize: "9px",
                    color: colors.error,
                    letterSpacing: "1.5px",
                    marginBottom: "10px",
                    fontWeight: 600,
                  }}>
                    $5 TIP BREAKDOWN
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: "4px 8px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                  }}>
                    <span style={{ color: colors.muted }}>You send</span>
                    <span style={{ color: colors.muted, fontSize: "9px" }}></span>
                    <span style={{ color: colors.textBright, textAlign: "right" }}>$5.00</span>

                    <span style={{ color: colors.muted }}>Platform tax</span>
                    <span style={{ color: colors.muted, fontSize: "9px" }}>30%</span>
                    <span style={{ color: colors.error, textAlign: "right" }}>−$1.50</span>

                    <span style={{ color: colors.muted }}>Fixed fee</span>
                    <span style={{ color: colors.muted, fontSize: "9px" }}>flat</span>
                    <span style={{ color: colors.error, textAlign: "right" }}>−$0.30</span>

                    <span style={{ color: colors.muted }}>Processing</span>
                    <span style={{ color: colors.muted, fontSize: "9px" }}>2.9%</span>
                    <span style={{ color: colors.error, textAlign: "right" }}>−$0.15</span>

                    <span style={{
                      color: colors.muted,
                      borderTop: `1px solid ${colors.error}30`,
                      paddingTop: "6px",
                      marginTop: "4px",
                    }}>Creator gets</span>
                    <span style={{
                      borderTop: `1px solid ${colors.error}30`,
                      paddingTop: "6px",
                      marginTop: "4px",
                    }}></span>
                    <span style={{
                      color: colors.error,
                      fontWeight: 700,
                      textAlign: "right",
                      borderTop: `1px solid ${colors.error}30`,
                      paddingTop: "6px",
                      marginTop: "4px",
                    }}>$3.05</span>
                  </div>
                </div>

                <p style={{
                  color: colors.muted,
                  fontSize: "13px",
                  margin: 0,
                  position: "relative",
                  marginTop: "auto",
                }}>
                  Three layers of fees. One broken system.
                </p>
              </div>
            </TerminalReveal>

            {/* DAMAGE REPORT: CRYPTO */}
            <TerminalReveal delay={350} style={{ height: "100%" }}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.error}50`,
                borderRadius: "12px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* Glitch overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    ${colors.error}05 2px,
                    ${colors.error}05 4px
                  )`,
                  pointerEvents: "none",
                  opacity: 0.5,
                }} />

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  position: "relative",
                }}>
                  <span style={{
                    color: colors.error,
                    fontSize: "16px",
                    display: "inline-block",
                    animation: prefersReducedMotion ? "none" : "idle-breathe 2s ease-in-out infinite 0.5s",
                  }}>&#9888;</span>
                  <span style={{
                    fontSize: "10px",
                    color: colors.error,
                    letterSpacing: "2px",
                    fontWeight: 700,
                  }}>
                    DAMAGE REPORT: CRYPTO
                  </span>
                </div>

                <p style={{
                  color: colors.textBright,
                  fontSize: "18px",
                  fontWeight: 500,
                  lineHeight: 1.5,
                  margin: "0 0 20px 0",
                  position: "relative",
                  fontStyle: "italic",
                }}>
                  &ldquo;Public tipping doxxes your entire wallet history.&rdquo;
                </p>

                {/* Exposed indicator */}
                <motion.div
                  ref={privacyRef}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ position: "relative", marginBottom: "12px" }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "11px",
                  }}>
                    <span style={{ color: colors.muted }}>PRIVACY LEVEL</span>
                    <span style={{ color: colors.error, fontWeight: 700 }}>{privacyCount}% PRIVATE</span>
                  </div>
                  <div style={{
                    height: "8px",
                    background: colors.bg,
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: `1px solid ${colors.error}30`,
                  }}>
                    <div style={{
                      width: `${privacyCount}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${colors.success}, ${colors.success}80)`,
                      borderRadius: "4px",
                      boxShadow: privacyCount > 0 ? `0 0 12px ${colors.success}60` : "none",
                    }} />
                  </div>
                </motion.div>

                {/* Exposed on-chain data box */}
                <div style={{
                  background: `${colors.error}08`,
                  border: `1px solid ${colors.error}30`,
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "12px",
                }}>
                  <div style={{
                    fontSize: "9px",
                    color: colors.error,
                    letterSpacing: "1.5px",
                    marginBottom: "10px",
                    fontWeight: 600,
                  }}>
                    EXPOSED ON-CHAIN
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "6px 12px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                  }}>
                    <span style={{ color: colors.muted }}>Your wallet</span>
                    <span style={{ color: colors.error }}>0x8f3...a2d</span>
                    <span style={{ color: colors.muted }}>Their wallet</span>
                    <span style={{ color: colors.error }}>0x2b1...9c4</span>
                    <span style={{ color: colors.muted }}>Amount</span>
                    <span style={{ color: colors.error }}>$50.00</span>
                    <span style={{ color: colors.muted }}>Timestamp</span>
                    <span style={{ color: colors.error }}>Jan 23, 2026</span>
                  </div>
                </div>

                <p style={{
                  color: colors.muted,
                  fontSize: "13px",
                  margin: 0,
                  position: "relative",
                  marginTop: "auto",
                }}>
                  Your wallet, their wallet, and the amount—indexed forever.
                </p>
              </div>
            </TerminalReveal>
          </div>
        </div>
      </SnapSection>

      {/* Chapter 3: The Solution */}
      <SnapSection id="solution" style={{ padding: "0 48px" }}>
        {/* Gold particles/glow overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${colors.primaryGlow} 0%, transparent 50%)`,
          pointerEvents: "none",
          opacity: 0.3,
        }} />

        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.success,
              letterSpacing: "2px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <span style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: colors.success,
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
                boxShadow: `0 0 10px ${colors.success}`,
              }} />
              CHAPTER 03: THE SOLUTION
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix=">"
            prefixColor={colors.primary}
            text="What if you kept everything?"
            style={{ fontSize: isMobile ? "32px" : "40px" }}
          />

          <TerminalReveal delay={100}>
            <p style={{
              color: colors.muted,
              fontSize: "16px",
              marginTop: "-16px",
              marginBottom: "40px",
            }}>
              Every dollar. Every tip. Completely private.
            </p>
          </TerminalReveal>

          {/* Hero Stats - Premium Achievement Cards */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? "16px" : "24px",
            marginTop: "32px",
            marginBottom: "40px",
            position: "relative",
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}>
            {/* Left Supporting Stat - 2 Min Setup */}
            <TerminalReveal delay={350}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "24px 20px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                width: isMobile ? "140px" : "160px",
                transform: isMobile ? "none" : "translateY(20px)",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${colors.success}, transparent)`,
                }} />
                <div style={{
                  fontSize: isMobile ? "36px" : "44px",
                  fontWeight: 800,
                  color: colors.success,
                  lineHeight: 1,
                  marginBottom: "8px",
                  textShadow: `0 0 30px ${colors.successGlow}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  2min
                </div>
                <div style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  color: colors.muted,
                  marginBottom: "6px",
                }}>
                  SETUP
                </div>
                <div style={{
                  fontSize: "10px",
                  color: colors.muted,
                  lineHeight: 1.4,
                }}>
                  Tweet → Done
                </div>
              </div>
            </TerminalReveal>

            {/* Center Hero Stat - 0% Fees with Halo */}
            <TerminalReveal delay={200}>
              <div style={{
                position: "relative",
              }}>
                {/* Floating ring/halo effect with slow rotation */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  border: `1px solid ${colors.success}30`,
                  animation: prefersReducedMotion ? "none" : "idle-spin-slow 20s linear infinite, ringPulse 3s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  border: `1px solid ${colors.success}15`,
                  animation: prefersReducedMotion ? "none" : "idle-spin-slow-reverse 15s linear infinite, ringPulse 3s ease-in-out infinite 0.5s",
                  pointerEvents: "none",
                }} />

                <div style={{
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.success}`,
                  borderRadius: "16px",
                  padding: isMobile ? "28px 32px" : "32px 48px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: `0 0 60px ${colors.successGlow}, 0 20px 40px rgba(0,0,0,0.4)`,
                  zIndex: 2,
                }}>
                  {/* Metallic shine overlay with sweep */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%, transparent 100%)`,
                    backgroundSize: "200% 100%",
                    pointerEvents: "none",
                    animation: prefersReducedMotion ? "none" : "idle-shine-sweep 8s ease-in-out infinite",
                  }} />

                  {/* Glow effect */}
                  <div style={{
                    position: "absolute",
                    top: "-30%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "300px",
                    height: "300px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${colors.successGlow} 0%, transparent 60%)`,
                    animation: "pulse-glow 3s ease-in-out infinite",
                  }} />
                  <div style={{
                    fontSize: isMobile ? "64px" : "80px",
                    fontWeight: 800,
                    color: colors.success,
                    lineHeight: 0.9,
                    marginBottom: "8px",
                    textShadow: `0 0 60px ${colors.successGlow}`,
                    position: "relative",
                    letterSpacing: "-0.05em",
                    fontFamily: "'JetBrains Mono', monospace",
                    animation: prefersReducedMotion ? "none" : "idle-text-glow-pulse 3s ease-in-out infinite",
                  }}>
                    0%
                  </div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    color: colors.textBright,
                    marginBottom: "12px",
                    position: "relative",
                  }}>
                    PLATFORM FEES
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: colors.text,
                    lineHeight: 1.5,
                    position: "relative",
                  }}>
                    Every satisfying cent goes to you.
                  </div>
                </div>
              </div>
            </TerminalReveal>

            {/* Right Supporting Stat - 100% Private */}
            <TerminalReveal delay={500}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "24px 20px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                width: isMobile ? "140px" : "160px",
                transform: isMobile ? "none" : "translateY(20px)",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${colors.success}, transparent)`,
                }} />
                <div style={{
                  fontSize: isMobile ? "32px" : "38px",
                  fontWeight: 800,
                  color: colors.success,
                  lineHeight: 1,
                  marginBottom: "8px",
                  textShadow: `0 0 30px ${colors.successGlow}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  100%
                </div>
                <div style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  color: colors.muted,
                  marginBottom: "6px",
                }}>
                  PRIVATE
                </div>
                <div style={{
                  fontSize: "10px",
                  color: colors.muted,
                  lineHeight: 1.4,
                }}>
                  Encrypted on-chain
                </div>
              </div>
            </TerminalReveal>
          </div>

          {/* Privacy Pipeline */}
          <TerminalReveal delay={800}>
            <div style={{
              maxWidth: "480px",
              margin: "0 auto",
              marginBottom: "20px",
            }}>
              {/* Privacy Pipeline */}
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "28px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginBottom: "20px", textAlign: "center" }}>
                  HOW YOU RECEIVE TIPS PRIVATELY
                </div>

                {/* Animated vertical pipeline */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "4px",
                  paddingLeft: "16px",
                }}>
                  {/* Step 1: You */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "56px", display: "flex", justifyContent: "center" }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: colors.bg,
                        border: `2px solid ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="1.5">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: colors.muted, letterSpacing: "1px" }}>STEP 1</div>
                      <div style={{ fontSize: "12px", color: colors.text }}>Supporter tips in any token</div>
                    </div>
                  </div>

                  {/* Animated connector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "56px", display: "flex", justifyContent: "center" }}>
                      <div style={{
                        width: "2px",
                        height: "20px",
                        background: `linear-gradient(180deg, ${colors.border}, ${colors.primary})`,
                        animation: "flowPulse 2s ease-in-out infinite",
                      }} />
                    </div>
                  </div>

                  {/* Step 2: Shielded (Hero) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      {/* Pulsing glow */}
                      <div style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${colors.primaryGlowStrong} 0%, transparent 70%)`,
                        animation: "pulse-glow 2s ease-in-out infinite",
                        zIndex: 0,
                      }} />
                      <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                        border: `2px solid ${colors.primary}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 25px ${colors.primaryGlowStrong}`,
                        position: "relative",
                        zIndex: 1,
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.bg} strokeWidth="2">
                          <rect x="5" y="11" width="14" height="10" rx="2" fill={colors.bg} stroke="none" />
                          <path d="M8 11V7a4 4 0 1 1 8 0v4" strokeLinecap="round" />
                          <circle cx="12" cy="16" r="1.5" fill={colors.primary} />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: colors.primary, letterSpacing: "1px", fontWeight: 600 }}>STEP 2: SHIELDED</div>
                      <div style={{ fontSize: "11px", color: colors.muted }}>Auto-swapped & encrypted</div>
                    </div>
                  </div>

                  {/* Animated connector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "56px", display: "flex", justifyContent: "center" }}>
                      <div style={{
                        width: "2px",
                        height: "20px",
                        background: `linear-gradient(180deg, ${colors.primary}, ${colors.success})`,
                        animation: "flowPulse 2s ease-in-out infinite 0.5s",
                      }} />
                    </div>
                  </div>

                  {/* Step 3: Creator */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "56px", display: "flex", justifyContent: "center", position: "relative" }}>
                      <div style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${colors.successGlow} 0%, transparent 70%)`,
                        zIndex: 0,
                      }} />
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: colors.bg,
                        border: `2px solid ${colors.success}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 15px ${colors.successGlow}`,
                        position: "relative",
                        zIndex: 1,
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.success}>
                          <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: colors.success, letterSpacing: "1px", fontWeight: 600 }}>STEP 3: DELIVERED</div>
                      <div style={{ fontSize: "12px", color: colors.success, fontWeight: 700 }}>Arrives 100% private</div>
                    </div>
                  </div>
                </div>

                {/* UNLINKABLE badge with stamp effect */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    border: `1px solid ${colors.success}50`,
                    borderRadius: "4px",
                    background: `${colors.success}10`,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span style={{ fontSize: "10px", color: colors.success, fontWeight: 700, letterSpacing: "2px" }}>
                      UNLINKABLE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TerminalReveal>

        </div>
      </SnapSection>

      {/* Chapter 4: Proof - Why Creators Trust TIPZ */}
      <SnapSection id="proof" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 04: PROOF
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Join 127+ creators keeping 100%."
            style={{ marginBottom: "48px" }}
          />

          {/* Testimonials Grid */}
          <TerminalReveal delay={200}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "40px",
            }}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "28px",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />
                <p style={{ fontSize: "16px", color: colors.text, margin: "0 0 20px", lineHeight: 1.7, fontStyle: "italic" }}>
                  &quot;Finally, a tipping platform that doesn&apos;t take 5% of my income. TIPZ just works.&quot;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "white",
                    boxShadow: "0 0 15px rgba(102, 126, 234, 0.3)",
                    animation: prefersReducedMotion ? "none" : "idle-glow-pulse 4s ease-in-out infinite",
                  }}>M</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright }}>@marcus_dev</div>
                    <div style={{ fontSize: "12px", color: colors.muted }}>Tech content creator</div>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "28px",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />
                <p style={{ fontSize: "16px", color: colors.text, margin: "0 0 20px", lineHeight: 1.7, fontStyle: "italic" }}>
                  &quot;The privacy aspect is huge for me. My supporters can tip without anyone tracking them.&quot;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "white",
                    boxShadow: "0 0 15px rgba(240, 147, 251, 0.3)",
                    animation: prefersReducedMotion ? "none" : "idle-glow-pulse 4s ease-in-out infinite 0.5s",
                  }}>S</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright }}>@sarah_writes</div>
                    <div style={{ fontSize: "12px", color: colors.muted }}>Independent journalist</div>
                  </div>
                </div>
              </div>
            </div>
          </TerminalReveal>

          {/* Stats bar */}
          <TerminalReveal delay={350}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              padding: "24px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: colors.primary,
                  marginBottom: "4px",
                  animation: prefersReducedMotion ? "none" : "idle-brightness-pulse 3s ease-in-out infinite",
                }}>127+</div>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px" }}>CREATORS REGISTERED</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: colors.success,
                  marginBottom: "4px",
                  animation: prefersReducedMotion ? "none" : "idle-brightness-pulse 3s ease-in-out infinite 0.3s",
                }}>0%</div>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px" }}>PLATFORM FEES</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: colors.success,
                  marginBottom: "4px",
                  animation: prefersReducedMotion ? "none" : "idle-brightness-pulse 3s ease-in-out infinite 0.6s",
                }}>100%</div>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px" }}>PRIVATE</div>
              </div>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 5: How It Works */}
      <SnapSection id="how-it-works" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 05: HOW IT WORKS
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Two minutes to go live."
            style={{ marginBottom: "48px" }}
          />

          {/* Side-by-side layout for Creators and Supporters */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
          }}>
            {/* For Creators */}
            <div>
              <TerminalReveal delay={200}>
                <h3 style={{
                  color: colors.primary,
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{ opacity: 0.5 }}>//</span> FOR CREATORS
                  <span style={{ fontSize: "11px", opacity: 0.6, fontWeight: 400 }}>• 3 steps</span>
                </h3>
              </TerminalReveal>

              <StaggeredItems
                baseDelay={120}
                columns={1}
                items={[
                  {
                    step: "01",
                    title: "Get a wallet",
                    desc: "Download Zashi (free). Copy your shielded address.",
                    icon: "/icons/wallet.svg",
                  },
                  {
                    step: "02",
                    title: "Tweet to verify",
                    desc: "One tweet links your address to your handle.",
                    icon: "/icons/link.svg",
                  },
                  {
                    step: "03",
                    title: "Share your link",
                    desc: "tipz.cash/yourname is live. Bio, tweets, anywhere.",
                    icon: "/icons/coins.svg",
                  },
                ]}
                renderItem={(item, visible) => (
                  <div
                    key={item.step}
                    className="card-hover"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      padding: "20px",
                      height: "100px",
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(12px)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "3px",
                      height: "100%",
                      background: `linear-gradient(180deg, ${colors.primary}, ${colors.primaryHover}, ${colors.primary})`,
                      backgroundSize: "100% 200%",
                      animation: prefersReducedMotion ? "none" : "idle-gradient-shift 6s ease-in-out infinite",
                    }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{
                        color: colors.primary,
                        fontSize: "24px",
                        fontWeight: 700,
                        textShadow: `0 0 20px ${colors.primaryGlow}`,
                        minWidth: "36px",
                        animation: prefersReducedMotion ? "none" : "idle-glow-pulse 3s ease-in-out infinite",
                      }}>
                        {item.step}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <img
                            src={item.icon}
                            alt=""
                            style={{
                              width: "18px",
                              height: "18px",
                              filter: "invert(70%) sepia(50%) saturate(500%) hue-rotate(5deg) brightness(100%)",
                              animation: prefersReducedMotion ? "none" : "idle-rotate 4s ease-in-out infinite",
                            }}
                          />
                          <h4 style={{ fontSize: "16px", fontWeight: 600, color: colors.textBright, margin: 0 }}>
                            {item.title}
                          </h4>
                        </div>
                        <p style={{ fontSize: "13px", color: colors.muted, margin: 0, lineHeight: 1.5 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* For Supporters */}
            <div>
              <TerminalReveal delay={300}>
                <h3 style={{
                  color: colors.success,
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{ opacity: 0.5 }}>//</span> FOR SUPPORTERS
                  <span style={{ fontSize: "11px", opacity: 0.6, fontWeight: 400 }}>• 3 steps</span>
                </h3>
              </TerminalReveal>

              <StaggeredItems
                baseDelay={120}
                columns={1}
                items={[
                  {
                    step: "01",
                    title: "Click the link",
                    desc: "No app. No signup. Just click.",
                    icon: "/icons/link.svg",
                  },
                  {
                    step: "02",
                    title: "Choose amount",
                    desc: "$1, $5, $10, $25 — pay with any token.",
                    icon: "/icons/coins.svg",
                  },
                  {
                    step: "03",
                    title: "Send",
                    desc: "Connect wallet, confirm. 100% goes to them.",
                    icon: "/icons/lock.svg",
                  },
                ]}
                renderItem={(item, visible) => (
                  <div
                    key={item.step}
                    className="card-hover"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      padding: "20px",
                      height: "100px",
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(12px)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "3px",
                      height: "100%",
                      background: `linear-gradient(180deg, ${colors.success}, #4ADE80, ${colors.success})`,
                      backgroundSize: "100% 200%",
                      animation: prefersReducedMotion ? "none" : "idle-gradient-shift 6s ease-in-out infinite",
                    }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{
                        color: colors.success,
                        fontSize: "24px",
                        fontWeight: 700,
                        textShadow: `0 0 20px ${colors.successGlow}`,
                        minWidth: "36px",
                        animation: prefersReducedMotion ? "none" : "idle-glow-pulse 3s ease-in-out infinite",
                      }}>
                        {item.step}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <img
                            src={item.icon}
                            alt=""
                            style={{
                              width: "18px",
                              height: "18px",
                              filter: "invert(60%) sepia(80%) saturate(400%) hue-rotate(90deg) brightness(95%)",
                              animation: prefersReducedMotion ? "none" : "idle-rotate 4s ease-in-out infinite",
                            }}
                          />
                          <h4 style={{ fontSize: "16px", fontWeight: 600, color: colors.textBright, margin: 0 }}>
                            {item.title}
                          </h4>
                        </div>
                        <p style={{ fontSize: "13px", color: colors.muted, margin: 0, lineHeight: 1.5 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </SnapSection>

      {/* Chapter 6: Command Center - Apple-Style Minimal */}
      <SnapSection id="creator-tools" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 06: COMMAND CENTER
            </div>
          </TerminalReveal>

          {/* Split layout: Minimal Copy left, Hero Visual right */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "80px",
            alignItems: "center",
          }}>
            {/* Left: Minimal Copy */}
            <div>
              <TypingHeading
                text="Your income, on autopilot."
                style={{ marginBottom: "20px", fontSize: "clamp(32px, 4vw, 42px)" }}
              />

              <TerminalReveal delay={100}>
                <p style={{
                  color: colors.muted,
                  fontSize: "18px",
                  lineHeight: 1.6,
                  marginBottom: "36px",
                }}>
                  We auto-stamp your content. You watch the tips roll in.
                </p>
              </TerminalReveal>

              {/* Feature Deck - Horizontal Row */}
              <TerminalReveal delay={200}>
                <div style={{
                  display: "flex",
                  gap: "24px",
                  marginBottom: "40px",
                }}>
                  {/* Auto-QR */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="2"
                      style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 3s ease-in-out infinite" }}
                    >
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    <span style={{ color: colors.textBright, fontSize: "14px", fontWeight: 500 }}>
                      Auto-QR
                    </span>
                  </div>

                  {/* Instant Alerts */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="2"
                      style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 3s ease-in-out infinite 0.3s" }}
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ color: colors.textBright, fontSize: "14px", fontWeight: 500 }}>
                      Instant Alerts
                    </span>
                  </div>

                  {/* Revenue Analytics */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="2"
                      style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 3s ease-in-out infinite 0.6s" }}
                    >
                      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ color: colors.textBright, fontSize: "14px", fontWeight: 500 }}>
                      Revenue Analytics
                    </span>
                  </div>
                </div>
              </TerminalReveal>

              {/* CTA Button */}
              <TerminalReveal delay={300}>
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "16px 32px",
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    borderRadius: "8px",
                    color: "#050505",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    boxShadow: "0 4px 24px rgba(255, 215, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  INSTALL COMMAND CENTER
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <p style={{
                  color: colors.muted,
                  fontSize: "12px",
                  marginTop: "16px",
                }}>
                  100% Free. Open Source. No Setup Fees.
                </p>
              </TerminalReveal>
            </div>

            {/* Right: "The Augmented Tweet" - Realistic X Post */}
            <TerminalReveal delay={150}>
              <div style={{
                position: "relative",
                height: "480px",
              }}>
                {/* Subtle background glow */}
                <div style={{
                  position: "absolute",
                  top: "40%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "350px",
                  height: "350px",
                  background: "radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(50px)",
                  animation: prefersReducedMotion ? "none" : "idle-glow-pulse 4s ease-in-out infinite",
                }} />

                {/* Layer 1: Realistic Dark-Mode Substack Newsletter */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -45%)",
                  width: "340px",
                  background: "#121212",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
                }}>
                  {/* Header Bar */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: "1px solid #333",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Publication icon */}
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "4px",
                        background: "linear-gradient(135deg, #1a1a2e 0%, #334155 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#fff",
                      }}>
                        P
                      </div>
                      <span style={{ color: "#e5e5e5", fontSize: "14px", fontWeight: 600 }}>The Privacy Stack</span>
                    </div>
                    <button style={{
                      background: "transparent",
                      border: "1px solid #555",
                      borderRadius: "16px",
                      padding: "4px 12px",
                      color: "#888",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}>
                      Subscribe
                    </button>
                  </div>

                  {/* Article Title - Serif editorial style */}
                  <div style={{
                    padding: "20px 16px 12px",
                  }}>
                    <h2 style={{
                      color: "#e5e5e5",
                      fontSize: "22px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      margin: 0,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                    }}>
                      Financial Privacy in the Age of Surveillance
                    </h2>
                  </div>

                  {/* Cover Image with QR Watermark */}
                  <div style={{
                    position: "relative",
                    margin: "0 16px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    aspectRatio: "16/9",
                  }}>
                    {/* Abstract moody gradient background */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: `
                        linear-gradient(135deg,
                          #0f172a 0%,
                          #1e293b 25%,
                          #334155 50%,
                          #1e293b 75%,
                          #0f172a 100%
                        )
                      `,
                    }} />
                    {/* Geometric accents for depth */}
                    <div style={{
                      position: "absolute",
                      top: "15%",
                      left: "10%",
                      width: "70px",
                      height: "70px",
                      background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
                      borderRadius: "50%",
                    }} />
                    <div style={{
                      position: "absolute",
                      bottom: "20%",
                      left: "30%",
                      width: "45px",
                      height: "45px",
                      background: "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)",
                      borderRadius: "50%",
                    }} />
                    <div style={{
                      position: "absolute",
                      top: "35%",
                      right: "35%",
                      width: "35px",
                      height: "35px",
                      background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
                      borderRadius: "50%",
                    }} />

                    {/* QR Watermark */}
                    <div style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}>
                      <div style={{
                        width: "28px",
                        height: "28px",
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gridTemplateRows: "repeat(7, 1fr)",
                        gap: "0.5px",
                        opacity: 0.85,
                        filter: "drop-shadow(0 1px 4px rgba(0, 0, 0, 0.6))",
                      }}>
                        {[
                          1,1,1,0,1,1,1,
                          1,0,1,0,1,0,1,
                          1,1,1,0,1,1,1,
                          0,0,0,0,0,0,0,
                          1,1,1,0,1,0,1,
                          1,0,1,0,0,1,0,
                          1,1,1,0,1,1,1,
                        ].map((cell, i) => (
                          <div key={i} style={{
                            background: cell ? "#fff" : "transparent",
                          }} />
                        ))}
                      </div>
                      <div style={{
                        color: "#FFD700",
                        fontSize: "6px",
                        fontFamily: "monospace",
                        fontWeight: 600,
                        marginTop: "2px",
                        textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
                        letterSpacing: "0.2px",
                      }}>
                        tipz.cash/privacystack
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div style={{
                    padding: "12px 16px 8px",
                    color: "#888",
                    fontSize: "12px",
                  }}>
                    Dec 15, 2024 • 8 min read
                  </div>

                  {/* Article Excerpt */}
                  <div style={{
                    padding: "0 16px 16px",
                    color: "#aaa",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}>
                    The question isn't whether you have something to hide. It's whether you have the right to choose what you reveal...
                  </div>

                  {/* Engagement Row - Real Substack actions */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "12px 16px",
                    borderTop: "1px solid #333",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#888", fontSize: "13px" }}>
                      <span>♡</span>
                      <span>847</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#888", fontSize: "13px" }}>
                      <span>💬</span>
                      <span>23</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#888", fontSize: "13px" }}>
                      <span>🔄</span>
                      <span>12</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#888", fontSize: "13px", marginLeft: "auto" }}>
                      <span>🔗</span>
                      <span>Share</span>
                    </div>
                  </div>
                </div>

                {/* Layer 3: Floating Notification Toast - Animated on scroll */}
                <TipNotification />
              </div>
            </TerminalReveal>
          </div>
        </div>
      </SnapSection>

      {/* Chapter 7: Any Token */}
      <SnapSection id="any-token" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 07: ANY TOKEN
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix="{}"
            prefixColor={colors.primary}
            text="Receive TIPZ from any token and from any chain."
          />

          <TerminalReveal delay={200}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              lineHeight: 1.8,
              marginBottom: "48px",
            }}>
              Don't limit your income. Fans can send funds from multiple networks (ETH, SOL, USDC), but you always receive shielded ZEC. We handle the complexity.
            </p>
          </TerminalReveal>

          <TerminalReveal delay={350}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              padding: "40px 32px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Background glow effect */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "200px",
                height: "200px",
                background: `radial-gradient(circle, ${colors.primaryGlow}20 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Input tokens */}
              <div style={{ textAlign: "center", position: "relative" }}>
                <div style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "12px",
                  justifyContent: "center",
                }}>
                  <img
                    src="/icons/eth.svg"
                    alt="ETH"
                    style={{
                      width: "40px",
                      height: "40px",
                      animation: prefersReducedMotion ? "none" : "idle-float-small 3s ease-in-out infinite",
                    }}
                  />
                  <img
                    src="/icons/usdc.svg"
                    alt="USDC"
                    style={{
                      width: "40px",
                      height: "40px",
                      animation: prefersReducedMotion ? "none" : "idle-float-small 3s ease-in-out infinite 0.3s",
                    }}
                  />
                  <img
                    src="/icons/sol.svg"
                    alt="SOL"
                    style={{
                      width: "40px",
                      height: "40px",
                      animation: prefersReducedMotion ? "none" : "idle-float-small 3s ease-in-out infinite 0.6s",
                    }}
                  />
                </div>
                <div style={{ fontSize: "13px", color: colors.textBright, fontWeight: 500 }}>ETH, USDC, SOL</div>
                <div style={{ fontSize: "11px", color: colors.muted, marginTop: "4px" }}>+ 50 more tokens</div>
              </div>

              {/* Arrow and swap box */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: colors.primary,
              }}>
                <span style={{
                  fontSize: "20px",
                  animation: prefersReducedMotion ? "none" : "idle-arrow-pulse 2s ease-in-out infinite",
                }}>→</span>
                <div style={{
                  padding: "12px 20px",
                  border: `2px solid ${colors.primary}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  backgroundColor: `${colors.primary}10`,
                  boxShadow: `0 0 20px ${colors.primaryGlow}`,
                  animation: prefersReducedMotion ? "none" : "idle-glow-pulse 2.5s ease-in-out infinite",
                }}>
                  <img
                    src="/icons/zap.svg"
                    alt=""
                    style={{
                      width: "14px",
                      height: "14px",
                      marginRight: "6px",
                      filter: "invert(70%) sepia(50%) saturate(500%) hue-rotate(5deg) brightness(100%)",
                      verticalAlign: "middle",
                    }}
                  />
                  AUTO-SWAP
                </div>
                <span style={{
                  fontSize: "20px",
                  animation: prefersReducedMotion ? "none" : "idle-arrow-pulse 2s ease-in-out infinite 0.5s",
                }}>→</span>
              </div>

              {/* Output - Private ZEC tip */}
              <div style={{ textAlign: "center", position: "relative" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#F4B728",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  boxShadow: "0 0 30px rgba(244, 183, 40, 0.3)",
                  animation: prefersReducedMotion ? "none" : "idle-glow-pulse 3s ease-in-out infinite",
                }}>
                  <img
                    src="/zec/brandmark-black.svg"
                    alt="ZEC"
                    style={{
                      width: "32px",
                      height: "32px",
                      animation: prefersReducedMotion ? "none" : "idle-zec-rotate 8s linear infinite",
                    }}
                  />
                </div>
                <div style={{ fontSize: "13px", color: "#F4B728", fontWeight: 600 }}>Private ZEC</div>
                <div style={{ fontSize: "11px", color: colors.muted, marginTop: "4px" }}>Arrives instantly</div>
              </div>
            </div>
          </TerminalReveal>

          {/* Trust elements */}
          <TerminalReveal delay={500}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              marginTop: "24px",
              fontSize: "11px",
              color: colors.muted,
            }}>
              <span>✓ Fair market rates</span>
              <span>✓ No extra fees</span>
              <span>✓ ~30 second conversion</span>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 7: FAQ - Common Questions */}
      <SnapSection id="faq" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 08: FAQ
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Common questions."
            style={{ marginBottom: "48px" }}
          />

          <TerminalReveal delay={200}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "24px",
                animation: prefersReducedMotion ? "none" : "idle-float-micro 6s ease-in-out infinite",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright, marginBottom: "12px" }}>
                  Do I need to understand crypto?
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>
                  No. Download Zashi wallet, copy your address, paste it in our form. Done. Two minutes, max.
                </div>
              </div>

              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "24px",
                animation: prefersReducedMotion ? "none" : "idle-float-micro 6s ease-in-out infinite 0.5s",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright, marginBottom: "12px" }}>
                  How do I convert tips to cash?
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>
                  Send to any exchange (Coinbase, Kraken, etc.) and sell. ZEC is widely supported.
                </div>
              </div>

              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "24px",
                animation: prefersReducedMotion ? "none" : "idle-float-micro 6s ease-in-out infinite 1s",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright, marginBottom: "12px" }}>
                  What if I&apos;m not registered?
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>
                  Your tip page won&apos;t exist yet. Register in 2 minutes to go live.
                </div>
              </div>

              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "24px",
                animation: prefersReducedMotion ? "none" : "idle-float-micro 6s ease-in-out infinite 1.5s",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright, marginBottom: "12px" }}>
                  Is this legal?
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>
                  Yes. Private transactions are legal. We&apos;re a payment tool, not a money transmitter.
                </div>
              </div>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 8: CTA - marketing-psychology: urgency + commitment */}
      <SnapSection id="join" style={{ textAlign: "center", padding: "0 48px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 09: JOIN THE MOVEMENT
            </div>
          </TerminalReveal>

          {/* copywriting: outcome without pain point formula */}
          <TypingHeading
            text="Keep 100% of your "
            suffix="TIPZ."
            suffixColor={colors.primary}
            style={{ fontSize: "44px", lineHeight: 1.2 }}
          />

          <TerminalReveal delay={200}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              marginBottom: "32px",
            }}>
              Join 127+ creators who registered for fee-free tipping.
              <br />Set up in 2 minutes. Private by default.
            </p>
          </TerminalReveal>

          {/* marketing-psychology: anchoring with competitor comparison */}
          <TerminalReveal delay={300}>
            <div style={{
              display: "inline-flex",
              gap: "24px",
              padding: "16px 24px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              marginBottom: "32px",
              fontSize: "14px",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: colors.error, fontWeight: 600, marginBottom: "4px" }}>Ko-fi</div>
                <div style={{
                  color: colors.muted,
                  animation: prefersReducedMotion ? "none" : "idle-pulse-red 3s ease-in-out infinite",
                }}>-5%</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: colors.error, fontWeight: 600, marginBottom: "4px" }}>PayPal</div>
                <div style={{
                  color: colors.muted,
                  animation: prefersReducedMotion ? "none" : "idle-pulse-red 3s ease-in-out infinite 0.3s",
                }}>-3%</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: colors.success, fontWeight: 700, marginBottom: "4px" }}>TIPZ</div>
                <div style={{
                  color: colors.success,
                  fontWeight: 700,
                  animation: prefersReducedMotion ? "none" : "idle-pulse-green 3s ease-in-out infinite",
                }}>$0</div>
              </div>
            </div>
          </TerminalReveal>

          <TerminalReveal delay={400}>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
              <a
                href="/register"
                className="cta-primary"
                style={{
                  position: "relative",
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                  color: colors.bg,
                  padding: "16px 36px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: `
                    0 0 30px ${colors.primaryGlowStrong},
                    0 0 50px ${colors.primaryGlow},
                    inset 0 1px 0 rgba(255,255,255,0.2),
                    0 8px 24px rgba(0,0,0,0.4)
                  `,
                  borderRadius: "12px",
                  letterSpacing: "0.03em",
                }}
              >
                Start Earning TIPZ →
              </a>
            </div>
          </TerminalReveal>

          {/* signup-flow-cro: trust signals near CTA */}
          <TerminalReveal delay={500}>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "12px", color: colors.muted }}>
              <span style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 4s ease-in-out infinite" }}>✓ No credit card</span>
              <span style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 4s ease-in-out infinite 0.3s" }}>✓ 2 min setup</span>
              <span style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 4s ease-in-out infinite 0.6s" }}>✓ Forever free</span>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Footer - Enhanced */}
      <footer style={{
        padding: "40px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid ${colors.border}`,
        fontSize: "12px",
        backgroundColor: colors.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: colors.primary, fontWeight: 700, fontSize: "16px", fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 15px ${colors.primaryGlow}` }}>[TIPZ]</span>
          <span style={{ color: colors.muted, fontSize: "10px", letterSpacing: "1px" }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <a href="/manifesto" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>MANIFESTO</a>
          <a href="/docs" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>DOCS</a>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>GITHUB</a>
          <a href="https://x.com/tipz_cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>X</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.muted }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: colors.success,
            boxShadow: `0 0 10px ${colors.success}`,
            animation: "pulse-glow 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: "11px", letterSpacing: "1px" }}>PRIVATE BY DEFAULT</span>
        </div>
      </footer>

      {/* Animations and Effects */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        /* Character entrance animation for premium typing */
        @keyframes char-enter {
          0% {
            opacity: 0;
            transform: translateY(-3px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Cursor spring entrance */
        @keyframes cursor-enter {
          0% {
            opacity: 0;
            transform: scaleY(0.6) translateY(4px);
          }
          100% {
            opacity: 1;
            transform: scaleY(1) translateY(0);
          }
        }

        /* GPU-accelerated pulse glow using filter */
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(245, 166, 35, 0.3));
            opacity: 1;
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(245, 166, 35, 0.5));
            opacity: 0.9;
          }
        }

        /* Legacy pulse-glow for elements that need box-shadow */
        @keyframes pulse-glow-box {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 166, 35, 0.2); }
          50% { box-shadow: 0 0 40px rgba(245, 166, 35, 0.4); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes float-subtle {
          0%, 100% { transform: rotate(3deg) translateY(0); }
          50% { transform: rotate(3deg) translateY(-8px); }
        }

        @keyframes float-subtle-reverse {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(0); }
        }

        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }

        /* Cursor animation - looping every 12s, synced with modal */
        @keyframes cursor-move-loop {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          2% {
            opacity: 1;
          }
          /* Move to TIP button */
          8% {
            transform: translate(305px, 220px);
            opacity: 1;
          }
          /* Click TIP button (synced with button-click-loop at ~5%) */
          10% {
            transform: translate(305px, 220px) scale(0.85);
          }
          12% {
            transform: translate(305px, 220px) scale(1);
          }
          /* Hold position then fade */
          18% {
            transform: translate(305px, 220px);
            opacity: 1;
          }
          22% {
            transform: translate(305px, 220px);
            opacity: 0;
          }
          /* Stay hidden for rest of loop */
          100% {
            transform: translate(0, 0);
            opacity: 0;
          }
        }

        /* GPU-optimized button click - looping every 12s */
        @keyframes button-click-loop {
          0%, 4% {
            transform: scale(1);
            filter: drop-shadow(0 0 20px rgba(245, 166, 35, 0.4));
          }
          5% {
            transform: scale(0.92);
            filter: drop-shadow(0 0 35px rgba(245, 166, 35, 0.9));
          }
          8%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 25px rgba(245, 166, 35, 0.5));
          }
        }

        /* Modal popup with float and fade - looping every 12s */
        @keyframes modal-loop {
          0%, 5% {
            opacity: 0;
            transform: rotate(3deg) scale(0.85) translateY(20px);
          }
          10% {
            opacity: 1;
            transform: rotate(3deg) scale(1.04) translateY(-2px);
          }
          13% {
            opacity: 1;
            transform: rotate(3deg) scale(0.99) translateY(1px);
          }
          16%, 25% {
            opacity: 1;
            transform: rotate(3deg) scale(1) translateY(0);
          }
          30% {
            opacity: 1;
            transform: rotate(3deg) translateY(-8px);
          }
          40% {
            opacity: 1;
            transform: rotate(3deg) translateY(0);
          }
          50% {
            opacity: 1;
            transform: rotate(3deg) translateY(-8px);
          }
          60% {
            opacity: 1;
            transform: rotate(3deg) translateY(0);
          }
          70% {
            opacity: 1;
            transform: rotate(3deg) translateY(-6px);
          }
          75% {
            opacity: 1;
            transform: rotate(3deg) translateY(0);
          }
          80% {
            opacity: 0;
            transform: rotate(3deg) scale(0.95) translateY(10px);
          }
          100% {
            opacity: 0;
            transform: rotate(3deg) scale(0.85) translateY(20px);
          }
        }

        @keyframes bar-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes bar-fill-success {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }

        @keyframes number-fade {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.05); opacity: 0; }
        }

        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          25% { transform: translateY(-15px) translateX(5px); opacity: 0.8; }
          50% { transform: translateY(-25px) translateX(-5px); opacity: 0.6; }
          75% { transform: translateY(-10px) translateX(10px); opacity: 0.9; }
        }

        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(245, 166, 35, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 166, 35, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent);
        }

        .floating-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(245, 166, 35, 0.3);
          box-shadow: 0 0 20px rgba(245, 166, 35, 0.2);
          animation: float-particle 6s ease-in-out infinite;
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
          97% { opacity: 0.9; }
          98% { opacity: 1; }
        }

        @keyframes glitch-1 {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 2px); }
          40% { clip-path: inset(40% 0 40% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(60% 0 20% 0); transform: translate(-1px, 1px); }
          80% { clip-path: inset(80% 0 0 0); transform: translate(1px, -1px); }
        }

        /* Premium CTA animations */
        @keyframes cta-glow-pulse {
          0%, 100% {
            box-shadow:
              0 0 60px rgba(245, 166, 35, 0.5),
              0 0 100px rgba(245, 166, 35, 0.2),
              inset 0 1px 0 rgba(255,255,255,0.2),
              0 8px 32px rgba(0,0,0,0.4);
          }
          50% {
            box-shadow:
              0 0 80px rgba(245, 166, 35, 0.7),
              0 0 140px rgba(245, 166, 35, 0.3),
              inset 0 1px 0 rgba(255,255,255,0.25),
              0 12px 40px rgba(0,0,0,0.5);
          }
        }

        @keyframes cta-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes arrow-entrance {
          0% { transform: translateX(-8px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Tip notification glow pulse */
        .tip-notification-glow {
          animation: tip-glow-pulse 2s ease-in-out infinite;
        }

        @keyframes tip-glow-pulse {
          0%, 100% {
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.2);
          }
          50% {
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.5);
          }
        }

        /* Tip amount shimmer effect */
        .tip-amount-shimmer {
          background: linear-gradient(
            90deg,
            #fff 0%,
            #fff 40%,
            #FFD700 50%,
            #fff 60%,
            #fff 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: tip-shimmer 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes tip-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Iron Man Morph Animations */
        .iron-man-link-pulse {
          animation: iron-man-pulse 1.5s ease-in-out infinite;
        }

        @keyframes iron-man-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; text-shadow: 0 0 8px rgba(29, 155, 240, 0.5); }
        }

        .iron-man-shield-lock {
          animation: iron-man-shield-glow 2s ease-in-out infinite;
        }

        @keyframes iron-man-shield-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(252, 211, 77, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(252, 211, 77, 0.6));
          }
        }

        .iron-man-shackle {
          animation: iron-man-shackle-drop 0.5s ease-out 0.3s forwards;
        }

        @keyframes iron-man-shackle-drop {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            opacity: 1;
            transform: translateX(-50%) translateY(2px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* === IDLE ANIMATIONS === */
        /* Gentle floating for background orbs */
        @keyframes idle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* Smaller float for tokens */
        @keyframes idle-float-small {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        /* Very subtle float for FAQ cards */
        @keyframes idle-float-micro {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        /* Gentle rotation for icons */
        @keyframes idle-rotate {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        /* Slow spin for halos */
        @keyframes idle-spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Slow spin reverse */
        @keyframes idle-spin-slow-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        /* Glow pulse for text and borders */
        @keyframes idle-glow-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        /* Scale breathing for icons */
        @keyframes idle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Subtle brightness pulse for numbers */
        @keyframes idle-brightness-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }

        /* Text shadow glow pulse for 0% */
        @keyframes idle-text-glow-pulse {
          0%, 100% { text-shadow: 0 0 40px rgba(34, 197, 94, 0.4); }
          50% { text-shadow: 0 0 70px rgba(34, 197, 94, 0.7); }
        }

        /* Gradient position shift for accent bars */
        @keyframes idle-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Metallic shine sweep */
        @keyframes idle-shine-sweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Red pulse for competitor fees */
        @keyframes idle-pulse-red {
          0%, 100% { color: #EF4444; }
          50% { color: #F87171; text-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
        }

        /* Green pulse for TIPZ fees */
        @keyframes idle-pulse-green {
          0%, 100% { color: #22C55E; }
          50% { color: #4ADE80; text-shadow: 0 0 10px rgba(34, 197, 94, 0.5); }
        }

        /* Border glow breathing */
        @keyframes idle-border-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.4); }
        }

        /* ZEC logo rotation with glow */
        @keyframes idle-zec-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Arrow opacity pulse */
        @keyframes idle-arrow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .cta-hero {
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease;
          will-change: transform;
        }

        .cta-hero:hover {
          transform: translateY(-4px) scale(1.03);
          filter: brightness(1.1);
        }

        .cta-hero:active {
          transform: translateY(-2px) scale(1.01);
          filter: brightness(0.95);
        }

        .noise-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .scanlines {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 999;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          );
          opacity: 0.15;
        }

        .cta-primary {
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
          will-change: transform;
        }

        .cta-primary:hover {
          transform: translateY(-3px) scale(1.02);
          filter: drop-shadow(0 0 25px rgba(245, 166, 35, 0.5));
        }

        .cta-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .cta-primary:hover::before {
          left: 100%;
        }

        .cta-secondary {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, color 0.2s ease, filter 0.3s ease;
          will-change: transform;
        }

        .cta-secondary:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: #F5A623 !important;
          color: #F5A623 !important;
          filter: drop-shadow(0 0 15px rgba(245, 166, 35, 0.2));
        }

        .card-hover {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, box-shadow 0.3s ease;
          will-change: transform;
        }

        .card-hover:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: #3d4450 !important;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35), 0 0 20px rgba(245, 166, 35, 0.05);
        }

        .glow-text {
          text-shadow: 0 0 20px rgba(245, 166, 35, 0.5);
        }

        .glow-success {
          text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
        }

        .stat-hover {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .stat-hover:hover {
          transform: scale(1.08);
        }

        /* Animated elements should use will-change during animation */
        [style*="animation"] {
          will-change: transform, opacity;
        }

        /* Header responsive */
        .header-inner {
          padding: 20px 48px;
        }

        .desktop-nav {
          display: flex;
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
        }

        .chapter-indicator {
          display: flex;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .header-inner {
            padding: 16px;
          }

          .desktop-nav {
            display: none !important;
          }

          .mobile-menu-btn {
            display: flex !important;
          }

          .chapter-indicator {
            display: none !important;
          }

          /* Disable scroll snap on mobile for natural scrolling */
          .main-container {
            scroll-snap-type: none !important;
            overflow-x: hidden !important;
          }

          /* Reduce section padding on mobile */
          .snap-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
