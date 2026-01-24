"use client";

import { useEffect, useState } from "react";
// Plain [TIPZ] text logo used throughout
import { CreatorCard, SkeletonCard } from "@/components/CreatorCard";
import { colors } from "@/lib/colors";
import { animationKeyframes } from "@/lib/animations";

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
              padding: "20px 48px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <a
              href="/"
              style={{ display: "flex", alignItems: "center", gap: "16px", textDecoration: "none" }}
            >
              <span style={{
                color: colors.primary,
                fontWeight: 700,
                fontSize: "18px",
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
              </a>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main style={{ position: "relative", zIndex: 1 }}>
          {/* Hero section */}
          <section
            style={{
              textAlign: "center",
              padding: "80px 24px 60px",
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
          <section style={{ padding: "0 24px 80px" }}>
            {loading ? (
              // Loading skeleton
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "24px",
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "24px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                  }}
                >
                  {creators.map((creator, index) => (
                    <CreatorCard key={creator.id} creator={creator} index={index} />
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
              padding: "40px 24px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "24px",
                color: colors.muted,
                fontSize: "12px",
                fontFamily: "monospace",
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
