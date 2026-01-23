"use client";

import { useEffect, useState, useRef } from "react";
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
  { id: "any-token", num: "06", title: "ANY TOKEN" },
  { id: "faq", num: "07", title: "FAQ" },
  { id: "join", num: "08", title: "JOIN" },
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
function useCountUp(target: number, duration: number = 1500) {
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

    const startTime = performance.now();
    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setCount(Math.round(easedProgress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, target, duration, prefersReducedMotion]);

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
        setTimeout(typeNextChar, delay);
      } else {
        setIsComplete(true);
        setNewCharIndex(-1);
      }
    };

    const startTimer = setTimeout(() => {
      typeNextChar();
    }, initialDelay);

    return () => clearTimeout(startTimer);
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
  const [change, setChange] = useState<number>(0);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch("/api/zec-price");
        const data = await res.json();
        setPrice(data.price);
        setChange(data.change24h);
      } catch {
        setPrice(27.50);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  if (price === null) return null;

  const isPositive = change >= 0;
  const changeColor = isPositive ? colors.success : colors.error;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "11px",
      fontFamily: "'JetBrains Mono', monospace",
      color: colors.muted,
    }}>
      <span style={{ color: colors.primary }}>ZEC</span>
      <span style={{ color: colors.textBright }}>
        ${price.toFixed(2)}
      </span>
      <span style={{ color: changeColor }}>
        {isPositive ? "+" : ""}{change.toFixed(1)}%
      </span>
    </div>
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
function AnimatedCharacter({
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
}

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
  const [glowIntensity, setGlowIntensity] = useState(0);
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

  // Container entrance (100ms delay, fades in)
  useEffect(() => {
    if (prefersReducedMotion) {
      setContainerVisible(true);
      return;
    }
    const timer = setTimeout(() => setContainerVisible(true), 100);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Dynamic glow intensity based on typing progress
  useEffect(() => {
    if (text.length > 0) {
      setGlowIntensity(displayText.length / text.length);
    }
  }, [displayText, text]);

  // Completion flash effect
  useEffect(() => {
    if (isComplete && !prefersReducedMotion) {
      setCompletionFlash(true);
      const flashTimer = setTimeout(() => setCompletionFlash(false), 400);
      const completeTimer = setTimeout(() => onComplete(), 200);
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(completeTimer);
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
      style={{
        position: "fixed",
        right: "32px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        display: "flex",
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
        scrollSnapStop: "normal",
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

// Static demo preview for mobile - shows the tip modal without animation
function StaticDemoPreview() {
  return (
    <div style={{
      position: "relative",
      marginTop: "40px",
    }}>
      {/* Glow behind the graphic */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.primaryGlowStrong} 0%, transparent 60%)`,
        filter: "blur(40px)",
        opacity: 0.5,
        zIndex: 0,
      }} />

      {/* Static modal preview */}
      <div style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: "16px",
        padding: "20px",
        width: "100%",
        maxWidth: "280px",
        margin: "0 auto",
        boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 30px ${colors.primaryGlow}`,
        zIndex: 1,
        position: "relative",
      }}>
        {/* Header */}
        <div style={{
          fontSize: "12px",
          color: colors.muted,
          marginBottom: "12px",
          textAlign: "center",
        }}>
          Tip <span style={{ color: colors.textBright, fontWeight: 600 }}>@alexcreates</span>
        </div>

        {/* Amount */}
        <div style={{
          textAlign: "center",
          marginBottom: "16px",
        }}>
          <span style={{
            fontSize: "40px",
            fontWeight: 800,
            color: colors.textBright,
            letterSpacing: "-0.02em",
          }}>
            $5
          </span>
        </div>

        {/* Amount Selection */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
          marginBottom: "16px",
        }}>
          {["$1", "$5", "$10", "$25"].map((amount) => (
            <div
              key={amount}
              style={{
                padding: "10px 6px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: amount === "$5" ? colors.primary : colors.bg,
                color: amount === "$5" ? colors.bg : colors.text,
                border: `1px solid ${amount === "$5" ? colors.primary : colors.border}`,
                borderRadius: "6px",
              }}
            >
              {amount}
            </div>
          ))}
        </div>

        {/* Send CTA */}
        <button style={{
          width: "100%",
          backgroundColor: colors.primary,
          color: colors.bg,
          padding: "14px 20px",
          fontSize: "15px",
          fontWeight: 700,
          borderRadius: "10px",
          border: "none",
          boxShadow: `0 4px 16px ${colors.primaryGlow}`,
        }}>
          Send $5 →
        </button>

        {/* Trust Signals */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          fontSize: "11px",
          marginTop: "10px",
        }}>
          <span style={{ color: colors.success }}>✓ 0% fees</span>
          <span style={{ color: colors.muted }}>🔒 Private</span>
          <span style={{ color: colors.muted }}>⚡ Instant</span>
        </div>
      </div>
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
  const heroText = "Private TIPZ for\ncreators.";
  const [heroAnimationReady, setHeroAnimationReady] = useState(false);
  const [tweetVisible, setTweetVisible] = useState(false);
  const currentChapter = useCurrentChapter();
  const isMobile = useIsMobile(768);
  const parallaxOffset = useParallax(0.3);
  const parallaxOffsetSlow = useParallax(0.15);

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
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 50%, ${colors.bgGradientStart} 100%)`,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
        overflowY: "auto",
        scrollSnapType: "y proximity",
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
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "16px", textDecoration: "none" }}>
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
          <nav style={{ display: "flex", gap: "32px", alignItems: "center" }}>
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
              }}
            >START EARNING</a>
          </nav>
        </div>
      </header>

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
          {/* Subtle gradient orb - top right with parallax */}
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
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          paddingTop: "40px",
        }}>
          {/* Main headline - full width, centered */}
          <div style={{ marginBottom: "24px", maxWidth: "900px" }}>
            <HeroTitle
              text={heroText}
              isMobile={isMobile}
              onComplete={() => setHeroAnimationReady(true)}
            />
          </div>

          {/* Sub-copy - punchy alliterative format */}
          <TerminalReveal delay={heroAnimationReady ? 0 : 99999}>
            <p style={{
              fontSize: "14px",
              lineHeight: 1.7,
              marginBottom: "32px",
              letterSpacing: "0.02em",
              color: colors.muted,
            }}>
              No Fees. No Friction. No Trace.
            </p>
          </TerminalReveal>

          {/* Single CTA - Premium animated button */}
          <TerminalReveal delay={heroAnimationReady ? 200 : 99999}>
            <div style={{ position: "relative", marginBottom: "48px" }}>


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

          {/* Visual Demo - centered below CTA */}
          {isMobile ? (
            <StaticDemoPreview />
          ) : (
          <div style={{
            position: "relative",
            marginTop: "20px",
            transform: "rotate(-2deg)",
            transformOrigin: "center center",
          }}>
            {/* Glow behind the graphic */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors.primaryGlowStrong} 0%, transparent 60%)`,
              filter: "blur(60px)",
              opacity: 0.6,
              zIndex: 0,
            }} />

            {/* Tweet Card - Authentic X/Twitter Design */}
            <TerminalReveal delay={heroAnimationReady ? 400 : 99999}>
              <div style={{
                backgroundColor: "#000000",
                border: `1px solid rgb(47, 51, 54)`,
                borderRadius: "16px",
                padding: "16px",
                transform: "rotate(2deg)",
                width: "380px",
                position: "relative",
                zIndex: 1,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                animation: "float-subtle 6s ease-in-out infinite",
                textAlign: "left",
              }}>
                {/* Tweet Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}>
                    A
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name row with X logo */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "15px", color: "#E7E9EA" }}>Alex Chen</span>
                        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                          <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" fill="#1D9BF0"/>
                        </svg>
                      </div>
                      {/* X Logo */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#E7E9EA" style={{ opacity: 0.6 }}>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgb(113, 118, 123)", fontSize: "15px" }}>
                      <span>@alexcreates</span>
                      <span>·</span>
                      <span>2h</span>
                    </div>
                  </div>
                </div>

                {/* Tweet Content */}
                <div style={{ marginTop: "12px", marginBottom: "12px" }}>
                  <p style={{ fontSize: "15px", lineHeight: 1.4, color: "#E7E9EA", margin: 0 }}>
                    Just dropped a 50-part thread on building your first SaaS.
                  </p>
                  <p style={{ fontSize: "15px", lineHeight: 1.4, color: "#E7E9EA", margin: "8px 0 0 0" }}>
                    3 years of learnings, distilled into actionable steps. 🧵
                  </p>
                </div>

                {/* Tweet Metrics Row */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "rgb(113, 118, 123)",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}>
                  <span>4:32 PM</span>
                  <span>·</span>
                  <span>Jan 21, 2025</span>
                  <span>·</span>
                  <span style={{ color: "#E7E9EA", fontWeight: 500 }}>1.2M</span>
                  <span>Views</span>
                </div>

                {/* Tweet Actions */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: `1px solid rgb(47, 51, 54)`,
                }}>
                  {/* Reply */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgb(113, 118, 123)", fontSize: "13px", cursor: "pointer" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                    </svg>
                    <span>156</span>
                  </div>
                  {/* Repost */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgb(113, 118, 123)", fontSize: "13px", cursor: "pointer" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                    </svg>
                    <span>892</span>
                  </div>
                  {/* Like */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgb(113, 118, 123)", fontSize: "13px", cursor: "pointer" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                    </svg>
                    <span>2.4K</span>
                  </div>
                  {/* TIPZ Button - Highlighted with click animation */}
                  <div style={{
                    backgroundColor: colors.primary,
                    color: colors.bg,
                    padding: "6px 14px",
                    borderRadius: "100px",
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    boxShadow: `0 0 20px ${colors.primaryGlow}`,
                    animation: tweetVisible ? "button-click-loop 12s ease-in-out 1.4s infinite" : "none",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                    TIP
                  </div>
                </div>
              </div>
            </TerminalReveal>

            {/* TIP Modal - Animated popup after cursor click */}
            <div style={{
              position: "absolute",
              top: "60px",
              right: "-80px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "20px",
              padding: "24px",
              width: "300px",
              boxShadow: `0 24px 48px rgba(0,0,0,0.5), 0 0 40px ${colors.primaryGlow}`,
              zIndex: 10,
              opacity: 0,
              animation: tweetVisible
                ? "modal-loop 12s ease-in-out 1.8s infinite"
                : "none",
            }}>
                {/* Compact Header */}
                <div style={{
                  fontSize: "13px",
                  color: colors.muted,
                  marginBottom: "16px",
                  textAlign: "center",
                }}>
                  Tip <span style={{ color: colors.textBright, fontWeight: 600 }}>@alexcreates</span>
                </div>

                {/* Prominent Amount Display */}
                <div style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}>
                  <span style={{
                    fontSize: "48px",
                    fontWeight: 800,
                    color: colors.textBright,
                    letterSpacing: "-0.02em",
                  }}>
                    $5
                  </span>
                </div>

                {/* Amount Selection */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                  marginBottom: "20px",
                }}>
                  {["$1", "$5", "$10", "$25"].map((amount) => (
                    <div
                      key={amount}
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: 600,
                        backgroundColor: amount === "$5" ? colors.primary : colors.bg,
                        color: amount === "$5" ? colors.bg : colors.text,
                        border: `1px solid ${amount === "$5" ? colors.primary : colors.border}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {amount}
                    </div>
                  ))}
                </div>

                {/* Send CTA */}
                <button style={{
                  width: "100%",
                  backgroundColor: colors.primary,
                  color: colors.bg,
                  padding: "16px 24px",
                  fontSize: "16px",
                  fontWeight: 700,
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 4px 20px ${colors.primaryGlow}`,
                }}>
                  Send $5 →
                </button>

                {/* Consolidated Trust Signals */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                  fontSize: "12px",
                  marginTop: "12px",
                }}>
                  <span style={{ color: colors.success }}>✓ 0% fees</span>
                  <span style={{ color: colors.muted, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <img src="/icons/lock.svg" alt="" style={{ width: "12px", height: "12px", opacity: 0.7, filter: "invert(1)" }} />
                    Private
                  </span>
                  <span style={{ color: colors.muted, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <img src="/icons/zap.svg" alt="" style={{ width: "12px", height: "12px", opacity: 0.7, filter: "invert(1)" }} />
                    Instant
                  </span>
                </div>
              </div>

            {/* Animated Cursor */}
            <div style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 20,
              opacity: tweetVisible ? undefined : 0,
              animation: tweetVisible ? "cursor-move-loop 12s ease-in-out 0.3s infinite" : "none",
              pointerEvents: "none",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                <path
                  d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
                  fill="#FFFFFF"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
          )}
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
            text="Your income is taxed. Your privacy is exposed."
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
                  animation: "pulse-glow 3s ease-in-out infinite",
                  pointerEvents: "none",
                }} />

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  position: "relative",
                }}>
                  <span style={{ color: colors.error, fontSize: "16px" }}>&#9888;</span>
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
                }}>
                  Platforms and payment processors take up to 38% of every tip.
                </p>

                {/* Animated progress bar */}
                <div style={{ position: "relative", marginBottom: "12px" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "11px",
                  }}>
                    <span style={{ color: colors.muted }}>FEE EXTRACTION</span>
                    <span style={{ color: colors.error, fontWeight: 700 }}>38% LOST</span>
                  </div>
                  <div style={{
                    height: "8px",
                    background: colors.bg,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: "38%",
                      height: "100%",
                      background: `linear-gradient(90deg, ${colors.error}, ${colors.error}80)`,
                      borderRadius: "4px",
                      animation: "bar-fill 1s ease-out 0.5s both",
                      transformOrigin: "left",
                    }} />
                  </div>
                </div>

                <p style={{
                  color: colors.muted,
                  fontSize: "13px",
                  margin: 0,
                  position: "relative",
                  marginTop: "auto",
                }}>
                  Micropayments don&apos;t work when fees eat the tip.
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
                  <span style={{ color: colors.error, fontSize: "16px" }}>&#9888;</span>
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
                <div style={{ position: "relative", marginBottom: "12px" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "11px",
                  }}>
                    <span style={{ color: colors.muted }}>PRIVACY LEVEL</span>
                    <span style={{ color: colors.error, fontWeight: 700 }}>0% PRIVATE</span>
                  </div>
                  <div style={{
                    height: "8px",
                    background: `repeating-linear-gradient(90deg, ${colors.error}40, ${colors.error}40 4px, transparent 4px, transparent 8px)`,
                    borderRadius: "4px",
                    border: `1px solid ${colors.error}30`,
                  }} />
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
              Every dollar. Every tip. Every time.
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
                  background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                }} />
                <div style={{
                  fontSize: isMobile ? "36px" : "44px",
                  fontWeight: 800,
                  color: colors.primary,
                  lineHeight: 1,
                  marginBottom: "8px",
                  textShadow: `0 0 30px ${colors.primaryGlow}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  2m
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
                  Tweet → Form → Done
                </div>
              </div>
            </TerminalReveal>

            {/* Center Hero Stat - 0% Fees with Halo */}
            <TerminalReveal delay={200}>
              <div style={{
                position: "relative",
              }}>
                {/* Floating ring/halo effect */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  border: `1px solid ${colors.success}30`,
                  animation: "ringPulse 3s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  border: `1px solid ${colors.success}15`,
                  animation: "ringPulse 3s ease-in-out infinite 0.5s",
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
                  {/* Metallic shine overlay */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)`,
                    pointerEvents: "none",
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
                    Every cent goes to the creator.
                  </div>

                  {/* Competitor comparison mini-table */}
                  <div style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: colors.bg,
                    borderRadius: "6px",
                    position: "relative",
                  }}>
                    <div style={{ fontSize: "9px", color: colors.muted, letterSpacing: "1px", marginBottom: "8px" }}>
                      VS. COMPETITORS
                    </div>
                    {[
                      { name: "Patreon", fee: "-8% to -12%" },
                      { name: "Ko-fi", fee: "-5%" },
                      { name: "PayPal", fee: "-2.9% + $0.30" },
                    ].map((comp) => (
                      <div key={comp.name} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "10px",
                        color: colors.muted,
                        marginBottom: "4px",
                      }}>
                        <span>{comp.name}</span>
                        <span style={{ color: colors.error }}>{comp.fee}</span>
                      </div>
                    ))}
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

          {/* Side-by-side: Fee Comparison + Privacy Pipeline */}
          <TerminalReveal delay={800}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "24px",
              marginBottom: "20px",
            }}>
              {/* Fee Comparison - Left Column */}
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "28px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginBottom: "20px" }}>
                  PLATFORM FEES ON $100
                </div>

                {/* Animated fee bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { name: "PayPal", fee: "-$3.20", gets: "$96.80", width: "32%", delay: "0s" },
                    { name: "Ko-fi", fee: "-$5.00", gets: "$95.00", width: "50%", delay: "0.15s" },
                    { name: "Patreon", fee: "-$12.00", gets: "$88.00", width: "100%", delay: "0.3s" },
                  ].map((platform) => (
                    <div key={platform.name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "55px", fontSize: "11px", color: colors.muted }}>{platform.name}</div>
                      <div style={{ flex: 1, position: "relative", height: "24px", backgroundColor: colors.bg, borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: platform.width,
                          background: `linear-gradient(90deg, ${colors.error} 0%, ${colors.error}80 100%)`,
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "8px",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: colors.textBright,
                          transformOrigin: "left",
                          animation: `bar-fill 0.6s ease-out ${platform.delay} both`,
                        }}>
                          {platform.fee}
                        </div>
                      </div>
                      <div style={{
                        width: "55px",
                        textAlign: "right",
                        fontSize: "12px",
                        color: colors.error,
                        fontWeight: 600,
                        animation: `number-fade 0.4s ease-out ${platform.delay} both`,
                      }}>{platform.gets}</div>
                    </div>
                  ))}

                  {/* TIPZ - Hero row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                    <div style={{ width: "55px", fontSize: "12px", color: colors.primary, fontWeight: 700 }}>TIPZ</div>
                    <div style={{
                      flex: 1,
                      position: "relative",
                      height: "36px",
                      backgroundColor: colors.bg,
                      borderRadius: "4px",
                      overflow: "hidden",
                      border: `2px solid ${colors.success}`,
                      boxShadow: `0 0 20px ${colors.successGlow}`,
                    }}>
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        right: 0,
                        background: `linear-gradient(90deg, ${colors.success}30 0%, ${colors.success}15 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: colors.success,
                        letterSpacing: "2px",
                        transformOrigin: "left",
                        animation: "bar-fill-success 0.8s ease-out 0.5s both",
                      }}>
                        $0 FEES
                      </div>
                    </div>
                    <div style={{
                      width: "55px",
                      textAlign: "right",
                      fontSize: "16px",
                      color: colors.success,
                      fontWeight: 700,
                      textShadow: `0 0 20px ${colors.successGlow}`,
                      animation: "number-fade 0.4s ease-out 0.7s both",
                    }}>$100</div>
                  </div>
                </div>
              </div>

              {/* Privacy Pipeline - Right Column */}
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                padding: "28px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginBottom: "20px", textAlign: "center" }}>
                  HOW YOUR TIP STAYS PRIVATE
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
                      <div style={{ fontSize: "12px", color: colors.text }}>Send in any token</div>
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
                      <div style={{ fontSize: "12px", color: colors.success, fontWeight: 700 }}>100% to you</div>
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
                <div style={{ fontSize: "28px", fontWeight: 800, color: colors.primary, marginBottom: "4px" }}>127+</div>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px" }}>CREATORS REGISTERED</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: colors.success, marginBottom: "4px" }}>0%</div>
                <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px" }}>PLATFORM FEES</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: colors.success, marginBottom: "4px" }}>100%</div>
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
            text="Two minutes to set up."
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
                  <span style={{ opacity: 0.5 }}>//</span> START EARNING
                  <span style={{ fontSize: "11px", opacity: 0.6, fontWeight: 400 }}>• 3 steps</span>
                </h3>
              </TerminalReveal>

              <StaggeredItems
                baseDelay={120}
                columns={1}
                items={[
                  {
                    step: "01",
                    title: "Download Zashi",
                    desc: "Free wallet app for private payments. Takes 30 seconds.",
                    icon: "/icons/wallet.svg",
                  },
                  {
                    step: "02",
                    title: "Register your address",
                    desc: "Paste your wallet address here. Verify ownership with a tweet.",
                    icon: "/icons/link.svg",
                  },
                  {
                    step: "03",
                    title: "Get paid",
                    desc: "TIP button goes live on your X posts. Tips arrive instantly.",
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
                      backgroundColor: colors.primary,
                    }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{
                        color: colors.primary,
                        fontSize: "24px",
                        fontWeight: 700,
                        textShadow: `0 0 20px ${colors.primaryGlow}`,
                        minWidth: "36px",
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
                    title: "Install extension",
                    desc: "Add TIPZ to Chrome. No account needed.",
                    icon: "/icons/puzzle.svg",
                  },
                  {
                    step: "02",
                    title: "Browse X",
                    desc: "TIP buttons appear on registered creators' posts.",
                    icon: "/icons/eye.svg",
                  },
                  {
                    step: "03",
                    title: "Send privately",
                    desc: "One click to tip. Your support stays between you and the creator.",
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
                      backgroundColor: colors.success,
                    }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{
                        color: colors.success,
                        fontSize: "24px",
                        fontWeight: 700,
                        textShadow: `0 0 20px ${colors.successGlow}`,
                        minWidth: "36px",
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

      {/* Chapter 6: Any Token */}
      <SnapSection id="any-token" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 06: ANY TOKEN
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
                    style={{ width: "40px", height: "40px" }}
                  />
                  <img
                    src="/icons/usdc.svg"
                    alt="USDC"
                    style={{ width: "40px", height: "40px" }}
                  />
                  <img
                    src="/icons/sol.svg"
                    alt="SOL"
                    style={{ width: "40px", height: "40px" }}
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
                <span style={{ fontSize: "20px", opacity: 0.6 }}>→</span>
                <div style={{
                  padding: "12px 20px",
                  border: `2px solid ${colors.primary}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  backgroundColor: `${colors.primary}10`,
                  boxShadow: `0 0 20px ${colors.primaryGlow}`,
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
                <span style={{ fontSize: "20px", opacity: 0.6 }}>→</span>
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
                }}>
                  <img
                    src="/zec/brandmark-black.svg"
                    alt="ZEC"
                    style={{
                      width: "32px",
                      height: "32px",
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
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}>
              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "24px",
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
              }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textBright, marginBottom: "12px" }}>
                  What if I don&apos;t have TIPZ set up?
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>
                  The TIP button only appears for registered creators. No missed tips, no confusion.
                </div>
              </div>

              <div style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                padding: "24px",
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
              CHAPTER 08: JOIN THE MOVEMENT
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
                <div style={{ color: colors.muted }}>-5%</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: colors.error, fontWeight: 600, marginBottom: "4px" }}>PayPal</div>
                <div style={{ color: colors.muted }}>-3%</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: colors.success, fontWeight: 700, marginBottom: "4px" }}>TIPZ</div>
                <div style={{ color: colors.success, fontWeight: 700 }}>$0</div>
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
                Start Earning TIPZ
              </a>
              <a
                href="https://chromewebstore.google.com/detail/tipz"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary"
                style={{
                  backgroundColor: "transparent",
                  color: colors.text,
                  padding: "20px 44px",
                  border: `1px solid ${colors.borderHover}`,
                  fontWeight: 500,
                  fontSize: "15px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  borderRadius: "12px",
                  letterSpacing: "0.02em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7 }}>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                Get Extension (Free)
              </a>
            </div>
          </TerminalReveal>

          {/* signup-flow-cro: trust signals near CTA */}
          <TerminalReveal delay={500}>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "12px", color: colors.muted }}>
              <span>✓ No credit card</span>
              <span>✓ 2 min setup</span>
              <span>✓ Forever free</span>
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
      `}</style>
    </div>
  );
}
