"use client";

import { useEffect, useState, useRef } from "react";

// Color palette - Terminal/Bloomberg style
const colors = {
  bg: "#0A0A0A",
  surface: "#111111",
  surfaceAlt: "#1A1A1A",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  success: "#00FF00",
  error: "#FF4444",
  muted: "#666666",
  mutedLight: "#888888",
  border: "#222222",
  borderLight: "#333333",
  text: "#E0E0E0",
  textBright: "#FFFFFF",
};

// Live ticker data (simulated)
const tickerItems = [
  { symbol: "ZEC/USD", price: "27.45", change: "+2.3%" },
  { symbol: "ETH/USD", price: "3,421.80", change: "+1.1%" },
  { symbol: "BTC/USD", price: "67,234.00", change: "+0.8%" },
  { symbol: "SOL/USD", price: "142.65", change: "-0.4%" },
  { symbol: "NEAR/USD", price: "5.82", change: "+3.2%" },
  { symbol: "USDC/USD", price: "1.00", change: "0.0%" },
];

// Protocol stats
const protocolStats = [
  { label: "NETWORK", value: "ZCASH_MAINNET", status: "live" },
  { label: "ENCRYPTION", value: "ZK-SNARKS", status: "live" },
  { label: "PLATFORM_FEE", value: "0.00%", status: "live" },
  { label: "CUSTODY", value: "SELF", status: "live" },
  { label: "LICENSE", value: "MIT_OPEN", status: "live" },
  { label: "SWAP_ENGINE", value: "NEAR_INTENTS", status: "beta" },
];

// Feature matrix
const featureMatrix = [
  { feature: "Shielded Transactions", tipz: true, paypal: false, kofi: false, eth: false },
  { feature: "Zero Platform Fee", tipz: true, paypal: false, kofi: false, eth: true },
  { feature: "Any Token Input", tipz: true, paypal: false, kofi: false, eth: false },
  { feature: "Self Custody", tipz: true, paypal: false, kofi: false, eth: true },
  { feature: "No KYC Required", tipz: true, paypal: false, kofi: false, eth: true },
  { feature: "No Account Needed (Tipper)", tipz: true, paypal: false, kofi: false, eth: true },
];

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
  return <span style={{ color: colors.primary, opacity: show ? 1 : 0 }}>_</span>;
}

// Live Ticker Component
function LiveTicker() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      padding: "8px 0",
    }}>
      <div style={{
        display: "flex",
        gap: "48px",
        transform: `translateX(-${offset}px)`,
        transition: "transform 0.05s linear",
        whiteSpace: "nowrap",
      }}>
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ color: colors.mutedLight }}>{item.symbol}</span>
            <span style={{ color: colors.textBright }}>{item.price}</span>
            <span style={{
              color: item.change.startsWith("+") ? colors.success :
                     item.change.startsWith("-") ? colors.error : colors.mutedLight
            }}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Data Panel Component
function DataPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      height: "100%",
    }}>
      <div style={{
        backgroundColor: colors.surfaceAlt,
        padding: "8px 12px",
        borderBottom: `1px solid ${colors.border}`,
        fontSize: "11px",
        color: colors.mutedLight,
        letterSpacing: "1px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>{title}</span>
        <span style={{ color: colors.success }}>●</span>
      </div>
      <div style={{ padding: "12px" }}>
        {children}
      </div>
    </div>
  );
}

