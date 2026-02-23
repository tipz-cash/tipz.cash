"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useLandingHooks";
import {
  IRONMAN_SPRING_CONFIG,
  IRONMAN_BASE_WIDTH,
  IRONMAN_BASE_HEIGHT,
  IRONMAN_TWEET_WIDTH,
  IRONMAN_CARD_WIDTH,
  NAVAL_AVATAR_URL,
} from "./constants";


export function IronManMorph({ isVisible, scale = 1 }: { isVisible: boolean; scale?: number }) {
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
            {/* Premium Cypherpunk shield */}
            <svg width={12 * scale} height={12 * scale} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 4px rgba(245,166,35,0.4))" }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#F5A623" />
              <path d="M12 3l7 2.5v6.5c0 4-4 7.2-7 9" fill="rgba(255,255,255,0.15)" />
              <path d="M9 8h6l-6 8h6" stroke="#050505" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
