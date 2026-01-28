"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ZEC Ticker component
function ZecTicker() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch("/api/zec-price");
        const data = await res.json();
        if (data.price) setPrice(data.price);
      } catch {
        // Ignore errors
      }
    }
    fetchPrice();
  }, []);

  return (
    <span style={{ color: "#6B7280", fontSize: "11px", letterSpacing: "1px" }}>
      ZEC {price ? `$${price.toFixed(2)}` : "—"}
    </span>
  );
}

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

// Collapsible section component
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="card-hover"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        marginBottom: "16px",
        borderRadius: "4px",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "transparent",
          border: "none",
          color: colors.textBright,
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          transition: "background-color 0.2s",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            color: colors.primary,
            fontSize: "16px",
            textShadow: isOpen ? `0 0 10px ${colors.primaryGlow}` : "none",
          }}>
            {isOpen ? "[-]" : "[+]"}
          </span>
          {title}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "0 24px 24px",
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 50%, ${colors.bgGradientStart} 100%)`,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
      }}
    >
      {/* Atmospheric overlays */}
      <div className="noise-overlay" />
      <div className="scanlines" />

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, borderBottom: `1px solid ${colors.border}`, backgroundColor: `${colors.bg}f0`, backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div className="header-inner" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <span style={{ color: colors.primary, fontWeight: 700, fontSize: "18px", textShadow: `0 0 20px ${colors.primaryGlow}` }}>[TIPZ]</span>
            <span style={{ color: colors.muted, fontSize: "10px", letterSpacing: "1px", padding: "2px 6px", border: `1px solid ${colors.border}`, borderRadius: "2px" }}>BETA</span>
          </Link>
          <nav className="desktop-nav" style={{ gap: "32px", alignItems: "center" }}>
            <Link href="/creators" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>CREATORS</Link>
            <Link href="/manifesto" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>MANIFESTO</Link>
            <span style={{ color: colors.primary, fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textShadow: `0 0 10px ${colors.primaryGlow}` }}>DOCS</span>
            <Link href="/register" className="cta-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `linear-gradient(135deg, ${colors.primary} 0%, #e89b1c 40%, ${colors.primaryHover} 100%)`, color: colors.bg, textDecoration: "none", fontSize: "11px", letterSpacing: "0.5px", fontWeight: 600, padding: "8px 14px", borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", boxShadow: `0 0 20px ${colors.primaryGlow}, 0 4px 12px rgba(0,0,0,0.3)` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Claim Your Tipz ID
            </Link>
          </nav>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "280px", maxWidth: "80vw", background: colors.bg, borderLeft: `1px solid ${colors.border}`, zIndex: 201, padding: "20px", display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
            <button onClick={() => setMobileMenuOpen(false)} style={{ alignSelf: "flex-end", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", marginBottom: "16px" }} aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div style={{ padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}><ZecTicker /></div>
            <Link href="/creators" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "16px 0", color: colors.text, textDecoration: "none", fontSize: "14px", letterSpacing: "1px", borderBottom: `1px solid ${colors.border}` }}>CREATORS</Link>
            <Link href="/manifesto" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "16px 0", color: colors.text, textDecoration: "none", fontSize: "14px", letterSpacing: "1px", borderBottom: `1px solid ${colors.border}` }}>MANIFESTO</Link>
            <span style={{ display: "block", padding: "16px 0", color: colors.primary, fontSize: "14px", letterSpacing: "1px", fontWeight: 600, borderBottom: `1px solid ${colors.border}` }}>DOCS</span>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px", padding: "16px", background: `linear-gradient(135deg, ${colors.primary} 0%, #e89b1c 40%, ${colors.primaryHover} 100%)`, color: colors.bg, textDecoration: "none", fontSize: "14px", letterSpacing: "0.5px", fontWeight: 600, borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", boxShadow: `0 0 20px ${colors.primaryGlow}, 0 4px 12px rgba(0,0,0,0.3)` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Claim Your Tipz ID
            </Link>
          </div>
        </>
      )}

      {/* Main content */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 24px 64px" }}>
        <div style={{ marginBottom: "64px" }}>
          <div
            style={{
              fontSize: "11px",
              color: colors.muted,
              letterSpacing: "2px",
              marginBottom: "16px",
            }}
          >
            // TECHNICAL_DOCUMENTATION
          </div>
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 700,
              marginBottom: "16px",
              lineHeight: 1.2,
              textShadow: `0 0 40px ${colors.primaryGlow}`,
            }}
          >
            How TIPZ Works
          </h1>
          <p
            style={{
              color: colors.muted,
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            Send a tip in 30 seconds. Any token. Private delivery.
          </p>
        </div>

        {/* 01 // THE TIP - Tipper's 60-Second Journey */}
        <section style={{ marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "2px",
              marginBottom: "24px",
              textShadow: `0 0 10px ${colors.primaryGlow}`,
            }}
          >
            01 // THE_TIP
          </h2>

          <p style={{ color: colors.text, fontSize: "14px", marginBottom: "24px", lineHeight: 1.7 }}>
            Tipping takes less than a minute. No account needed. Just a wallet.
          </p>

          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              padding: "32px",
              marginBottom: "24px",
              borderRadius: "4px",
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

            <div style={{ display: "grid", gap: "32px" }}>
              {[
                {
                  num: "01",
                  title: "Connect wallet",
                  timing: "~5 seconds",
                  desc: "MetaMask, Rabby, Coinbase Wallet, or Phantom. One click. No signup.",
                  color: colors.primary
                },
                {
                  num: "02",
                  title: "Pick your amount",
                  timing: "~10 seconds",
                  desc: "$1, $5, $10, $25—or custom. See exactly how much ZEC the creator will receive.",
                  color: colors.primary
                },
                {
                  num: "03",
                  title: "Confirm in wallet",
                  timing: "~15 seconds",
                  desc: "One signature. Success screen appears immediately after confirmation.",
                  color: colors.primary
                },
                {
                  num: "04",
                  title: "Done. Close the page.",
                  timing: "5-10 min delivery",
                  desc: "That's it. We handle the cross-chain swap in the background. You'll only hear from us if something fails.",
                  color: colors.success
                },
              ].map((step) => (
                <div key={step.num}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                    <span style={{
                      color: step.color,
                      fontSize: "24px",
                      fontWeight: 700,
                      textShadow: `0 0 15px ${step.color === colors.success ? colors.successGlow : colors.primaryGlow}`,
                    }}>
                      {step.num}
                    </span>
                    <span style={{ fontWeight: 600, color: step.color === colors.success ? colors.success : colors.textBright }}>
                      {step.title}
                    </span>
                    <span style={{
                      color: colors.muted,
                      fontSize: "11px",
                      padding: "2px 8px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "2px",
                      marginLeft: "auto",
                    }}>
                      {step.timing}
                    </span>
                  </div>
                  <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginLeft: "56px" }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual flow - enhanced */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "32px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              fontSize: "12px",
              flexWrap: "wrap",
              borderRadius: "4px",
              position: "relative",
            }}
          >
            <span style={{ color: colors.text }}>ETH/USDC/SOL</span>
            <span style={{ color: colors.primary, fontSize: "18px" }}>→</span>
            <span
              style={{
                padding: "8px 16px",
                border: `2px solid ${colors.primary}`,
                color: colors.primary,
                fontWeight: 600,
                boxShadow: `0 0 15px ${colors.primaryGlow}`,
              }}
            >
              NEAR INTENTS
            </span>
            <span style={{ color: colors.primary, fontSize: "18px" }}>→</span>
            <span
              style={{
                padding: "8px 16px",
                border: `2px solid ${colors.success}`,
                color: colors.success,
                fontWeight: 600,
                boxShadow: `0 0 15px ${colors.successGlow}`,
              }}
            >
              SHIELDED ZEC
            </span>
            <span style={{ color: colors.success, fontSize: "18px" }}>→</span>
            <span style={{ color: colors.success, fontWeight: 600 }}>Creator Wallet ✓</span>
          </div>
        </section>

        {/* 02 // THE DELIVERY - Creator Experience (NEW) */}
        <section style={{ marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "2px",
              marginBottom: "24px",
              textShadow: `0 0 10px ${colors.primaryGlow}`,
            }}
          >
            02 // THE_DELIVERY
          </h2>

          <p style={{ color: colors.text, fontSize: "14px", marginBottom: "24px", lineHeight: 1.7 }}>
            What creators receive. No intermediaries. No platform fees.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            <div
              className="card-hover"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.success}`,
                padding: "28px",
                borderRadius: "4px",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 0 30px ${colors.successGlow}`,
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "3px",
                height: "100%",
                backgroundColor: colors.success,
              }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: colors.success }}>
                Shielded ZEC
              </h3>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                Tips arrive as encrypted Zcash. Only you hold the viewing key.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "12px", color: colors.muted }}>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.success }}>→</span> 5-10 minute delivery</li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.success }}>→</span> No sender info on-chain</li>
                <li><span style={{ color: colors.success }}>→</span> Self-custody—you hold the keys</li>
              </ul>
            </div>

            <div
              className="card-hover"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.primary}`,
                padding: "28px",
                borderRadius: "4px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "3px",
                height: "100%",
                backgroundColor: colors.primary,
                opacity: 0.5,
              }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: colors.textBright }}>
                Zero Platform Fees
              </h3>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                100% of the tip value reaches you. We don&apos;t take a cut.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "12px", color: colors.muted }}>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.primary }}>→</span> Network gas: ~$0.01-0.50 (tipper pays)</li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.primary }}>→</span> Compare: Patreon 5-12%</li>
                <li><span style={{ color: colors.primary }}>→</span> Compare: Ko-fi 5%</li>
              </ul>
            </div>
          </div>
        </section>

        {/* POWERED BY */}
        <section style={{ marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "2px",
              marginBottom: "24px",
              textShadow: `0 0 10px ${colors.primaryGlow}`,
            }}
          >
            03 // POWERED_BY
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div
              className="card-hover"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                padding: "28px",
                borderRadius: "4px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "3px",
                height: "100%",
                backgroundColor: colors.primary,
                opacity: 0.5,
              }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: colors.textBright }}>
                NEAR Intents
              </h3>
              <p style={{ color: colors.textBright, fontSize: "14px", lineHeight: 1.6, marginBottom: "12px" }}>
                Any Token → ZEC, Automatically
              </p>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                You send ETH or SOL. Market makers compete for the best rate. No bridges. No DEX routing. Just results.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "12px", color: colors.muted }}>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.primary }}>→</span> Cross-chain in one step</li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.primary }}>→</span> Best execution via solver competition</li>
                <li><span style={{ color: colors.primary }}>→</span> No custody risk</li>
              </ul>
            </div>

            <div
              className="card-hover"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.success}`,
                padding: "28px",
                borderRadius: "4px",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 0 30px ${colors.successGlow}`,
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "3px",
                height: "100%",
                backgroundColor: colors.success,
              }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px", color: colors.success }}>
                Zcash Shielded
              </h3>
              <p style={{ color: colors.textBright, fontSize: "14px", lineHeight: 1.6, marginBottom: "12px" }}>
                The Tip Becomes Invisible
              </p>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                Once converted to ZEC, the transaction is encrypted on-chain. Not hidden—encrypted. Only the creator holds the viewing key.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "12px", color: colors.muted }}>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.success }}>→</span> Zero-knowledge proofs</li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.success }}>→</span> Sender, receiver, amount: all encrypted</li>
                <li><span style={{ color: colors.success }}>→</span> Self-sovereign privacy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* TECHNICAL SPECS */}
        <section style={{ marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "2px",
              marginBottom: "24px",
              textShadow: `0 0 10px ${colors.primaryGlow}`,
            }}
          >
            04 // TECHNICAL_SPECS
          </h2>

          <CollapsibleSection title="Supported Tokens" defaultOpen>
            <div style={{ paddingTop: "16px" }}>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                Send tips with these tokens. NEAR Intents handles the conversion.
              </p>

              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: colors.textBright, marginBottom: "8px", fontWeight: 600 }}>EVM Chains</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", fontSize: "12px" }}>
                  {[
                    { token: "ETH", chains: "Ethereum, Arbitrum, Optimism" },
                    { token: "USDC", chains: "Ethereum, Polygon, Arbitrum, Optimism" },
                    { token: "USDT", chains: "Ethereum, Arbitrum, Optimism, Polygon" },
                  ].map((item) => (
                    <div
                      key={item.token}
                      style={{
                        padding: "12px",
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "4px",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.token}</div>
                      <div style={{ fontSize: "10px", color: colors.muted }}>{item.chains}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: colors.textBright, marginBottom: "8px", fontWeight: 600 }}>Solana</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", fontSize: "12px" }}>
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>SOL</div>
                    <div style={{ fontSize: "10px", color: colors.muted }}>Solana Mainnet</div>
                  </div>
                </div>
              </div>

              <p style={{ color: colors.muted, fontSize: "11px" }}>
                * Token availability depends on solver liquidity at time of swap
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Shielded Address Formats">
            <div style={{ paddingTop: "16px" }}>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                TIPZ supports Zcash shielded addresses for private delivery:
              </p>

              <div
                style={{
                  backgroundColor: colors.bg,
                  padding: "20px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  marginBottom: "12px",
                  border: `1px solid ${colors.success}`,
                  borderRadius: "4px",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ color: colors.success, fontWeight: 600 }}>Unified (u1...):</span>
                  <span style={{ color: colors.muted, marginLeft: "8px", fontSize: "11px" }}>Recommended</span>
                </div>
                <code style={{ color: colors.text, wordBreak: "break-all", display: "block", marginBottom: "16px" }}>
                  u1rl42v9...
                </code>

                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: colors.primary }}>Sapling (zs...):</span>
                </div>
                <code style={{ color: colors.text, wordBreak: "break-all" }}>
                  zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9sly
                </code>
                <div style={{ marginTop: "8px", color: colors.muted }}>78 characters, Base58 encoded</div>
              </div>

              <p style={{ color: colors.muted, fontSize: "12px", marginBottom: "8px", fontWeight: 600 }}>
                How to get a shielded address:
              </p>
              <ol style={{ color: colors.muted, fontSize: "12px", margin: 0, paddingLeft: "20px", lineHeight: 1.8 }}>
                <li>Download <a href="https://electriccoin.co/zashi/" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>Zashi Wallet</a> (iOS/Android)</li>
                <li>Create a new wallet and backup your seed phrase</li>
                <li>Tap &quot;Receive&quot; to copy your Unified Address</li>
              </ol>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Transaction Lifecycle">
            <div style={{ paddingTop: "16px" }}>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                Every tip moves through these states. You can close the page after signing—we track it for you.
              </p>
              <div style={{ fontSize: "12px" }}>
                {[
                  { state: "PENDING_DEPOSIT", userText: "Waiting for your deposit", desc: "Your wallet signature sent. Funds transferring to solver.", color: colors.muted },
                  { state: "PROCESSING", userText: "Routing funds", desc: "Market makers competing to fulfill. Cross-chain swap in progress.", color: colors.primary },
                  { state: "SUCCESS", userText: "Delivered", desc: "Shielded ZEC in creator's wallet. Transaction complete.", color: colors.success },
                  { state: "REFUNDED", userText: "Returned to you", desc: "Swap couldn't complete. Original funds sent back to your wallet.", color: colors.error },
                ].map((item, i) => (
                  <div
                    key={item.state}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      padding: "16px 0",
                      borderBottom: i < 3 ? `1px solid ${colors.border}` : "none",
                    }}
                  >
                    <span style={{
                      color: item.color,
                      fontWeight: 600,
                      minWidth: "140px",
                      fontSize: "11px",
                      textShadow: item.color === colors.success ? `0 0 10px ${colors.successGlow}` : "none",
                    }}>
                      {item.state}
                    </span>
                    <div>
                      <div style={{ color: colors.textBright, marginBottom: "4px" }}>{item.userText}</div>
                      <div style={{ color: colors.muted, fontSize: "11px" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "20px", padding: "16px", backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: "4px" }}>
                <div style={{ color: colors.textBright, fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>
                  What if I close the page?
                </div>
                <p style={{ color: colors.muted, fontSize: "12px", margin: 0, lineHeight: 1.6 }}>
                  No problem. The swap continues in the background. If it fails, we store a notification and you&apos;ll see it next time you visit TIPZ. Your funds are never lost.
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Privacy Guarantees">
            <div style={{ paddingTop: "16px" }}>
              <div style={{ display: "grid", gap: "16px", fontSize: "13px" }}>
                {[
                  { title: "Sender privacy", desc: "Tipper's identity is not linked to the final shielded transaction" },
                  { title: "Receiver privacy", desc: "Creator's shielded address is not visible on transparent chains" },
                  { title: "Amount privacy", desc: "Final tip amount is encrypted. Only the creator can see it." },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ color: colors.success, fontSize: "16px" }}>✓</span>
                    <div>
                      <span style={{ fontWeight: 600, color: colors.textBright }}>{item.title}</span>
                      <p style={{ color: colors.muted, margin: "4px 0 0" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: "16px",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ color: colors.error }}>!</span>
                  <div>
                    <span style={{ fontWeight: 600, color: colors.text }}>Initial deposit is visible</span>
                    <p style={{ color: colors.muted, margin: "4px 0 0" }}>
                      Your wallet&apos;s deposit transaction is visible on the source chain (Ethereum, Solana, etc). Privacy starts after the funds enter the Zcash shielded pool.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </section>

        {/* 05 // QUESTIONS - FAQ (NEW) */}
        <section style={{ marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "2px",
              marginBottom: "24px",
              textShadow: `0 0 10px ${colors.primaryGlow}`,
            }}
          >
            05 // QUESTIONS
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            {[
              {
                q: "How long does it take?",
                a: "Wallet confirmation is instant. Shielded delivery to the creator: 5-10 minutes. You can close the page after signing.",
              },
              {
                q: "What if the swap fails?",
                a: "Rare, but handled. Your original funds auto-return to your wallet. You'll see a notification next time you visit TIPZ.",
              },
              {
                q: "Are there fees?",
                a: "Zero platform fees. Network gas (~$0.01-0.50) is included in the quote and paid by the tipper. Creators receive 100%.",
              },
              {
                q: "Is it really private?",
                a: "From the creator's perspective: fully encrypted. Your initial deposit IS visible on the source chain (Ethereum, Solana, etc). Once converted to shielded ZEC, it's encrypted.",
              },
              {
                q: "Which wallets work?",
                a: "MetaMask, Rabby, Coinbase Wallet (EVM chains), and Phantom (Solana). Any wallet that supports WalletConnect should work.",
              },
              {
                q: "Do I need a Zcash wallet to tip?",
                a: "No. Tippers use their existing ETH/SOL wallet. Only creators need a Zcash wallet to receive tips.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  padding: "20px 24px",
                  borderRadius: "4px",
                }}
              >
                <div style={{ color: colors.textBright, fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>
                  {faq.q}
                </div>
                <p style={{ color: colors.muted, fontSize: "13px", margin: 0, lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA - Dual Path */}
        <section
          style={{
            padding: "48px 32px",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "4px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            {/* For Creators */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "12px" }}>
                FOR CREATORS
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: colors.textBright }}>
                Start receiving private tips
              </h2>
              <p style={{ color: colors.muted, marginBottom: "24px", fontSize: "13px" }}>
                Register in under 2 minutes. Just your X handle and Zcash address.
              </p>
              <Link
                href="/register"
                className="cta-primary"
                style={{
                  display: "inline-block",
                  backgroundColor: colors.primary,
                  color: colors.bg,
                  padding: "14px 32px",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: `0 0 30px ${colors.primaryGlow}`,
                }}
              >
                Register Now →
              </Link>
            </div>

            {/* For Tippers */}
            <div style={{ textAlign: "center", borderLeft: `1px solid ${colors.border}`, paddingLeft: "32px" }}>
              <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "12px" }}>
                FOR SUPPORTERS
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: colors.textBright }}>
                Support a creator now
              </h2>
              <p style={{ color: colors.muted, marginBottom: "24px", fontSize: "13px" }}>
                No signup. Connect wallet, pick amount, done.
              </p>
              <Link
                href="/creators"
                style={{
                  display: "inline-block",
                  backgroundColor: "transparent",
                  color: colors.textBright,
                  border: `1px solid ${colors.border}`,
                  padding: "14px 32px",
                  fontWeight: 600,
                  fontSize: "13px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.2s",
                }}
              >
                Browse Creators
              </Link>
            </div>
          </div>
        </section>
      </main>

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
          <span style={{ color: colors.primary, fontWeight: 700, fontSize: "16px", textShadow: `0 0 15px ${colors.primaryGlow}` }}>[TIPZ]</span>
          <span style={{ color: colors.muted, fontSize: "10px", letterSpacing: "1px" }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <Link href="/manifesto" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>MANIFESTO</Link>
          <span style={{ color: colors.primary, fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>DOCS</span>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>GITHUB</a>
          <a href="https://x.com/tipz_cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>X</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.muted }}>
          <span style={{
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

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-2px);
          border-color: #3d4450 !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .header-inner { padding: 20px 48px; }
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none; flex-direction: column; gap: 5px; padding: 10px; background: transparent; border: none; cursor: pointer; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; }

        @media (max-width: 768px) {
          .header-inner { padding: 16px; }
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
