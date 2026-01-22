"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Color palette (matching main site)
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

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "14px",
    lineHeight: 1.6,
  };

  const maxWidthStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 24px",
  };

  const borderStyle = `1px solid ${colors.border}`;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header
        style={{
          borderBottom: borderStyle,
          position: "sticky",
          top: 0,
          backgroundColor: colors.bg,
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
            <span style={{ color: colors.primary, fontWeight: 700, fontSize: "16px" }}>
              [TIPZ]
            </span>
            <span style={{ color: colors.muted, fontSize: "11px" }}>
              v0.1.0-beta
            </span>
          </Link>
          <nav style={{ display: "flex", gap: "32px" }}>
            <span
              style={{
                color: colors.primary,
                fontSize: "12px",
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
                fontSize: "12px",
              }}
            >
              DOCS
            </Link>
            <Link
              href="/register"
              style={{
                color: colors.muted,
                textDecoration: "none",
                fontSize: "12px",
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
          padding: "80px 0 40px",
          borderBottom: borderStyle,
        }}
      >
        <div style={maxWidthStyle}>
          <div style={{ marginBottom: "24px" }}>
            <span style={{ color: colors.success }}>$</span>{" "}
            <span style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "2px" }}>
              {mounted ? displayText : heroText}
              <Cursor visible={mounted && !isComplete} />
            </span>
          </div>
          <p style={{ color: colors.muted, fontSize: "14px", maxWidth: "600px" }}>
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
          padding: "48px 0",
          borderBottom: borderStyle,
          backgroundColor: colors.surface,
        }}
      >
        <div style={maxWidthStyle}>
          <blockquote
            style={{
              margin: 0,
              padding: "0 0 0 24px",
              borderLeft: `3px solid ${colors.primary}`,
              fontStyle: "italic",
              color: colors.text,
            }}
          >
            <p style={{ margin: "0 0 16px", fontSize: "16px", lineHeight: 1.8 }}>
              &quot;Privacy is necessary for an open society in the electronic age.
              Privacy is not secrecy. A private matter is something one doesn&apos;t
              want the whole world to know, but a secret matter is something one
              doesn&apos;t want anybody to know. Privacy is the power to selectively
              reveal oneself to the world.&quot;
            </p>
            <footer style={{ color: colors.muted, fontSize: "13px" }}>
              — Eric Hughes, <cite>A Cypherpunk&apos;s Manifesto</cite> (1993)
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Manifesto Sections */}
      {manifestoSections.map((section, index) => (
        <section
          key={section.title}
          style={{
            padding: "64px 0",
            borderBottom: borderStyle,
            backgroundColor: index % 2 === 0 ? colors.bg : colors.surface,
          }}
        >
          <div style={maxWidthStyle}>
            <h2
              style={{
                color: colors.primary,
                fontSize: "14px",
                letterSpacing: "1px",
                marginBottom: "32px",
                fontWeight: 600,
              }}
            >
              // {section.title}
            </h2>
            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "15px",
                lineHeight: 1.9,
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
          padding: "64px 0",
          borderBottom: borderStyle,
          textAlign: "center",
        }}
      >
        <div style={maxWidthStyle}>
          <pre
            style={{
              color: colors.primary,
              fontSize: "10px",
              lineHeight: 1.2,
              marginBottom: "32px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
{`                     ██
████████╗██╗██████╗███████╗
╚══██╔══╝██║██╔══██╗╚═███╔╝
   ██║   ██║██████╔╝ ███╔╝
   ██║   ██║██╔═══╝ ███╔╝
   ██║   ██║██║    ███╔╝
   ╚═╝   ╚═╝╚═╝   ███████╗
                     ██`}
          </pre>
          <p style={{ color: colors.muted, fontSize: "12px", marginBottom: "8px" }}>
            Signed with conviction,
          </p>
          <p style={{ color: colors.text, fontSize: "14px", fontWeight: 600 }}>
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
          padding: "64px 0",
          backgroundColor: colors.surface,
        }}
      >
        <div style={{ ...maxWidthStyle, textAlign: "center" }}>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            Ready to build the private internet?
          </h3>
          <p
            style={{
              color: colors.muted,
              marginBottom: "32px",
              maxWidth: "500px",
              margin: "0 auto 32px",
            }}
          >
            Register as a creator or install the extension to start tipping privately.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/#register"
              style={{
                backgroundColor: colors.primary,
                color: colors.bg,
                border: "none",
                padding: "14px 28px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Register as Creator
            </Link>
            <a
              href="https://chromewebstore.google.com/detail/tipz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "transparent",
                color: colors.text,
                border: borderStyle,
                padding: "14px 28px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.2s",
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
          padding: "32px 0",
          borderTop: borderStyle,
          backgroundColor: colors.bg,
        }}
      >
        <div
          style={{
            ...maxWidthStyle,
            maxWidth: "1200px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
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
            <span style={{ color: colors.primary, fontWeight: 700 }}>
              [TIPZ]
            </span>
            <span style={{ color: colors.muted, fontSize: "12px" }}>
              v0.1.0-beta
            </span>
          </Link>

          <div
            style={{
              display: "flex",
              gap: "24px",
              color: colors.muted,
              fontSize: "12px",
            }}
          >
            <a
              href="https://github.com/anthropics/tipz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.muted, textDecoration: "none" }}
            >
              GITHUB
            </a>
            <a
              href="https://x.com/tipz_cash"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.muted, textDecoration: "none" }}
            >
              X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
