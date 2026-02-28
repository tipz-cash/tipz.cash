import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getJetBrainsMonoBold, getOgFonts } from "@/lib/og-fonts"

export const runtime = "edge"

function normalizeHandle(handle: string): string {
  return handle.toLowerCase().replace(/^@/, "")
}

// Generate avatar color based on handle
function getAvatarHue(handle: string): number {
  return handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
}

async function loadCreator(normalizedHandle: string): Promise<{ handle: string; avatar_url?: string } | null> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return null
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('creators')
      .select('handle, avatar_url')
      .eq('handle_normalized', normalizedHandle)
      .single()
    return data
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params
  const cleanHandle = handle.replace(/^@/, "")
  const normalizedHandle = normalizeHandle(cleanHandle)
  const baseUrl = new URL(request.url).origin

  // Load font + creator data in parallel
  const [fontData, creator] = await Promise.all([
    getJetBrainsMonoBold(baseUrl),
    loadCreator(normalizedHandle),
  ])

  const displayHandle = creator?.handle || cleanHandle
  const avatarHue = getAvatarHue(displayHandle)

  // Pre-fetch avatar image and convert to data URL so Satori doesn't need to fetch externally
  let avatarDataUrl: string | null = null
  if (creator?.avatar_url) {
    try {
      const avatarRes = await fetch(creator.avatar_url)
      if (avatarRes.ok) {
        const avatarBuffer = await avatarRes.arrayBuffer()
        const contentType = avatarRes.headers.get('content-type') || 'image/jpeg'
        const base64 = Buffer.from(avatarBuffer).toString('base64')
        avatarDataUrl = `data:${contentType};base64,${base64}`
      }
    } catch {
      // Silently fail - will use letter avatar fallback
    }
  }

  // Color palette
  const colors = {
    bg: "#050505",
    glassBg: "rgba(26, 26, 26, 0.6)",
    goldBorderTop: "rgba(255, 215, 0, 0.5)",
    shadowBorderBottom: "rgba(0, 0, 0, 0.8)",
    green: "#00FF94",
    gold: "#FFD700",
    orange: "#FFA500",
    textWhite: "#FFFFFF",
    textMuted: "rgba(255, 255, 255, 0.5)",
    chipBg: "rgba(255, 255, 255, 0.05)",
    chipBorder: "rgba(255, 255, 255, 0.1)",
  }

  const priceChips = [
    { amount: "$1", selected: false },
    { amount: "$5", selected: true },
    { amount: "$10", selected: false },
    { amount: "$25", selected: false },
  ]

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
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {/* Wall-to-Wall Dense App Terminal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "1136px",
            height: "566px",
            backgroundColor: "rgba(18, 18, 18, 0.95)",
            borderRadius: "24px",
            padding: "32px",
            justifyContent: "space-between",
            boxShadow: "inset 0 1px 0 0 rgba(255, 235, 160, 0.25), 0 25px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Top Section: Identity + Trust */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* Row 1 - Identity: Avatar + Handle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              {/* Avatar - Squircle */}
              {avatarDataUrl ? (
                <img
                  src={avatarDataUrl}
                  alt={displayHandle}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    objectFit: "cover",
                    flexShrink: 0,
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: `linear-gradient(135deg, hsl(${avatarHue}, 50%, 35%) 0%, hsl(${avatarHue}, 60%, 25%) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: 800,
                    color: colors.textWhite,
                    flexShrink: 0,
                    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {displayHandle[0]?.toUpperCase() || "?"}
                </div>
              )}

              {/* @handle - Bold Headline */}
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 700,
                  color: colors.textWhite,
                  fontFamily: "monospace",
                  letterSpacing: "-1px",
                }}
              >
                {`@${displayHandle.toLowerCase()}`}
              </div>
            </div>

            {/* Row 2 - Trust: The Green Points */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                marginLeft: "72px",
              }}
            >
              {/* Shield - Private */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span style={{ fontSize: "18px", fontWeight: 600, color: colors.green, fontFamily: "monospace" }}>
                  Private
                </span>
              </div>

              {/* Lightning - Instant */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span style={{ fontSize: "18px", fontWeight: 600, color: colors.green, fontFamily: "monospace" }}>
                  Instant
                </span>
              </div>

              {/* Ban/Circle - 0% fees */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                <span style={{ fontSize: "18px", fontWeight: 600, color: colors.green, fontFamily: "monospace" }}>
                  0% fees
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Controls - 4-Stack Layout */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Row 1 - Chips: FULL WIDTH KEYBOARD */}
            <div
              style={{
                display: "flex",
                width: "100%",
                gap: "12px",
              }}
            >
              {priceChips.map((chip) => (
                <div
                  key={chip.amount}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "64px",
                    borderRadius: "14px",
                    fontSize: "28px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    ...(chip.selected
                      ? {
                          backgroundColor: colors.textWhite,
                          color: colors.bg,
                          boxShadow: "0 0 40px rgba(255, 215, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.3)",
                        }
                      : {
                          backgroundColor: "rgba(255, 255, 255, 0.06)",
                          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          color: colors.textMuted,
                        }),
                  }}
                >
                  {chip.amount}
                </div>
              ))}
            </div>

            {/* Row 2 - Private Note: MESSAGE TRENCH */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: "64px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderRadius: "14px",
                padding: "0 20px",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              {/* Left: Placeholder text */}
              <span style={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "18px",
                fontFamily: "monospace",
              }}>
                Add a private note...
              </span>

              {/* Right: ENCRYPTED badge */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: "rgba(0, 255, 148, 0.1)",
                borderRadius: "10px",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{
                  color: colors.green,
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                }}>
                  ENCRYPTED
                </span>
              </div>
            </div>

            {/* Row 3 - Token Selector: NETWORK DROPDOWN */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: "64px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderRadius: "14px",
                padding: "0 20px",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Left: ETH Token */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* ETH Diamond Icon */}
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #627EEA 0%, #3C3C3D 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 256 417" fill="none">
                    <path fill="#fff" fillOpacity="0.6" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                    <path fill="#fff" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
                  </svg>
                </div>
                <span style={{
                  color: colors.textWhite,
                  fontSize: "20px",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}>
                  ETH
                </span>
              </div>

              {/* Right: Balance + Chevron */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "16px",
                  fontFamily: "monospace",
                }}>
                  0.0998
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Row 4 - Send Button: FULL WIDTH ANCHOR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "64px",
                background: "linear-gradient(180deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
                borderRadius: "14px",
                fontSize: "24px",
                fontWeight: 700,
                color: colors.bg,
                fontFamily: "monospace",
                letterSpacing: "0.5px",
                boxShadow: "inset 0 2px 0 rgba(255, 255, 255, 0.4), 0 8px 32px rgba(255, 215, 0, 0.5)",
              }}
            >
              Send $5.00
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: getOgFonts(fontData),
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  )
}
