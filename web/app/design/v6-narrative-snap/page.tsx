"use client";

import { useEffect, useState, useRef } from "react";

// Color palette
const colors = {
  bg: "#0A0A0A",
  surface: "#1A1A1A",
  surfaceLight: "#222222",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  success: "#00FF00",
  error: "#FF4444",
  muted: "#888888",
  border: "#333333",
  text: "#E0E0E0",
  textBright: "#FFFFFF",
};

const chapters = [
  { id: "problem", num: "01", title: "THE PROBLEM" },
  { id: "micropayments", num: "02", title: "MICROPAYMENTS" },
  { id: "surveillance", num: "03", title: "SURVEILLANCE" },
  { id: "solution", num: "04", title: "THE SOLUTION" },
  { id: "any-token", num: "05", title: "ANY TOKEN" },
  { id: "how-it-works", num: "06", title: "HOW IT WORKS" },
  { id: "why-it-matters", num: "07", title: "WHY IT MATTERS" },
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
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
  const { ref, displayText, isComplete, hasStarted } = useTypingOnView(text, 35);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!hasStarted || isComplete) return;
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, [hasStarted, isComplete]);

  return (
    <h2
      ref={ref as React.RefObject<HTMLHeadingElement>}
      style={{
        fontSize: "32px",
        fontWeight: 600,
        marginBottom: "32px",
        lineHeight: 1.3,
        minHeight: "1.3em",
        ...style,
      }}
    >
      {prefix && <span style={{ color: prefixColor || colors.success }}>{prefix}</span>}
      {prefix && " "}
      {displayText}
      {!isComplete && hasStarted && (
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
}: {
  children: React.ReactNode;
  delay?: number;
  showCursor?: boolean;
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
        transform: shouldAnimate ? (visible ? "translateY(0)" : "translateY(12px)") : "none",
        transition: shouldAnimate ? "opacity 0.4s ease-out, transform 0.4s ease-out" : "none",
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

// Cursor component
function Cursor({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShow((s) => !s), 530);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;
  return <span style={{ color: colors.primary, opacity: show ? 1 : 0 }}>█</span>;
}

// Chapter Indicator
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
        gap: "12px",
      }}
    >
      {chapters.map((chapter, index) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            transition: "all 0.3s ease-out",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: index === currentChapter ? colors.primary : colors.muted,
              opacity: index === currentChapter ? 1 : 0,
              transition: "opacity 0.3s ease-out",
              whiteSpace: "nowrap",
            }}
          >
            {chapter.num}
          </span>
          <div
            style={{
              width: index === currentChapter ? "24px" : "8px",
              height: "2px",
              backgroundColor: index === currentChapter ? colors.primary : colors.border,
              transition: "all 0.3s ease-out",
            }}
          />
        </a>
      ))}
    </div>
  );
}

// Snap Section wrapper
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

