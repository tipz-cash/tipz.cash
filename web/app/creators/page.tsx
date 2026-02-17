"use client";

import { useEffect, useState } from "react";
import { CreatorCard, SkeletonCard, Creator } from "@/components/CreatorCard";
import { CreatorModal } from "@/components/CreatorModal";
import { ActivityTicker } from "@/components/ActivityTicker";
import { Leaderboard } from "@/components/Leaderboard";
import { LetterGridBackground } from "@/components/LetterGridBackground";
import { colors } from "@/lib/colors";
import { animationKeyframes } from "@/lib/animations";
import SiteHeader from "@/components/SiteHeader";

interface ApiResponse {
  creators: Creator[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const limit = 50;

  // Filter creators based on search query
  const filteredCreators = creators.filter((creator) =>
    creator.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          overflow-x: hidden;
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

        .hero-section {
          text-align: center;
          padding: 80px 24px 60px;
          max-width: 800px;
          margin: 0 auto;
        }

        .creators-grid-section {
          padding: 0 24px 80px;
        }

        .creators-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-stats {
          text-align: center;
          padding: 40px 24px;
          border-top: 1px solid ${colors.border};
        }

        .footer-stats-inner {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          color: ${colors.muted};
          font-size: 12px;
          font-family: monospace;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 80px 16px 32px;
          }

          .creators-grid-section {
            padding: 0 16px 48px;
          }

          .creators-grid {
            gap: 16px;
          }

          .footer-stats {
            padding: 24px 16px;
          }

          .footer-stats-inner {
            gap: 12px;
            font-size: 11px;
          }
        }

        @media (max-width: 428px) {
          .creators-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
        }

        @media (max-width: 375px) {
          .creators-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .creators-grid-section {
            padding: 0 12px 32px;
          }
          .hero-section {
            padding: 80px 12px 24px;
          }
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

        <SiteHeader activePage="creators" />

        {/* Letter grid background - fixed behind all main content */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <LetterGridBackground fillCenter />
        </div>

        {/* Main content */}
        <main style={{ position: "relative", zIndex: 1 }}>
          {/* Hero section */}
          <section className="hero-section">
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 700,
                color: colors.textBright,
                margin: "0 0 16px",
                letterSpacing: "-1px",
              }}
            >
              The Sovereign Directory.
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: colors.muted,
                margin: "0 0 32px",
                fontFamily: "monospace",
              }}
            >
              The uncensorable voices of the new web.
            </p>

            {/* Leaderboard - Top supported creators by tip count */}
            <Leaderboard />

            {/* Search Bar */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "8px",
            }}>
              <div style={{
                position: "relative",
                width: "100%",
                maxWidth: "400px",
              }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.muted}
                  strokeWidth="2"
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 48px",
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    color: colors.textBright,
                    fontSize: "16px",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>
            </div>

          </section>

          {/* Activity Ticker - Social proof before browsing */}
          <ActivityTicker />

          {/* Creators grid */}
          <section className="creators-grid-section">
            {loading ? (
              // Loading skeleton
              <div className="creators-grid">
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
            ) : filteredCreators.length === 0 && searchQuery ? (
              // No search results
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
                  No creators found
                </p>
                <p style={{ color: colors.muted, margin: "0 0 24px" }}>
                  No results for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "transparent",
                    color: colors.primary,
                    border: `1px solid ${colors.primary}`,
                    padding: "12px 24px",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  CLEAR SEARCH
                </button>
              </div>
            ) : (
              // Creators grid
              <>
                <div className="creators-grid">
                  {filteredCreators.map((creator, index) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      index={index}
                      onClick={() => {
                        // If creator has a shielded address, navigate to their tip page
                        if (creator.shielded_address) {
                          window.location.href = `/${creator.handle}`;
                        } else {
                          // Otherwise show the invite modal
                          setSelectedCreator(creator);
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Load more button */}
                {hasMore && !searchQuery && (
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
          <section className="footer-stats">
            <div className="footer-stats-inner">
              <span>{total} creators</span>
              <span style={{ color: colors.border }}>•</span>
              <span>0% fees</span>
              <span style={{ color: colors.border }}>•</span>
              <span>unlinkable</span>
            </div>
          </section>
        </main>

        {/* Creator Modal */}
        {selectedCreator && (
          <CreatorModal
            creator={selectedCreator}
            onClose={() => setSelectedCreator(null)}
          />
        )}
      </div>
    </>
  );
}
