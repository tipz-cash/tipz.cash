"use client";

import { useState } from "react";
import Link from "next/link";

// Color palette (matching v6-narrative-snap)
const colors = {
  bg: "#0A0A0A",
  surface: "#1A1A1A",
  surfaceLight: "#222222",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  success: "#00FF00",
  error: "#FF4444",
  muted: "#888888",
  border: "#333333",
  text: "#E0E0E0",
  textBright: "#FFFFFF",
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
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        marginBottom: "16px",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "16px 20px",
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
        }}
      >
        <span>
          <span style={{ color: colors.primary, marginRight: "12px" }}>
            {isOpen ? "[-]" : "[+]"}
          </span>
          {title}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "0 20px 20px",
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
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${colors.border}`,
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
              style={{ color: colors.primary, fontWeight: 700, fontSize: "16px" }}
            >
              [TIPZ]
            </span>
            <span style={{ color: colors.muted, fontSize: "11px" }}>
              v0.1.0-beta
            </span>
          </Link>
          <nav style={{ display: "flex", gap: "32px" }}>
            <Link
              href="/manifesto"
              style={{
                color: colors.muted,
                textDecoration: "none",
                fontSize: "12px",
              }}
            >
              MANIFESTO
            </Link>
            <span
              style={{
                color: colors.primary,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              DOCS
            </span>
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

      {/* Main content */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
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
              fontSize: "40px",
              fontWeight: 600,
              marginBottom: "16px",
              lineHeight: 1.2,
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
        <section style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "1px",
              marginBottom: "24px",
            }}
          >
            01 // HOW_IT_WORKS
          </h2>

          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: colors.primary,
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    01
                  </span>
                  <span style={{ fontWeight: 600 }}>Tipper sends any token</span>
                </div>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: "13px",
                    lineHeight: 1.6,
                    marginLeft: "44px",
                  }}
                >
                  ETH, USDC, SOL, or any supported token from their existing
                  wallet.
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: colors.primary,
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    02
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    NEAR Intents routes the swap
                  </span>
                </div>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: "13px",
                    lineHeight: 1.6,
                    marginLeft: "44px",
                  }}
                >
                  Cross-chain intent-based routing finds the optimal path to
                  convert funds.
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: colors.primary,
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    03
                  </span>
                  <span style={{ fontWeight: 600 }}>Funds converted to ZEC</span>
                </div>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: "13px",
                    lineHeight: 1.6,
                    marginLeft: "44px",
                  }}
                >
                  Automatic conversion to Zcash for shielded delivery.
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: colors.success,
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    04
                  </span>
                  <span style={{ fontWeight: 600, color: colors.success }}>
                    Private delivery to creator
                  </span>
                </div>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: "13px",
                    lineHeight: 1.6,
                    marginLeft: "44px",
                  }}
                >
                  Creator receives ZEC via shielded transaction. No public trace
                  of sender, receiver, or amount.
                </p>
              </div>
            </div>
          </div>

          {/* Visual flow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "24px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              fontSize: "12px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: colors.text }}>ETH/USDC/SOL</span>
            <span style={{ color: colors.muted }}>→</span>
            <span
              style={{
                padding: "4px 12px",
                border: `1px solid ${colors.primary}`,
                color: colors.primary,
              }}
            >
              NEAR INTENTS
            </span>
            <span style={{ color: colors.muted }}>→</span>
            <span
              style={{
                padding: "4px 12px",
                border: `1px solid ${colors.success}`,
                color: colors.success,
              }}
            >
              SHIELDED ZEC
            </span>
            <span style={{ color: colors.muted }}>→</span>
            <span style={{ color: colors.success }}>Creator Wallet</span>
          </div>
        </section>

        {/* POWERED BY */}
        <section style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "1px",
              marginBottom: "24px",
            }}
          >
            02 // POWERED_BY
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                padding: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                NEAR Intents
              </h3>
              <p
                style={{
                  color: colors.muted,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                Cross-chain intent-based swaps via Defuse Protocol. Users express
                what they want, solvers compete to fulfill it at the best rate.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "12px",
                  color: colors.muted,
                }}
              >
                <li style={{ marginBottom: "4px" }}>
                  <span style={{ color: colors.primary }}>→</span> Chain-agnostic
                  swaps
                </li>
                <li style={{ marginBottom: "4px" }}>
                  <span style={{ color: colors.primary }}>→</span> Competitive
                  solver market
                </li>
                <li>
                  <span style={{ color: colors.primary }}>→</span> No bridge
                  custody risk
                </li>
              </ul>
            </div>

            <div
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.success}`,
                padding: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "12px",
                  color: colors.success,
                }}
              >
                Zcash Shielded
              </h3>
              <p
                style={{
                  color: colors.muted,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                zk-SNARK powered privacy. Sender, receiver, and amount are all
                encrypted on-chain. Only you hold the viewing key.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "12px",
                  color: colors.muted,
                }}
              >
                <li style={{ marginBottom: "4px" }}>
                  <span style={{ color: colors.success }}>→</span> Encrypted
                  transactions
                </li>
                <li style={{ marginBottom: "4px" }}>
                  <span style={{ color: colors.success }}>→</span> Zero-knowledge
                  proofs
                </li>
                <li>
                  <span style={{ color: colors.success }}>→</span> Self-sovereign
                  privacy
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* TECHNICAL SPECS */}
        <section style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "14px",
              color: colors.primary,
              letterSpacing: "1px",
              marginBottom: "24px",
            }}
          >
            03 // TECHNICAL_SPECS
          </h2>

          <CollapsibleSection title="Supported Input Tokens">
            <div style={{ paddingTop: "16px" }}>
              <p
                style={{
                  color: colors.muted,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                TIPZ accepts any token supported by the NEAR Intents solver
                network. Current coverage includes:
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  fontSize: "12px",
                }}
              >
                {[
                  "ETH",
                  "USDC",
                  "USDT",
                  "SOL",
                  "NEAR",
                  "wBTC",
                  "DAI",
                  "MATIC",
                  "ARB",
                ].map((token) => (
                  <div
                    key={token}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: colors.surfaceLight,
                      border: `1px solid ${colors.border}`,
                      textAlign: "center",
                    }}
                  >
                    {token}
                  </div>
                ))}
              </div>
              <p
                style={{
                  color: colors.muted,
                  fontSize: "11px",
                  marginTop: "12px",
                }}
              >
                * Token availability depends on solver liquidity
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Shielded Address Formats">
            <div style={{ paddingTop: "16px" }}>
              <p
                style={{
                  color: colors.muted,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                TIPZ supports Zcash Sapling shielded addresses for maximum
                privacy:
              </p>
              <div
                style={{
                  backgroundColor: colors.bg,
                  padding: "16px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: colors.primary }}>Sapling (zs...):</span>
                </div>
                <code style={{ color: colors.text, wordBreak: "break-all" }}>
                  zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9sly
                </code>
                <div style={{ marginTop: "4px", color: colors.muted }}>
                  78 characters, Base58 encoded
                </div>
              </div>
              <p style={{ color: colors.muted, fontSize: "12px" }}>
                Get a shielded address from{" "}
                <a
                  href="https://electriccoin.co/zashi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.primary }}
                >
                  Zashi Wallet
                </a>{" "}
                or any Zcash wallet that supports shielded transactions.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Intent Lifecycle">
            <div style={{ paddingTop: "16px" }}>
              <p
                style={{
                  color: colors.muted,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                Each tip passes through the following states:
              </p>
              <div style={{ fontSize: "12px" }}>
                {[
                  {
                    state: "PENDING",
                    desc: "Intent submitted, awaiting solver",
                    color: colors.muted,
                  },
                  {
                    state: "MATCHED",
                    desc: "Solver accepted, swap in progress",
                    color: colors.primary,
                  },
                  {
                    state: "SWAPPED",
                    desc: "Cross-chain swap complete",
                    color: colors.primary,
                  },
                  {
                    state: "SHIELDING",
                    desc: "Converting to shielded ZEC",
                    color: colors.primary,
                  },
                  {
                    state: "COMPLETE",
                    desc: "Private delivery confirmed",
                    color: colors.success,
                  },
                ].map((item, i) => (
                  <div
                    key={item.state}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "12px 0",
                      borderBottom:
                        i < 4 ? `1px solid ${colors.border}` : "none",
                    }}
                  >
                    <span
                      style={{
                        color: item.color,
                        fontWeight: 600,
                        minWidth: "100px",
                      }}
                    >
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
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span style={{ color: colors.success }}>✓</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>Sender privacy</span>
                    <p style={{ color: colors.muted, margin: "4px 0 0" }}>
                      Tipper&apos;s identity is not linked to the final shielded
                      transaction
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span style={{ color: colors.success }}>✓</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>Receiver privacy</span>
                    <p style={{ color: colors.muted, margin: "4px 0 0" }}>
                      Creator&apos;s shielded address is not visible on
                      transparent chains
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span style={{ color: colors.success }}>✓</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>Amount privacy</span>
                    <p style={{ color: colors.muted, margin: "4px 0 0" }}>
                      Final tip amount is encrypted in the shielded transaction
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: "12px",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ color: colors.error }}>!</span>
                  <div>
                    <span style={{ fontWeight: 600, color: colors.text }}>
                      Note on input transactions
                    </span>
                    <p style={{ color: colors.muted, margin: "4px 0 0" }}>
                      The initial deposit from the tipper&apos;s wallet is
                      visible on the source chain. Privacy begins after the
                      cross-chain swap.
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
            padding: "48px 24px",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            Ready to receive private tips?
          </h2>
          <p
            style={{
              color: colors.muted,
              marginBottom: "24px",
            }}
          >
            Register your handle and start accepting tips today.
          </p>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              backgroundColor: colors.primary,
              color: colors.bg,
              padding: "14px 32px",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Register Now
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${colors.border}`,
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: colors.primary, fontWeight: 700 }}>[TIPZ]</span>
          <span style={{ color: colors.muted }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <Link
            href="/manifesto"
            style={{ color: colors.muted, textDecoration: "none" }}
          >
            Manifesto
          </Link>
          <span style={{ color: colors.textBright }}>Docs</span>
          <a
            href="https://github.com/tipz-app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.muted, textDecoration: "none" }}
          >
            GitHub
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: colors.muted,
          }}
        >
          <span style={{ color: colors.success }}>●</span>
          <span>Private by default</span>
        </div>
      </footer>
    </div>
  );
}
