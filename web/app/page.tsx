"use client";

import { useEffect, useState, useRef, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import { TipzLogo } from "@/components/TipzLogo";

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
  { id: "hero", num: "01", title: "VISION" },
  { id: "broken", num: "02", title: "THE FALSE CHOICE" },
  { id: "solution", num: "03", title: "THE SOLUTION" },
  { id: "any-token", num: "04", title: "UNIVERSAL INTAKE" },
  { id: "proof", num: "05", title: "GENESIS COHORT" },
  { id: "creator-tools", num: "06", title: "COMMAND CENTER" },
  { id: "faq", num: "07", title: "FAQ" },
  { id: "how-it-works", num: "08", title: "GET STARTED" },
  { id: "join", num: "09", title: "EXIT" },
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
    reducedMotion?: boolean;
  } = {}
) {
  const {
    baseSpeed = 55,
    varianceRange = 25,
    pauseOnSpace = 80,
    pauseOnPunctuation = 150,
    accelerationCurve = true,
    initialDelay = 400,
    reducedMotion: reducedMotionOverride,
  } = options;

  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [newCharIndex, setNewCharIndex] = useState(-1);
  const systemPrefersReducedMotion = usePrefersReducedMotion();
  // Use override if provided, otherwise fall back to system preference
  const prefersReducedMotion = reducedMotionOverride ?? systemPrefersReducedMotion;

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


// Iron Man Morph - Hero animation that transforms link preview into payment terminal
// 4-phase animation: Tweet → Card → Processing → Receipt

// Memoized constants (defined outside component to avoid recreation)
const IRONMAN_SPRING_CONFIG = { type: "spring" as const, stiffness: 120, damping: 20 };
const IRONMAN_BASE_WIDTH = 460;
const IRONMAN_BASE_HEIGHT = 580;
const IRONMAN_TWEET_WIDTH = 400;
const IRONMAN_CARD_WIDTH = 340;

// Naval avatar URL - preloaded to prevent animation lag
const NAVAL_AVATAR_URL = "https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg";

function IronManMorph({ isVisible, scale = 1 }: { isVisible: boolean; scale?: number }) {
  // 4-phase animation: 0=tweet, 1=card, 2=processing, 3=receipt
  const [phase, setPhase] = useState(0);
  const [sendButtonClicked, setSendButtonClicked] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Preload Naval avatar image to prevent animation lag
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageReady(true);
    img.onerror = () => setImageReady(true); // Proceed even if image fails
    img.src = NAVAL_AVATAR_URL;

    // Fallback timeout - proceed after 1.5s even if image isn't loaded
    const fallback = setTimeout(() => setImageReady(true), 1500);
    return () => clearTimeout(fallback);
  }, []);

  // Animation timeline - 7 second loop matching the motion script
  // Phase 0: The Hook (0-2s) - Tweet context with cursor animation
  // Phase 1: The Expansion + Input (2-3.5s) - Card morphs, user clicks Send
  // Phase 2: The Scrub (3.5-5s) - Processing with "identity scrubbed" message
  // Phase 3: The Payoff (5-7s) - Receipt with SEALED badge
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, visible: false, hovering: null as string | null });

  // Gate animation on both visibility and image readiness
  const animationReady = isVisible && imageReady;

  useEffect(() => {
    if (!animationReady || prefersReducedMotion) return;

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
  }, [animationReady, prefersReducedMotion]);

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
                src={NAVAL_AVATAR_URL}
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
              src={NAVAL_AVATAR_URL}
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
                Private tips open here 👇
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
                        src={NAVAL_AVATAR_URL}
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
                        fontFamily: "var(--font-family-mono)",
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
                        <span style={{ fontSize: `${7 * scale}px`, fontWeight: 600, color: "#10B981", fontFamily: "var(--font-family-mono)" }}>
                          Private
                        </span>
                      </div>

                      {/* Lightning - Instant */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
                        <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <span style={{ fontSize: `${7 * scale}px`, fontWeight: 600, color: "#10B981", fontFamily: "var(--font-family-mono)" }}>
                          Instant
                        </span>
                      </div>

                      {/* Ban/Circle - 0% fees */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
                        <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        <span style={{ fontSize: `${7 * scale}px`, fontWeight: 600, color: "#10B981", fontFamily: "var(--font-family-mono)" }}>
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
                              fontFamily: "var(--font-family-mono)",
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
                        fontFamily: "var(--font-family-mono)",
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
                          fontFamily: "var(--font-family-mono)",
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
                          fontFamily: "var(--font-family-mono)",
                        }}>
                          ETH
                        </span>
                      </div>

                      {/* Right: Balance + Chevron */}
                      <div style={{ display: "flex", alignItems: "center", gap: `${4 * scale}px` }}>
                        <span style={{
                          color: "rgba(255, 255, 255, 0.5)",
                          fontSize: `${6 * scale}px`,
                          fontFamily: "var(--font-family-mono)",
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
                      fontFamily: "var(--font-family-mono)",
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
            src={NAVAL_AVATAR_URL}
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
              fontFamily: "var(--font-family-mono)",
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
                  fontFamily: "var(--font-family-mono)",
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
          <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: `${13 * scale}px`, fontFamily: "var(--font-family-mono)" }}>
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
            <span style={{ color: "#00FF94", fontSize: `${7 * scale}px`, fontWeight: 700, fontFamily: "var(--font-family-mono)", letterSpacing: "0.5px" }}>
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
            <span style={{ color: "#FFFFFF", fontSize: `${14 * scale}px`, fontWeight: 600, fontFamily: "var(--font-family-mono)" }}>
              ETH
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: `${6 * scale}px` }}>
            <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${10 * scale}px`, fontFamily: "var(--font-family-mono)" }}>
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
              fontFamily: "var(--font-family-mono)",
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
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: `${9 * scale}px`, fontFamily: "var(--font-family-mono)" }}>Private</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
            <svg width={10 * scale} height={10 * scale} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: `${9 * scale}px`, fontFamily: "var(--font-family-mono)" }}>Instant</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: `${3 * scale}px` }}>
            <svg width={10 * scale} height={10 * scale} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="4" y1="4" x2="20" y2="20" />
            </svg>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: `${9 * scale}px`, fontFamily: "var(--font-family-mono)" }}>0% fees</span>
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
                  fontFamily: "var(--font-family-mono)",
                  letterSpacing: "0.5px",
                  marginBottom: `${4 * scale}px`,
                }}>
                  Establishing Secure Channel...
                </div>
                <div style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: `${9 * scale}px`,
                  fontFamily: "var(--font-family-mono)",
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
                fontFamily: "var(--font-family-mono)",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: `${4 * scale}px`,
              }}>
                PAYMENT SECURE
              </div>
              <div style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: `${9 * scale}px`,
                fontFamily: "var(--font-family-mono)",
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
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "var(--font-family-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    AMOUNT SENT
                  </span>
                  <span style={{ color: "#FFFFFF", fontSize: `${8 * scale}px`, fontFamily: "var(--font-family-mono)", fontWeight: 600 }}>
                    $5.00
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: `${6 * scale}px` }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "var(--font-family-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    NETWORK FEE
                  </span>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "var(--font-family-mono)" }}>
                    $0.01
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: `${6 * scale}px` }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "var(--font-family-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    PLATFORM FEE
                  </span>
                  <span style={{ color: "#00FF94", fontSize: `${8 * scale}px`, fontFamily: "var(--font-family-mono)", fontWeight: 700 }}>
                    $0.00
                  </span>
                </div>
                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.1)", margin: `${6 * scale}px 0` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: `${8 * scale}px`, fontFamily: "var(--font-family-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                      fontFamily: "var(--font-family-mono)",
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
                fontFamily: "var(--font-family-mono)",
              }}>
                No platform fees. Swap spread included in rate.
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
        fontFamily: "var(--font-family-mono)",
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
  reducedMotion: reducedMotionOverride,
}: {
  text: string;
  isMobile: boolean;
  onComplete: () => void;
  reducedMotion?: boolean;
}) {
  const [containerVisible, setContainerVisible] = useState(false);
  const [completionFlash, setCompletionFlash] = useState(false);
  const systemPrefersReducedMotion = usePrefersReducedMotion();
  // Use override if provided, otherwise fall back to system preference
  const prefersReducedMotion = reducedMotionOverride ?? systemPrefersReducedMotion;

  const { displayText, isComplete, newCharIndex } = usePremiumTypingEffect(text, {
    baseSpeed: 55,
    varianceRange: 25,
    pauseOnSpace: 80,
    pauseOnPunctuation: 150,
    accelerationCurve: true,
    initialDelay: prefersReducedMotion ? 0 : 400,
    reducedMotion: prefersReducedMotion,
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

  // Check if character is the final "X" (for X logo)
  const isXLogoChar = (index: number) => {
    return text.endsWith("on X") && index === text.length - 1;
  };

  // X Logo SVG component for inline use - Gold colored, slightly larger for visual weight
  const XLogo = ({ size = "1.05em" }: { size?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={colors.primary}
      style={{
        display: "inline-block",
        verticalAlign: "-0.08em",
        marginLeft: "0.15em",
        filter: `drop-shadow(0 0 8px ${colors.primaryGlow})`,
      }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

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
          fontSize: isMobile ? "clamp(24px, 7vw, 36px)" : "clamp(48px, 5vw, 72px)",
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
              ) : isXLogoChar(index) ? (
                <XLogo key={index} />
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
            {displayText.split("").map((char, index) =>
              isXLogoChar(index) ? (
                <XLogo key={index} />
              ) : (
                <AnimatedCharacter
                  key={index}
                  char={char}
                  index={index}
                  isNew={index === newCharIndex}
                  isTipzChar={isTipzChar(index)}
                />
              )
            )}
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
  isMobile,
}: {
  children: React.ReactNode;
  id: string;
  style?: React.CSSProperties;
  isMobile?: boolean;
}) {
  return (
    <section
      id={id}
      className="snap-section"
      style={{
        minHeight: isMobile ? "auto" : "100vh",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        scrollMarginTop: `${HEADER_HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: isMobile ? "72px" : undefined,  // 60px header + 12px breathing room
        paddingBottom: isMobile ? "32px" : undefined,
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

// Header height constant for scroll-padding calculations
const HEADER_HEIGHT = 60; // px

export default function HomePage() {
  const heroText = "Uncensorable\nIncome on X";
  const [heroAnimationReady, setHeroAnimationReady] = useState(false);
  const [tweetVisible, setTweetVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const currentChapter = useCurrentChapter();
  const isMobile = useIsMobile(768);
  const parallaxOffset = useParallax(0.3);
  const parallaxOffsetSlow = useParallax(0.15);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Treat mobile as reduced motion for simpler, faster experience
  const effectiveReducedMotion = prefersReducedMotion || isMobile;

  // Scroll-triggered checklist animation
  const [checklistVisible, setChecklistVisible] = useState(false);
  const checklistRef = useRef<HTMLDivElement>(null);

  // Track mount state for hydration-safe animations
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Intersection Observer for checklist scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setChecklistVisible(true);
            observer.disconnect(); // Only trigger once
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% visible
    );

    if (checklistRef.current) {
      observer.observe(checklistRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counters for damage report
  const { ref: feeRef, count: feeCount } = useCountUp(39, 2500, 400);
  const { ref: privacyRef, count: privacyCount } = useCountDown(2500, 400);

  // Fallback timeout for heroAnimationReady - ensures animations proceed
  // even if HeroTitle.onComplete never fires (e.g., font loading issues)
  useEffect(() => {
    if (heroAnimationReady) return;
    const fallbackTimer = setTimeout(() => setHeroAnimationReady(true), 2000);
    return () => clearTimeout(fallbackTimer);
  }, [heroAnimationReady]);

  // Gate button/modal animations until tweet is visible
  useEffect(() => {
    if (heroAnimationReady) {
      // Tweet becomes visible 400ms after heroAnimationReady
      const timer = setTimeout(() => setTweetVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [heroAnimationReady]);

  const contentPadding: React.CSSProperties = {
    padding: isMobile ? "0" : "0 48px",
    maxWidth: "900px",
    margin: "0 auto",
    width: "100%",
  };

  return (
    <div
      className="main-container"
      style={{
        minHeight: "100dvh",
        height: "auto",
        background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 50%, ${colors.bgGradientStart} 100%)`,
        color: colors.text,
        fontFamily: "var(--font-family-mono)",
        overflowY: "auto",
        overflowX: "hidden",
        scrollSnapType: isMobile ? "none" : "y proximity",
        scrollBehavior: "smooth",
        scrollPaddingTop: `${HEADER_HEIGHT}px`,
        position: "relative",
      }}
    >
      {/* Atmospheric overlays */}
      <div className="noise-overlay" />
      <SiteHeader activePage="home" />

      {/* Chapter Indicator */}
      <ChapterIndicator currentChapter={currentChapter} />

      {/* Chapter 01: Hero - The Promise */}
      <SnapSection id="hero" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px", overflow: "hidden", position: "relative" }}>
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
            width: "min(600px, 100vw)",
            height: "min(600px, 100vw)",
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
          paddingTop: "20px",
        }}>
          {/* Left side: Copy + CTA */}
          <div style={{
            flex: 1,
            maxWidth: isMobile ? "100%" : "500px",
            textAlign: isMobile ? "center" : "left",
            paddingTop: isMobile ? "0" : "60px",
          }}>
            {/* Main headline */}
            <div style={{ marginBottom: "24px", position: "relative" }}>
              {/* Ambient glow behind headline */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: isMobile ? "50%" : "30%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "300px" : "500px",
                height: isMobile ? "200px" : "300px",
                borderRadius: "50%",
                background: `radial-gradient(ellipse, ${colors.primaryGlow} 0%, transparent 70%)`,
                filter: "blur(60px)",
                opacity: 0.4,
                pointerEvents: "none",
                zIndex: 0,
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <HeroTitle
                  text={heroText}
                  isMobile={isMobile}
                  onComplete={() => setHeroAnimationReady(true)}
                  reducedMotion={effectiveReducedMotion}
                />
              </div>
            </div>

            {/* Sub-copy */}
            <TerminalReveal delay={heroAnimationReady ? 0 : 99999}>
              <p style={{
                fontSize: isMobile ? "11px" : "14px",
                lineHeight: 1.7,
                marginBottom: "32px",
                letterSpacing: "0.04em",
                color: colors.textBright,
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "8px" : "14px",
                flexWrap: "nowrap",
                whiteSpace: "nowrap",
              }}>
                <span>Private Tips</span>
                <span style={{ color: colors.muted, opacity: 0.3, fontWeight: 300 }}>/</span>
                <span>Non-Custodial</span>
                <span style={{ color: colors.muted, opacity: 0.3, fontWeight: 300 }}>/</span>
                <span>Unfreezable</span>
                <span style={{ color: colors.muted, opacity: 0.3, fontWeight: 300 }}>/</span>
                <span>Untrackable</span>
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
                    gap: "12px",
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

                  {/* Shield/Security Icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>

                  <span style={{ position: "relative", zIndex: 1, fontFamily: "var(--font-family-mono)" }}>
                    Claim Your Tipz ID
                  </span>
                </a>

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
              <IronManMorph isVisible={tweetVisible} scale={isMobile ? 0.5 : 1} />
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 02: The False Choice - Simplified Visual Storytelling */}
      <SnapSection id="broken" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={contentPadding}>
          {/* Chapter Header */}
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.error,
              letterSpacing: "2px",
              marginBottom: "20px",
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
                boxShadow: `0 0 10px ${colors.error}`,
              }} />
              CHAPTER 02: THE FALSE CHOICE
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix=">"
            prefixColor={colors.error}
            text="The False Choice."
            style={{ fontSize: isMobile ? "32px" : "44px" }}
          />

          {/* The Two Traps - Visual Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "24px",
            alignItems: "stretch",
            marginTop: "32px",
          }}>

            {/* THE DRAIN - Feudal Model */}
            <TerminalReveal delay={200} style={{ height: "100%" }}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "20px",
                padding: isMobile ? "16px" : "28px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Label */}
                <div style={{
                  fontSize: "12px",
                  color: colors.muted,
                  letterSpacing: "2px",
                  marginBottom: "20px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  OPTION A: SERFDOM
                </div>

                {/* THE OWNERSHIP AUDIT - Who owns what */}
                <div ref={feeRef} style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                }}>
                  {/* Audit container - matches Receipt style on right */}
                  <div style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                  }}>
                    {/* Each asset status row */}
                    {[
                      { asset: "CONTENT", status: "YOURS", safe: true },
                      { asset: "AUDIENCE", status: "RENTED", safe: false },
                      { asset: "DISTRIBUTION", status: "THROTTLED", safe: false },
                      { asset: "INCOME", status: "SEIZABLE", safe: false },
                    ].map((row, i) => (
                      <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: i < 3 ? `1px solid ${colors.border}` : "none",
                      }}>
                        <span style={{ color: colors.muted }}>{row.asset}</span>
                        <span style={{
                          color: row.safe ? colors.success : colors.error,
                          fontWeight: 600,
                        }}>
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status indicator - matches "FULLY EXPOSED" on right */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "20px",
                    fontSize: "12px",
                    color: colors.error,
                    fontFamily: "var(--font-mono)",
                  }}>
                    <span
                      className={hasMounted ? "warning-flash" : undefined}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: colors.error,
                        boxShadow: `0 0 10px ${colors.error}`,
                      }}
                    />
                    CONTROL: REVOKED
                  </div>
                </div>

                {/* Bottom line */}
                <div style={{
                  fontSize: "15px",
                  color: colors.textBright,
                  textAlign: "center",
                  marginTop: "auto",
                  paddingTop: "24px",
                  lineHeight: 1.5,
                }}>
                  You feed the algorithm. <span style={{ color: colors.error, fontWeight: 600 }}>They own the audience</span>.
                </div>
              </div>
            </TerminalReveal>

            {/* THE LOCK - Surveillance Model */}
            <TerminalReveal delay={300} style={{ height: "100%" }}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "20px",
                padding: isMobile ? "16px" : "28px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Label */}
                <div style={{
                  fontSize: "12px",
                  color: colors.muted,
                  letterSpacing: "2px",
                  marginBottom: "20px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  OPTION B: SURVEILLANCE
                </div>

                {/* THE LOCK ANIMATION - Data being exposed */}
                <div ref={privacyRef} style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                }}>
                  {/* Transaction being exposed */}
                  <div style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                  }}>
                    {/* Each row lights up red as privacy count drops */}
                    {[
                      { label: "FROM", value: "0x7a2f...4e3d", threshold: 80 },
                      { label: "TO", value: "@creator_handle", threshold: 60 },
                      { label: "AMOUNT", value: "$50.00", threshold: 40 },
                      { label: "TIME", value: "2024-01-15 14:32", threshold: 20 },
                    ].map((row, i) => {
                      const isExposed = privacyCount <= row.threshold;
                      return (
                        <div key={i} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 0",
                          borderBottom: i < 3 ? `1px solid ${colors.border}` : "none",
                          transition: "all 0.5s ease",
                        }}>
                          <span style={{ color: colors.muted }}>{row.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{
                              color: isExposed ? colors.error : colors.text,
                              transition: "color 0.3s ease",
                            }}>
                              {isExposed ? row.value : "••••••••"}
                            </span>
                            {/* Eye icon - open when exposed, closed when hidden */}
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={isExposed ? colors.error : colors.muted}
                              strokeWidth="2"
                              style={{ transition: "all 0.3s ease" }}
                            >
                              {isExposed ? (
                                // Eye open - being watched
                                <>
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </>
                              ) : (
                                // Eye closed - hidden
                                <>
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                  <line x1="1" y1="1" x2="23" y2="23"/>
                                </>
                              )}
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status indicator */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "20px",
                    fontSize: "12px",
                    color: privacyCount <= 20 ? colors.error : colors.muted,
                    fontFamily: "var(--font-mono)",
                    transition: "color 0.3s ease",
                  }}>
                    <span
                      className={hasMounted && privacyCount <= 20 ? "warning-flash" : undefined}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: privacyCount <= 20 ? colors.error : colors.muted,
                        boxShadow: privacyCount <= 20 ? `0 0 10px ${colors.error}` : "none",
                        transition: "all 0.3s ease",
                      }}
                    />
                    {privacyCount <= 20 ? "FULLY EXPOSED" : "SCANNING..."}
                  </div>
                </div>

                {/* Bottom line */}
                <div style={{
                  fontSize: "15px",
                  color: colors.textBright,
                  textAlign: "center",
                  marginTop: "auto",
                  paddingTop: "24px",
                  lineHeight: 1.5,
                }}>
                  Every transaction is indexed. <span style={{ color: colors.error, fontWeight: 600 }}>Forever public</span>.
                </div>
              </div>
            </TerminalReveal>
          </div>

          {/* The Third Way - Simple, Confident */}
          <TerminalReveal delay={500}>
            <div style={{
              marginTop: "64px",
              marginBottom: isMobile ? "40px" : "0",
              textAlign: "center",
              position: "relative",
            }}>
              {/* Simple golden glow */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "300px" : "500px",
                height: "150px",
                borderRadius: "50%",
                background: `radial-gradient(ellipse, ${colors.primaryGlow} 0%, transparent 70%)`,
                filter: "blur(40px)",
                opacity: 0.5,
                pointerEvents: "none",
              }} />

              <div style={{
                display: "inline-block",
                padding: isMobile ? "20px 24px" : "32px 48px",
                borderRadius: "16px",
                border: `2px solid ${colors.primary}40`,
                backgroundColor: `${colors.surface}`,
                position: "relative",
                boxShadow: `0 0 60px ${colors.primaryGlow}`,
              }}>
                <p style={{
                  color: colors.primary,
                  fontSize: isMobile ? "24px" : "32px",
                  fontWeight: 700,
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}>
                  The Third Way.
                </p>
                <p style={{
                  color: colors.text,
                  fontSize: "16px",
                }}>
                  Ownership without surveillance.
                </p>
              </div>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>
      {/* Chapter 03: The Solution */}
      <SnapSection id="solution" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
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
              marginBottom: "24px",
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
            text="Build a Sovereign Economy."
            style={{ fontSize: isMobile ? "32px" : "40px" }}
          />

          <TerminalReveal delay={100}>
            <p style={{
              color: colors.muted,
              fontSize: "16px",
              marginTop: "-12px",
              marginBottom: "24px",
            }}>
              Permissionless. Private. Perpetual.
            </p>
          </TerminalReveal>

          {/* Hero Stats - Premium Achievement Cards */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? "16px" : "20px",
            marginTop: "20px",
            marginBottom: "28px",
            position: "relative",
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}>
            {/* Left Supporting Stat - 2 Min Setup */}
            <TerminalReveal delay={350}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "20px 18px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                width: isMobile ? "140px" : "155px",
                transform: isMobile ? "none" : "translateY(16px)",
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
                  fontFamily: "var(--font-family-mono)",
                }}>
                  120s
                </div>
                <div style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  color: colors.muted,
                  marginBottom: "6px",
                }}>
                  TO SOVEREIGNTY
                </div>
                <div style={{
                  fontSize: "10px",
                  color: colors.muted,
                  lineHeight: 1.4,
                }}>
                  No banks. No applications.
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
                  padding: isMobile ? "22px 28px" : "24px 40px",
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
                    fontSize: isMobile ? "56px" : "68px",
                    fontWeight: 800,
                    color: colors.success,
                    lineHeight: 0.9,
                    marginBottom: "6px",
                    textShadow: `0 0 60px ${colors.successGlow}`,
                    position: "relative",
                    letterSpacing: "-0.05em",
                    fontFamily: "var(--font-family-mono)",
                    animation: prefersReducedMotion ? "none" : "idle-text-glow-pulse 3s ease-in-out infinite",
                  }}>
                    100%
                  </div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    color: colors.textBright,
                    marginBottom: "12px",
                    position: "relative",
                  }}>
                    LEVERAGE
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: colors.text,
                    lineHeight: 1.5,
                    position: "relative",
                  }}>
                    You own the upside. We take zero rent.
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
                padding: "20px 18px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                width: isMobile ? "140px" : "155px",
                transform: isMobile ? "none" : "translateY(16px)",
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
                  fontFamily: "var(--font-family-mono)",
                }}>
                  0
                </div>
                <div style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  color: colors.muted,
                  marginBottom: "6px",
                }}>
                  GATEKEEPERS
                </div>
                <div style={{
                  fontSize: "10px",
                  color: colors.muted,
                  lineHeight: 1.4,
                }}>
                  No middlemen. No freeze risk.
                </div>
              </div>
            </TerminalReveal>
          </div>

          {/* The Sovereign Pipeline - Refined Design */}
          <TerminalReveal delay={800}>
            <div style={{
              maxWidth: "500px",
              margin: "0 auto",
              marginBottom: "12px",
            }}>
              {/* Pipeline Container */}
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Subtle top accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />

                {/* Pipeline Steps */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                  position: "relative",
                }}>

                  {/* === STEP 1: INPUT === */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    paddingBottom: "18px",
                  }}>
                    {/* Step indicator */}
                    <div style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <span style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: colors.text,
                      }}>01</span>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "11px",
                        color: colors.muted,
                        letterSpacing: "1px",
                        marginBottom: "4px",
                      }}>INPUT</div>
                      <div style={{
                        fontSize: "18px",
                        color: colors.textBright,
                        fontWeight: 600,
                      }}>Any Asset</div>
                      <div style={{
                        fontSize: "13px",
                        color: colors.muted,
                        marginTop: "4px",
                      }}>ETH, USDC, SOL — we accept it all</div>
                    </div>
                  </div>

                  {/* Connector line */}
                  <div style={{
                    position: "absolute",
                    left: "25px",
                    top: "52px",
                    width: "3px",
                    height: "calc(100% - 104px)",
                    background: `linear-gradient(180deg, ${colors.border} 0%, ${colors.primary} 50%, ${colors.success} 100%)`,
                    borderRadius: "2px",
                    zIndex: 1,
                  }} />

                  {/* === STEP 2: THE BLACK BOX === */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    paddingTop: "6px",
                    paddingBottom: "18px",
                  }}>
                    {/* Step indicator - highlighted */}
                    <div style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "12px",
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: `0 0 30px ${colors.primaryGlowStrong}`,
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.bg} strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "11px",
                        color: colors.primary,
                        letterSpacing: "1px",
                        marginBottom: "4px",
                        fontWeight: 600,
                      }}>THE BLACK BOX</div>
                      <div style={{
                        fontSize: "18px",
                        color: colors.primary,
                        fontWeight: 600,
                        textShadow: `0 0 20px ${colors.primaryGlow}`,
                      }}>Link Severed Forever</div>
                      <div style={{
                        fontSize: "13px",
                        color: colors.muted,
                        marginTop: "4px",
                      }}>Zcash shielded pool breaks the chain</div>
                    </div>
                  </div>

                  {/* === STEP 3: OUTPUT === */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    paddingTop: "6px",
                  }}>
                    {/* Step indicator */}
                    <div style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.success}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: `0 0 20px ${colors.successGlow}`,
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "11px",
                        color: colors.success,
                        letterSpacing: "1px",
                        marginBottom: "4px",
                        fontWeight: 600,
                      }}>OUTPUT</div>
                      <div style={{
                        fontSize: "18px",
                        color: colors.success,
                        fontWeight: 600,
                        textShadow: `0 0 20px ${colors.successGlow}`,
                      }}>Sovereign Wealth</div>
                      <div style={{
                        fontSize: "13px",
                        color: colors.muted,
                        marginTop: "4px",
                      }}>100% yours. Self-custody. Zero fees.</div>
                    </div>
                  </div>

                </div>

                {/* Bottom badge */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "28px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${colors.border}`,
                }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: `${colors.success}10`,
                    border: `1px solid ${colors.success}30`,
                    borderRadius: "6px",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span style={{
                      fontSize: "12px",
                      color: colors.success,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}>
                      Verified Shielded
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </TerminalReveal>

        </div>
      </SnapSection>
      {/* Chapter 04: Any Token - Privacy Conversion Terminal */}
      <SnapSection id="any-token" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 04: UNIVERSAL INTAKE
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Accept anything. Receive privacy."
          />

          <TerminalReveal delay={200}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              lineHeight: 1.8,
              marginBottom: "48px",
            }}>
              From any wallet. ETH, USDC, USDT, and SOL are automatically bridged to shielded ZEC. They pay their way. You receive yours.
            </p>
          </TerminalReveal>

          <TerminalReveal delay={350}>
            {/* Main Terminal Container */}
            <div style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              padding: isMobile ? "32px 20px" : "48px 32px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Dot Grid Background Pattern */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(circle, ${colors.border} 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
                opacity: 0.3,
                pointerEvents: "none",
              }} />

              {/* Central Radial Glow */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(400px, 90vw)",
                height: "min(400px, 90vw)",
                background: `radial-gradient(circle, ${colors.primaryGlow}15 0%, ${colors.primaryGlow}05 40%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Three Column Layout */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
                gap: isMobile ? "24px" : "32px",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}>

                {/* INPUT SECTION - Left Column */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  order: isMobile ? 1 : 0,
                }}>
                  <div style={{
                    fontSize: "10px",
                    color: colors.muted,
                    letterSpacing: "2px",
                    marginBottom: "8px",
                    textAlign: "center",
                  }}>
                    INPUT CHAINS
                  </div>

                  {/* Token Slots */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr",
                    gap: "12px",
                  }}>
                    {[
                      { icon: "/icons/eth.svg", name: "ETH", chain: "Ethereum", delay: 0 },
                      { icon: "/icons/usdc.svg", name: "USDC", chain: "Multi-chain", delay: 0.1 },
                      { icon: "/icons/usdt.svg", name: "USDT", chain: "Multi-chain", delay: 0.2 },
                      { icon: "/icons/sol.svg", name: "SOL", chain: "Solana", delay: 0.3 },
                    ].map((token, idx) => (
                      <div
                        key={token.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? "8px" : "12px",
                          padding: isMobile ? "10px 12px" : "12px 16px",
                          backgroundColor: `${colors.bg}80`,
                          border: `1px solid ${colors.border}`,
                          borderRadius: "8px",
                          animation: prefersReducedMotion ? "none" : `idle-float-micro 4s ease-in-out infinite ${token.delay}s`,
                        }}
                      >
                        <img
                          src={token.icon}
                          alt={token.name}
                          style={{
                            width: isMobile ? "24px" : "32px",
                            height: isMobile ? "24px" : "32px",
                          }}
                        />
                        <div>
                          <div style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: 600, color: colors.textBright }}>
                            {token.name}
                          </div>
                          {!isMobile && (
                            <div style={{ fontSize: "10px", color: colors.muted }}>
                              {token.chain}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CONVERSION CORE - Center */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "24px",
                  order: isMobile ? 0 : 1,
                }}>
                  {/* Protocol Box */}
                  <div
                    ref={checklistRef}
                    style={{
                    padding: isMobile ? "20px 24px" : "28px 36px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    backgroundColor: `${colors.surface}`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
                    textAlign: "center",
                    minWidth: isMobile ? "180px" : "220px",
                    position: "relative",
                  }}>
                    {/* Subtle top accent line */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: "20%",
                      right: "20%",
                      height: "1px",
                      background: `linear-gradient(90deg, transparent, ${colors.primary}60, transparent)`,
                    }} />

                    {/* Header */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginBottom: "20px",
                      paddingBottom: "12px",
                      borderBottom: `1px solid ${colors.border}40`,
                    }}>
                      <img
                        src="/icons/zap.svg"
                        alt=""
                        style={{
                          width: "14px",
                          height: "14px",
                          filter: "invert(70%) sepia(50%) saturate(500%) hue-rotate(5deg) brightness(100%)",
                          opacity: 0.9,
                        }}
                      />
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "1.5px",
                        color: colors.primary,
                        fontFamily: "var(--font-mono)",
                      }}>
                        INTENTS PROTOCOL
                      </span>
                    </div>

                    {/* Sequential Progress Checklist */}
                    <div className="intents-checklist" style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      position: "relative",
                    }}>
                      {[
                        { label: "ROUTING", color: colors.success, stepDelay: 0.3 },
                        { label: "BRIDGING", color: colors.primary, stepDelay: 0.9 },
                        { label: "SHIELDING", color: "#a855f7", stepDelay: 1.5 },
                      ].map((item, index, arr) => (
                        <div
                          key={item.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px 0",
                            position: "relative",
                          }}
                        >
                          {/* Vertical connector line */}
                          {index < arr.length - 1 && (
                            <div style={{
                              position: "absolute",
                              left: "9px",
                              top: "26px",
                              width: "2px",
                              height: "16px",
                              backgroundColor: colors.border,
                              overflow: "hidden",
                            }}>
                              <div
                                className="connector-fill"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  backgroundColor: item.color,
                                  transform: prefersReducedMotion ? "translateY(0)" : "translateY(-100%)",
                                  animationName: (prefersReducedMotion || !checklistVisible) ? "none" : "connectorFill",
                                  animationDuration: "0.3s",
                                  animationTimingFunction: "ease-out",
                                  animationFillMode: "forwards",
                                  animationDelay: `${item.stepDelay + 0.35}s`,
                                }}
                              />
                            </div>
                          )}

                          {/* Step indicator */}
                          <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: `2px solid ${colors.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            backgroundColor: colors.bg,
                            flexShrink: 0,
                            overflow: "hidden",
                          }}>
                            {/* Background fill on complete */}
                            <div
                              className="step-bg-fill"
                              style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: item.color,
                                opacity: prefersReducedMotion ? 1 : 0,
                                animationName: (prefersReducedMotion || !checklistVisible) ? "none" : "stepBgFill",
                                animationDuration: "0.2s",
                                animationTimingFunction: "ease-out",
                                animationFillMode: "forwards",
                                animationDelay: `${item.stepDelay + 0.15}s`,
                              }}
                            />
                            {/* Checkmark */}
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 12 12"
                              fill="none"
                              style={{
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              <path
                                d="M2.5 6L5 8.5L9.5 3.5"
                                stroke={colors.bg}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                  strokeDasharray: 12,
                                  strokeDashoffset: prefersReducedMotion ? 0 : 12,
                                  animationName: (prefersReducedMotion || !checklistVisible) ? "none" : "drawCheckmark",
                                  animationDuration: "0.25s",
                                  animationTimingFunction: "ease-out",
                                  animationFillMode: "forwards",
                                  animationDelay: `${item.stepDelay + 0.2}s`,
                                }}
                              />
                            </svg>
                          </div>

                          {/* Label */}
                          <span
                            className="step-label"
                            style={{
                              color: prefersReducedMotion ? item.color : colors.muted,
                              letterSpacing: "1px",
                              fontWeight: 500,
                              transition: "color 0.2s ease",
                              animationName: (prefersReducedMotion || !checklistVisible) ? "none" : "labelHighlight",
                              animationDuration: "0.3s",
                              animationTimingFunction: "ease-out",
                              animationFillMode: "forwards",
                              animationDelay: `${item.stepDelay + 0.1}s`,
                            }}
                            data-active-color={item.color}
                          >
                            {item.label}
                          </span>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* OUTPUT SECTION - Right Column */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isMobile ? "12px" : "16px",
                  order: isMobile ? 2 : 2,
                }}>
                  <div style={{
                    fontSize: "10px",
                    color: colors.muted,
                    letterSpacing: "2px",
                    marginBottom: "8px",
                  }}>
                    SHIELDED OUTPUT
                  </div>

                  {/* Large ZEC Coin with Dramatic Glow */}
                  <div style={{
                    position: "relative",
                    width: isMobile ? "80px" : "120px",
                    height: isMobile ? "80px" : "120px",
                  }}>
                    {/* Outer glow rings */}
                    <div style={{
                      position: "absolute",
                      inset: "-20px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${colors.primaryGlow}20 0%, transparent 70%)`,
                      animation: prefersReducedMotion ? "none" : "idle-glow-pulse 2s ease-in-out infinite",
                    }} />
                    <div style={{
                      position: "absolute",
                      inset: "-10px",
                      borderRadius: "50%",
                      border: `1px solid ${colors.primaryGlow}30`,
                      animation: prefersReducedMotion ? "none" : "idle-glow-pulse 2s ease-in-out infinite 0.5s",
                    }} />

                    {/* Main coin - using yellow brandmark directly */}
                    <img
                      src="/zec/brandmark-yellow.svg"
                      alt="ZEC"
                      style={{
                        width: "100%",
                        height: "100%",
                        filter: `drop-shadow(0 0 30px ${colors.primaryGlow}60) drop-shadow(0 0 15px ${colors.primaryGlow}40)`,
                        animation: prefersReducedMotion ? "none" : "idle-float-small 3s ease-in-out infinite",
                      }}
                    />

                    {/* Shield badge */}
                    <div style={{
                      position: "absolute",
                      bottom: isMobile ? "-6px" : "-8px",
                      right: isMobile ? "-6px" : "-8px",
                      width: isMobile ? "28px" : "36px",
                      height: isMobile ? "28px" : "36px",
                      borderRadius: "50%",
                      backgroundColor: colors.surface,
                      border: `2px solid ${colors.success}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 15px ${colors.success}40`,
                    }}>
                      <svg width={isMobile ? "14" : "18"} height={isMobile ? "14" : "18"} viewBox="0 0 24 24" fill={colors.success}>
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Labels */}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    backgroundColor: `${colors.success}15`,
                    border: `1px solid ${colors.success}40`,
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: colors.success,
                    letterSpacing: "1px",
                  }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: colors.success,
                      animation: prefersReducedMotion ? "none" : "terminal-blink 2s ease-in-out infinite",
                    }} />
                    SHIELDED
                  </div>

                  <div style={{ fontSize: "12px", color: colors.muted, textAlign: "center" }}>
                    Private • Instant
                  </div>
                </div>
              </div>
            </div>
          </TerminalReveal>

          {/* Trust Footer - Terminal Status Cards */}
          <TerminalReveal delay={500}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: isMobile ? "12px" : "16px",
              marginTop: "24px",
            }}>
              {[
                { label: "RATES", value: "Market", icon: "●" },
                { label: "PLATFORM FEE", value: "None", icon: "●" },
                { label: "SETTLE", value: "~5 min", icon: "●" },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    transition: "border-color 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary + "40";
                    e.currentTarget.style.backgroundColor = colors.surface + "cc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.backgroundColor = colors.surface;
                  }}
                >
                  <span style={{
                    color: colors.success,
                    fontSize: "10px",
                  }}>
                    {item.icon}
                  </span>
                  <div>
                    <div style={{
                      fontSize: "10px",
                      color: colors.muted,
                      letterSpacing: "1px",
                      marginBottom: "2px",
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: colors.textBright,
                      fontWeight: 500,
                    }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TerminalReveal>
        </div>

        {/* CSS Keyframes for Chapter 7 animations */}
        <style jsx>{`
          @keyframes data-stream {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes terminal-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </SnapSection>
      {/* Chapter 05: Sovereign Dashboard */}
      <SnapSection id="creator-tools" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 05: COMMAND CENTER
            </div>
          </TerminalReveal>

          {/* Split layout: Minimal Copy left, Hero Visual right (stacks on mobile with visual below) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr",
            gap: isMobile ? "40px" : "80px",
            alignItems: "center",
          }}>
            {/* Left: Minimal Copy (always first on mobile) */}
            <div style={{ order: 0 }}>
              <TypingHeading
                text="The Sovereign Dashboard."
                style={{ marginBottom: "20px", fontSize: "clamp(32px, 4vw, 42px)" }}
              />

              <TerminalReveal delay={250}>
                <p style={{
                  color: colors.muted,
                  fontSize: "18px",
                  lineHeight: 1.6,
                  marginBottom: "36px",
                }}>
                  Real-time earnings, private encrypted messages from supporters, and tools to promote your tip page.
                </p>
              </TerminalReveal>

              {/* Feature Deck - Vertical Stack with Descriptions */}
              <TerminalReveal delay={500}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  marginBottom: "40px",
                }}>
                  {/* Real-Time Earnings */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="2"
                      style={{ flexShrink: 0, marginTop: "2px", animation: prefersReducedMotion ? "none" : "idle-breathe 3s ease-in-out infinite" }}
                    >
                      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <span style={{ color: colors.textBright, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                        Real-Time Earnings
                      </span>
                      <span style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.5 }}>
                        ZEC + USD totals update live. Your browser tab shows a count so you never miss a tip.
                      </span>
                    </div>
                  </div>

                  {/* Encrypted Messages */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="2"
                      style={{ flexShrink: 0, marginTop: "2px", animation: prefersReducedMotion ? "none" : "idle-breathe 3s ease-in-out infinite 0.3s" }}
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <span style={{ color: colors.textBright, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                        Encrypted Messages
                      </span>
                      <span style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.5 }}>
                        Private messages from tippers, end-to-end encrypted. Your keys never leave your browser.
                      </span>
                    </div>
                  </div>

                  {/* Promotion Tools */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="2"
                      style={{ flexShrink: 0, marginTop: "2px", animation: prefersReducedMotion ? "none" : "idle-breathe 3s ease-in-out infinite 0.6s" }}
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <span style={{ color: colors.textBright, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                        Promotion Tools
                      </span>
                      <span style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.5 }}>
                        Copy your link, compose a tweet, or stamp your URL onto any image — all in one place.
                      </span>
                    </div>
                  </div>
                </div>
              </TerminalReveal>

              {/* CTA Button */}
              <TerminalReveal delay={750}>
                <a
                  href="/my"
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
                  OPEN YOUR DASHBOARD
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </TerminalReveal>
            </div>

            {/* Right: Dashboard Mockup (below text on mobile) */}
            <TerminalReveal delay={300}>
              <div style={{
                position: "relative",
                height: isMobile ? "auto" : "540px",
                minHeight: isMobile ? "440px" : undefined,
                order: isMobile ? 1 : 0,
              }}>
                {/* Ambient Glow Layer 1 — primary */}
                <div style={{
                  position: "absolute",
                  top: "40%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "400px",
                  height: "400px",
                  background: "radial-gradient(circle, rgba(245, 166, 35, 0.12) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(60px)",
                  animation: prefersReducedMotion ? "none" : "dashboard-ambient 5s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
                {/* Ambient Glow Layer 2 — offset, phase-shifted */}
                <div style={{
                  position: "absolute",
                  top: "48%",
                  left: "55%",
                  transform: "translate(-50%, -50%)",
                  width: "250px",
                  height: "250px",
                  background: "radial-gradient(circle, rgba(245, 166, 35, 0.06) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                  animation: prefersReducedMotion ? "none" : "dashboard-ambient 7s ease-in-out 1s infinite",
                  pointerEvents: "none",
                }} />

                {/* Gradient Border Wrapper */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: isMobile ? "translate(-50%, -50%)" : undefined,
                  width: isMobile ? "min(300px, calc(100vw - 46px))" : "400px",
                  borderRadius: "13px",
                  padding: "1px",
                  background: "linear-gradient(135deg, rgba(245,166,35,0.4) 0%, rgba(245,166,35,0.1) 30%, rgba(42,47,56,0.5) 50%, rgba(245,166,35,0.1) 70%, rgba(245,166,35,0.3) 100%)",
                  animation: prefersReducedMotion || isMobile ? "none" : "dashboard-float 6s ease-in-out infinite",
                }}>
                  {/* Dashboard Card — Inner */}
                  <div style={{
                    width: "100%",
                    background: "linear-gradient(165deg, rgba(22,25,32,0.97) 0%, rgba(18,20,26,0.99) 50%, rgba(14,16,22,1) 100%)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3), 0 12px 28px rgba(0,0,0,0.4), 0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(245,166,35,0.04)",
                  }}>
                    {/* Shimmer sweep overlay */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)",
                      backgroundSize: "200% 200%",
                      animation: prefersReducedMotion ? "none" : "dashboard-shimmer 8s linear infinite",
                      pointerEvents: "none",
                      zIndex: 1,
                    }} />

                    {/* Header Bar */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 20px",
                      borderBottom: `1px solid ${colors.border}`,
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.success }} />
                        <span style={{ fontSize: "11px", color: colors.muted, letterSpacing: "2px", fontFamily: "var(--font-family-mono)" }}>LIVE</span>
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 10px",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}>
                        <span style={{ fontSize: "11px", color: colors.muted }}>Logout</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>

                    {/* Avatar + Identity Section */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "14px 20px 10px",
                      position: "relative",
                      zIndex: 2,
                    }}>
                      {/* Avatar with amber ring */}
                      <div style={{
                        width: isMobile ? "48px" : "56px",
                        height: isMobile ? "48px" : "56px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #F5A623, #FFA500)",
                        padding: "3px",
                        boxShadow: "0 0 20px rgba(245,166,35,0.25)",
                        marginBottom: "8px",
                      }}>
                        <div style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          background: "linear-gradient(165deg, rgba(22,25,32,0.97), rgba(14,16,22,1))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <span style={{ fontSize: "16px", fontWeight: 700, color: colors.primary, fontFamily: "var(--font-family-mono)" }}>TIPZ</span>
                        </div>
                      </div>
                      {/* Handle */}
                      <span style={{ fontSize: "18px", fontWeight: 700, color: colors.textBright, marginBottom: "4px" }}>@tipz_cash</span>
                      {/* Verified badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={colors.success} stroke="none"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>
                        <span style={{ fontSize: "11px", color: colors.success, letterSpacing: "1px", fontWeight: 600 }}>VERIFIED</span>
                      </div>
                      {/* Tip link */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px", color: colors.muted }}>tipz.cash/tipz_cash</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>

                    {/* Total Earned Hero */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "6px 20px 10px",
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "24px", fontWeight: 700, color: colors.primary, fontFamily: "var(--font-family-mono)" }}>12.8400</span>
                        <span style={{ fontSize: "13px", color: colors.muted, fontFamily: "var(--font-family-mono)" }}>ZEC</span>
                      </div>
                      <span style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginBottom: "8px" }}>TOTAL EARNED</span>
                      {/* Progress bar */}
                      <div style={{ width: "100%", position: "relative", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }}>
                        <div style={{ position: "absolute", left: "65%", top: "-3px", width: "8px", height: "8px", borderRadius: "50%", background: colors.primary, boxShadow: "0 0 8px rgba(245,166,35,0.4)" }} />
                      </div>
                    </div>

                    {/* Two-Column Stats */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      padding: "10px 20px",
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: colors.textBright, fontFamily: "var(--font-family-mono)" }}>47</div>
                        <div style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginTop: "2px" }}>TIPS RECEIVED</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: colors.success, fontFamily: "var(--font-family-mono)" }}>$583.20</div>
                        <div style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginTop: "2px" }}>USD VALUE</div>
                      </div>
                    </div>

                    {/* Promote Section */}
                    <div style={{
                      padding: "8px 20px",
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "10px" }}>PROMOTE</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        {[
                          { label: "Copy Link", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                          { label: "Tweet", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="1.5"><path d="M7 17l9.2-9.2M17 17V7H7" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                          { label: "Stamp", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                        ].map((tool) => (
                          <div key={tool.label} style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 6px",
                            border: `1px solid ${colors.border}`,
                            borderRadius: "8px",
                          }}>
                            {tool.icon}
                            <span style={{ fontSize: "11px", color: colors.muted, fontFamily: "var(--font-family-mono)" }}>{tool.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Section */}
                    <div style={{
                      padding: "8px 20px 14px",
                      position: "relative",
                      zIndex: 2,
                    }}>
                      <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "10px" }}>ACTIVITY</div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {[
                          { amount: "+0.42 ZEC", time: "2m ago", hasMemo: true },
                          { amount: "+1.05 ZEC", time: "18m ago", hasMemo: false },
                          { amount: "+0.15 ZEC", time: "1h ago", hasMemo: true },
                        ].map((tip, i) => (
                          <div key={i} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 0",
                            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.success, flexShrink: 0 }} />
                            <span style={{ fontSize: "12px", fontWeight: 600, color: colors.primary, fontFamily: "var(--font-family-mono)" }}>{tip.amount}</span>
                            <span style={{ fontSize: "10px", color: colors.muted, marginLeft: "auto" }}>{tip.time}</span>
                            {tip.hasMemo && (
                              <span style={{
                                fontSize: "9px",
                                fontWeight: 600,
                                color: colors.primary,
                                background: "rgba(245,166,35,0.1)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                letterSpacing: "0.5px",
                              }}>MEMO</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </TerminalReveal>
          </div>
        </div>
      </SnapSection>
      {/* Chapter 06: Genesis Cohort */}
      <SnapSection id="proof" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 06: GENESIS COHORT
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Join the Genesis Cohort."
            style={{ marginBottom: "16px" }}
          />

          <TerminalReveal delay={100}>
            <p style={{
              fontSize: "16px",
              color: colors.muted,
              marginBottom: "48px",
            }}>
              The first 1,000 sovereigns set the standard. Reserve your handle. Secure your privacy.
            </p>
          </TerminalReveal>

          {/* Testimonial Cards - Refined Style */}
          <TerminalReveal delay={200}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "24px",
              marginBottom: "40px",
            }}>
              {/* Testimonial 1 */}
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: isMobile ? "16px" : "28px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Top accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${colors.success}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />

                <p style={{
                  fontSize: "16px",
                  color: colors.textBright,
                  margin: "0 0 24px",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}>
                  &quot;Direct settlement means no middlemen holding my funds for 30 days. The capital efficiency of receiving instant, global payments is unmatched.&quot;
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.success}40 0%, ${colors.success}20 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 15px ${colors.successGlow}`,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright }}>
                      Verified Creator
                    </div>
                    <div style={{ fontSize: "12px", color: colors.muted }}>
                      Anonymous • X User
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: isMobile ? "16px" : "28px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Top accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />

                <p style={{
                  fontSize: "16px",
                  color: colors.textBright,
                  margin: "0 0 24px",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}>
                  &quot;In a world of surveillance, unlinkable wealth is the only asset that truly belongs to you. This is the new standard for digital ownership.&quot;
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.primary}40 0%, ${colors.primary}20 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 15px ${colors.primaryGlow}`,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright }}>
                      Private Investor
                    </div>
                    <div style={{ fontSize: "12px", color: colors.muted }}>
                      Tech Founder • Anonymous
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TerminalReveal>

          {/* Stats Bar - Glass Morphism Style */}
          <TerminalReveal delay={350}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
              gap: "16px",
            }}>
              {/* Stat 1: Rent Paid */}
              <div style={{
                backgroundColor: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: isMobile ? "24px 20px" : "24px 28px",
                position: "relative",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}>
                {/* Top gradient accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${colors.success}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />
                <div style={{
                  fontSize: "11px",
                  color: colors.muted,
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  fontFamily: "var(--font-family-mono)",
                }}>
                  RENT PAID
                </div>
                <div style={{
                  fontSize: isMobile ? "32px" : "36px",
                  fontWeight: 700,
                  color: colors.success,
                  fontFamily: "var(--font-family-mono)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>
                  $0<span style={{ fontSize: "0.6em", opacity: 0.7 }}>.00</span>
                </div>
                <div style={{
                  fontSize: "11px",
                  color: colors.muted,
                  marginTop: "12px",
                  fontFamily: "var(--font-family-mono)",
                }}>
                  <span style={{ color: colors.success }}>↓ 100%</span> vs. platforms
                </div>
              </div>

              {/* Stat 2: Volume (Redacted) */}
              <div style={{
                backgroundColor: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: isMobile ? "24px 20px" : "24px 28px",
                position: "relative",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}>
                {/* Top gradient accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />
                <div style={{
                  fontSize: "11px",
                  color: colors.muted,
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  fontFamily: "var(--font-family-mono)",
                }}>
                  VOLUME
                </div>
                <div style={{
                  fontSize: isMobile ? "32px" : "36px",
                  fontWeight: 700,
                  color: colors.primary,
                  fontFamily: "var(--font-family-mono)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>
                  [REDACTED]
                </div>
                <div style={{
                  fontSize: "11px",
                  color: colors.muted,
                  marginTop: "12px",
                  fontFamily: "var(--font-family-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span style={{ color: colors.primary }}>Shielded</span>
                </div>
              </div>

              {/* Stat 3: System Status */}
              <div style={{
                backgroundColor: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: isMobile ? "24px 20px" : "24px 28px",
                position: "relative",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}>
                {/* Top gradient accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${colors.success}, transparent)`,
                  borderRadius: "12px 12px 0 0",
                }} />
                <div style={{
                  fontSize: "11px",
                  color: colors.muted,
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  fontFamily: "var(--font-family-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: colors.success,
                    borderRadius: "50%",
                    boxShadow: `0 0 8px ${colors.success}`,
                    animation: prefersReducedMotion ? "none" : "pulse-glow 2s ease-in-out infinite",
                  }} />
                  STATUS
                </div>
                <div style={{
                  fontSize: isMobile ? "32px" : "36px",
                  fontWeight: 700,
                  color: colors.success,
                  fontFamily: "var(--font-family-mono)",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}>
                  ONLINE
                </div>
                <div style={{
                  fontSize: "11px",
                  color: colors.muted,
                  marginTop: "12px",
                  fontFamily: "var(--font-family-mono)",
                }}>
                  <span style={{ color: colors.success }}>100%</span> uptime
                </div>
              </div>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>
      {/* Chapter 07: FAQ - Common Questions */}
      <SnapSection id="faq" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 07: FAQ
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Common questions."
            style={{ marginBottom: "48px" }}
          />

          <TerminalReveal delay={200}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "16px" : "24px",
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
                  What does the dashboard show?
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>
                  Real-time tips, encrypted messages, total earnings, and tools to promote your link — all at tipz.cash/my.
                </div>
              </div>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>
      {/* Chapter 08: How It Works */}
      <SnapSection id="how-it-works" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 08: GET STARTED
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Claim your sovereign income."
            style={{ marginBottom: "16px" }}
          />

          <TerminalReveal delay={50}>
            <p style={{
              fontSize: "16px",
              color: colors.muted,
              marginBottom: "48px",
            }}>
              Three steps to permanent financial independence.
            </p>
          </TerminalReveal>

          {/* Side-by-side layout for Creators and Supporters */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "32px" : "48px",
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
                </h3>
              </TerminalReveal>

              <StaggeredItems
                baseDelay={120}
                columns={1}
                items={[
                  {
                    step: "01",
                    title: "Link your wallet",
                    desc: "Connect a Zashi shielded wallet. Takes 2 mins to set up.",
                    icon: "/icons/wallet.svg",
                  },
                  {
                    step: "02",
                    title: "Verify your identity",
                    desc: "One tweet binds your X handle to your keys.",
                    icon: "/icons/link.svg",
                  },
                  {
                    step: "03",
                    title: "Go live",
                    desc: "Your uncensorable payment link is now active.",
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
                </h3>
              </TerminalReveal>

              <StaggeredItems
                baseDelay={120}
                columns={1}
                items={[
                  {
                    step: "01",
                    title: "Open their link",
                    desc: "No account. No tracking. Just click.",
                    icon: "/icons/link.svg",
                  },
                  {
                    step: "02",
                    title: "Pick your amount",
                    desc: "Any token works. Any amount converts.",
                    icon: "/icons/coins.svg",
                  },
                  {
                    step: "03",
                    title: "Confirm & send",
                    desc: "100% arrives instantly. Zero fees. Shielded delivery.",
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
      {/* Chapter 09: CTA - marketing-psychology: urgency + commitment */}
      <SnapSection id="join" isMobile={isMobile} style={{ textAlign: "center", paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 09: THE SOVEREIGN EXIT
            </div>
          </TerminalReveal>

          {/* copywriting: definite vision statement */}
          <TypingHeading
            text="Exit the Rental "
            suffix="Economy."
            suffixColor={colors.primary}
            style={{ fontSize: "44px", lineHeight: 1.2 }}
          />

          <TerminalReveal delay={200}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              marginBottom: "32px",
            }}>
              Platforms tax your income and survey your data. Tipz is 0% rent and 100% private. Stop working for the algorithm. Start building equity.
            </p>
          </TerminalReveal>

          <TerminalReveal delay={300}>
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
                  fontFamily: "var(--font-family-mono)",
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
                CLAIM SOVEREIGNTY →
              </a>
            </div>
          </TerminalReveal>

          {/* signup-flow-cro: trust signals near CTA */}
          <TerminalReveal delay={500}>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "12px", color: colors.muted }}>
              <span style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 4s ease-in-out infinite" }}>✓ No KYC</span>
              <span style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 4s ease-in-out infinite 0.3s" }}>✓ Instant Deployment</span>
              <span style={{ animation: prefersReducedMotion ? "none" : "idle-breathe 4s ease-in-out infinite 0.6s" }}>✓ Zero Rent Protocol</span>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Footer - Enhanced */}
      <footer className="home-footer" style={{
        padding: isMobile ? "24px 16px" : "40px 48px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? "16px" : "0",
        borderTop: `1px solid ${colors.border}`,
        fontSize: "12px",
        backgroundColor: colors.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <TipzLogo size={16} />
          <span style={{ color: colors.muted, fontSize: "10px", letterSpacing: "1px" }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: isMobile ? "16px" : "32px", flexWrap: "wrap" }}>
          <a href="/manifesto" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>MANIFESTO</a>
          <a href="/docs" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>DOCS</a>
          <a href="/my" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>MY TIPZ</a>
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
          <span style={{ fontSize: "11px", letterSpacing: "1px" }}>SYSTEM STATUS: OPERATIONAL</span>
        </div>
      </footer>

      {/* Animations and Effects */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        /* Sequential checklist animations for intents protocol */
        @keyframes stepBgFill {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes drawCheckmark {
          to { stroke-dashoffset: 0; }
        }

        @keyframes connectorFill {
          to { transform: translateY(0); }
        }

        @keyframes labelHighlight {
          0% { color: #6B7280; }
          100% { color: #F9FAFB; }
        }

        @keyframes statusReveal {
          0% { opacity: 0; transform: translateX(-4px); }
          100% { opacity: 1; transform: translateX(0); }
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


        /* Sovereign Wealth Reactor animations */
        @keyframes pipeFlow {
          0% {
            top: -20px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: calc(100% + 20px);
            opacity: 0;
          }
        }

        @keyframes reactorCore {
          0%, 100% {
            box-shadow:
              0 0 20px rgba(245, 166, 35, 0.6),
              0 0 40px rgba(245, 166, 35, 0.3),
              inset 0 1px 0 rgba(255,255,255,0.2);
          }
          50% {
            box-shadow:
              0 0 30px rgba(245, 166, 35, 0.8),
              0 0 60px rgba(245, 166, 35, 0.4),
              inset 0 1px 0 rgba(255,255,255,0.3);
          }
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

        /* Chapter 5: Sovereign Dashboard - Premium floating dashboard */
        @keyframes dashboard-shimmer {
          0% { background-position: -200% -200%; }
          100% { background-position: 200% 200%; }
        }

        @keyframes dashboard-float {
          0%, 100% { transform: translate(-50%, -45%) perspective(1200px) rotateX(2deg) rotateY(-1deg) translateY(0); }
          50% { transform: translate(-50%, -45%) perspective(1200px) rotateX(2deg) rotateY(-1deg) translateY(-3px); }
        }

        @keyframes dashboard-ambient {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.1); }
        }


        /* Chapter 2: The False Choice - Simplified Animations */

        /* Coin drain animation - simple horizontal flow */
        @keyframes coin-drain {
          0% {
            transform: translateX(-20px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(20px);
            opacity: 0;
          }
        }

        /* Legacy animations kept for compatibility */
        @keyframes tear-glitch {
          0%, 90% {
            opacity: 0.6;
            transform: translateX(-50%) scaleY(1);
          }
          92% {
            opacity: 0.9;
            transform: translateX(-48%) scaleY(1.1);
          }
          94% {
            opacity: 0.3;
            transform: translateX(-52%) scaleY(0.9);
          }
          96% {
            opacity: 1;
            transform: translateX(-50%) scaleY(1.15);
          }
          98% {
            opacity: 0.5;
            transform: translateX(-50%) scaleY(0.95);
          }
          100% {
            opacity: 0.6;
            transform: translateX(-50%) scaleY(1);
          }
        }

        /* Prison bars pulsing shadow */
        @keyframes prison-bars {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(0);
          }
          50% {
            opacity: 0.5;
            transform: translateX(2px);
          }
        }

        /* Portcullis closing animation */
        @keyframes portcullis {
          0%, 100% {
            stroke-dasharray: 0 0;
            opacity: 0.7;
          }
          50% {
            stroke-dasharray: 2 1;
            opacity: 1;
          }
        }

        /* Lock indicator pulse */
        @keyframes lock-pulse {
          0%, 100% { r: 3; opacity: 0.6; }
          50% { r: 3.5; opacity: 1; }
        }

        /* Particle flow from YOU to PLATFORM */
        @keyframes particle-flow {
          0% {
            transform: translateX(0) translateY(-50%);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(-200px) translateY(-50%);
            opacity: 0;
          }
        }

        /* Ownership bar pulse */
        @keyframes ownership-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(245, 166, 35, 0.2);
          }
          50% {
            box-shadow: 0 0 35px rgba(245, 166, 35, 0.4);
          }
        }

        /* Scrolling hex addresses */
        @keyframes scroll-hex {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scroll-hex-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        /* Vertical scan line */
        @keyframes scan-line-vertical {
          0% { top: -2px; }
          100% { top: 100%; }
        }

        /* Eye pupil tracking */
        @keyframes eye-track {
          0%, 100% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
        }

        /* Eye iris pulse */
        @keyframes eye-pulse {
          0%, 100% {
            stroke: #EF4444;
            opacity: 0.8;
          }
          50% {
            stroke: #F87171;
            opacity: 1;
          }
        }

        /* Eye scanning sweep */
        @keyframes eye-sweep {
          0%, 100% { transform: rotate(-30deg); opacity: 0.3; }
          50% { transform: rotate(30deg); opacity: 0.6; }
        }

        /* Golden particle burst */
        @keyframes golden-burst {
          0% {
            transform: rotate(var(--rotation, 0deg)) translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            transform: rotate(var(--rotation, 0deg)) translateX(80px);
            opacity: 0;
          }
        }

        /* Hope glow aura */
        @keyframes hope-glow {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        /* Gradient shift for border */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Ring pulse for proof section decorative rings */
        /* Note: Only opacity is animated since transform is handled by idle-spin-slow */
        @keyframes ringPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        /* Feudal card hover effects */
        .feudal-card:hover {
          border-color: rgba(245, 166, 35, 0.4) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 30px rgba(245, 166, 35, 0.1) !important;
          transform: perspective(1000px) rotateY(2deg) !important;
        }

        .feudal-card:hover .chain-corner {
          opacity: 1 !important;
        }

        /* Surveillance card hover effects */
        .surveillance-card:hover {
          border-color: rgba(239, 68, 68, 0.4) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 30px rgba(239, 68, 68, 0.1) !important;
          transform: perspective(1000px) rotateY(-2deg) !important;
        }

        .surveillance-card:hover .eye-glow {
          opacity: 1 !important;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .feudal-card,
          .surveillance-card {
            transition: none !important;
          }
          .feudal-card:hover,
          .surveillance-card:hover {
            transform: none !important;
          }
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

        .chapter-indicator {
          display: flex;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
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
            min-height: auto !important;
          }

          /* Card padding reduction */
          .card-hover {
            padding: 16px !important;
          }
        }

        /* Small phone adjustments */
        @media (max-width: 428px) {
          .snap-section {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }

        /* Very small phones (iPhone SE) */
        @media (max-width: 375px) {
          .snap-section {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .card-hover {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
