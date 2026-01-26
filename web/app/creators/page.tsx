"use client";

import { useEffect, useState } from "react";
// Plain [TIPZ] text logo used throughout
import { CreatorCard, SkeletonCard } from "@/components/CreatorCard";
import { colors } from "@/lib/colors";
import { animationKeyframes } from "@/lib/animations";
import { useResponsive } from "@/hooks/useResponsive";

interface Creator {
  id: string;
  platform: string;
  handle: string;
  shielded_address: string;
  created_at: string;
}

interface ApiResponse {
  creators: Creator[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  isDemo?: boolean;
}

// ZEC Ticker component (simplified version)
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
    <span style={{ color: colors.muted, fontSize: "11px", letterSpacing: "1px" }}>
      ZEC {price ? `$${price.toFixed(2)}` : "—"}
    </span>
  );
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isSm } = useResponsive();
  const limit = 50;

  async function fetchCreators(newOffset: number = 0, append: boolean = false) {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await fetch(`/api/creators?limit=${limit}&offset=${newOffset}`);
      if (!res.ok) throw new Error("Failed to fetch creators");

      const data: ApiResponse = await res.json();

      if (append) {
        setCreators((prev) => [...prev, ...data.creators]);
      } else {
        setCreators(data.creators);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
      setOffset(newOffset);
      setIsDemo(data.isDemo ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchCreators();
  }, []);

  function handleLoadMore() {
    if (!loadingMore && hasMore) {
      fetchCreators(offset + limit, true);
    }
  }

  return (
    <>
      {/* Global styles and keyframes */}
      <style jsx global>{`
        ${animationKeyframes}

        html {
          background: ${colors.pageBg};
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
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
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: colors.pageBg,
          color: colors.text,
        }}
      >
        {/* Grid texture background */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `linear-gradient(${colors.border}15 1px, transparent 1px), linear-gradient(90deg, ${colors.border}15 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: `${colors.pageBg}ee`,
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: isMobile ? "16px" : "20px 48px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <a
              href="/"
              style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px", textDecoration: "none" }}
            >
              <span style={{
                color: colors.primary,
                fontWeight: 700,
                fontSize: isMobile ? "16px" : "18px",
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 20px ${colors.primaryGlow}`,
              }}>[TIPZ]</span>
              <span
                style={{
                  color: colors.muted,
                  fontSize: "10px",
                  letterSpacing: "1px",
                  padding: "2px 6px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "2px",
                }}
              >
                BETA
              </span>
            </a>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                <ZecTicker />
                <span style={{ color: colors.border }}>|</span>
                <a
                  href="/creators"
                  style={{
                    color: colors.primary,
                    textDecoration: "none",
                    fontSize: "11px",
                    letterSpacing: "1px",
                  }}
                >
                  CREATORS
                </a>
                <a
                  href="/manifesto"
                  style={{
                    color: colors.muted,
                    textDecoration: "none",
                    fontSize: "11px",
                    letterSpacing: "1px",
                  }}
                >
                  MANIFESTO
                </a>
                <a
                  href="/docs"
                  style={{
                    color: colors.muted,
                    textDecoration: "none",
                    fontSize: "11px",
                    letterSpacing: "1px",
                  }}
                >
                  DOCS
                </a>
                <a
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
                </a>
              </nav>
            )}

            {/* Mobile Hamburger Button */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  minWidth: "44px",
                  minHeight: "44px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Open menu"
              >
                <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
                <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
                <span style={{ width: "20px", height: "2px", background: colors.text, borderRadius: "1px" }} />
              </button>
            )}
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.7)",
                zIndex: 200,
              }}
            />
            {/* Drawer */}
            <div
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "280px",
                maxWidth: "80vw",
                background: colors.pageBg,
                borderLeft: `1px solid ${colors.border}`,
                zIndex: 201,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {/* Close Button */}
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

              {/* ZEC Ticker */}
              <div style={{ padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
                <ZecTicker />
              </div>

              {/* Nav Links */}
              <a
                href="/creators"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "16px 0",
                  color: colors.primary,
                  textDecoration: "none",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: 600,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                CREATORS
              </a>
              <a
                href="/manifesto"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "16px 0",
                  color: colors.text,
                  textDecoration: "none",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                MANIFESTO
              </a>
              <a
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "16px 0",
                  color: colors.text,
                  textDecoration: "none",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                DOCS
              </a>

              {/* CTA Button */}
              <a
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  marginTop: "16px",
                  padding: "16px",
                  color: colors.bg,
                  backgroundColor: colors.primary,
                  textDecoration: "none",
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                START EARNING
              </a>
            </div>
          </>
        )}

        {/* Main content */}
        <main style={{ position: "relative", zIndex: 1 }}>
          {/* Hero section */}
          <section
            style={{
              textAlign: "center",
              padding: isMobile ? "40px 16px 32px" : "80px 24px 60px",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 700,
                color: colors.textBright,
                margin: "0 0 16px",
                letterSpacing: "-1px",
              }}
            >
              TIP A CREATOR
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: colors.muted,
                margin: 0,
                fontFamily: "monospace",
              }}
            >
              Private. Zero fees. 100% goes to them.
            </p>

            {/* Demo mode indicator */}
            {isDemo && !loading && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "24px",
                  padding: "8px 16px",
                  background: "rgba(245, 166, 35, 0.1)",
                  border: `1px solid ${colors.primary}40`,
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: colors.primary,
                  letterSpacing: "1px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: colors.primary,
                    animation: "pulse 2s infinite",
                  }}
                />
                DEMO MODE
              </div>
            )}
          </section>

          {/* Creators grid */}
          <section style={{ padding: isMobile ? "0 16px 48px" : "0 24px 80px" }}>
            {loading ? (
              // Loading skeleton
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isSm ? "repeat(auto-fill, minmax(140px, 1fr))" : "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: isMobile ? "16px" : "24px",
                  maxWidth: "1200px",
                  margin: "0 auto",
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} index={i} />
                ))}
              </div>
            ) : error ? (
              // Error state
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "16px",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                <p style={{ color: colors.muted, margin: "0 0 24px" }}>{error}</p>
                <button
                  onClick={() => fetchCreators()}
                  style={{
                    background: colors.primary,
                    color: colors.bg,
                    border: "none",
                    padding: "12px 24px",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  TRY AGAIN
                </button>
              </div>
            ) : creators.length === 0 ? (
              // Empty state
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "16px",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                <p
                  style={{
                    color: colors.textBright,
                    fontSize: "18px",
                    fontWeight: 600,
                    margin: "0 0 8px",
                  }}
                >
                  No creators yet
                </p>
                <p style={{ color: colors.muted, margin: "0 0 24px" }}>Be the first to register</p>
                <a
                  href="/register"
                  style={{
                    display: "inline-block",
                    background: colors.primary,
                    color: colors.bg,
                    textDecoration: "none",
                    padding: "12px 24px",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    borderRadius: "4px",
                  }}
                >
                  REGISTER NOW
                </a>
              </div>
            ) : (
              // Creators grid
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isSm ? "repeat(auto-fill, minmax(140px, 1fr))" : "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: isMobile ? "16px" : "24px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                  }}
                >
                  {creators.map((creator, index) => (
                    <CreatorCard key={creator.id} creator={creator} index={index} compact={isSm} />
                  ))}
                </div>

                {/* Load more button */}
                {hasMore && (
                  <div style={{ textAlign: "center", marginTop: "48px" }}>
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{
                        background: "transparent",
                        color: colors.muted,
                        border: `1px solid ${colors.border}`,
                        padding: "16px 32px",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "1px",
                        cursor: loadingMore ? "not-allowed" : "pointer",
                        borderRadius: "4px",
                        transition: "all 0.2s",
                        opacity: loadingMore ? 0.5 : 1,
                      }}
                    >
                      {loadingMore ? "LOADING..." : "LOAD MORE"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Footer stats */}
          <section
            style={{
              textAlign: "center",
              padding: isMobile ? "24px 16px" : "40px 24px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: isMobile ? "12px" : "24px",
                color: colors.muted,
                fontSize: isMobile ? "11px" : "12px",
                fontFamily: "monospace",
                flexWrap: "wrap",
              }}
            >
              <span>{total} creators</span>
              <span style={{ color: colors.border }}>•</span>
              <span>0% fees</span>
              <span style={{ color: colors.border }}>•</span>
              <span>unlinkable</span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
