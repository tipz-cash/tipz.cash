import { ImageResponse } from "next/og";

// Image metadata
export const alt = "TIPZ - Private Tips. Any Asset. Zero Trace.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #08090a 0%, #0d1117 50%, #08090a 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(245, 166, 35, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 166, 35, 0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Ambient glow - top right */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(245, 166, 35, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Ambient glow - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(245, 166, 35, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            zIndex: 10,
          }}
        >
          {/* Logo mark + text */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            {/* Z mark icon */}
            <div
              style={{
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(245, 166, 35, 0.1)",
                borderRadius: 16,
                border: "1px solid rgba(245, 166, 35, 0.3)",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 20 20" fill="none">
                <path
                  d="M0 2 L18 2 L18 5 L7 5 L18 15 L18 18 L0 18 L0 15 L11 15 L0 5 Z"
                  fill="#F5A623"
                />
                <rect x="-1" y="7" width="22" height="2" fill="#F5A623" />
                <rect x="-1" y="11" width="22" height="2" fill="#F5A623" />
              </svg>
            </div>

            {/* TIPZ text */}
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#F9FAFB",
              }}
            >
              <span style={{ color: "#6B7280" }}>[</span>
              <span>TIPZ</span>
              <span style={{ color: "#6B7280" }}>]</span>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: "#F5A623",
                letterSpacing: "0.05em",
              }}
            >
              Private Tips. Any Asset. Zero Trace.
            </div>

            <div
              style={{
                fontSize: 20,
                color: "#6B7280",
                letterSpacing: "0.02em",
              }}
            >
              Micro-tipping for creators using Zcash shielded addresses
            </div>
          </div>
        </div>

        {/* Bottom URL bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            background: "rgba(18, 20, 26, 0.8)",
            borderRadius: 8,
            border: "1px solid rgba(42, 47, 56, 0.8)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: "#22C55E",
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontSize: 18,
              color: "#D1D5DB",
              letterSpacing: "0.05em",
            }}
          >
            tipz.cash
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
