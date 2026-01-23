import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

// Generate avatar color based on handle
function getAvatarColor(handle: string): string {
  const hue = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 60%, 40%)`
}

function normalizeHandle(handle: string): string {
  return handle.toLowerCase().replace(/^@/, "")
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const cleanHandle = handle.replace(/^@/, "")
  const normalizedHandle = normalizeHandle(cleanHandle)

  // Look up creator in database (create client inline for edge runtime)
  let creator: { handle: string } | null = null
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data } = await supabase
        .from('creators')
        .select('handle')
        .eq('handle_normalized', normalizedHandle)
        .single()
      creator = data
    } catch {
      // Silently fail - creator will be null
    }
  }

  const isVerified = !!creator
  const displayHandle = creator?.handle || cleanHandle

  // Terminal-style colors
  const colors = {
    bg: "#050505",
    surface: "#0F0F0F",
    primary: "#F5A623", // Zcash gold
    verified: "#22c55e",
    unverified: "#FF4444",
    muted: "#666666",
    border: "#222222",
    text: "#E0E0E0",
    textBright: "#FFFFFF",
  }

  // Grid pattern for background
  const gridSize = 40
  const gridColor = "#111111"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Grid pattern background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />

        {/* Radial gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at center, rgba(245, 166, 35, 0.08) 0%, transparent 60%)`,
          }}
        />

        {/* Main card container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            borderRadius: "32px",
            padding: "48px 64px",
            width: "1080px",
            position: "relative",
          }}
        >
          {/* Left side: Avatar + Handle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
            }}
          >
            {/* Letter Avatar */}
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                backgroundColor: isVerified ? getAvatarColor(displayHandle) : colors.surface,
                border: `4px solid ${isVerified ? colors.primary : colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isVerified ? `0 0 40px rgba(245, 166, 35, 0.3)` : "none",
              }}
            >
              <span
                style={{
                  fontSize: "64px",
                  color: isVerified ? colors.textBright : colors.muted,
                  fontWeight: 700,
                }}
              >
                {displayHandle[0]?.toUpperCase() || "?"}
              </span>
            </div>

            {/* Handle + Status */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 600,
                  color: colors.textBright,
                }}
              >
                @{displayHandle}
              </span>

              {/* Status badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: isVerified
                    ? "rgba(34, 197, 94, 0.15)"
                    : "rgba(255, 68, 68, 0.15)",
                  borderRadius: "20px",
                }}
              >
                {isVerified ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.verified}
                    strokeWidth="2.5"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ) : (
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: colors.unverified,
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: "18px",
                    color: isVerified ? colors.verified : colors.unverified,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  {isVerified ? "PRIVATE TIPS ACTIVE" : "NOT REGISTERED"}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: TIPZ branding */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: colors.primary,
                letterSpacing: "4px",
              }}
            >
              TIPZ
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: colors.muted,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.verified}
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: "18px" }}>
                Powered by Zcash
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            color: colors.muted,
            fontSize: "16px",
            letterSpacing: "1px",
          }}
        >
          <span>0% FEES</span>
          <span>•</span>
          <span>PRIVATE</span>
          <span>•</span>
          <span>UNLINKABLE</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
