"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { TipzLogo } from "@/components/TipzLogo";

// Hook for responsive breakpoint detection
function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// Color palette - Terminal Purity: single accent color
const colors = {
  bg: "#08090a",
  bgGradientStart: "#08090a",
  bgGradientEnd: "#0d1117",
  surface: "#12141a",
  surfaceHover: "#1a1d24",
  primary: "#F5A623",
  primaryGlow: "rgba(245, 166, 35, 0.15)",
  muted: "#6B7280",
  border: "#2a2f38",
  borderHover: "#3d4450",
  text: "#D1D5DB",
  textBright: "#F9FAFB",
};

// Tab types
type TabId = "tippers" | "creators" | "technical";

// Tab navigation component - underline style
function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "tippers", label: "FOR TIPPERS" },
    { id: "creators", label: "FOR CREATORS" },
    { id: "technical", label: "TECHNICAL" },
  ];

  return (
    <div
      className="docs-tabs"
      style={{
        display: "flex",
        gap: "32px",
        borderBottom: `1px solid ${colors.border}`,
        marginBottom: "64px",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: "16px 0",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "1px",
            fontFamily: "'JetBrains Mono', monospace",
            color: activeTab === tab.id ? colors.primary : colors.muted,
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === tab.id ? `2px solid ${colors.primary}` : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: "-1px",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Collapsible section component
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  id,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        marginBottom: "16px",
        borderRadius: "4px",
        overflow: "hidden",
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
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: colors.primary, fontSize: "14px" }}>
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

// Callout box component - simplified, no colored backgrounds
function Callout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "transparent",
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        padding: "16px 20px",
        marginBottom: "24px",
      }}
    >
      <div style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

// Code block component
function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        padding: "16px 20px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "12px",
        color: colors.muted,
        overflowX: "auto",
        marginBottom: "16px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {children}
    </pre>
  );
}

