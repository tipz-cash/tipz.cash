import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const cleanHandle = handle.replace(/^@/, "")

  // Terminal-style colors
  const colors = {
    bg: "#0A0A0A",
    surface: "#1A1A1A",
    primary: "#F5A623",
    success: "#00FF00",
    muted: "#888888",
    border: "#333333",
    text: "#E0E0E0",
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
          fontFamily: "monospace",
        }}
      >
        {/* Card container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: colors.surface,
            border: `2px solid ${colors.border}`,
            borderRadius: "24px",
            padding: "60px 80px",
            maxWidth: "900px",
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#FF5F56",
                }}
              />
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#FFBD2E",
                }}
              />
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#27CA40",
                }}
              />
            </div>
            <span
              style={{
                color: colors.muted,
                fontSize: "18px",
                marginLeft: "12px",
              }}
            >
              [TIPZ] // CREATOR_CARD
            </span>
          </div>

          {/* Avatar circle */}
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              backgroundColor: colors.bg,
              border: `4px solid ${colors.primary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "32px",
              boxShadow: `0 0 40px rgba(245, 166, 35, 0.3)`,
            }}
          >
            <span
              style={{
                fontSize: "56px",
                color: colors.primary,
                fontWeight: 700,
              }}
            >
              {cleanHandle[0]?.toUpperCase() || "?"}
            </span>
          </div>

          {/* Handle + verified badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "42px",
                fontWeight: 600,
                color: colors.text,
              }}
            >
              @{cleanHandle}
            </span>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={colors.primary}
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>

          {/* Verified text */}
          <span
            style={{
              fontSize: "20px",
              color: colors.primary,
              fontWeight: 500,
              letterSpacing: "1px",
              marginBottom: "40px",
            }}
          >
            Verified TIPZ Creator
          </span>

          {/* CTA button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              color: colors.bg,
              padding: "20px 48px",
              borderRadius: "12px",
              fontSize: "22px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            Add TIPZ to Browser
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: colors.muted,
              fontSize: "16px",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.success}
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Powered by Zcash shielding
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
