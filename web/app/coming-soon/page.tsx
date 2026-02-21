'use client'

import { useEffect, useState } from 'react'

export default function ComingSoon() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes shimmerSweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes borderSweep {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#08090a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle radial glow behind content */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(245, 166, 35, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Main content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
          position: 'relative',
          zIndex: 1,
          maxWidth: '480px',
          textAlign: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="TIPZ"
            style={{
              height: '40px',
              width: 'auto',
            }}
          />

          {/* Tagline */}
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '16px',
            color: '#D1D5DB',
            letterSpacing: '-0.01em',
            lineHeight: 1.5,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}>
            Private tips. Any asset. Zero trace.
          </p>

          {/* Launching Soon badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '999px',
            border: '1px solid rgba(245, 166, 35, 0.2)',
            background: 'rgba(245, 166, 35, 0.05)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
          }}>
            {/* Pulsing dot */}
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#F5A623',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              fontSize: '12px',
              fontWeight: 500,
              color: '#F5A623',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Launching Soon
            </span>
          </div>

          {/* CTA button */}
          <a
            href="https://x.com/tipz_cash"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#F5A623',
              color: '#08090a',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              transition: 'background 0.2s ease, transform 0.2s ease',
              opacity: mounted ? 1 : 0,
              transitionProperty: 'opacity, background, transform',
              transitionDuration: '0.8s, 0.2s, 0.2s',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1), ease, ease',
              transitionDelay: '0.6s, 0s, 0s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFB84D'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5A623'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* X icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow @tipz_cash
          </a>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: mounted ? 0.4 : 0,
          transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s',
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            fontSize: '11px',
            color: '#6B7280',
            letterSpacing: '0.04em',
          }}>
            Powered by Zcash
          </span>
        </div>
      </div>
    </>
  )
}
