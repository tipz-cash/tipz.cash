"use client"

import { useEffect, useState } from "react"
import { colors } from "@/lib/colors"

interface LeaderboardEntry {
  rank: number
  handle: string
  tip_count: number
  tier: "bronze" | "silver" | "gold"
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  demo: boolean
}

// Tier colors: gold, silver, bronze (based on rank position)
const tierColors = {
  gold: "#F5A623",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
}

const tierGlows = {
  gold: "rgba(245, 166, 35, 0.4)",
  silver: "rgba(192, 192, 192, 0.3)",
  bronze: "rgba(205, 127, 50, 0.3)",
}

const tierGlowsStrong = {
  gold: "rgba(245, 166, 35, 0.6)",
  silver: "rgba(192, 192, 192, 0.5)",
  bronze: "rgba(205, 127, 50, 0.5)",
}

// Get tier based on rank position
function getTierFromRank(rank: number): "gold" | "silver" | "bronze" {
  if (rank === 1) return "gold"
  if (rank === 2) return "silver"
  return "bronze"
}

// Privacy: Fuzzy buckets to prevent oracle attacks
function getSignalBucket(count: number): string {
  if (count >= 200) return "200+ Tipz"
  if (count >= 100) return "100+ Tipz"
  if (count >= 50) return "50+ Tipz"
  if (count >= 10) return "10+ Tipz"
  return "Tipz"  // 1-9 tips, no number shown
}

interface LeaderboardProps {
  prefersReducedMotion?: boolean
}

export function Leaderboard({ prefersReducedMotion = false }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard?limit=3")
        const data: LeaderboardResponse = await res.json()
        setLeaderboard(data.leaderboard)
        setIsDemo(data.demo)
      } catch (error) {
        console.error("[Leaderboard] Fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <>
        <style jsx>{`
          @keyframes skeletonPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          @keyframes skeletonFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            margin: "0 auto 32px",
            maxWidth: "600px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "100%",
                maxWidth: "160px",
                height: "100px",
                background: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderTop: "1px solid rgba(245, 166, 35, 0.2)",
                border: `1px solid ${colors.border}`,
                borderRadius: "16px",
                animation: prefersReducedMotion
                  ? "none"
                  : `skeletonFadeIn 0.4s ease forwards, skeletonPulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      </>
    )
  }

  if (leaderboard.length === 0) {
    return null
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          maxWidth: "640px",
          margin: "0 auto 40px",
          padding: "0 24px",
        }}
      >
        {/* Section header with stagger animation */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
            position: "relative",
            opacity: 0,
            animation: prefersReducedMotion ? "none" : "fadeInUp 0.5s ease forwards",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "2px",
              color: colors.muted,
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
            }}
          >
            Most Supported
          </h2>
        </div>

        {/* Leaderboard entries - podium style (2nd, 1st, 3rd) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "16px",
            position: "relative",
          }}
        >
          {/* Reorder for podium: 2nd place left, 1st place center, 3rd place right */}
          {[leaderboard[1], leaderboard[0], leaderboard[2]]
            .filter(Boolean)
            .map((entry, index) => (
              <LeaderboardCard
                key={entry.handle}
                entry={entry}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
        </div>

        {/* Demo indicator */}
        {isDemo && (
          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
              fontSize: "9px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1px",
              color: colors.muted,
              opacity: 0,
              animation: prefersReducedMotion
                ? "none"
                : "fadeInUp 0.5s ease forwards",
              animationDelay: "0.4s",
            }}
          >
            DEMO
          </div>
        )}
      </div>
    </>
  )
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  index: number
  prefersReducedMotion: boolean
}

function LeaderboardCard({ entry, index, prefersReducedMotion }: LeaderboardCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  // Use rank-based tier (1st = gold, 2nd = silver, 3rd = bronze)
  const tier = getTierFromRank(entry.rank)
  const tierColor = tierColors[tier]
  const tierGlow = tierGlows[tier]
  const tierGlowStrong = tierGlowsStrong[tier]

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rankBadgePop {
          0% {
            transform: translateX(-50%) scale(0);
            opacity: 0;
          }
          60% {
            transform: translateX(-50%) scale(1.15);
          }
          100% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
        }

      `}</style>

      <a
        href={`/${entry.handle}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          // @ts-expect-error CSS custom property
          "--tier-glow": tierGlow,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          padding: "20px 24px",
          // Podium height: 1st place elevated above others
          marginBottom: entry.rank === 1 ? 24 : 0,
          // Glassmorphism background
          background: "rgba(26, 26, 26, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          // Gradient top border for premium feel
          borderTop: `1px solid ${isHovered ? tierColor : `${tierColor}40`}`,
          borderLeft: `1px solid ${isHovered ? `${tierColor}50` : "rgba(255, 255, 255, 0.08)"}`,
          borderRight: `1px solid ${isHovered ? `${tierColor}50` : "rgba(255, 255, 255, 0.08)"}`,
          borderBottom: `1px solid ${isHovered ? `${tierColor}30` : "rgba(0, 0, 0, 0.3)"}`,
          borderRadius: "16px",
          textDecoration: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          minWidth: "140px",
          flex: 1,
          maxWidth: "180px",
          // Staggered entrance animation
          opacity: 0,
          animation: prefersReducedMotion
            ? "none"
            : `fadeInUp 0.5s ease forwards`,
          animationDelay: `${0.1 + index * 0.1}s`,
          // 3D perspective hover effect
          transform: isHovered
            ? "translateY(-6px) perspective(1000px) rotateX(2deg)"
            : "translateY(0) perspective(1000px) rotateX(0deg)",
          // Always-on tier glow + intensify on hover
          boxShadow: isHovered
            ? `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px ${tierGlowStrong}`
            : `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 16px ${tierGlow}`,
        }}
      >
        {/* Rank badge with pop animation */}
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${tierColor} 0%, ${tierColor}dd 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 700,
            color: colors.bg,
            fontFamily: "'JetBrains Mono', monospace",
            boxShadow: `0 0 16px ${tierGlow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            opacity: 0,
            animation: prefersReducedMotion
              ? "none"
              : "rankBadgePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
            animationDelay: `${0.3 + index * 0.1}s`,
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          {entry.rank}
        </div>

        {/* Handle with text glow on hover */}
        <span
          style={{
            marginTop: "12px",
            fontSize: "14px",
            fontWeight: 600,
            color: colors.textBright,
            fontFamily: "'JetBrains Mono', monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            transition: "text-shadow 0.3s ease",
            textShadow: isHovered ? `0 0 12px ${tierColor}` : "none",
          }}
        >
          @{entry.handle}
        </span>

        {/* Tip count with enhanced tier badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: colors.muted,
              fontFamily: "'JetBrains Mono', monospace",
              transition: "color 0.3s ease",
            }}
          >
            {getSignalBucket(entry.tip_count)}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              opacity: isHovered ? 1 : 0.7,
              transition: "opacity 0.3s ease",
              filter: isHovered ? `drop-shadow(0 0 4px ${tierGlow})` : "none",
            }}
          >
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke={tierColor}
              strokeWidth="1.5"
              fill={`${tierColor}15`}
            />
          </svg>
        </div>
      </a>
    </>
  )
}
