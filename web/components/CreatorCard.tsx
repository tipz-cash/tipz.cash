"use client";

import { useState } from "react";
import { colors } from "@/lib/colors";

export interface Creator {
  id: string;
  platform: string;
  handle: string;
  shielded_address: string;
  created_at: string;
  avatar_url?: string;
  is_og_cypherpunk?: boolean;
}

// Generate a consistent hue from a string
export function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

interface CreatorCardProps {
  creator: Creator;
  index: number;
  compact?: boolean;
  onClick?: () => void;
}

export function CreatorCard({ creator, index, compact = false, onClick }: CreatorCardProps) {
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

      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textDecoration: "none",
          cursor: "pointer",
          background: "rgba(26, 26, 26, 0.6)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          borderTop: "1px solid rgba(255, 215, 0, 0.5)",
          borderLeft: isHovered ? "1px solid rgba(255, 215, 0, 0.3)" : "none",
          borderRight: isHovered ? "1px solid rgba(255, 215, 0, 0.3)" : "none",
          borderBottom: isHovered ? "1px solid rgba(255, 215, 0, 0.3)" : "1px solid rgba(0, 0, 0, 0.8)",
          borderRadius: compact ? "16px" : "24px",
          padding: compact ? "20px 16px" : "32px 24px",
          opacity: 0,
          animation: "fadeInUp 0.4s ease forwards",
          animationDelay: `${index * 0.05}s`,
          transition: "all 0.25s ease",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: isHovered
            ? `0 16px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
            : "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          overflow: "hidden",
        }}
      >
        {/* Avatar with gold ring on hover */}
        <div
          style={{
            position: "relative",
            width: compact ? "56px" : "72px",
            height: compact ? "56px" : "72px",
            marginBottom: compact ? "12px" : "16px",
          }}
        >
          {/* Gold ring - visible on hover */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: compact ? "62px" : "78px",
              height: compact ? "62px" : "78px",
              borderRadius: "50%",
              background: "transparent",
              border: "2px solid #F5A623",
              boxShadow: isHovered
                ? "0 0 12px rgba(245, 166, 35, 0.5), 0 0 4px rgba(245, 166, 35, 0.3) inset"
                : "none",
              opacity: isHovered ? 1 : 0,
              transition: "all 0.25s ease",
              pointerEvents: "none",
            }}
          />
          {/* Avatar */}
          {creator.avatar_url ? (
            <img
              src={creator.avatar_url}
              alt={creator.handle}
              style={{
                position: "relative",
                width: compact ? "56px" : "72px",
                height: compact ? "56px" : "72px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${isHovered ? "transparent" : colors.border}`,
                transition: "border-color 0.25s ease",
              }}
            />
          ) : (
            <div
              style={{
                position: "relative",
                width: compact ? "56px" : "72px",
                height: compact ? "56px" : "72px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, hsl(${hue}, 50%, 35%) 0%, hsl(${hue}, 60%, 25%) 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: compact ? "22px" : "28px",
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                textTransform: "uppercase",
                fontFamily: "var(--font-family-mono)",
                border: `2px solid ${isHovered ? "transparent" : colors.border}`,
                transition: "border-color 0.25s ease",
              }}
            >
              {creator.handle[0]}
            </div>
          )}
        </div>

        {/* Handle */}
        <h3
          style={{
            color: colors.textBright,
            fontSize: compact ? "14px" : "16px",
            fontWeight: 600,
            margin: compact ? "0 0 8px" : "0 0 12px",
            fontFamily: "var(--font-family-mono)",
            letterSpacing: "-0.01em",
            wordBreak: "break-word",
            textAlign: "center",
          }}
        >
          @{creator.handle}
        </h3>

        {/* Shielded badge - gold shield icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: compact ? "4px" : "6px",
            marginBottom: compact ? "12px" : "16px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#FFD700"
            stroke="none"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" stroke="#050505" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#FFD700",
              letterSpacing: "0.5px",
            }}
          >
            SHIELDED
          </span>
        </div>

        {/* Cypherpunk badge */}
        {creator.is_og_cypherpunk && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(245, 166, 35, 0.3)",
            background: "rgba(245, 166, 35, 0.08)",
            marginBottom: compact ? "12px" : "16px",
          }}>
            <span style={{
              fontSize: "9px",
              fontWeight: 700,
              color: colors.primary,
              letterSpacing: "1.5px",
              fontFamily: "var(--font-family-mono)",
            }}>
              CYPHERPUNK
            </span>
          </div>
        )}

        {/* Tip CTA */}
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
          Tip
          <span
            style={{
              transition: "transform 0.2s ease",
              transform: isHovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            →
          </span>
        </div>
      </div>
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
          background: "rgba(26, 26, 26, 0.6)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          borderTop: "1px solid rgba(255, 215, 0, 0.5)",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.8)",
          borderRadius: "24px",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          animation: `fadeInUp 0.4s ease forwards, shimmerSkeleton 1.5s infinite`,
          animationDelay: `${index * 0.05}s`,
          opacity: 0,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
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
