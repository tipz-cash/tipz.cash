'use client'

import { motion, useReducedMotion } from 'framer-motion'

const colors = {
  bg: '#08090a',
  bgEnd: '#0d1117',
  primary: '#F5A623',
  primaryGlow: 'rgba(245, 166, 35, 0.15)',
  border: '#2a2f38',
  muted: '#6B7280',
  textBright: '#F9FAFB',
}

export default function ComingSoon() {
  const prefersReducedMotion = useReducedMotion()

  const fade = (delay: number) =>
    prefersReducedMotion
      ? { initial: {}, animate: {} }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            delay,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          },
        }

  return (
    <>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes idle-float {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.45; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.65; }
        }

        .noise-overlay-cs {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 1000;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .cs-wordmark { font-size: 72px; }
        .cs-tagline { font-size: 22px; }
        .cs-secondary { font-size: 15px; }

        @media (max-width: 639px) {
          .cs-wordmark { font-size: 48px !important; }
          .cs-tagline { font-size: 18px !important; }
          .cs-secondary { font-size: 13px !important; }
        }
        @media (max-width: 389px) {
          .cs-wordmark { font-size: 36px !important; }
          .cs-tagline { font-size: 16px !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bgEnd} 50%, ${colors.bg} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="noise-overlay-cs" />

        {/* Background atmosphere */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(600px, 100vw)',
              height: 'min(600px, 100vw)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.primaryGlow} 0%, transparent 70%)`,
              filter: 'blur(80px)',
              animation: prefersReducedMotion ? 'none' : 'idle-float 6s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(${colors.border}15 1px, transparent 1px), linear-gradient(90deg, ${colors.border}15 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
              opacity: 0.12,
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            maxWidth: '560px',
            textAlign: 'center',
          }}
        >
          {/* tipz.cash wordmark */}
          <motion.div {...fade(0.2)}>
            <span
              className="cs-wordmark"
              style={{
                fontFamily: "var(--font-family-mono, 'JetBrains Mono', monospace)",
                fontWeight: 700,
                letterSpacing: '-0.02em',
                display: 'inline-flex',
                alignItems: 'baseline',
              }}
            >
              <span style={{ color: '#FFFFFF' }}>tip</span>
              <span
                style={{
                  color: colors.primary,
                  textShadow: `0 0 24px rgba(245, 166, 35, 0.4)`,
                }}
              >
                z
              </span>
              <span style={{ color: '#FFFFFF' }}>.cash</span>
            </span>
          </motion.div>

          {/* Primary tagline */}
          <motion.p
            {...fade(0.45)}
            className="cs-tagline"
            style={{
              fontFamily: "var(--font-family, 'Inter', system-ui, sans-serif)",
              fontWeight: 600,
              color: colors.textBright,
              letterSpacing: '-0.01em',
              lineHeight: 1.4,
              marginTop: '28px',
            }}
          >
            Private tips for creators.
          </motion.p>

          {/* Divider */}
          <motion.div
            {...fade(0.6)}
            style={{
              width: '48px',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)`,
              marginTop: '28px',
            }}
          />

          {/* Secondary copy */}
          <motion.p
            {...fade(0.75)}
            className="cs-secondary"
            style={{
              fontFamily: "var(--font-family, 'Inter', system-ui, sans-serif)",
              fontWeight: 400,
              color: colors.muted,
              letterSpacing: '0.01em',
              lineHeight: 1.7,
              marginTop: '28px',
            }}
          >
            Your money. Your audience.{' '}
            <span
              style={{
                color: colors.primary,
                textShadow: `0 0 16px rgba(245, 166, 35, 0.25)`,
              }}
            >
              Your privacy.
            </span>
          </motion.p>

          {/* Coming Soon */}
          <motion.div
            {...fade(0.9)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '36px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: colors.primary,
                animation: prefersReducedMotion ? 'none' : 'pulseGlow 2s ease-in-out infinite',
                boxShadow: `0 0 8px rgba(245, 166, 35, 0.3)`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-family-mono, 'JetBrains Mono', monospace)",
                fontSize: '11px',
                fontWeight: 500,
                color: colors.muted,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Coming Soon
            </span>
          </motion.div>
        </div>
      </div>
    </>
  )
}
