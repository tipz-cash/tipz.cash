import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090a",
          borderRadius: 6,
        }}
      >
        <span style={{
          color: "#F5A623",
          fontSize: 28,
          fontWeight: 900,
          fontFamily: "monospace",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textShadow: "0 0 6px rgba(245, 166, 35, 0.7), 0 0 12px rgba(245, 166, 35, 0.3)",
          WebkitTextStroke: "1.5px #F5A623",
        }}>Z</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
