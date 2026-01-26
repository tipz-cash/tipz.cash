"use client";

import { useState } from "react";
import Link from "next/link";

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
            <span
              style={{
                color: colors.primary,
                fontWeight: 700,
                fontSize: "18px",
                textShadow: `0 0 20px ${colors.primaryGlow}`,
              }}
            >
              [TIPZ]
            </span>
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
            <Link
              href="/creators"
              style={{
                color: colors.muted,
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "1px",
              }}
            >
              CREATORS
            </Link>
            <Link
              href="/manifesto"
              style={{
                color: colors.muted,
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "1px",
              }}
            >
              MANIFESTO
            </Link>
            <span
              style={{
                color: colors.primary,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                textShadow: `0 0 10px ${colors.primaryGlow}`,
              }}
            >
              DOCS
            </span>
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
                borderRadius: "8px",
              }}
            >
              START EARNING
            </Link>
          </nav>
        </div>
      </header>

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
            Private tipping infrastructure powered by cross-chain swaps and
            shielded transactions.
          </p>
        </div>

        {/* HOW IT WORKS */}
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
            01 // HOW_IT_WORKS
          </h2>

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
                { num: "01", title: "Tipper sends any token", desc: "ETH, USDC, SOL, or any supported token from their existing wallet.", color: colors.primary },
                { num: "02", title: "NEAR Intents routes the swap", desc: "Cross-chain intent-based routing finds the optimal path to convert funds.", color: colors.primary },
                { num: "03", title: "Funds converted to ZEC", desc: "Automatic conversion to Zcash for shielded delivery.", color: colors.primary },
                { num: "04", title: "Private delivery to creator", desc: "Creator receives ZEC via shielded transaction. No public trace of sender, receiver, or amount.", color: colors.success },
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
            02 // POWERED_BY
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
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                Cross-chain intent-based swaps via Defuse Protocol. Users express
                what they want, solvers compete to fulfill it at the best rate.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "12px", color: colors.muted }}>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.primary }}>→</span> Chain-agnostic swaps</li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.primary }}>→</span> Competitive solver market</li>
                <li><span style={{ color: colors.primary }}>→</span> No bridge custody risk</li>
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
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                zk-SNARK powered privacy. Sender, receiver, and amount are all
                encrypted on-chain. Only you hold the viewing key.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "12px", color: colors.muted }}>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.success }}>→</span> Encrypted transactions</li>
                <li style={{ marginBottom: "8px" }}><span style={{ color: colors.success }}>→</span> Zero-knowledge proofs</li>
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
            03 // TECHNICAL_SPECS
          </h2>

          <CollapsibleSection title="Supported Input Tokens" defaultOpen>
            <div style={{ paddingTop: "16px" }}>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                TIPZ accepts any token supported by the NEAR Intents solver network. Current coverage includes:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", fontSize: "12px" }}>
                {["ETH", "USDC", "USDT", "SOL", "NEAR", "wBTC", "DAI", "MATIC", "ARB"].map((token) => (
                  <div
                    key={token}
                    style={{
                      padding: "12px",
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      textAlign: "center",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                  >
                    {token}
                  </div>
                ))}
              </div>
              <p style={{ color: colors.muted, fontSize: "11px", marginTop: "12px" }}>
                * Token availability depends on solver liquidity
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Shielded Address Formats">
            <div style={{ paddingTop: "16px" }}>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                TIPZ supports Zcash Sapling shielded addresses for maximum privacy:
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
                  position: "relative",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: colors.success }}>Sapling (zs...):</span>
                </div>
                <code style={{ color: colors.text, wordBreak: "break-all" }}>
                  zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9sly
                </code>
                <div style={{ marginTop: "8px", color: colors.muted }}>78 characters, Base58 encoded</div>
              </div>
              <p style={{ color: colors.muted, fontSize: "12px" }}>
                Get a shielded address from{" "}
                <a href="https://electriccoin.co/zashi/" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>
                  Zashi Wallet
                </a>{" "}
                or any Zcash wallet that supports shielded transactions.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Intent Lifecycle">
            <div style={{ paddingTop: "16px" }}>
              <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginBottom: "16px" }}>
                Each tip passes through the following states:
              </p>
              <div style={{ fontSize: "12px" }}>
                {[
                  { state: "PENDING", desc: "Intent submitted, awaiting solver", color: colors.muted },
                  { state: "MATCHED", desc: "Solver accepted, swap in progress", color: colors.primary },
                  { state: "SWAPPED", desc: "Cross-chain swap complete", color: colors.primary },
                  { state: "SHIELDING", desc: "Converting to shielded ZEC", color: colors.primary },
                  { state: "COMPLETE", desc: "Private delivery confirmed", color: colors.success },
                ].map((item, i) => (
                  <div
                    key={item.state}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 0",
                      borderBottom: i < 4 ? `1px solid ${colors.border}` : "none",
                    }}
                  >
                    <span style={{
                      color: item.color,
                      fontWeight: 600,
                      minWidth: "100px",
                      textShadow: item.color === colors.success ? `0 0 10px ${colors.successGlow}` : "none",
                    }}>
                      {item.state}
                    </span>
                    <span style={{ color: colors.muted }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Privacy Guarantees">
            <div style={{ paddingTop: "16px" }}>
              <div style={{ display: "grid", gap: "16px", fontSize: "13px" }}>
                {[
                  { title: "Sender privacy", desc: "Tipper's identity is not linked to the final shielded transaction" },
                  { title: "Receiver privacy", desc: "Creator's shielded address is not visible on transparent chains" },
                  { title: "Amount privacy", desc: "Final tip amount is encrypted in the shielded transaction" },
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
                    <span style={{ fontWeight: 600, color: colors.text }}>Note on input transactions</span>
                    <p style={{ color: colors.muted, margin: "4px 0 0" }}>
                      The initial deposit from the tipper&apos;s wallet is visible on the source chain. Privacy begins after the cross-chain swap.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </section>

        {/* CTA */}
        <section
          style={{
            textAlign: "center",
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
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>
            Ready to receive private tips?
          </h2>
          <p style={{ color: colors.muted, marginBottom: "32px" }}>
            Register your handle and start accepting tips today.
          </p>
          <Link
            href="/register"
            className="cta-primary"
            style={{
              display: "inline-block",
              backgroundColor: colors.primary,
              color: colors.bg,
              padding: "16px 40px",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: `0 0 30px ${colors.primaryGlow}`,
            }}
          >
            Register Now →
          </Link>
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
      `}</style>
    </div>
  );
}
