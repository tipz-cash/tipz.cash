"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TipzLogo } from "@/components/TipzLogo";

// Color palette - refined for depth and atmosphere (matching home page)
const colors = {
  bg: "#08090a",
  bgGradientStart: "#08090a",
  bgGradientEnd: "#0d1117",
  surface: "#12141a",
  surfaceHover: "#1a1d24",
  surfaceLight: "#1e2128",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  primaryGlow: "rgba(245, 166, 35, 0.15)",
  primaryGlowStrong: "rgba(245, 166, 35, 0.3)",
  success: "#22C55E",
  successGlow: "rgba(34, 197, 94, 0.2)",
  error: "#EF4444",
  errorGlow: "rgba(239, 68, 68, 0.15)",
  muted: "#6B7280",
  border: "#2a2f38",
  borderHover: "#3d4450",
  text: "#D1D5DB",
  textBright: "#F9FAFB",
};

// Typing effect hook
function useTypingEffect(text: string, speed: number = 30) {
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

// Blinking cursor component
function Cursor({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShow((s) => !s), 530);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;
  return (
    <span style={{ color: colors.primary, opacity: show ? 1 : 0 }}>_</span>
  );
}

const manifestoSections = [
  {
    title: "I. PRIVACY IS NOT A CRIME",
    content: `When you close your curtains, you are not hiding crimes.
When you seal an envelope, you are not evading detection.
When you whisper to a friend, you are not conspiring.

Privacy is the default state of human interaction.
The burden of proof lies on those who would surveil—not on those who would be free.

We reject the premise that transparency is virtue.
We reject the demand that we justify our shadows.
We reject surveillance as the price of participation.`
  },
  {
    title: "II. FINANCIAL SURVEILLANCE IS CONTROL",
    content: `Every transaction indexed is a behavior tracked.
Every wallet exposed is a life mapped.
Every tip amount published is leverage granted.

They call it "transparency." We call it what it is: control.

When your employer can see who you support,
when your government can profile your generosity,
when your competitors can count your income—
you are not free. You are observed.

And the observed self-censors.`
  },
  {
    title: "III. CYPHERPUNKS WRITE CODE",
    content: `We do not petition for privacy. We build it.
We do not ask permission. We deploy.
We do not trust promises. We verify.

For thirty years, cypherpunks have known:
Privacy in an open society requires cryptography.

Zcash gave us shielded transactions.
NEAR gave us trustless swaps.
We give you TIPZ.

The tools exist. The math is sound.
Now we ship.`
  },
  {
    title: "IV. CREATORS DESERVE SOVEREIGNTY",
    content: `You built an audience with your ideas, your art, your voice.
That audience wants to support you.

But the platforms stand between.
They take their cut. They freeze your funds.
They demand your identity. They report your income.
They make your success their product.

We believe creators deserve:
→ Self-custody of their earnings
→ Privacy of their financial life
→ Zero intermediaries skimming value
→ Freedom from platform capture

Your audience found you. You earned their support.
No middleman should stand between.`
  },
  {
    title: "V. SUPPORT WITHOUT SURVEILLANCE",
    content: `To tip someone today is to create a permanent record.
Your wallet. Their wallet. The amount. The timestamp.
Indexed forever. Analyzed by algorithms. Sold to data brokers.

What should be a private act of appreciation
becomes a node in someone else's graph.

We build for a different world:
Where generosity leaves no trace.
Where support needs no justification.
Where the act of giving is between giver and receiver—
and no one else.`
  },
  {
    title: "VI. THE PROTOCOL IS THE PRODUCT",
    content: `We do not custody your funds.
We cannot freeze your account.
We do not know your balance.
We cannot see your transactions.

This is not a limitation. This is the design.

TIPZ is a protocol, not a platform.
We route. We swap. We disappear.

If we are compromised, you are not.
If we are shut down, the code remains.
If we are subpoenaed, we have nothing to give.

Trust math. Not us.`
  },
  {
    title: "VII. THE FUTURE WE BUILD",
    content: `We envision an internet where:

Private transactions are the default, not the exception.
Creators keep 100% of what they earn.
Supporters give without surveillance.
No platform owns the relationship between creator and audience.
Financial privacy is a right—not a premium feature.

This is not utopia. This is engineering.
The cryptography exists. The networks are live.
We are simply connecting the pieces.

One tip at a time.`
  },
  {
    title: "VIII. JOIN US",
    content: `If you believe privacy is a right, not a privilege—
If you believe creators deserve sovereignty—
If you believe support should be private—

Then you are already one of us.

Register your address.
Install the extension.
Send a shielded tip.

The surveillance economy ends when we stop participating in it.

Build the world you want to live in.
We are.`
  }
];

export default function ManifestoPage() {
  const heroText = "THE TIPZ MANIFESTO";
  const { displayText, isComplete } = useTypingEffect(heroText, 50);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 50%, ${colors.bgGradientStart} 100%)`,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "14px",
        lineHeight: 1.6,
        position: "relative",
      }}
    >
      {/* Atmospheric overlays */}
      <div className="noise-overlay" />
      <div className="scanlines" />

      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: `${colors.bg}f0`,
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px 48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textDecoration: "none",
            }}
          >
            <TipzLogo size={18} color={colors.primary} glowColor={colors.primaryGlow} />
            <span style={{
              color: colors.muted,
              fontSize: "10px",
              letterSpacing: "1px",
              padding: "2px 6px",
              border: `1px solid ${colors.border}`,
              borderRadius: "2px",
            }}>BETA</span>
          </Link>
          <nav style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <span
              style={{
                color: colors.primary,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                textShadow: `0 0 10px ${colors.primaryGlow}`,
              }}
            >
              MANIFESTO
            </span>
            <Link
              href="/docs"
              style={{
                color: colors.muted,
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "1px",
              }}
            >
              DOCS
            </Link>
            <Link
              href="/register"
              className="cta-primary"
              style={{
                color: colors.bg,
                backgroundColor: colors.primary,
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "1px",
                fontWeight: 600,
                padding: "8px 16px",
              }}
            >
              REGISTER
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: "140px 0 60px",
          borderBottom: `1px solid ${colors.border}`,
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "16px",
            }}
          >
            // DECLARATION_OF_PRINCIPLES
          </div>
          <div style={{ marginBottom: "24px" }}>
            <span style={{ color: colors.success, fontSize: "20px" }}>$</span>{" "}
            <span
              style={{
                fontSize: "42px",
                fontWeight: 700,
                letterSpacing: "2px",
                textShadow: `0 0 40px ${colors.primaryGlow}`,
              }}
            >
              {mounted ? displayText : heroText}
              <Cursor visible={mounted && !isComplete} />
            </span>
          </div>
          <p style={{ color: colors.muted, fontSize: "16px", maxWidth: "600px", lineHeight: 1.6 }}>
            On privacy, sovereignty, and the future of creator support.
          </p>
          <p style={{ color: colors.muted, fontSize: "12px", marginTop: "16px" }}>
            Published: 2025 | License: CC0 (Public Domain)
          </p>
        </div>
      </section>

      {/* Epigraph */}
      <section
        style={{
          padding: "64px 0",
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          position: "relative",
        }}
      >
        {/* Accent line */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          <blockquote
            style={{
              margin: 0,
              padding: "0 0 0 24px",
              borderLeft: `3px solid ${colors.primary}`,
              fontStyle: "italic",
              color: colors.text,
            }}
          >
            <p style={{ margin: "0 0 16px", fontSize: "18px", lineHeight: 1.9, color: colors.textBright }}>
              &quot;Privacy is necessary for an open society in the electronic age.
              Privacy is not secrecy. A private matter is something one doesn&apos;t
              want the whole world to know, but a secret matter is something one
              doesn&apos;t want anybody to know. Privacy is the power to selectively
              reveal oneself to the world.&quot;
            </p>
            <footer style={{ color: colors.muted, fontSize: "13px" }}>
              — Eric Hughes, <cite style={{ color: colors.primary }}>A Cypherpunk&apos;s Manifesto</cite> (1993)
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Manifesto Sections */}
      {manifestoSections.map((section, index) => (
        <section
          key={section.title}
          style={{
            padding: "80px 0",
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: index % 2 === 0 ? "transparent" : colors.surface,
            position: "relative",
          }}
        >
          {/* Section accent for even sections */}
          {index % 2 === 0 && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "3px",
              height: "100%",
              background: `linear-gradient(180deg, transparent, ${colors.primary}40, transparent)`,
            }} />
          )}

          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
            <h2
              style={{
                color: colors.primary,
                fontSize: "14px",
                letterSpacing: "2px",
                marginBottom: "40px",
                fontWeight: 600,
                textShadow: `0 0 10px ${colors.primaryGlow}`,
              }}
            >
              // {section.title}
            </h2>
            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "16px",
                lineHeight: 2,
                color: colors.text,
              }}
            >
              {section.content}
            </div>
          </div>
        </section>
      ))}

      {/* Signature */}
      <section
        style={{
          padding: "80px 0",
          borderBottom: `1px solid ${colors.border}`,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow background */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "400px",
          background: `radial-gradient(circle, ${colors.primaryGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div style={{ marginBottom: "40px" }}>
            <TipzLogo size={48} color={colors.primary} glowColor={colors.primaryGlow} />
          </div>
          <p style={{ color: colors.muted, fontSize: "13px", marginBottom: "8px" }}>
            Signed with conviction,
          </p>
          <p style={{ color: colors.textBright, fontSize: "16px", fontWeight: 600 }}>
            The TIPZ Team
          </p>
          <p style={{ color: colors.muted, fontSize: "12px", marginTop: "24px" }}>
            tipz.cash | MIT Licensed | Open Source
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 0",
          backgroundColor: colors.surface,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent line */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h3
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginBottom: "16px",
              color: colors.textBright,
            }}
          >
            Ready to build the private internet?
          </h3>
          <p
            style={{
              color: colors.muted,
              marginBottom: "40px",
              maxWidth: "500px",
              margin: "0 auto 40px",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Register as a creator or install the extension to start tipping privately.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/#register"
              className="cta-primary"
              style={{
                backgroundColor: colors.primary,
                color: colors.bg,
                border: "none",
                padding: "16px 32px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: `0 0 30px ${colors.primaryGlow}`,
              }}
            >
              Register as Creator →
            </Link>
            <a
              href="https://chromewebstore.google.com/detail/tipz"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary"
              style={{
                backgroundColor: "transparent",
                color: colors.textBright,
                border: `1px solid ${colors.border}`,
                padding: "16px 32px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Install Extension
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${colors.border}`,
          fontSize: "12px",
          backgroundColor: colors.surface,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <TipzLogo size={16} color={colors.primary} glowColor={colors.primaryGlow} />
          <span style={{ color: colors.muted, fontSize: "10px", letterSpacing: "1px" }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <span style={{ color: colors.primary, fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>MANIFESTO</span>
          <Link href="/docs" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>DOCS</Link>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>GITHUB</a>
          <a href="https://x.com/tipz_cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>X</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.muted }}>
          <span className="status-pulse" style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: colors.success,
            boxShadow: `0 0 10px ${colors.success}`,
          }} />
          <span style={{ fontSize: "11px", letterSpacing: "1px" }}>PRIVATE BY DEFAULT</span>
        </div>
      </footer>

      {/* Styles */}
      <style>{`
        .noise-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .scanlines {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 999;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          );
          opacity: 0.15;
        }

        .cta-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(245, 166, 35, 0.4), 0 10px 40px rgba(245, 166, 35, 0.2);
        }

        .cta-secondary {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-secondary:hover {
          transform: translateY(-2px);
          border-color: #3d4450 !important;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }

        .status-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.6); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.9), 0 0 30px rgba(34, 197, 94, 0.4); }
        }
      `}</style>
    </div>
  );
}
