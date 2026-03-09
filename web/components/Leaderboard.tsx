"use client"

import { useEffect, useState } from "react"
import { colors } from "@/lib/colors"
import { useAvatarFallback } from "@/hooks/useAvatarFallback"
import { hashToHue } from "@/components/CreatorCard"

interface RecentCreator {
  id: string
  handle: string
  avatar_url?: string
  created_at: string
}

interface LeaderboardProps {
  prefersReducedMotion?: boolean
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export function Leaderboard({ prefersReducedMotion = false }: LeaderboardProps) {
  const [creators, setCreators] = useState<RecentCreator[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/creators?limit=3&offset=0")
        const data = await res.json()
        setCreators(data.creators ?? [])
      } catch (error) {
        console.error("[RecentlyJoined] Fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecent()
  }, [])

  if (isLoading) {
    return (
      <>
        <style jsx>{`
          @keyframes skeletonPulse {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.6;
            }
          }
          @keyframes skeletonFadeIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
                height: "90px",
                background: "rgba(26, 26, 26, 0.6)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
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

  if (creators.length === 0) {
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
        {/* Section header */}
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
              fontFamily: "var(--font-family-mono)",
              textTransform: "uppercase",
            }}
          >
            Recently Joined
          </h2>
        </div>

        {/* Recent creators row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
            gap: "16px",
            position: "relative",
          }}
        >
          {creators.map((creator, index) => (
            <RecentCreatorCard
              key={creator.id}
              creator={creator}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </>
  )
}

interface RecentCreatorCardProps {
  creator: RecentCreator
  index: number
  prefersReducedMotion: boolean
}

function RecentCreatorCard({ creator, index, prefersReducedMotion }: RecentCreatorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { imgFailed, onImgError } = useAvatarFallback(creator.avatar_url)
  const hue = hashToHue(creator.handle)
  const accentColor = colors.primary // tipz gold

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

      <a
        href={`/${creator.handle}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "20px 24px",
          background: "rgba(26, 26, 26, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: `1px solid ${isHovered ? `${accentColor}60` : `${accentColor}20`}`,
          borderLeft: `1px solid ${isHovered ? `${accentColor}30` : "rgba(255, 255, 255, 0.08)"}`,
          borderRight: `1px solid ${isHovered ? `${accentColor}30` : "rgba(255, 255, 255, 0.08)"}`,
          borderBottom: `1px solid ${isHovered ? `${accentColor}20` : "rgba(0, 0, 0, 0.3)"}`,
          borderRadius: "16px",
          textDecoration: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          minWidth: "96px",
          flex: 1,
          maxWidth: "180px",
          opacity: 0,
          animation: prefersReducedMotion ? "none" : `fadeInUp 0.5s ease forwards`,
          animationDelay: `${0.1 + index * 0.1}s`,
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: isHovered
            ? `0 16px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(245, 166, 35, 0.15)`
            : `0 4px 16px rgba(0, 0, 0, 0.3)`,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${isHovered ? accentColor : colors.border}`,
            transition: "border-color 0.3s ease",
            flexShrink: 0,
          }}
        >
          {creator.avatar_url && !imgFailed ? (
            <img
              src={creator.avatar_url}
              alt={creator.handle}
              onError={onImgError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, hsl(${hue}, 50%, 35%) 0%, hsl(${hue}, 60%, 25%) 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                textTransform: "uppercase",
                fontFamily: "var(--font-family-mono)",
              }}
            >
              {creator.handle[0]}
            </div>
          )}
        </div>

        {/* Handle */}
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: colors.textBright,
            fontFamily: "var(--font-family-mono)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          @{creator.handle}
        </span>

        {/* Joined time */}
        <span
          style={{
            fontSize: "11px",
            color: colors.muted,
            fontFamily: "var(--font-family-mono)",
          }}
        >
          {timeAgo(creator.created_at)}
        </span>
      </a>
    </>
  )
}
