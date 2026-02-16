"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { colors } from "@/lib/colors";

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
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      color: colors.muted,
      fontSize: "11px",
      letterSpacing: "1px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      ZEC {price ? `$${price.toFixed(2)}` : "—"}
    </span>
  );
}

const navLinks = [
  { href: "/creators", label: "CREATORS", key: "creators" },
  { href: "/manifesto", label: "MANIFESTO", key: "manifesto" },
  { href: "/docs", label: "DOCS", key: "docs" },
] as const;

const navLinkStyle: React.CSSProperties = {
  color: colors.muted,
  textDecoration: "none",
  fontSize: "11px",
  letterSpacing: "1px",
  transition: "color 0.2s",
  fontFamily: "'JetBrains Mono', monospace",
};

const activeLinkStyle: React.CSSProperties = {
  ...navLinkStyle,
  color: colors.primary,
  fontWeight: 600,
  textShadow: `0 0 10px ${colors.primaryGlow}`,
};

const mobileLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "16px 0",
  color: colors.text,
  textDecoration: "none",
  fontSize: "14px",
  letterSpacing: "1px",
  borderBottom: `1px solid ${colors.border}`,
};

const mobileActiveLinkStyle: React.CSSProperties = {
  ...mobileLinkStyle,
  color: colors.primary,
  fontWeight: 600,
};

interface SiteHeaderProps {
  activePage?: "home" | "creators" | "manifesto" | "docs" | "my";
}

export default function SiteHeader({ activePage }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: `${colors.bg}f0`,
        backdropFilter: "blur(12px)",
        zIndex: 100,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div className="site-header-inner" style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <span style={{
              color: colors.primary,
              fontWeight: 700,
              fontSize: "18px",
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: `0 0 20px ${colors.primaryGlow}`,
            }}>[TIPZ]</span>
            <span style={{
              color: colors.muted,
              fontSize: "10px",
              letterSpacing: "1px",
              padding: "2px 6px",
              border: `1px solid ${colors.border}`,
              borderRadius: "2px",
            }}>BETA</span>
          </Link>

          <nav className="site-desktop-nav" style={{ gap: "32px", alignItems: "center" }}>
            <ZecTicker />
            <span style={{ color: colors.border }}>|</span>
            {navLinks.map((link) => (
              activePage === link.key ? (
                <span key={link.key} style={activeLinkStyle}>{link.label}</span>
              ) : (
                <Link key={link.key} href={link.href} style={navLinkStyle}>{link.label}</Link>
              )
            ))}
            <span style={{ color: colors.border }}>|</span>
            {activePage === "my" ? (
              <span style={activeLinkStyle}>MY TIPZ</span>
            ) : (
              <Link href="/my" style={navLinkStyle}>MY TIPZ</Link>
            )}
            <Link
              href="/register"
              className="cta-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: `linear-gradient(135deg, ${colors.primary} 0%, #e89b1c 40%, ${colors.primaryHover} 100%)`,
                color: colors.bg,
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "0.5px",
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: "8px",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: `0 0 20px ${colors.primaryGlow}, 0 4px 12px rgba(0,0,0,0.3)`,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Claim Your Tipz ID
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="site-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
            <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 200,
            }}
          />
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "280px",
            maxWidth: "80vw",
            background: colors.bg,
            borderLeft: `1px solid ${colors.border}`,
            zIndex: 201,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflowY: "auto",
          }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                alignSelf: "flex-end",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                marginBottom: "16px",
              }}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
              <ZecTicker />
            </div>
            {navLinks.map((link) => (
              activePage === link.key ? (
                <span key={link.key} style={mobileActiveLinkStyle}>{link.label}</span>
              ) : (
                <Link key={link.key} href={link.href} onClick={() => setMobileMenuOpen(false)} style={mobileLinkStyle}>{link.label}</Link>
              )
            ))}
            <div style={{ height: "1px", background: colors.border, margin: "4px 0" }} />
            {activePage === "my" ? (
              <span style={mobileActiveLinkStyle}>MY TIPZ</span>
            ) : (
              <Link href="/my" onClick={() => setMobileMenuOpen(false)} style={mobileLinkStyle}>MY TIPZ</Link>
            )}
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "16px",
                padding: "16px",
                background: `linear-gradient(135deg, ${colors.primary} 0%, #e89b1c 40%, ${colors.primaryHover} 100%)`,
                color: colors.bg,
                textDecoration: "none",
                fontSize: "14px",
                letterSpacing: "0.5px",
                fontWeight: 600,
                borderRadius: "8px",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: `0 0 20px ${colors.primaryGlow}, 0 4px 12px rgba(0,0,0,0.3)`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Claim Your Tipz ID
            </Link>
          </div>
        </>
      )}

      <style>{`
        .site-header-inner {
          padding: 20px 48px;
        }
        .site-desktop-nav {
          display: flex;
        }
        .site-mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .site-header-inner {
            padding: 16px;
          }
          .site-desktop-nav {
            display: none !important;
          }
          .site-mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