export default function V6DenseHomePage() {
  const heroText = "Private tips. Any asset. Zero trace.";
  const { displayText, isComplete } = useTypingEffect(heroText, 35);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);

    // Update time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").slice(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    lineHeight: 1.5,
  };

  return (
    <div style={containerStyle}>
      {/* Top Bar - System Status */}
      <header style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: "6px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ color: colors.primary, fontWeight: 700 }}>[TIPZ]</span>
          <span style={{ color: colors.muted }}>v0.1.0-beta</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: colors.success }}>●</span>
            <span style={{ color: colors.mutedLight }}>SYSTEM_OPERATIONAL</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ color: colors.muted }}>{currentTime}</span>
          <a href="/manifesto" style={{ color: colors.mutedLight, textDecoration: "none" }}>MANIFESTO</a>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.mutedLight, textDecoration: "none" }}>GITHUB</a>
        </div>
      </header>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Main Grid Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr 320px",
        gridTemplateRows: "auto 1fr",
        gap: "1px",
        backgroundColor: colors.border,
        minHeight: "calc(100vh - 80px)",
      }}>
        {/* Left Sidebar - Protocol Info */}
        <div style={{ backgroundColor: colors.bg, padding: "16px" }}>
          <DataPanel title="// PROTOCOL_STATUS">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {protocolStats.map((stat) => (
                <div key={stat.label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ color: colors.muted, fontSize: "11px" }}>{stat.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      color: stat.status === "live" ? colors.text : colors.primary,
                      fontSize: "11px",
                    }}>
                      {stat.value}
                    </span>
                    <span style={{
                      color: stat.status === "live" ? colors.success : colors.primary,
                      fontSize: "10px",
                    }}>
                      {stat.status === "live" ? "●" : "○"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DataPanel>

          <div style={{ marginTop: "16px" }}>
            <DataPanel title="// SUPPORTED_TOKENS">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                fontSize: "11px",
              }}>
                {["ETH", "USDC", "SOL", "NEAR", "BTC*", "DAI*"].map((token) => (
                  <div key={token} style={{
                    padding: "6px",
                    backgroundColor: colors.surfaceAlt,
                    textAlign: "center",
                    color: token.includes("*") ? colors.muted : colors.text,
                  }}>
                    {token}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "10px", color: colors.muted, marginTop: "8px" }}>
                * Coming soon
              </p>
            </DataPanel>
          </div>
        </div>

        {/* Center - Hero */}
        <div style={{
          backgroundColor: colors.bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
          position: "relative",
        }}>
          {/* Terminal Window */}
          <div style={{
            width: "100%",
            maxWidth: "700px",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderLight}`,
          }}>
            {/* Terminal Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              backgroundColor: colors.surfaceAlt,
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#27CA40" }} />
              </div>
              <span style={{ marginLeft: "8px", fontSize: "11px", color: colors.muted }}>
                tipz@mainnet ~ /tip
              </span>
            </div>

            {/* Terminal Content */}
            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: "24px" }}>
                <span style={{ color: colors.success }}>$</span>{" "}
                <span style={{ fontSize: "20px", fontWeight: 600 }}>
                  {mounted ? displayText : heroText}
                  <Cursor visible={mounted && !isComplete} />
                </span>
              </div>

              <div style={{ color: colors.mutedLight, marginBottom: "32px", fontSize: "14px" }}>
                Zcash shielded addresses + any-token swaps.
                <br />No account needed. No fees. No trace.
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "12px" }}>
                <a href="#register" style={{
                  backgroundColor: colors.primary,
                  color: colors.bg,
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  REGISTER_CREATOR
                </a>
                <a href="https://chromewebstore.google.com/detail/tipz" target="_blank" rel="noopener noreferrer" style={{
                  backgroundColor: "transparent",
                  color: colors.text,
                  padding: "12px 24px",
                  border: `1px solid ${colors.borderLight}`,
                  fontWeight: 500,
                  fontSize: "14px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  INSTALL_EXTENSION
                </a>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            width: "100%",
            maxWidth: "700px",
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            backgroundColor: colors.border,
          }}>
            {[
              { label: "PLATFORM_FEE", value: "0%", accent: true },
              { label: "CUSTODY_TYPE", value: "SELF" },
              { label: "KYC_REQUIRED", value: "NO" },
              { label: "TIPPER_SIGNUP", value: "NO" },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: colors.surface,
                padding: "16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "10px", color: colors.muted, marginBottom: "4px" }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: stat.accent ? colors.success : colors.text,
                }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Comparison & How It Works */}
        <div style={{ backgroundColor: colors.bg, padding: "16px" }}>
          <DataPanel title="// VS_ALTERNATIVES">
            <div style={{ fontSize: "11px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "4px 0", color: colors.muted, fontWeight: 500 }}>Feature</th>
                    <th style={{ textAlign: "center", padding: "4px 0", color: colors.primary, fontWeight: 600 }}>TIPZ</th>
                    <th style={{ textAlign: "center", padding: "4px 0", color: colors.muted, fontWeight: 500 }}>Others</th>
                  </tr>
                </thead>
                <tbody>
                  {featureMatrix.slice(0, 5).map((row) => (
                    <tr key={row.feature} style={{ borderTop: `1px solid ${colors.border}` }}>
                      <td style={{ padding: "6px 0", color: colors.mutedLight }}>{row.feature}</td>
                      <td style={{ textAlign: "center", color: row.tipz ? colors.success : colors.error }}>
                        {row.tipz ? "YES" : "NO"}
                      </td>
                      <td style={{ textAlign: "center", color: colors.muted }}>
                        {row.paypal ? "YES" : "NO"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>

          <div style={{ marginTop: "16px" }}>
            <DataPanel title="// HOW_IT_WORKS">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { step: "01", title: "Register", desc: "Paste ZEC shielded address + verify via tweet" },
                  { step: "02", title: "Share", desc: "Tip button appears on all your X posts" },
                  { step: "03", title: "Receive", desc: "Tips auto-swap to ZEC, arrive shielded" },
                ].map((item) => (
                  <div key={item.step} style={{ display: "flex", gap: "12px" }}>
                    <div style={{
                      color: colors.primary,
                      fontWeight: 700,
                      fontSize: "14px",
                      minWidth: "24px",
                    }}>
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "12px", marginBottom: "2px" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "11px", color: colors.muted }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DataPanel>
          </div>
        </div>

        {/* Bottom Row - Spans Full Width */}
        <div style={{
          gridColumn: "1 / -1",
          backgroundColor: colors.bg,
          padding: "24px",
        }}>
          {/* Architecture Section */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{
              color: colors.primary,
              fontSize: "11px",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}>
              // ARCHITECTURE
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}>
              {[
                { icon: "[]", title: "ZK_SHIELDED", desc: "zk-SNARKs encrypt sender, receiver, and amount" },
                { icon: "{}", title: "ANY_TOKEN_IN", desc: "ETH, USDC, SOL swap to ZEC via NEAR Intents" },
                { icon: "()", title: "SELF_CUSTODY", desc: "Direct to shielded address. Your keys only." },
                { icon: "<>", title: "FOSS_LICENSED", desc: "MIT licensed. Audit the code. Verify everything." },
              ].map((feature) => (
                <div key={feature.title} style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  padding: "20px",
                }}>
                  <div style={{ fontSize: "20px", marginBottom: "8px", color: colors.primary }}>
                    {feature.icon}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                    {feature.title}
                  </div>
                  <div style={{ fontSize: "11px", color: colors.muted }}>
                    {feature.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registration CTA */}
          <div id="register" style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderLight}`,
            padding: "32px",
            textAlign: "center",
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
              Start receiving tips in 2 minutes.
            </h3>
            <p style={{ color: colors.muted, marginBottom: "24px", fontSize: "13px" }}>
              Zero platform fees. Self-custody by default. No KYC required.
            </p>
            <a href="/register" style={{
              backgroundColor: colors.primary,
              color: colors.bg,
              padding: "14px 32px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              display: "inline-block",
            }}>
              REGISTER_NOW
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: colors.primary, fontWeight: 700 }}>[TIPZ]</span>
          <span style={{ color: colors.muted }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <a href="/manifesto" style={{ color: colors.muted, textDecoration: "none" }}>MANIFESTO</a>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none" }}>GITHUB</a>
          <a href="https://x.com/tipz_cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none" }}>X</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.muted }}>
          <span style={{ color: colors.success }}>●</span>
          <span>All systems operational</span>
          <span>|</span>
          <span>Powered by Zcash + NEAR Intents</span>
        </div>
      </footer>
    </div>
  );
}
