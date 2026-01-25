"use client";

import { useEffect, useState, useRef } from "react";

// Color palette - Clean terminal style
const colors = {
  bg: "#0A0A0A",
  surface: "#1A1A1A",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  success: "#00FF00",
  error: "#FF4444",
  muted: "#888888",
  border: "#333333",
  text: "#E0E0E0",
  textBright: "#FFFFFF",
};

// Typing effect hook
function useTypingEffect(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayText("");
    setIsComplete(false);

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
  }, [text, speed]);

  return { displayText, isComplete };
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

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${hovered ? colors.primary : colors.border}`,
        padding: "32px",
        transition: "border-color 0.2s ease",
      }}
    >
      <div style={{
        fontSize: "32px",
        marginBottom: "16px",
        color: colors.primary,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: "16px",
        fontWeight: 600,
        marginBottom: "12px",
        color: colors.textBright,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: "14px",
        color: colors.muted,
        lineHeight: 1.6,
        margin: 0,
      }}>
        {description}
      </p>
    </div>
  );
}

export default function V6MinimalHomePage() {
  const heroText = "Private tips. Any asset. Zero trace.";
  const { displayText, isComplete } = useTypingEffect(heroText, 40);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: colors.bg,
      color: colors.text,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Minimal Header */}
      <header style={{
        padding: "24px 48px",
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
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: colors.primary, fontWeight: 700, fontSize: "16px" }}>[TIPZ]</span>
          <span style={{ color: colors.muted, fontSize: "12px" }}>v0.1.0-beta</span>
        </div>
        <nav style={{ display: "flex", gap: "32px" }}>
          {[
            { label: "MANIFESTO", href: "/manifesto" },
            { label: "GITHUB", href: "https://github.com/tipz-app" },
            { label: "EXTENSION", href: "https://chromewebstore.google.com/detail/tipz" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                color: colors.muted,
                textDecoration: "none",
                fontSize: "12px",
                letterSpacing: "0.5px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero Section - Full viewport */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "120px 48px 80px",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Subtle glow effect */}
        <div style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, rgba(245, 166, 35, 0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Terminal prompt with typing effect */}
        <div style={{
          marginBottom: "32px",
          position: "relative",
        }}>
          <span style={{ color: colors.success, fontSize: "28px" }}>{">"}</span>{" "}
          <span style={{ fontSize: "36px", fontWeight: 600 }}>
            {mounted ? displayText : heroText}
            <Cursor visible={mounted && !isComplete} />
          </span>
        </div>

        {/* Subheadline */}
        <p style={{
          color: colors.muted,
          fontSize: "18px",
          maxWidth: "500px",
          marginBottom: "48px",
          lineHeight: 1.6,
        }}>
          Tip creators in any crypto. They receive shielded ZEC.
          <br />No account needed. Zero platform fees.
        </p>

        {/* Dual CTA */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/register"
            style={{
              backgroundColor: colors.primary,
              color: colors.bg,
              padding: "16px 32px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "background-color 0.2s",
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
              padding: "16px 32px",
              border: `1px solid ${colors.border}`,
              fontWeight: 500,
              fontSize: "15px",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.2s",
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

        {/* Scroll indicator */}
        <div style={{
          position: "absolute",
          bottom: "40px",
          color: colors.muted,
          fontSize: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}>
          <span>SCROLL</span>
          <span style={{ animation: "bounce 2s infinite" }}>↓</span>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section style={{
        padding: "80px 48px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}>
          <FeatureCard
            icon="[]"
            title="ZK_SHIELDED"
            description="zk-SNARKs encrypt sender, receiver, and amount. Chain analysis sees nothing. Your tips stay private."
          />
          <FeatureCard
            icon="{}"
            title="ANY_TOKEN_IN"
            description="Tip in ETH, USDC, SOL—whatever you have. We auto-swap to ZEC via NEAR Intents. They receive shielded."
          />
          <FeatureCard
            icon="()"
            title="SELF_CUSTODY"
            description="Tips go direct to shielded addresses. No custodial risk. No platform holding your funds. Your keys only."
          />
        </div>
      </section>

      {/* Simple Value Props */}
      <section style={{
        padding: "80px 48px",
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "32px",
          textAlign: "center",
        }}>
          {[
            { value: "0%", label: "Platform Fee" },
            { value: "2min", label: "Setup Time" },
            { value: "No", label: "KYC Required" },
            { value: "No", label: "Tipper Account" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{
                fontSize: "32px",
                fontWeight: 700,
                color: colors.primary,
                marginBottom: "8px",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: "12px",
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Minimal */}
      <section style={{
        padding: "80px 48px",
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        <h2 style={{
          color: colors.primary,
          fontSize: "12px",
          letterSpacing: "1px",
          marginBottom: "48px",
          textAlign: "center",
        }}>
          // HOW_IT_WORKS
        </h2>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "32px",
        }}>
          {[
            {
              step: "01",
              title: "Register",
              desc: "Paste your Zcash shielded address. Verify with a tweet. Done.",
            },
            {
              step: "02",
              title: "Share",
              desc: "Tip button appears on your X posts for fans using the extension.",
            },
            {
              step: "03",
              title: "Receive",
              desc: "Tips arrive privately. No public transaction trail. No trace.",
            },
          ].map((item, i) => (
            <div key={item.step} style={{
              flex: 1,
              textAlign: "center",
              position: "relative",
            }}>
              {i < 2 && (
                <div style={{
                  position: "absolute",
                  top: "24px",
                  right: "-16px",
                  width: "32px",
                  borderTop: `1px dashed ${colors.border}`,
                }} />
              )}
              <div style={{
                color: colors.primary,
                fontSize: "48px",
                fontWeight: 700,
                marginBottom: "16px",
              }}>
                {item.step}
              </div>
              <h3 style={{
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "8px",
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: "14px",
                color: colors.muted,
                lineHeight: 1.6,
                margin: 0,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: "120px 48px",
        textAlign: "center",
        backgroundColor: colors.surface,
      }}>
        <h2 style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "16px",
        }}>
          Start receiving tips in 2 minutes.
        </h2>
        <p style={{
          color: colors.muted,
          fontSize: "16px",
          marginBottom: "32px",
          maxWidth: "500px",
          margin: "0 auto 32px",
        }}>
          Zero platform fees. Self-custody by default. No KYC required.
        </p>
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
            display: "inline-block",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
        >
          Create Your Tip Page
        </a>
      </section>

      {/* Minimal Footer */}
      <footer style={{
        padding: "32px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid ${colors.border}`,
        fontSize: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: colors.primary, fontWeight: 700 }}>[TIPZ]</span>
          <span style={{ color: colors.muted }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <a href="/manifesto" style={{ color: colors.muted, textDecoration: "none" }}>Manifesto</a>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none" }}>GitHub</a>
          <a href="https://x.com/tipz_cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none" }}>X</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.muted }}>
          <span style={{ color: colors.success }}>●</span>
          <span>Powered by Zcash + NEAR Intents</span>
        </div>
      </footer>

      {/* Bounce animation keyframes */}
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
