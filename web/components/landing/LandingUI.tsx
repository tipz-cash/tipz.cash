"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { colors } from "@/lib/colors";
import { useCountUp, useInView, usePrefersReducedMotion } from "@/hooks/useLandingHooks";
import { chapters, HEADER_HEIGHT } from "./constants";

// Counting stat component with animation
export function CountingStat({
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
export function ChapterIndicator({ currentChapter }: { currentChapter: number }) {
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

// [REDACTED] text that glitches on hover — scrambles characters for 200ms then settles
export function RedactedGlitch({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const base = "[REDACTED]";
  const glitchChars = "█▓▒░#@$%&*!?<>{}";
  const [text, setText] = useState(base);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHover = useCallback(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setText(
        base.split("").map((ch) =>
          ch === "[" || ch === "]" ? ch : glitchChars[Math.floor(Math.random() * glitchChars.length)]
        ).join("")
      );
    }, 40);
    timeoutRef.current = setTimeout(() => {
      clearInterval(interval);
      setText(base);
    }, 200);
    return () => { clearInterval(interval); if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [prefersReducedMotion]);

  return (
    <span
      onMouseEnter={handleHover}
      style={{ color: colors.primary, cursor: "default", fontFamily: "var(--font-family-mono)" }}
    >
      {text}
    </span>
  );
}

// Static payment card preview showing the Cypherpunk badge in context
export function CypherpunkCardPreview({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{
      width: isMobile ? "100%" : "320px",
      maxWidth: "320px",
      background: "rgba(26, 26, 26, 0.6)",
      backdropFilter: "blur(24px) saturate(150%)",
      WebkitBackdropFilter: "blur(24px) saturate(150%)",
      borderRadius: "24px",
      borderTop: "1px solid rgba(255, 215, 0, 0.5)",
      borderLeft: "none",
      borderRight: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.8)",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      overflow: "hidden",
      padding: "16px",
    }}>
      {/* Header: Avatar + Handle + Shield */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
        paddingBottom: "12px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "22%",
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          <img
            src="/tipz-avatar.png"
            alt="tipz_cash"
            style={{
              width: "140%",
              height: "140%",
              objectFit: "cover",
              objectPosition: "center",
              marginLeft: "-20%",
              marginTop: "-20%",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            fontFamily: "var(--font-family)",
          }}>
            @tipz_cash
          </span>
          {/* Gold Cypherpunk shield — same badge shown in the title */}
          <svg width={16} height={16} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 4px rgba(245,166,35,0.4))", flexShrink: 0 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#F5A623" />
            <path d="M12 3l7 2.5v6.5c0 4-4 7.2-7 9" fill="rgba(255,255,255,0.15)" />
            <path d="M9 8h6l-6 8h6" stroke="#050505" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Amount pills */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        {[1, 5, 10, 25, 50].map((amount) => {
          const isSelected = amount === 5;
          return (
            <div key={amount} style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "40px",
              background: isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              color: isSelected ? "#050505" : "rgba(255, 255, 255, 0.5)",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "var(--font-family-mono)",
              boxShadow: isSelected
                ? "0 0 20px rgba(255, 215, 0, 0.5), 0 0 8px rgba(255, 215, 0, 0.3)"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}>
              ${amount}
            </div>
          );
        })}
      </div>

      {/* Message trench */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        height: "38px",
        background: "rgba(0, 0, 0, 0.4)",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
        marginBottom: "12px",
      }}>
        <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px", fontFamily: "var(--font-family-mono)" }}>
          Add a private note...
        </span>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 6px",
          background: "rgba(0, 255, 148, 0.1)",
          borderRadius: "6px",
          flexShrink: 0,
        }}>
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ color: "#00FF94", fontSize: "7px", fontWeight: 700, fontFamily: "var(--font-family-mono)", letterSpacing: "0.5px" }}>
            ENCRYPTED
          </span>
        </div>
      </div>

      {/* Send button */}
      <div style={{
        width: "100%",
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
        borderRadius: "8px",
        color: "#050505",
        fontSize: "15px",
        fontWeight: 700,
        fontFamily: "var(--font-family-mono)",
        letterSpacing: "0.5px",
        boxShadow: "inset 0 2px 0 rgba(255, 255, 255, 0.4), 0 8px 24px rgba(255, 215, 0, 0.5)",
      }}>
        Send $5.00
      </div>

      {/* Trust footer */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginTop: "10px",
        paddingTop: "8px",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "9px", fontFamily: "var(--font-family-mono)" }}>Private</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "9px", fontFamily: "var(--font-family-mono)" }}>Instant</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
          <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "9px", fontFamily: "var(--font-family-mono)" }}>0% fees</span>
        </div>
      </div>
    </div>
  );
}

// Section wrapper with smooth scroll snap
export function SnapSection({
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
export function StaggeredItems({
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
