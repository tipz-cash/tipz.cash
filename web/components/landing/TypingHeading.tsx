"use client";

import { useEffect, useState, useRef } from "react";
import { colors } from "@/lib/colors";

// Typing heading component for chapter titles
export function TypingHeading({
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
