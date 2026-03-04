"use client";

import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { usePrefersReducedMotion, usePremiumTypingEffect } from "@/hooks/useLandingHooks";
import { AnimatedCharacter, PremiumCursor } from "./TypingComponents";

// HeroTitle component - orchestrates the entire premium typing animation
export function HeroTitle({
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

  // Find "TIPZ" — only highlight the Z
  const tipzStartIndex = text.toLowerCase().indexOf("tipz");
  const isTipzChar = (index: number) => {
    return tipzStartIndex !== -1 && index === tipzStartIndex + 3;
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
