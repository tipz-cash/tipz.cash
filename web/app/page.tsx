"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import { TipzLogo } from "@/components/TipzLogo";
import { colors } from "@/lib/colors";
import {
  usePrefersReducedMotion,
  useIsMobile,
  useCountUp,
  useCountDown,
  useParallax,
  useInView,
  useCurrentChapter,
  useDashboardAnimation,
} from "@/hooks/useLandingHooks";
import {
  chapters,
  HEADER_HEIGHT,
  renderWithTipzHighlight,
  TypingHeading,
  TerminalReveal,
  IronManMorph,
  HeroTitle,
  CountingStat,
  ChapterIndicator,
  RedactedGlitch,
  CypherpunkCardPreview,
  SnapSection,
  StaggeredItems,
} from "@/components/landing";
import "./landing.css";

export default function HomePage() {
  const heroText = "Uncensorable\nIncome on X";
  const [heroAnimationReady, setHeroAnimationReady] = useState(false);
  const handleHeroComplete = useCallback(() => setHeroAnimationReady(true), []);
  const [tweetVisible, setTweetVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const currentChapter = useCurrentChapter(chapters);
  const isMobile = useIsMobile(768);
  const parallaxOffset = useParallax(0.3);
  const parallaxOffsetSlow = useParallax(0.15);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Treat mobile as reduced motion for simpler, faster experience
  const effectiveReducedMotion = prefersReducedMotion || isMobile;

  // Dashboard mockup animation
  const dashboardInView = useInView(0.3);
  const dashAnim = useDashboardAnimation(dashboardInView.isInView, prefersReducedMotion);

  // Scroll-triggered checklist animation
  const [checklistVisible, setChecklistVisible] = useState(false);
  const checklistRef = useRef<HTMLDivElement>(null);

  // OG Cypherpunk spots remaining
  const [ogSpotsRemaining, setOgSpotsRemaining] = useState<number | null>(null);

  // Track mount state for hydration-safe animations
  useEffect(() => {
    setHasMounted(true);
    fetch("/api/og-spots")
      .then((r) => r.json())
      .then((d) => setOgSpotsRemaining(d.remaining ?? null))
      .catch(() => {});
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
      const timer = setTimeout(() => setTweetVisible(true), 700);
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
            width: "min(600px, 100%)",
            height: "min(600px, 100%)",
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
                  onComplete={handleHeroComplete}
                  reducedMotion={effectiveReducedMotion}
                />
              </div>
            </div>

            {/* Sub-copy */}
            <TerminalReveal delay={heroAnimationReady ? 100 : 99999}>
              <p style={{
                fontSize: isMobile ? "13px" : "16px",
                lineHeight: 1.6,
                marginBottom: "32px",
                letterSpacing: "0.01em",
                color: colors.muted,
              }}>
                No platform cut. No frozen accounts. No trace.
                <br />
                <span style={{ color: colors.textBright }}>Private payments, directly from your audience.</span>
              </p>
            </TerminalReveal>

            {/* CTA Button */}
            <TerminalReveal delay={heroAnimationReady ? 300 : 99999}>
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
          <TerminalReveal delay={heroAnimationReady ? 500 : 99999}>
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
            text="The False Choice."
            delay={200}
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
            <TerminalReveal delay={900} style={{ height: "100%" }}>
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
            <TerminalReveal delay={1100} style={{ height: "100%" }}>
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
          <TerminalReveal delay={600}>
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
            text="Build a Sovereign Economy."
            delay={200}
            style={{ fontSize: isMobile ? "32px" : "40px" }}
          />

          <TerminalReveal delay={400}>
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
            <TerminalReveal delay={700}>
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
                  30s
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
            <TerminalReveal delay={500}>
              <div style={{
                position: "relative",
              }}>
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
            <TerminalReveal delay={600}>
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
                      }}>100% yours. Self-custody. Zero platform fees.</div>
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
            delay={200}
          />

          <TerminalReveal delay={500}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              lineHeight: 1.8,
              marginBottom: "48px",
            }}>
              From any wallet. ETH, USDC, USDT, and SOL are automatically bridged to shielded ZEC. They pay their way. You receive yours.
            </p>
          </TerminalReveal>

          <TerminalReveal delay={700}>
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
          <TerminalReveal delay={900}>
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
                delay={200}
                style={{ marginBottom: "20px", fontSize: "clamp(32px, 4vw, 42px)" }}
              />

              <TerminalReveal delay={400}>
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
              <TerminalReveal delay={600}>
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
              <TerminalReveal delay={800}>
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
            <TerminalReveal delay={500}>
              <div ref={dashboardInView.ref} style={{
                position: "relative",
                height: isMobile ? "auto" : "540px",
                minHeight: isMobile ? "440px" : undefined,
                order: isMobile ? 1 : 0,
              }}>
                {/* Dashboard Card */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: isMobile ? "translate(-50%, -50%)" : undefined,
                  width: isMobile ? "min(300px, calc(100% - 46px))" : "400px",
                  background: "linear-gradient(165deg, #161920 0%, #12141a 50%, #0e1016 100%)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3), 0 12px 28px rgba(0,0,0,0.4), 0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(245,166,35,0.04)",
                  animation: prefersReducedMotion || isMobile ? "none" : "dashboard-float 6s ease-in-out infinite",
                }}>

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
                        <span style={{ fontSize: "24px", fontWeight: 700, color: colors.primary, fontFamily: "var(--font-family-mono)" }}>{dashAnim.zecTotal}</span>
                        <span style={{ fontSize: "13px", color: colors.muted, fontFamily: "var(--font-family-mono)" }}>ZEC</span>
                      </div>
                      <span style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginBottom: "8px" }}>TOTAL EARNED</span>
                      {/* Progress bar */}
                      <div style={{ width: "100%", position: "relative", height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }}>
                        <div style={{ position: "absolute", left: `${dashAnim.progressPct}%`, top: "-3px", width: "8px", height: "8px", borderRadius: "50%", background: colors.primary, boxShadow: "0 0 8px rgba(245,166,35,0.4)", transition: "left 0.3s ease-out" }} />
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
                        <div style={{ fontSize: "16px", fontWeight: 700, color: dashAnim.flashTipCount ? colors.success : colors.textBright, textShadow: dashAnim.flashTipCount ? `0 0 12px ${colors.successGlow}` : "none", fontFamily: "var(--font-family-mono)", transition: "color 0.2s ease, text-shadow 0.2s ease" }}>{dashAnim.tipCount}</div>
                        <div style={{ fontSize: "10px", color: colors.muted, letterSpacing: "2px", marginTop: "2px" }}>TIPS RECEIVED</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: colors.success, fontFamily: "var(--font-family-mono)" }}>${dashAnim.usdValue}</div>
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
                        {dashAnim.activityItems.map((tip, i) => (
                          <div key={`${tip.amount}-${tip.time}-${i}`} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 0",
                            borderBottom: i < dashAnim.activityItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            opacity: tip.visible ? 1 : 0,
                            transform: tip.visible ? "translateY(0)" : "translateY(8px)",
                            transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
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
            </TerminalReveal>
          </div>
        </div>
      </SnapSection>
      {/* Chapter 06: The First 100 */}
      <SnapSection id="proof" isMobile={isMobile} style={{ paddingInline: isMobile ? "16px" : "48px" }}>
        <div style={contentPadding}>
          <TerminalReveal delay={0}>
            <div style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "32px",
            }}>
              CHAPTER 06: THE FIRST 100
            </div>
          </TerminalReveal>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <TypingHeading
              text={`Join the Cypherpunks.`}
              delay={200}
              style={{ marginBottom: 0 }}
            />
            {/* Z shield — appears after title finishes typing */}
            <TerminalReveal delay={900}>
              <svg width={28} height={28} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 8px rgba(245,166,35,0.5))", flexShrink: 0, marginTop: "2px" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#F5A623" />
                <path d="M12 3l7 2.5v6.5c0 4-4 7.2-7 9" fill="rgba(255,255,255,0.15)" />
                <path d="M9 8h6l-6 8h6" stroke="#050505" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </TerminalReveal>
          </div>

          <TerminalReveal delay={1100}>
            <p style={{
              fontSize: "16px",
              color: colors.muted,
              marginBottom: "40px",
              whiteSpace: "nowrap",
            }}>
              Join the first 100 creators building the private creator economy.
            </p>
          </TerminalReveal>

          {/* Animated Badge Visual */}
          <TerminalReveal delay={500}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "40px",
            }}>
              <CypherpunkCardPreview isMobile={isMobile} />
            </div>
          </TerminalReveal>

          {/* Privilege Strip — compact single row */}
          <TerminalReveal delay={700}>
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "12px" : "0",
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              overflow: "hidden",
              marginBottom: "24px",
            }}>
              {[
                { label: "PROVENANCE", text: "First 100 verified. Limited run, then the window closes.", color: colors.primary },
                { label: "THE SIGNAL", text: "Permanent mark on your profile and directory.", color: colors.success },
                { label: "PROTOCOL ACCESS", text: "Priority access to future unlocks. Details classified.", color: colors.primary },
              ].map((item, i) => (
                <div key={item.label} style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  padding: isMobile ? "14px 16px" : "16px 20px",
                  borderRight: !isMobile && i < 2 ? `1px solid ${colors.border}` : "none",
                  borderBottom: isMobile && i < 2 ? `1px solid ${colors.border}` : "none",
                }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: item.color,
                    letterSpacing: "1.5px",
                    fontFamily: "var(--font-family-mono)",
                    lineHeight: 1,
                  }}>
                    {item.label}
                  </span>
                  <p style={{
                    fontSize: "13px",
                    color: colors.muted,
                    margin: "8px 0 0",
                    lineHeight: 1.5,
                  }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </TerminalReveal>

          {/* Spots Remaining */}
          <TerminalReveal delay={900}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 20px",
              borderRadius: "8px",
              border: `1px solid ${colors.border}`,
              backgroundColor: "rgba(26, 26, 26, 0.6)",
              fontFamily: "var(--font-family-mono)",
              fontSize: "13px",
              gap: "8px",
            }}>
              <span style={{
                color: colors.primary,
                fontWeight: 700,
                fontSize: "18px",
              }}>{ogSpotsRemaining ?? "—"}</span>
              <span style={{ color: colors.muted }}>/</span>
              <span style={{ color: colors.muted }}>100 OG spots remaining</span>
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
            delay={200}
            style={{ marginBottom: "48px" }}
          />

          <TerminalReveal delay={900}>
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
                  How can I convert ZEC to other assets?
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.6 }}>
                  In ZODL you can swap directly using NEAR Intents into multiple assets. Or send to any exchange (Coinbase, Kraken, etc.) to off-ramp into fiat.
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
            delay={200}
            style={{ marginBottom: "16px" }}
          />

          <TerminalReveal delay={1100}>
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
              <TerminalReveal delay={1500}>
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
                    title: "Sign in with X",
                    desc: "Connect your account in the dashboard. One click.",
                    icon: "/icons/link.svg",
                  },
                  {
                    step: "02",
                    title: "Add your address",
                    desc: "Paste your Zcash unified address. That's it.",
                    icon: "/icons/wallet.svg",
                  },
                  {
                    step: "03",
                    title: "Go live",
                    desc: "Your tip page is active. Share it and start earning.",
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
              <TerminalReveal delay={1700}>
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
                    desc: "100% arrives instantly. Zero platform fees. Shielded delivery.",
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
            delay={200}
            style={{ fontSize: "44px", lineHeight: 1.2 }}
          />

          <TerminalReveal delay={900}>
            <p style={{
              color: colors.muted,
              fontSize: "18px",
              marginBottom: "32px",
            }}>
              Platforms tax your income and surveil your data. TIPZ is 0% fees with privacy by default. Stop working for the algorithm. Start building equity.
            </p>
          </TerminalReveal>

          <TerminalReveal delay={1300}>
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
            <p style={{
              fontSize: "13px",
              color: colors.muted,
              textAlign: "center",
              margin: 0,
              fontFamily: "var(--font-family-mono)",
            }}>
              The first 100 get the <span style={{ color: colors.primary }}>CYPHERPUNK</span> badge.
            </p>
          </TerminalReveal>

          {/* signup-flow-cro: trust signals near CTA */}
          <TerminalReveal delay={1700}>
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
          <a href="https://github.com/tipz-cash/tipz.cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px", transition: "color 0.2s" }}>GITHUB</a>
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
    </div>
  );
}

