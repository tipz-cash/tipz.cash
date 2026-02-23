"use client";

import { useEffect, useState, memo } from "react";
import { colors } from "@/lib/colors";
import { usePrefersReducedMotion } from "@/hooks/useLandingHooks";

// Cursor component with glow effect
export function Cursor({ visible }: { visible: boolean }) {
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
export function PremiumCursor({
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
export const AnimatedCharacter = memo(function AnimatedCharacter({
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

// Code block line-by-line reveal
export function CodeBlockReveal({
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