// Staggered items component
function StaggeredItems({
  items,
  renderItem,
  baseDelay = 100,
}: {
  items: { step: string; title: string; desc: string }[];
  renderItem: (item: { step: string; title: string; desc: string }, visible: boolean, index: number) => React.ReactNode;
  baseDelay?: number;
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
      const timer = setTimeout(() => {
        setVisibleItems(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * baseDelay);
      timers.push(timer);
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [isInView, items.length, baseDelay, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "32px",
      }}
    >
      {items.map((item, i) => renderItem(item, visibleItems[i], i))}
    </div>
  );
}

export default function V6NarrativeSnapPage() {
  const heroText = "Creators are getting screwed.";
  const { displayText, isComplete } = useTypingEffect(heroText, 35);
  const [mounted, setMounted] = useState(false);
  const currentChapter = useCurrentChapter();
  const { ref: codeRef1, isInView: codeInView1 } = useInView(0.15);
  const { ref: codeRef2, isInView: codeInView2 } = useInView(0.15);
  const { ref: codeRef3, isInView: codeInView3 } = useInView(0.15);

  useEffect(() => {
    setMounted(true);
  }, []);

  const contentPadding: React.CSSProperties = {
    padding: "0 48px",
    maxWidth: "900px",
    margin: "0 auto",
    width: "100%",
  };

  const publicBlockchainLines = [
    "Sender:   0x7a2f...4e3d",
    "Receiver: 0x9b1c...8f2a",
    "Amount:   $50.00 USDC",
    "Time:     2024-01-15 14:32:01",
    "Status:   PUBLIC ❌",
  ];

  const shieldedTipsLines = [
    "Sender:   [ENCRYPTED]",
    "Receiver: [ENCRYPTED]",
    "Amount:   [ENCRYPTED]",
    "Time:     [ENCRYPTED]",
    "Status:   PRIVATE ✓",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        scrollPaddingTop: "70px",
        height: "100vh",
      }}
    >
      {/* Fixed Header */}
      <header style={{
        padding: "20px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: `${colors.bg}ee`,
        backdropFilter: "blur(8px)",
        zIndex: 100,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: colors.primary, fontWeight: 700, fontSize: "16px" }}>[TIPZ]</span>
          <span style={{ color: colors.muted, fontSize: "11px" }}>v0.1.0-beta</span>
          <span style={{ color: colors.primary, fontSize: "10px", padding: "2px 8px", border: `1px solid ${colors.primary}`, marginLeft: "8px" }}>SNAP</span>
        </div>
        <nav style={{ display: "flex", gap: "32px" }}>
          <a href="/manifesto" style={{ color: colors.muted, textDecoration: "none", fontSize: "12px" }}>MANIFESTO</a>
          <a href="/docs" style={{ color: colors.muted, textDecoration: "none", fontSize: "12px" }}>DOCS</a>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "12px" }}>GITHUB</a>
          <a href="/register" style={{ color: colors.primary, textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>REGISTER</a>
        </nav>
      </header>

      {/* Chapter Indicator */}
      <ChapterIndicator currentChapter={currentChapter} />

      {/* Chapter 1: The Problem */}
      <SnapSection id="problem" style={{ textAlign: "center", padding: "0 48px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 01: THE PROBLEM
            </div>
          </TerminalReveal>

          <div style={{ marginBottom: "64px" }}>
            <span style={{ color: colors.error, fontSize: "32px" }}>{">"}</span>{" "}
            <span style={{ fontSize: "40px", fontWeight: 600 }}>
              {mounted ? displayText : heroText}
              <Cursor visible={mounted && !isComplete} />
            </span>
          </div>

          <div style={{
            maxWidth: "700px",
            color: colors.muted,
            fontSize: "18px",
            lineHeight: 1.8,
            margin: "0 auto",
          }}>
            <TerminalReveal delay={1200}>
              <p style={{ marginBottom: "32px" }}>
                30% platform fees. Payout delays. Chargebacks.
              </p>
            </TerminalReveal>
            <TerminalReveal delay={1500}>
              <p style={{ marginBottom: "32px" }}>
                Deplatformed without warning. Income gone overnight.
              </p>
            </TerminalReveal>
            <TerminalReveal delay={1800}>
              <p style={{ color: colors.text }}>
                You build the audience. You create the content.
                <br />They take the cut. <span style={{ color: colors.error }}>The creator economy is broken.</span>
              </p>
            </TerminalReveal>
          </div>

          <TerminalReveal delay={2200}>
            <div style={{
              marginTop: "64px",
              color: colors.muted,
              fontSize: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}>
              <span>Scroll to continue</span>
              <span style={{ animation: "bounce 2s infinite" }}>↓</span>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 2: Micropayments */}
      <SnapSection id="micropayments" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 02: MICROPAYMENTS SHOULD JUST WORK
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix=">"
            prefixColor={colors.success}
            text="What if you could tip $1—and the creator actually got "
            suffix="$1?"
            suffixColor={colors.primary}
            style={{ fontSize: "40px" }}
          />

          <div style={{
            color: colors.muted,
            fontSize: "18px",
            lineHeight: 1.8,
          }}>
            <TerminalReveal delay={200}>
              <p style={{ marginBottom: "32px" }}>
                No fees. No middleman. No minimums. No delays.
              </p>
            </TerminalReveal>
            <TerminalReveal delay={350}>
              <p style={{ marginBottom: "32px" }}>
                Crypto was supposed to fix this.
                <br />
                Peer-to-peer payments. Instant settlement. Self-custody.
              </p>
            </TerminalReveal>
            <TerminalReveal delay={500} showCursor>
              <p style={{ color: colors.text }}>
                But there&apos;s a catch.
              </p>
            </TerminalReveal>
          </div>
        </div>
      </SnapSection>

      {/* Chapter 3: The Surveillance Problem */}
      <SnapSection id="surveillance" style={{ backgroundColor: colors.surface, padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 03: THE SURVEILLANCE PROBLEM
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix="{}"
            prefixColor={colors.error}
            text="Every crypto tip you send is public."
          />

          <TerminalReveal delay={200}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              lineHeight: 1.8,
              marginBottom: "32px",
            }}>
              Your wallet. Their wallet. The amount. The timestamp.
              <br />All indexed. Forever. Visible to anyone.
            </p>
          </TerminalReveal>

          <div
            ref={codeRef1}
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.error}`,
              padding: "24px",
              marginBottom: "32px",
            }}
          >
            <div style={{ color: colors.error, fontWeight: 600, marginBottom: "16px", fontSize: "12px" }}>
              PUBLIC BLOCKCHAIN DATA
            </div>
            <CodeBlockReveal lines={publicBlockchainLines} isInView={codeInView1} lineDelay={80} />
          </div>

          <TerminalReveal delay={700}>
            <p style={{
              color: colors.text,
              fontSize: "18px",
              lineHeight: 1.8,
            }}>
              Competitors track creator income. Stalkers profile supporters.
              <br />
              <span style={{ color: colors.error }}>This isn&apos;t freedom. It&apos;s surveillance with extra steps.</span>
            </p>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 4: The Solution */}
      <SnapSection id="solution" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 04: THE SOLUTION
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix=">"
            prefixColor={colors.success}
            text="TIPZ—Tips that "
            suffix="actually work."
            suffixColor={colors.primary}
            style={{ fontSize: "40px" }}
          />

          <div style={{
            color: colors.muted,
            fontSize: "18px",
            lineHeight: 1.8,
            marginBottom: "48px",
          }}>
            <TerminalReveal delay={200}>
              <p style={{ marginBottom: "32px" }}>
                Instant micropayments. Zero fees. <span style={{ color: colors.textBright }}>Private by default.</span>
              </p>
            </TerminalReveal>
            <TerminalReveal delay={350}>
              <p>
                Your tip goes in. The creator gets paid.
                <br />
                No trace. No trail. No tracking.
              </p>
            </TerminalReveal>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginTop: "32px",
          }}>
            <div
              ref={codeRef2}
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.error}`,
                padding: "24px",
              }}
            >
              <div style={{ color: colors.error, fontWeight: 600, marginBottom: "16px", fontSize: "12px" }}>
                TRADITIONAL TIPS
              </div>
              <CodeBlockReveal lines={publicBlockchainLines} isInView={codeInView2} lineDelay={60} />
            </div>

            <div
              ref={codeRef3}
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.success}`,
                padding: "24px",
              }}
            >
              <div style={{ color: colors.success, fontWeight: 600, marginBottom: "16px", fontSize: "12px" }}>
                TIPZ SHIELDED TIPS
              </div>
              <CodeBlockReveal lines={shieldedTipsLines} isInView={codeInView3} lineDelay={60} />
            </div>
          </div>
        </div>
      </SnapSection>

      {/* Chapter 5: Any Token */}
      <SnapSection id="any-token" style={{ backgroundColor: colors.surface, padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 05: ANY TOKEN
            </div>
          </TerminalReveal>

          <TypingHeading
            prefix="{}"
            prefixColor={colors.primary}
            text="Use whatever crypto you have."
          />

          <TerminalReveal delay={200}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              lineHeight: 1.8,
              marginBottom: "48px",
            }}>
              TIPZ auto-swaps any token to private delivery. No extra steps.
            </p>
          </TerminalReveal>

          <TerminalReveal delay={350}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
              padding: "32px",
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                }}>
                  ETH / USDC / SOL
                </div>
                <div style={{ fontSize: "11px", color: colors.muted }}>Your token</div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: colors.primary,
              }}>
                <span>→</span>
                <div style={{
                  padding: "8px 16px",
                  border: `1px solid ${colors.primary}`,
                  fontSize: "11px",
                }}>
                  AUTO-SWAP
                </div>
                <span>→</span>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "24px",
                  marginBottom: "8px",
                  color: colors.success,
                }}>
                  Private Delivery
                </div>
                <div style={{ fontSize: "11px", color: colors.muted }}>Shielded transfer</div>
              </div>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Chapter 6: How It Works */}
      <SnapSection id="how-it-works" style={{ padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 06: HOW IT WORKS
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Two minutes to set up."
            style={{ marginBottom: "48px" }}
          />

          {/* For Creators */}
          <div style={{ marginBottom: "48px" }}>
            <TerminalReveal delay={200}>
              <h3 style={{
                color: colors.primary,
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "24px",
              }}>
                // FOR_CREATORS
              </h3>
            </TerminalReveal>

            <StaggeredItems
              baseDelay={120}
              items={[
                {
                  step: "01",
                  title: "Get a wallet",
                  desc: "Download Zashi and copy your shielded address",
                },
                {
                  step: "02",
                  title: "Register",
                  desc: "Paste your address at tipz.cash. Verify with a tweet.",
                },
                {
                  step: "03",
                  title: "Receive tips",
                  desc: "Tip button appears on your posts.",
                },
              ]}
              renderItem={(item, visible, index) => (
                <div
                  key={item.step}
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    padding: "20px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                  }}
                >
                  <div style={{
                    color: colors.primary,
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}>
                    {item.step}
                  </div>
                  <h4 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "12px", color: colors.muted, margin: 0, lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              )}
            />
          </div>

          {/* For Tippers */}
          <div>
            <TerminalReveal delay={500}>
              <h3 style={{
                color: colors.primary,
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "24px",
              }}>
                // FOR_TIPPERS
              </h3>
            </TerminalReveal>

            <StaggeredItems
              baseDelay={120}
              items={[
                {
                  step: "01",
                  title: "Install extension",
                  desc: "Add TIPZ to Chrome. No sign-up required.",
                },
                {
                  step: "02",
                  title: "Browse X",
                  desc: "See [TIP] buttons on registered creators.",
                },
                {
                  step: "03",
                  title: "Tip privately",
                  desc: "Connect wallet, confirm. No trace.",
                },
              ]}
              renderItem={(item, visible, index) => (
                <div
                  key={item.step}
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    padding: "20px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                  }}
                >
                  <div style={{
                    color: colors.primary,
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}>
                    {item.step}
                  </div>
                  <h4 style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "12px", color: colors.muted, margin: 0, lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              )}
            />
          </div>
        </div>
      </SnapSection>

      {/* Chapter 7: Why It Matters */}
      <SnapSection id="why-it-matters" style={{ backgroundColor: colors.surface, padding: "0 48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 07: WHY IT MATTERS
            </div>
          </TerminalReveal>

          <TypingHeading
            text="Built for creators. Designed for freedom."
            style={{ marginBottom: "48px" }}
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
          }}>
            <TerminalReveal delay={200}>
              <div>
                <h3 style={{
                  color: colors.primary,
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}>
                  For creators
                </h3>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  color: colors.muted,
                  fontSize: "14px",
                  lineHeight: 2,
                }}>
                  <li>→ Keep 100%—zero platform fees</li>
                  <li>→ Get paid instantly—no payout delays</li>
                  <li>→ Own your income—no deplatforming risk</li>
                  <li>→ Stay private—no public wallet balances</li>
                </ul>
              </div>
            </TerminalReveal>

            <TerminalReveal delay={350}>
              <div>
                <h3 style={{
                  color: colors.primary,
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}>
                  For supporters
                </h3>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  color: colors.muted,
                  fontSize: "14px",
                  lineHeight: 2,
                }}>
                  <li>→ Tip $1 and it actually arrives as $1</li>
                  <li>→ Use any crypto you have</li>
                  <li>→ Support without surveillance</li>
                  <li>→ No account, no signup, no KYC</li>
                </ul>
              </div>
            </TerminalReveal>
          </div>
        </div>
      </SnapSection>

      {/* Chapter 8: CTA */}
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

          <TypingHeading
            text="The creator economy needs an upgrade."
            style={{ fontSize: "48px", lineHeight: 1.2 }}
          />

          <TerminalReveal delay={200}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              marginBottom: "48px",
            }}>
              Zero fees. Instant payments. Private by default.
              <br />Be part of the fix.
            </p>
          </TerminalReveal>

          <TerminalReveal delay={350}>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="/register"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.bg,
                  padding: "18px 40px",
                  fontWeight: 600,
                  fontSize: "16px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "background-color 0.2s ease-out",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
              >
                I&apos;m a Creator
              </a>
              <a
                href="https://chromewebstore.google.com/detail/tipz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "transparent",
                  color: colors.text,
                  padding: "18px 40px",
                  border: `1px solid ${colors.border}`,
                  fontWeight: 500,
                  fontSize: "16px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.2s ease-out",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.text;
                }}
              >
                I Want to Tip
              </a>
            </div>
          </TerminalReveal>
        </div>
      </SnapSection>

      {/* Footer */}
      <footer style={{
        padding: "32px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid ${colors.border}`,
        fontSize: "12px",
        scrollSnapAlign: "end",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: colors.primary, fontWeight: 700 }}>[TIPZ]</span>
          <span style={{ color: colors.muted }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <a href="/manifesto" style={{ color: colors.muted, textDecoration: "none" }}>Manifesto</a>
          <a href="/docs" style={{ color: colors.muted, textDecoration: "none" }}>Docs</a>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none" }}>GitHub</a>
          <a href="https://x.com/tipz_cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none" }}>X</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.muted }}>
          <span style={{ color: colors.success }}>●</span>
          <span>Private by default</span>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
