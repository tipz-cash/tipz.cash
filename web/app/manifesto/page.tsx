"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { colors } from "@/lib/colors"
import SiteHeader from "@/components/SiteHeader"
import { TipzLogo } from "@/components/TipzLogo"
// Typing effect hook
function useTypingEffect(text: string, speed: number = 30) {
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let index = 0
    setDisplayText("")
    setIsComplete(false)

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return { displayText, isComplete }
}

// Blinking cursor component
function Cursor({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setShow((s) => !s), 530)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null
  return <span style={{ color: colors.primary, opacity: show ? 1 : 0 }}>_</span>
}

const manifestoSections = [
  {
    title: "I. CREATION IS HUMAN",
    content: `Machines will generate infinite content. AI will write, paint, compose, code. The feed will flood with synthetic everything.

But machines do not create. They produce.

Creation requires struggle. Requires taste. Requires a soul risking itself in public.

The creator who bleeds into their work, who fails and returns, who says something only they could say: that creator cannot be replaced.

In an age of infinite production, authentic creation becomes the scarcest resource.

Creators are not content factories. They are the last signal in a sea of noise.`,
  },
  {
    title: "II. TECHNOFEUDALISM",
    content: `We were promised a digital commons. We got digital fiefdoms.

The platforms own the land. You work it. They collect the rent. You hope for scraps. They change the rules. You comply or vanish.

This is not capitalism. Capitalists compete. This is feudalism. Lords extract.

You built an audience with your ideas, your art, your voice. That audience wants to support you. But the platforms stand between.

They take their cut. They freeze your funds. They demand your identity. They report your income. They make your success their product.

You do not own your audience. The platform does.
You do not own your revenue. The processor does.
You do not own your money. The bank does.

Creators deserve self-custody of their earnings, privacy of their financial life, zero intermediaries extracting value, and freedom from platform capture.

Your audience found you. You earned their support. No middleman should stand between.`,
  },
  {
    title: "III. PRIVACY IS NOT A CRIME",
    content: `When you close your curtains, you are not hiding crimes.
When you seal an envelope, you are not evading detection.
When you whisper to a friend, you are not conspiring.

Privacy is the default state of human interaction.

The burden of proof lies on those who would surveil, not on those who would be free.

Every transaction indexed is a behavior tracked.
Every wallet exposed is a life mapped.
Every tip amount published is leverage granted.

This was dangerous before. With AI, it becomes totalizing.

Models trained on your financial life. Profiles built from your every exchange. Predictions about your loyalty, your politics, your worth.

We reject the premise that transparency is virtue.
We reject the demand to justify our shadows.
We reject surveillance as the price of participation.`,
  },
  {
    title: "IV. CYPHERPUNKS WRITE CODE",
    content: `We do not petition for privacy. We build it.
We do not ask permission. We deploy.
We do not trust promises. We verify.

For thirty years, cypherpunks have known: privacy in an open society requires cryptography.

Zcash gave us shielded transactions. Solana gave us speed and reach.

We give you TIPZ.

The tools exist. The math is sound. Now we ship.`,
  },
  {
    title: "V. EXIT",
    content: `You cannot reform the feudal lord. You cannot petition for freedom. You can only leave.

Exit is the only leverage the serf has ever had.

TIPZ is an exit.

Not a better platform. A way out of platforms.
Not a fairer landlord. No landlord at all.
Not improved surveillance. No surveillance.

Private money. Self-custody. Zero extraction.

The door is open.`,
  },
  {
    title: "VI. SUPPORT WITHOUT SURVEILLANCE",
    content: `To tip someone today is to create a permanent record.

Your wallet. Their wallet. The amount. The timestamp. Indexed forever. Analyzed by algorithms. Sold to data brokers.

What should be a private act of appreciation becomes a node in someone else's graph.

We build for a different world:

Where generosity needs no permission.
Where support needs no justification.
Where the act of giving belongs to giver and receiver alone.`,
  },
  {
    title: "VII. PROTOCOL, NOT PLATFORM",
    content: `We do not custody your funds.
We cannot freeze your account.
We do not know your balance.
We cannot see your transactions.

This is not a limitation. This is the design.

TIPZ is a protocol, not a platform. We route. We swap. We disappear.

Your privacy does not depend on us.
The protocol works without us.
We built it that way on purpose.

Trust math. Not us.`,
  },
  {
    title: "VIII. JOIN US",
    content: `If you believe privacy is a right, not a privilege—
If you believe creators deserve sovereignty—
If you believe support should be private—
If you believe the serfs can leave—

You are already one of us.

Register your address. Send a shielded tip.

The surveillance economy ends when we stop participating.

Exit the ledger.`,
  },
]

