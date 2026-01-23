"use client";

import { useState } from "react";
import { colors } from "@/lib/colors";

interface Creator {
  id: string;
  platform: string;
  handle: string;
  shielded_address: string;
  created_at: string;
}

// Generate a consistent hue from a string
function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

interface CreatorCardProps {
  creator: Creator;
  index: number;
}

export function CreatorCard({ creator, index }: CreatorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hue = hashToHue(creator.handle);

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
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textDecoration: "none",
          cursor: "pointer",
          background: colors.cardBg,
          border: `1px solid ${isHovered ? colors.cardBorderHover : colors.cardBorder}`,
          borderRadius: "16px",
          padding: "32px 24px",
          opacity: 0,
          animation: "fadeInUp 0.4s ease forwards",
          animationDelay: `${index * 0.05}s`,
          transition: "all 0.25s ease",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: isHovered
            ? `0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${colors.cardBorderHover}`
            : "0 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Avatar with gold ring on hover */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          {/* Gold ring - visible on hover */}
          <div
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              background: colors.gradientGold,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          />
          {/* Avatar */}
          <div
            style={{
              position: "relative",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, hsl(${hue}, 50%, 35%) 0%, hsl(${hue}, 60%, 25%) 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#fff",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
              border: `2px solid ${isHovered ? "transparent" : colors.border}`,
              transition: "border-color 0.25s ease",
            }}
          >
            {creator.handle[0]}
          </div>
        </div>

        {/* Handle */}
        <h3
          style={{
            color: colors.textBright,
            fontSize: "16px",
            fontWeight: 600,
            margin: "0 0 12px",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "-0.01em",
          }}
        >
          @{creator.handle}
        </h3>

        {/* Shielded badge - minimal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.15)",
            borderRadius: "100px",
            fontSize: "10px",
            fontWeight: 600,
            color: colors.success,
            letterSpacing: "0.5px",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: colors.success,
            }}
          />
          SHIELDED
        </div>

        {/* View CTA - subtle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: isHovered ? colors.primary : colors.muted,
            fontSize: "12px",
            fontWeight: 500,
            transition: "color 0.25s ease",
          }}
        >
          View
          <span
            style={{
              transition: "transform 0.2s ease",
              transform: isHovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            →
          </span>
        </div>
      </a>
    </>
  );
}

// Skeleton Card for loading state
export function SkeletonCard({ index }: { index: number }) {
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
        @keyframes shimmerSkeleton {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
      `}</style>
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: "16px",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          animation: `fadeInUp 0.4s ease forwards, shimmerSkeleton 1.5s infinite`,
          animationDelay: `${index * 0.05}s`,
          opacity: 0,
        }}
      >
        {/* Avatar skeleton */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: colors.border,
            marginBottom: "4px",
          }}
        />
        {/* Handle skeleton */}
        <div
          style={{
            width: "100px",
            height: "18px",
            borderRadius: "4px",
            background: colors.border,
          }}
        />
        {/* Badge skeleton */}
        <div
          style={{
            width: "80px",
            height: "22px",
            borderRadius: "100px",
            background: colors.border,
          }}
        />
        {/* CTA skeleton */}
        <div
          style={{
            width: "50px",
            height: "14px",
            borderRadius: "4px",
            background: colors.border,
          }}
        />
      </div>
    </>
  );
}
