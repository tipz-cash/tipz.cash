import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090a",
          borderRadius: 40,
        }}
      >
        <span style={{
          color: "#F5A623",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "monospace",
          textShadow: "0 0 16px rgba(245, 166, 35, 0.4)",
        }}>Z</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
