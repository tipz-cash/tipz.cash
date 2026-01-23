"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"

const colors = {
  bg: "#050505",
  surface: "rgba(18, 20, 26, 0.95)",
  surfaceBorder: "rgba(255, 255, 255, 0.08)",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  primaryGlow: "rgba(245, 166, 35, 0.15)",
  primaryGlowStrong: "rgba(245, 166, 35, 0.4)",
  success: "#22C55E",
  verified: "#22c55e",
  error: "#FF4444",
  muted: "#6B7280",
  border: "#2a2f38",
  text: "#D1D5DB",
  textBright: "#F9FAFB",
}

// Animation keyframes
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes cardReveal {
    0% {
      transform: translateY(50px);
      opacity: 0;
      filter: blur(8px);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
      filter: blur(0);
    }
  }

  @keyframes avatarPop {
    0% {
      transform: scale(0.7);
      opacity: 0;
    }
    70% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes ringPulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.08);
      opacity: 1;
    }
  }

  @keyframes borderSweep {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @keyframes floatParticle {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
      opacity: 0.2;
    }
    50% {
      transform: translateY(-25px) rotate(180deg);
      opacity: 0.6;
    }
  }

  @keyframes stampIn {
    0% {
      transform: scale(1.4) rotate(-8deg);
      opacity: 0;
    }
    60% {
      transform: scale(0.95) rotate(2deg);
    }
    100% {
      transform: scale(1) rotate(0);
      opacity: 1;
    }
  }

  @keyframes ctaGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(245, 166, 35, 0.3);
    }
    50% {
      box-shadow: 0 0 35px rgba(245, 166, 35, 0.5);
    }
  }

  @keyframes slideInText {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
`

// Skeleton component
function Skeleton({ width, height, borderRadius = "4px", style = {} }: {
  width: string | number
  height: string | number
  borderRadius?: string
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, ${colors.border} 25%, rgba(50,50,50,1) 50%, ${colors.border} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease-in-out infinite",
      ...style,
    }} />
  )
}

// Floating particles component
function FloatingParticles({ visible }: { visible: boolean }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${10 + (i * 7)}%`,
    delay: `${i * 0.3}s`,
    duration: `${3 + (i % 3)}s`,
    size: 3 + (i % 3),
  }))

  if (!visible) return null

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: "60%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: colors.primary,
            animation: `floatParticle ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

interface Creator {
  id: string
  platform: string
  handle: string
  shielded_address: string
}

type PageState = "loading" | "found" | "not_found" | "error"

// Animation phase tracker
type AnimPhase = "hidden" | "atmosphere" | "card" | "content" | "complete"

export default function CreatorCardPage() {
  const params = useParams()
  const handle = params.handle as string
  const [state, setState] = useState<PageState>("loading")
  const [creator, setCreator] = useState<Creator | null>(null)
  const [extensionInstalled, setExtensionInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [animPhase, setAnimPhase] = useState<AnimPhase>("complete") // Start visible, animate if JS works
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Check for extension and mobile, with dynamic detection for Install Interceptor
  useEffect(() => {
    const checkExtension = () => {
      const marker = document.getElementById('tipz-extension-installed')
      setExtensionInstalled(!!marker)
    }

    // Initial check
    checkExtension()
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent))

    // Watch for extension marker being injected dynamically (Install Interceptor)
    const observer = new MutationObserver(() => {
      checkExtension()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  // Fetch creator data
  useEffect(() => {
    async function fetchCreator() {
      try {
        const response = await fetch(`/api/creator?platform=x&handle=${encodeURIComponent(handle)}`)
        const data = await response.json()

        if (data.found && data.creator) {
          setCreator(data.creator)
          setState("found")
        } else {
          setState("not_found")
        }
      } catch {
        setState("error")
      }
    }

    if (handle) {
      fetchCreator()
    }
  }, [handle])

  // Animation sequence runs on mount for found state (content always visible as fallback)
  const [hasAnimated, setHasAnimated] = useState(false)
  useEffect(() => {
    if (state !== "found" || hasAnimated || prefersReducedMotion) return

    // Reset to hidden, then animate
    setAnimPhase("hidden")
    setHasAnimated(true)

    // Phase 1: Atmosphere (50ms)
    const t1 = setTimeout(() => setAnimPhase("atmosphere"), 50)
    // Phase 2: Card reveal (300ms)
    const t2 = setTimeout(() => setAnimPhase("card"), 300)
    // Phase 3: Content (700ms)
    const t3 = setTimeout(() => setAnimPhase("content"), 700)
    // Phase 4: Complete (1200ms)
    const t4 = setTimeout(() => setAnimPhase("complete"), 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [state, hasAnimated, prefersReducedMotion])

  // Button configuration
  const getButtonConfig = () => {
    if (isMobile) {
      return {
        text: "Open on Desktop to Tip",
        action: null,
        disabled: true,
      }
    }
    if (extensionInstalled) {
      return {
        text: "SEND A TIP",
        action: () => {
          window.dispatchEvent(new CustomEvent('tipz-open-modal', {
            detail: { handle: creator?.handle || handle }
          }))
        },
        disabled: false,
      }
    }
    return {
      text: "GET STARTED — IT'S FREE",
      action: () => {
        // Save pending tip for Install Interceptor
        sessionStorage.setItem('tipz_pending_tip', JSON.stringify({
          handle: creator?.handle || handle,
          platform: 'x',
          timestamp: Date.now()
        }));
        window.open('https://chromewebstore.google.com/detail/tipz/pkfmgpniebpokpjojomhaaajgcdkbfpc', '_blank');
      },
      disabled: false,
    }
  }

  // Avatar color based on handle
  const getAvatarColor = (handle: string) => {
    const hue = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, 55%, 35%)`
  }

  // Copy address
  const copyAddress = async () => {
    if (!creator?.shielded_address) return
    try {
      await navigator.clipboard.writeText(creator.shielded_address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  // Truncate address
  const truncateAddress = (addr: string) => {
    if (addr.length <= 20) return addr
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: animPhase === "hidden"
      ? colors.bg
      : `radial-gradient(ellipse at center top, rgba(245, 166, 35, 0.12) 0%, ${colors.bg} 60%)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'JetBrains Mono', 'Monaco', 'Consolas', monospace",
    transition: prefersReducedMotion ? "none" : "background 0.6s ease",
    position: "relative",
    overflow: "hidden",
  }

  // Loading state
  if (state === "loading") {
    return (
      <div style={containerStyle}>
        <style>{animationStyles}</style>
        <div style={{
          maxWidth: "420px",
          width: "100%",
          background: colors.surface,
          backdropFilter: "blur(16px)",
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: "24px",
          padding: "48px 40px",
          textAlign: "center",
        }}>
          <Skeleton width={100} height={28} style={{ margin: "0 auto 40px" }} />
          <Skeleton width={140} height={140} borderRadius="50%" style={{ margin: "0 auto 28px" }} />
          <Skeleton width={160} height={32} style={{ margin: "0 auto 16px" }} />
          <Skeleton width={160} height={28} borderRadius="16px" style={{ margin: "0 auto 40px" }} />
          <Skeleton width="100%" height={56} borderRadius="14px" style={{ marginBottom: "24px" }} />
          <Skeleton width={220} height={14} style={{ margin: "0 auto" }} />
        </div>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </div>
    )
  }

  // Not found state
  if (state === "not_found") {
    return (
      <div style={containerStyle}>
        <style>{animationStyles}</style>
        <div style={{
          maxWidth: "420px",
          width: "100%",
          background: colors.surface,
          backdropFilter: "blur(16px)",
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: "24px",
          padding: "48px 40px",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "26px",
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: "3px",
            marginBottom: "40px",
          }}>
            TIPZ
          </div>

          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: `3px dashed ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}>
            <span style={{ fontSize: "44px", color: colors.muted }}>?</span>
          </div>

          <h1 style={{
            color: colors.text,
            fontSize: "26px",
            fontWeight: 600,
            margin: "0 0 16px",
          }}>
            @{handle}
          </h1>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "rgba(255,68,68,0.12)",
            borderRadius: "24px",
            marginBottom: "32px",
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: colors.error,
            }} />
            <span style={{
              color: colors.error,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
            }}>
              NOT REGISTERED
            </span>
          </div>

          <div style={{
            backgroundColor: "rgba(255,255,255,0.02)",
            border: `1px solid ${colors.surfaceBorder}`,
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "28px",
          }}>
            <p style={{
              color: colors.muted,
              fontSize: "14px",
              margin: 0,
              lineHeight: 1.6,
            }}>
              This creator hasn't joined yet. Tag them on X and let them know they can receive private, fee-free tips!
            </p>
          </div>

          <a
            href={`https://x.com/intent/tweet?text=Hey%20@${handle}%20you%20should%20join%20@tipz_cash%20to%20receive%20private%2C%20fee-free%20tips!`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "18px",
              backgroundColor: colors.primary,
              color: colors.bg,
              textDecoration: "none",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            INVITE THEM ON X
          </a>

          <a
            href="/creators"
            style={{
              display: "block",
              width: "100%",
              padding: "18px",
              backgroundColor: "transparent",
              color: colors.muted,
              textDecoration: "none",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "1px",
              border: `1px solid ${colors.border}`,
            }}
          >
            BROWSE OTHER CREATORS
          </a>

          <p style={{
            color: colors.muted,
            fontSize: "11px",
            marginTop: "28px",
            marginBottom: 0,
            letterSpacing: "2px",
          }}>
            0% FEES • PRIVATE • UNLINKABLE
          </p>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </div>
    )
  }

  // Error state
  if (state === "error") {
    return (
      <div style={containerStyle}>
        <style>{animationStyles}</style>
        <div style={{
          maxWidth: "420px",
          width: "100%",
          background: colors.surface,
          backdropFilter: "blur(16px)",
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: "24px",
          padding: "48px 40px",
          textAlign: "center",
        }}>
          <div style={{ color: colors.error, fontSize: "56px", marginBottom: "20px" }}>⚠</div>
          <p style={{ color: colors.text, marginBottom: "28px", fontSize: "15px" }}>
            Something went wrong.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "16px 32px",
              backgroundColor: "transparent",
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            Try Again
          </button>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </div>
    )
  }

  const buttonConfig = getButtonConfig()
  const showParticles = animPhase !== "hidden" && !prefersReducedMotion && !isMobile

  // Found - Premium creator profile
  return (
    <div ref={containerRef} style={containerStyle}>
      <style>{animationStyles}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        top: "-20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "400px",
        background: `radial-gradient(ellipse, ${colors.primaryGlow} 0%, transparent 70%)`,
        opacity: animPhase === "hidden" ? 0 : 0.8,
        transition: prefersReducedMotion ? "none" : "opacity 0.8s ease",
        pointerEvents: "none",
        animation: animPhase === "complete" && !prefersReducedMotion ? "glowPulse 4s ease-in-out infinite" : "none",
      }} />

      {/* Floating particles */}
      <FloatingParticles visible={showParticles} />

      {/* Main card */}
      <div style={{
        position: "relative",
        maxWidth: "420px",
        width: "100%",
        background: colors.surface,
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        overflow: "hidden",
        opacity: animPhase === "hidden" ? 0 : 1,
        transform: animPhase === "hidden" ? "translateY(50px)" : "translateY(0)",
        filter: animPhase === "hidden" ? "blur(8px)" : "blur(0)",
        transition: prefersReducedMotion ? "none" : "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: "0.25s",
        boxShadow: `0 25px 80px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)`,
      }}>
        {/* Animated border sweep */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "24px",
          padding: "1px",
          background: animPhase === "complete"
            ? `linear-gradient(90deg, transparent 0%, ${colors.primary} 50%, transparent 100%)`
            : `linear-gradient(135deg, ${colors.surfaceBorder} 0%, rgba(245,166,35,0.2) 50%, ${colors.surfaceBorder} 100%)`,
          backgroundSize: "200% 100%",
          animation: animPhase === "complete" && !prefersReducedMotion ? "borderSweep 4s linear infinite" : "none",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
        }} />

        {/* Noise texture header */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
          backgroundSize: "100px 100px",
          opacity: 0.1,
          pointerEvents: "none",
        }} />

        {/* Card content */}
        <div style={{
          position: "relative",
          padding: "48px 40px",
          textAlign: "center",
        }}>
          {/* TIPZ Logo */}
          <div style={{
            fontSize: "26px",
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: "3px",
            marginBottom: "40px",
            opacity: animPhase === "hidden" ? 0 : 1,
            transform: animPhase === "hidden" ? "translateY(10px)" : "translateY(0)",
            transition: prefersReducedMotion ? "none" : "all 0.4s ease",
            transitionDelay: "0.5s",
          }}>
            TIPZ
          </div>

          {/* Avatar section */}
          <div style={{
            position: "relative",
            width: "160px",
            height: "160px",
            margin: "0 auto 28px",
          }}>
            {/* Pulsing gold ring */}
            <div style={{
              position: "absolute",
              inset: "-8px",
              borderRadius: "50%",
              border: `3px solid ${colors.primary}`,
              opacity: ["content", "complete"].includes(animPhase) ? 0.6 : 0,
              animation: animPhase === "complete" && !prefersReducedMotion ? "ringPulse 2.5s ease-in-out infinite" : "none",
              transition: prefersReducedMotion ? "none" : "opacity 0.4s ease",
              boxShadow: `0 0 30px ${colors.primaryGlow}`,
            }} />

            {/* Avatar */}
            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: getAvatarColor(creator?.handle || handle),
              border: `4px solid ${colors.primary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 50px ${colors.primaryGlowStrong}, 0 10px 40px rgba(0, 0, 0, 0.4)`,
              opacity: ["content", "complete"].includes(animPhase) ? 1 : 0,
              transform: animPhase === "complete" ? "scale(1)" : animPhase === "content" ? "scale(1.08)" : "scale(0.7)",
              transition: prefersReducedMotion ? "none" : "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}>
              <span style={{
                fontSize: "64px",
                color: colors.textBright,
                fontWeight: 700,
                textShadow: "0 4px 8px rgba(0,0,0,0.4)",
                textTransform: "uppercase",
              }}>
                {creator?.handle?.[0] || "?"}
              </span>
            </div>
          </div>

          {/* Handle */}
          <h1 style={{
            color: colors.textBright,
            fontSize: "30px",
            fontWeight: 600,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            opacity: ["content", "complete"].includes(animPhase) ? 1 : 0,
            transform: ["content", "complete"].includes(animPhase) ? "translateY(0)" : "translateY(10px)",
            transition: prefersReducedMotion ? "none" : "all 0.4s ease",
            transitionDelay: "0.1s",
          }}>
            @{creator?.handle}
          </h1>

          {/* Verified badge with stamp animation */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            borderRadius: "24px",
            marginBottom: "36px",
            opacity: animPhase === "complete" ? 1 : 0,
            transform: animPhase === "complete"
              ? "scale(1) rotate(0)"
              : "scale(1.4) rotate(-8deg)",
            transition: prefersReducedMotion ? "none" : "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transitionDelay: "0.2s",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.verified} strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              color: colors.verified,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
            }}>
              VERIFIED SHIELDED
            </span>
          </div>

          {/* Value proposition - why tip here */}
          <div style={{
            padding: "20px",
            background: `linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(245, 166, 35, 0.05) 100%)`,
            border: `1px solid rgba(34, 197, 94, 0.2)`,
            borderRadius: "12px",
            marginBottom: "24px",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "1px",
              marginBottom: "12px",
            }}>
              <span style={{ color: colors.success }}>✓ 0% FEES</span>
              <span style={{ color: colors.primary }}>✓ PRIVATE</span>
              <span style={{ color: colors.text }}>✓ INSTANT</span>
            </div>
            <p style={{
              color: colors.muted,
              fontSize: "12px",
              margin: 0,
              textAlign: "center",
              lineHeight: 1.5,
            }}>
              100% of your tip goes directly to @{creator?.handle}. No middlemen, no tracking.
            </p>
          </div>

          {/* Hero CTA Button */}
          <button
            onClick={buttonConfig.action || undefined}
            disabled={buttonConfig.disabled}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              padding: "20px 24px",
              background: buttonConfig.disabled
                ? colors.border
                : isButtonHovered
                  ? `linear-gradient(135deg, ${colors.primaryHover} 0%, ${colors.primary} 100%)`
                  : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
              color: buttonConfig.disabled ? colors.muted : colors.bg,
              border: "none",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: buttonConfig.disabled ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "1px",
              opacity: animPhase === "complete" ? 1 : 0,
              transform: animPhase === "complete"
                ? isButtonHovered ? "scale(1.02)" : "scale(1)"
                : "translateY(10px)",
              transition: prefersReducedMotion ? "none" : "all 0.3s ease",
              transitionDelay: animPhase === "complete" ? "0s" : "0.3s",
              boxShadow: buttonConfig.disabled
                ? "none"
                : isButtonHovered
                  ? `0 0 40px ${colors.primaryGlowStrong}, 0 10px 30px rgba(0, 0, 0, 0.3)`
                  : `0 0 25px ${colors.primaryGlow}, 0 8px 20px rgba(0, 0, 0, 0.2)`,
              animation: animPhase === "complete" && !buttonConfig.disabled && !prefersReducedMotion
                ? "ctaGlow 3s ease-in-out infinite"
                : "none",
            }}
          >
            {buttonConfig.text}
            {!buttonConfig.disabled && (
              <span style={{
                transition: "transform 0.2s ease",
                transform: isButtonHovered ? "translateX(4px)" : "translateX(0)",
              }}>
                →
              </span>
            )}
          </button>

          {/* How to tip - instruction */}
          <p style={{
            color: colors.muted,
            fontSize: "11px",
            marginTop: "16px",
            marginBottom: "24px",
            textAlign: "center",
          }}>
            {extensionInstalled
              ? "Click above to send a private tip. Takes 10 seconds."
              : "Add the free Chrome extension, then tip with one click."}
          </p>

          {/* Address section */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "12px 16px",
            background: "rgba(0, 0, 0, 0.3)",
            border: `1px solid ${colors.surfaceBorder}`,
            borderRadius: "10px",
            opacity: animPhase === "complete" ? 1 : 0,
            transition: prefersReducedMotion ? "none" : "opacity 0.4s ease",
            transitionDelay: "0.5s",
          }}>
            <code style={{
              fontSize: "11px",
              color: colors.muted,
              fontFamily: "inherit",
            }}>
              {truncateAddress(creator?.shielded_address || "")}
            </code>
            <button
              onClick={copyAddress}
              style={{
                background: "transparent",
                border: "none",
                padding: "4px",
                cursor: "pointer",
                color: copied ? colors.success : colors.muted,
                transition: "color 0.2s ease",
                display: "flex",
                alignItems: "center",
              }}
              title="Copy address"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Back to home - always visible */}
      <a
        href="/"
        style={{
          color: colors.muted,
          fontSize: "13px",
          textDecoration: "none",
          marginTop: "28px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to TIPZ
      </a>

      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </div>
  )
}
