"use client"

import { useEffect, useState } from "react"

export default function ComingSoon() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .noise-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
        .grid-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#08090a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="noise-overlay" />
        <div className="grid-overlay" />

        {/* Radial amber glow behind content */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(245, 166, 35, 0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition:
              "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Large wordmark: tipz.cash */}
          <h1
            style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
              fontSize: "clamp(48px, 8vw, 88px)",
              fontWeight: 400,
              color: "#ffffff",
              letterSpacing: "0.05em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            tip<span style={{ color: "#F5A623" }}>z</span>.cash
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "clamp(16px, 2.5vw, 22px)",
              color: "#e5e7eb",
              letterSpacing: "-0.01em",
              lineHeight: 1.5,
              margin: "20px 0 0 0",
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
            }}
          >
            Private tips for creators.
          </p>

          {/* Divider */}
          <div
            style={{
              width: "48px",
              height: "1px",
              background: "rgba(255, 255, 255, 0.15)",
              margin: "28px 0",
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
            }}
          />

          {/* Value prop line */}
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "clamp(13px, 1.8vw, 16px)",
              color: "#9CA3AF",
              letterSpacing: "0.01em",
              lineHeight: 1.6,
              margin: 0,
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
            }}
          >
            Your money. Your audience. <span style={{ color: "#F5A623" }}>Your privacy.</span>
          </p>

          {/* Coming Soon badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(245, 166, 35, 0.2)",
              background: "rgba(245, 166, 35, 0.05)",
              marginTop: "32px",
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#F5A623",
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                fontSize: "12px",
                fontWeight: 500,
                color: "#F5A623",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Coming Soon
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: mounted ? 0.4 : 0,
            transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              fontSize: "11px",
              color: "#6B7280",
              letterSpacing: "0.04em",
            }}
          >
            Powered by Zcash
          </span>
        </div>
      </div>
    </>
  )
}