// Step list component - simplified inline numbering
function StepList({
  steps,
}: {
  steps: { num: string; title: string; desc: string }[];
}) {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {steps.map((step) => (
        <div key={step.num}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "4px" }}>
            <span style={{ color: colors.muted, fontSize: "12px", fontFamily: "monospace" }}>
              {step.num}.
            </span>
            <span style={{ fontWeight: 600, color: colors.textBright, fontSize: "14px" }}>
              {step.title}
            </span>
          </div>
          <p style={{ color: colors.muted, fontSize: "13px", lineHeight: 1.6, marginLeft: "36px", margin: "0 0 0 36px" }}>
            {step.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// TAB CONTENT: FOR TIPPERS
// ============================================
function TippersTab() {
  return (
    <>
      {/* The 60-Second Tip */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          THE 60-SECOND TIP
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Tipping takes less than a minute. No account needed. Just a wallet.
        </p>

        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            padding: "32px",
            marginBottom: "32px",
            borderRadius: "4px",
          }}
        >
          <StepList
            steps={[
              { num: "01", title: "Connect wallet", desc: "MetaMask, Rabby, Coinbase Wallet, or Phantom. One click. No signup." },
              { num: "02", title: "Pick your amount", desc: "$1, $5, $10, $25—or custom. See exactly how much ZEC the creator will receive." },
              { num: "03", title: "Confirm in wallet", desc: "One signature. Success screen appears immediately after confirmation." },
              { num: "04", title: "Done", desc: "That's it. We handle the cross-chain swap in the background. Delivery in 5-10 minutes." },
            ]}
          />
        </div>

        {/* Simplified flow */}
        <CodeBlock>{`Your Token → NEAR Intents → Shielded ZEC → Creator`}</CodeBlock>
      </section>

      {/* Exchange Payments — Coming Soon */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.muted, letterSpacing: "2px", marginBottom: "24px" }}>
          EXCHANGE PAYMENTS — COMING SOON
        </h2>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "32px", borderRadius: "4px", opacity: 0.7 }}>
          <p style={{ color: colors.text, fontSize: "14px", marginBottom: "16px", lineHeight: 1.7 }}>
            Connect your Coinbase, Kraken, or Binance account to tip directly — no wallet needed. Exchange payments are coming in a future update.
          </p>
          <p style={{ color: colors.muted, fontSize: "13px", margin: 0, lineHeight: 1.7 }}>
            For now, connect a crypto wallet (MetaMask, Phantom, Rabby) to send tips.
          </p>
        </div>
      </section>

      {/* What Happens to Your Tip */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          WHAT HAPPENS TO YOUR TIP
        </h2>

        <CodeBlock>{`Your Token → NEAR Intents Deposit Address → ZEC Shielded Address

NO TIPZ smart contracts — direct transfers only.
Market makers compete for the best swap rate.
Auto-refund if swap fails (rare, but handled).`}</CodeBlock>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", borderRadius: "4px" }}>
            <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>Zero Platform Fees</div>
            <p style={{ color: colors.muted, fontSize: "12px", margin: 0 }}>No TIPZ platform fee. Cross-chain swap spread (~3-4% on a $5 tip) is embedded in your quote rate.</p>
          </div>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", borderRadius: "4px" }}>
            <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>Atomic Execution</div>
            <p style={{ color: colors.muted, fontSize: "12px", margin: 0 }}>Swap completes fully or refunds automatically. No stuck funds.</p>
          </div>
        </div>
      </section>

      {/* Privacy Breakdown */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          PRIVACY BREAKDOWN
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Honest privacy expectations—what&apos;s visible and what&apos;s not.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px" }}>
            <div style={{ color: colors.muted, fontWeight: 600, marginBottom: "12px", fontSize: "11px", letterSpacing: "1px" }}>VISIBLE ON SOURCE CHAIN</div>
            <ul style={{ color: colors.muted, fontSize: "13px", margin: 0, paddingLeft: "16px", lineHeight: 1.8 }}>
              <li>Your deposit transaction</li>
              <li>That you sent to a NEAR Intents address</li>
              <li>The token type and amount you deposited</li>
            </ul>
          </div>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px" }}>
            <div style={{ color: colors.primary, fontWeight: 600, marginBottom: "12px", fontSize: "11px", letterSpacing: "1px" }}>PRIVATE (ZCASH SHIELDED)</div>
            <ul style={{ color: colors.muted, fontSize: "13px", margin: 0, paddingLeft: "16px", lineHeight: 1.8 }}>
              <li>Who receives the ZEC</li>
              <li>The final tip amount</li>
              <li>Any link between you and the creator</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Send a Private Message */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          SEND A PRIVATE MESSAGE
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Attach a message to your tip. Only the creator can read it.
        </p>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px", marginBottom: "24px" }}>
          <div style={{ display: "grid", gap: "16px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>280 characters max</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>Short messages only—like a tweet.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>End-to-end encrypted</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>RSA-4096 + AES-256-GCM. Our server cannot read your message.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>One-way only</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>Creators cannot reply. This preserves your anonymity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          QUESTIONS
        </h2>

        <div style={{ display: "grid", gap: "16px" }}>
          {[
            { q: "How long does delivery take?", a: "5-10 minutes after your wallet confirms. You can close the page—we track it for you." },
            { q: "What if the swap fails?", a: "Rare, but handled. Your original funds auto-return to your wallet within minutes." },
            { q: "Are there fees?", a: "Zero TIPZ platform fees. The cross-chain swap includes a ~3-4% spread (on a $5 tip, ~$0.15-0.17) embedded in the exchange rate. No hidden charges." },
            { q: "Do I need a Zcash wallet to tip?", a: "No. Use your existing ETH/SOL/USDC wallet. Only creators need Zcash." },
          ].map((faq, i) => (
            <div key={i} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px 24px", borderRadius: "4px" }}>
              <div style={{ color: colors.textBright, fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>{faq.q}</div>
              <p style={{ color: colors.muted, fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ============================================
// TAB CONTENT: FOR CREATORS
// ============================================
function CreatorsTab() {
  return (
    <>
      {/* Get Started */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          GET STARTED IN 2 MINUTES
        </h2>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "32px", marginBottom: "32px", borderRadius: "4px" }}>
          <StepList
            steps={[
              { num: "01", title: "Get a Zcash wallet", desc: "Download Zashi (iOS/Android). Free. Takes 30 seconds. Create wallet, backup seed phrase." },
              { num: "02", title: "Register at tipz.cash/register", desc: "Enter your X handle and paste your unified address (starts with u1...)." },
              { num: "03", title: "Verify via tweet", desc: "Post a verification tweet. We'll confirm automatically." },
              { num: "04", title: "Share your link", desc: "Your tip page is live at tipz.cash/yourhandle. Add it to your bio." },
            ]}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="https://electriccoin.co/zashi/" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 20px", backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "4px", color: colors.text, textDecoration: "none", fontSize: "13px" }}>
            Download Zashi
          </a>
          <Link href="/register" style={{ padding: "12px 20px", backgroundColor: colors.primary, borderRadius: "4px", color: colors.bg, textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            Register Now →
          </Link>
        </div>
      </section>

      {/* What You Receive */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          WHAT YOU RECEIVE
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { title: "Shielded ZEC", desc: "Encrypted on-chain. Only you hold the viewing key." },
            { title: "Zero Platform Fees", desc: "100% of tip value. Compare: Patreon 5-12%, Ko-fi 5%." },
            { title: "Self-Custody", desc: "You hold the keys. No middleman. No withdrawal requests." },
          ].map((item) => (
            <div key={item.title} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", borderRadius: "4px" }}>
              <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>{item.title}</div>
              <p style={{ color: colors.muted, fontSize: "12px", margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creator Dashboard */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          CREATOR DASHBOARD
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Your command center at tipz.cash/my. Real-time earnings, private encrypted messages from supporters, and tools to promote your tip page. No extension required.
        </p>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", color: colors.muted, marginBottom: "16px", letterSpacing: "1px" }}>FEATURES</div>
          <div style={{ display: "grid", gap: "12px", fontSize: "13px" }}>
            {[
              { title: "Real-time earnings", desc: "Tips appear in your activity feed instantly. ZEC + USD totals update live. Your browser tab shows a count (e.g. \"(3) TIPZ\") so you know when tips arrive from another tab." },
              { title: "Encrypted messages", desc: "Tippers can attach a private message to any tip. Messages are end-to-end encrypted — your keys are generated and stored locally in your browser. TIPZ never sees your private key or the message content. We relay encrypted blobs, nothing more." },
              { title: "Promotion tools", desc: "Copy your tip link, compose a tweet, or stamp your URL onto any image — screenshots, memes, artwork. Everything you need to share your tip page, all from one dashboard." },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ color: colors.primary }}>→</span>
                <div>
                  <span style={{ fontWeight: 600, color: colors.textBright }}>{item.title}</span>
                  <p style={{ color: colors.muted, margin: "2px 0 0", fontSize: "12px" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", color: colors.muted, marginBottom: "12px", letterSpacing: "1px" }}>HOW TO GET STARTED</div>
          <ol style={{ color: colors.muted, fontSize: "13px", margin: 0, paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>Visit <span style={{ color: colors.primary }}>tipz.cash/my</span></li>
            <li>Log in with X (Twitter) — one-click OAuth</li>
            <li>Dashboard loads with your handle, stats, and activity feed</li>
            <li>Done — tips appear in real-time</li>
          </ol>
        </div>

      </section>

      {/* Image Stamping */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          IMAGE STAMPING
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Add your tip URL to images before sharing. Works with screenshots, memes, artwork—anything.
        </p>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px" }}>
          <StepList
            steps={[
              { num: "01", title: "Open your dashboard", desc: "Visit tipz.cash/my and log in." },
              { num: "02", title: 'Click "Stamp"', desc: "Opens the image stamping tool." },
              { num: "03", title: "Paste or upload image", desc: "Ctrl+V to paste from clipboard, or click to upload." },
              { num: "04", title: "Copy stamped image", desc: "Your tip URL is overlaid in the corner. Copy and paste directly into X." },
            ]}
          />
        </div>
      </section>

      {/* Notifications */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          NOTIFICATIONS
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Tips appear in your activity feed in real-time. Your browser tab updates with a count (e.g. &quot;(3) TIPZ&quot;) so you know when tips arrive even from another tab. The count resets when you return to the dashboard.
        </p>

        <Callout>
          Direct ZEC tips have no notification. If someone sends ZEC directly to your shielded address (without using tipz.cash), we cannot notify you. The tip still arrives—we just don&apos;t know about it. Check your Zcash wallet periodically.
        </Callout>
      </section>

      {/* Direct ZEC → ZEC */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          ZEC → ZEC: TRUE INVISIBILITY
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          If a tipper sends ZEC directly to your shielded address — without using tipz.cash — the transaction is completely invisible to us. No notification. No dashboard entry. No record on our side, period. This isn&apos;t a bug. It&apos;s the entire point.
        </p>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px", marginBottom: "24px" }}>
          <div style={{ display: "grid", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>We can&apos;t see it</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>Zcash shielded transactions encrypt sender, receiver, and amount on-chain. Even TIPZ has zero visibility.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>Your wallet still gets it</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>The ZEC lands in your Zashi wallet regardless. Only you hold the viewing key to see it.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>Not in your dashboard</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>These tips won&apos;t appear in your TIPZ dashboard or activity feed — because we never knew they happened.</p>
              </div>
            </div>
          </div>
        </div>

        <Callout>
          This is the power of real privacy. Not even the platform that connects you can surveil your income. Check your Zashi wallet periodically for direct ZEC tips.
        </Callout>
      </section>

      {/* Private Messages */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          PRIVATE MESSAGES
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Supporters can attach encrypted messages to tips. Here&apos;s how it works.
        </p>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "24px", borderRadius: "4px", marginBottom: "32px" }}>
          <div style={{ display: "grid", gap: "16px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>End-to-end encrypted</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>RSA-OAEP 4096-bit + AES-256-GCM. Industry-standard hybrid encryption.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>Your private key never leaves your device</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>Generated and stored locally in your browser.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>Blind relay</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>Our server passes encrypted blobs—we cannot read message content.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>One-way only</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>You cannot reply—by design. Protects tipper anonymity.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ color: colors.primary }}>→</span>
              <div>
                <span style={{ fontWeight: 600, color: colors.textBright }}>280 characters max</span>
                <p style={{ color: colors.muted, margin: "4px 0 0" }}>Short messages only. Prevents spam, keeps it personal.</p>
              </div>
            </div>
          </div>
        </div>

        <Callout>
          Messages are decrypted in your dashboard at tipz.cash/my. Your private key is generated and stored locally in your browser.
        </Callout>
      </section>
    </>
  );
}

// ============================================
// TAB CONTENT: TECHNICAL
// ============================================
function TechnicalTab() {
  return (
    <>
      {/* No Smart Contracts */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          NO SMART CONTRACTS
        </h2>

        <Callout>
          TIPZ deploys ZERO smart contracts. We&apos;re a routing layer, not a custody solution. Your funds flow directly from your wallet to the creator&apos;s shielded address via NEAR Intents market makers.
        </Callout>

        <CodeBlock>{`Flow:
Your Wallet → NEAR Intents Deposit Address → Market Maker → Creator's ZEC

No TIPZ-owned contracts in the path.
No locked funds. No governance tokens. No DeFi complexity.`}</CodeBlock>
      </section>

      {/* NEAR Intents */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          NEAR INTENTS
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Intent-based cross-chain swaps. Express what you want, let solvers compete for the best execution.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", borderRadius: "4px" }}>
            <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>1Click API</div>
            <p style={{ color: colors.muted, fontSize: "12px", margin: 0, lineHeight: 1.6 }}>Single integration handles all chains. Deposit, swap, deliver.</p>
          </div>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", borderRadius: "4px" }}>
            <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>Solver Competition</div>
            <p style={{ color: colors.muted, fontSize: "12px", margin: 0, lineHeight: 1.6 }}>Market makers compete for each swap. Best rate wins.</p>
          </div>
          <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", borderRadius: "4px" }}>
            <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "8px", fontSize: "13px" }}>Atomic Execution</div>
            <p style={{ color: colors.muted, fontSize: "12px", margin: 0, lineHeight: 1.6 }}>Swap completes fully or reverts. No partial fills.</p>
          </div>
        </div>
      </section>

      {/* Supported Tokens */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          SUPPORTED TOKENS
        </h2>

        <CodeBlock>{`EVM CHAINS
├── Ethereum: ETH, USDC, USDT
├── Polygon: MATIC, USDC, USDT
├── Arbitrum: ETH, USDC, USDT
└── Optimism: ETH, USDC, USDT

SOLANA
└── SOL (via Phantom)

OUTPUT
└── ZEC (shielded)`}</CodeBlock>

        <p style={{ color: colors.muted, fontSize: "12px", marginTop: "16px" }}>
          * Token availability depends on solver liquidity at time of swap
        </p>
      </section>

      {/* Transaction Lifecycle */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          TRANSACTION LIFECYCLE
        </h2>

        <div style={{ fontSize: "12px" }}>
          {[
            { state: "PENDING_DEPOSIT", userText: "Waiting for your deposit", desc: "Your wallet signature sent. Funds transferring to solver." },
            { state: "PROCESSING", userText: "Routing funds", desc: "Market makers competing to fulfill. Cross-chain swap in progress." },
            { state: "SUCCESS", userText: "Delivered", desc: "Shielded ZEC in creator's wallet. Transaction complete." },
            { state: "REFUNDED", userText: "Returned to you", desc: "Swap couldn't complete. Original funds sent back to your wallet." },
          ].map((item, i) => (
            <div
              key={item.state}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                padding: "16px",
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderBottom: i < 3 ? "none" : undefined,
                borderRadius: i === 0 ? "4px 4px 0 0" : i === 3 ? "0 0 4px 4px" : undefined,
              }}
            >
              <span style={{ color: colors.muted, fontWeight: 600, minWidth: "140px", fontSize: "11px", fontFamily: "monospace" }}>
                {item.state}
              </span>
              <div>
                <div style={{ color: colors.textBright, marginBottom: "4px" }}>{item.userText}</div>
                <div style={{ color: colors.muted, fontSize: "11px" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px", padding: "16px", backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "4px" }}>
          <div style={{ color: colors.textBright, fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>What if I close the page?</div>
          <p style={{ color: colors.muted, fontSize: "12px", margin: 0, lineHeight: 1.6 }}>
            No problem. The swap continues in the background. If it fails, your funds auto-refund. We store a notification and you&apos;ll see it next time you visit TIPZ.
          </p>
        </div>
      </section>

      {/* Shielded Addresses */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          SHIELDED ADDRESSES
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          TIPZ supports Zcash shielded addresses for private delivery.
        </p>

        <div style={{ backgroundColor: colors.bg, padding: "20px", fontFamily: "monospace", fontSize: "12px", marginBottom: "16px", border: `1px solid ${colors.border}`, borderRadius: "4px" }}>
          <div style={{ marginBottom: "16px" }}>
            <span style={{ color: colors.primary, fontWeight: 600 }}>Unified (u1...):</span>
            <span style={{ color: colors.muted, marginLeft: "8px", fontSize: "11px" }}>Recommended</span>
          </div>
          <code style={{ color: colors.muted, wordBreak: "break-all", display: "block", marginBottom: "16px" }}>
            u1rl42v9...
          </code>

        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          {[
            { name: "ZODL", note: "Recommended", url: "https://zodl.com" },
          ].map((wallet) => (
            <a key={wallet.name} href={wallet.url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "16px", borderRadius: "4px", textDecoration: "none" }}>
              <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "4px" }}>{wallet.name}</div>
              <div style={{ color: colors.muted, fontSize: "11px" }}>{wallet.note}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Encryption Spec */}
      <section style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "12px", color: colors.primary, letterSpacing: "2px", marginBottom: "24px" }}>
          ENCRYPTION SPEC
        </h2>

        <p style={{ color: colors.text, fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
          Private messages use hybrid encryption. Technical details for auditors and security researchers.
        </p>

        <CodeBlock>{`HYBRID ENCRYPTION SCHEME

Asymmetric Layer:
├── Algorithm: RSA-OAEP
├── Key Size: 4096-bit
├── Hash: SHA-256
└── Security Level: ~128-bit

Symmetric Layer:
├── Algorithm: AES-256-GCM
├── Key: Random 256-bit per message
├── Nonce: Random 96-bit per message
└── Authentication: Built into GCM mode

Key Management:
├── Public key: Uploaded to TIPZ server on first dashboard login
├── Private key: Stored locally in browser IndexedDB
└── Key never leaves device in plaintext`}</CodeBlock>

        <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, padding: "20px", borderRadius: "4px" }}>
          <div style={{ color: colors.textBright, fontWeight: 600, marginBottom: "12px", fontSize: "12px" }}>Message Flow</div>
          <ol style={{ color: colors.muted, fontSize: "12px", margin: 0, paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>Tipper generates random AES-256 key</li>
            <li>Message encrypted with AES-GCM</li>
            <li>AES key encrypted with creator&apos;s RSA public key</li>
            <li>Encrypted bundle (key + nonce + ciphertext) sent to server</li>
            <li>Server relays blob to creator via WebSocket</li>
            <li>Dashboard decrypts AES key with local RSA private key</li>
            <li>Message decrypted with AES key</li>
          </ol>
        </div>
      </section>

      {/* Privacy Guarantees */}
      <CollapsibleSection title="Privacy Guarantees">
        <div style={{ paddingTop: "16px" }}>
          <div style={{ display: "grid", gap: "16px", fontSize: "13px" }}>
            {[
              { title: "Sender privacy", desc: "Tipper's identity is not linked to the final shielded transaction" },
              { title: "Receiver privacy", desc: "Creator's shielded address is not visible on transparent chains" },
              { title: "Amount privacy", desc: "Final tip amount is encrypted. Only the creator can see it." },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ color: colors.primary }}>→</span>
                <div>
                  <span style={{ fontWeight: 600, color: colors.textBright }}>{item.title}</span>
                  <p style={{ color: colors.muted, margin: "4px 0 0" }}>{item.desc}</p>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", borderTop: `1px solid ${colors.border}`, paddingTop: "16px", marginTop: "4px" }}>
              <span style={{ color: colors.muted }}>!</span>
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
    </>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("tippers");
  const isMobile = useIsMobile(640);

  // Handle URL hash for deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as TabId;
      if (["tippers", "creators", "technical"].includes(hash)) {
        setActiveTab(hash);
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 50%, ${colors.bgGradientStart} 100%)`,
        color: colors.text,
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Atmospheric overlays */}
      <div className="noise-overlay" />
      <div className="scanlines" />

      <SiteHeader activePage="docs" />

      {/* Main content */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "100px 16px 48px" : "120px 24px 64px" }}>
        <div style={{ marginBottom: "64px" }}>
          <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "2px", marginBottom: "16px" }}>
            // DOCUMENTATION
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "16px", lineHeight: 1.2, color: colors.textBright }}>
            How TIPZ Works
          </h1>
          <p style={{ color: colors.muted, fontSize: "14px", lineHeight: 1.6 }}>
            Send a tip in 30 seconds. Any token. Private delivery.
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Content */}
        {activeTab === "tippers" && <TippersTab />}
        {activeTab === "creators" && <CreatorsTab />}
        {activeTab === "technical" && <TechnicalTab />}

        {/* CTA - Dual Path */}
        <section
          style={{
            padding: isMobile ? "32px 20px" : "48px 32px",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "4px",
            marginTop: isMobile ? "40px" : "64px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "32px" : "32px" }}>
            {/* For Creators */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "12px" }}>FOR CREATORS</div>
              <h2 style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: 700, marginBottom: "12px", color: colors.textBright }}>Start receiving private tips</h2>
              <p style={{ color: colors.muted, marginBottom: "24px", fontSize: "13px" }}>Register in under 2 minutes. Just your X handle and Zcash address.</p>
              <Link
                href="/register"
                style={{
                  display: "inline-block",
                  backgroundColor: colors.primary,
                  color: colors.bg,
                  padding: isMobile ? "12px 24px" : "14px 32px",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  borderRadius: "4px",
                }}
              >
                Register Now →
              </Link>
            </div>

            {/* For Tippers */}
            <div style={{ textAlign: "center", borderLeft: isMobile ? "none" : `1px solid ${colors.border}`, borderTop: isMobile ? `1px solid ${colors.border}` : "none", paddingLeft: isMobile ? 0 : "32px", paddingTop: isMobile ? "32px" : 0 }}>
              <div style={{ fontSize: "11px", color: colors.muted, letterSpacing: "1px", marginBottom: "12px" }}>FOR SUPPORTERS</div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: colors.textBright }}>Support a creator now</h2>
              <p style={{ color: colors.muted, marginBottom: "24px", fontSize: "13px" }}>No signup. Connect wallet, pick amount, done.</p>
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
                  borderRadius: "4px",
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
          padding: isMobile ? "32px 16px" : "40px 48px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: "center",
          gap: isMobile ? "20px" : undefined,
          borderTop: `1px solid ${colors.border}`,
          fontSize: "12px",
          backgroundColor: colors.surface,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <TipzLogo size={16} />
          <span style={{ color: colors.muted, fontSize: "10px", letterSpacing: "1px" }}>v0.1.0-beta</span>
        </div>
        <div style={{ display: "flex", gap: isMobile ? "20px" : "32px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/manifesto" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>MANIFESTO</Link>
          <span style={{ color: colors.primary, fontSize: "11px", letterSpacing: "1px", fontWeight: 600 }}>DOCS</span>
          <Link href="/my" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>MY TIPZ</Link>
          <a href="https://github.com/tipz-app" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>GITHUB</a>
          <a href="https://x.com/tipz_cash" target="_blank" rel="noopener noreferrer" style={{ color: colors.muted, textDecoration: "none", fontSize: "11px", letterSpacing: "1px" }}>X</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.muted }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: colors.primary }} />
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
          opacity: 0.02;
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
          opacity: 0.1;
        }

        /* Docs tabs responsive */
        @media (max-width: 640px) {
          .docs-tabs {
            gap: 16px !important;
            margin-bottom: 32px !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .docs-tabs button {
            white-space: nowrap;
            font-size: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .docs-tabs {
            gap: 12px !important;
          }
        }

        /* Make all docs grids responsive */
        @media (max-width: 640px) {
          main section > div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          /* Fix main container padding */
          main {
            padding: 48px 16px !important;
          }
          /* Fix footer */
          footer {
            flex-direction: column !important;
            gap: 24px !important;
            padding: 32px 16px !important;
            text-align: center;
          }
          footer > div {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
