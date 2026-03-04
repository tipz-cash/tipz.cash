import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getJetBrainsMonoBold, getOgFonts } from "@/lib/og-fonts"

export const runtime = "edge"

export async function GET(_request: NextRequest) {
  const fontData = await getJetBrainsMonoBold()

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(160deg, #0d1117 0%, #08090a 40%, #0a0c10 100%)",
          fontFamily: "JetBrains Mono",
          position: "relative",
        }}
      >
        {/* Logo row: Zcash shield icon + [TIPZ] */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Zcash-style shield icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Stylized Z / shield bars */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M8 10h20" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M8 18h20" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M8 26h20" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M24 10L12 26" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* [TIPZ] wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0px",
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.3)",
              }}
            >
              [
            </span>
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#D1D5DB",
                letterSpacing: "2px",
              }}
            >
              TIPZ
            </span>
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.3)",
              }}
            >
              ]
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 38,
            fontWeight: 700,
            color: "#F5A623",
            letterSpacing: "-0.5px",
            marginBottom: "16px",
          }}
        >
          Private Tips For Creators
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.4)",
            fontWeight: 400,
          }}
        >
          Micro-tipping for creators using Zcash shielded addresses
        </div>

        {/* Bottom: tipz.cash badge */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
          }}
        >
          {/* Green dot */}
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 0 8px rgba(34, 197, 94, 0.5)",
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            tipz.cash
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: getOgFonts(fontData),
    }
  )
}