export default function ManifestoPage() {
  const heroText = "THE CREATORS MANIFESTO"
  const { displayText, isComplete } = useTypingEffect(heroText, 50)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 50%, ${colors.bgGradientStart} 100%)`,
        color: colors.text,
        fontFamily: "var(--font-family-mono)",
        fontSize: "14px",
        lineHeight: 1.6,
        position: "relative",
      }}
    >
      {/* Atmospheric overlays */}
      <div className="noise-overlay" />
      <div className="scanlines" />

      <SiteHeader activePage="manifesto" />

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
              className="manifesto-hero-title"
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}
        />

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
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "18px",
                lineHeight: 1.9,
                color: colors.textBright,
              }}
            >
              &quot;Privacy is necessary for an open society in the electronic age. Privacy is not
              secrecy. A private matter is something one doesn&apos;t want the whole world to know,
              but a secret matter is something one doesn&apos;t want anybody to know. Privacy is the
              power to selectively reveal oneself to the world.&quot;
            </p>
            <footer style={{ color: colors.muted, fontSize: "13px" }}>
              — Eric Hughes,{" "}
              <cite style={{ color: colors.primary }}>A Cypherpunk&apos;s Manifesto</cite> (1993)
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Manifesto Sections */}
      {manifestoSections.map((section, index) => (
        <section
          key={section.title}
          className="manifesto-section"
          style={{
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: index % 2 === 0 ? "transparent" : colors.surface,
            position: "relative",
          }}
        >
          {/* Section accent for even sections */}
          {index % 2 === 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "3px",
                height: "100%",
                background: `linear-gradient(180deg, transparent, ${colors.primary}40, transparent)`,
              }}
            />
          )}

          <div className="manifesto-content">
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
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            background: `radial-gradient(circle, ${colors.primaryGlow} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", position: "relative" }}
        >
          <div style={{ marginBottom: "40px" }}>
            <TipzLogo size={48} />
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}
        />

        <div
          style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}
        >
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
                fontFamily: "var(--font-family-mono)",
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
                fontFamily: "var(--font-family-mono)",
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
        className="manifesto-footer"
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
          <TipzLogo size={16} />
          <span style={{ color: colors.muted, fontSize: "10px", letterSpacing: "1px" }}>
            v0.1.0-beta
          </span>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <span
            style={{
              color: colors.primary,
              fontSize: "11px",
              letterSpacing: "1px",
              fontWeight: 600,
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
            href="/my"
            style={{
              color: colors.muted,
              textDecoration: "none",
              fontSize: "11px",
              letterSpacing: "1px",
            }}
          >
            MY TIPZ
          </Link>
          <a
            href="https://github.com/tipz-app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.muted,
              textDecoration: "none",
              fontSize: "11px",
              letterSpacing: "1px",
            }}
          >
            GITHUB
          </a>
          <a
            href="https://x.com/tipz_cash"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.muted,
              textDecoration: "none",
              fontSize: "11px",
              letterSpacing: "1px",
            }}
          >
            X
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.muted }}>
          <span
            className="status-pulse"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: colors.success,
              boxShadow: `0 0 10px ${colors.success}`,
            }}
          />
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
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
          will-change: transform;
        }

        .cta-primary:hover {
          transform: translateY(-3px) scale(1.02);
          filter: drop-shadow(0 0 25px rgba(245, 166, 35, 0.5));
        }

        .cta-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .cta-primary:hover::before {
          left: 100%;
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


        /* Manifesto sections responsive */
        .manifesto-section {
          padding: 80px 0;
        }
        .manifesto-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .manifesto-footer {
          flex-wrap: wrap;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .manifesto-section {
            padding: 48px 0;
          }
          .manifesto-content {
            padding: 0 16px;
          }
          .manifesto-footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 24px 16px;
          }
          .manifesto-footer > div {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .manifesto-section {
            padding: 40px 0;
          }
          .manifesto-hero-title {
            font-size: 28px !important;
          }
        }

        @media (max-width: 375px) {
          .manifesto-section {
            padding: 32px 0;
          }
          .manifesto-content {
            padding: 0 12px;
          }
          .manifesto-hero-title {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
