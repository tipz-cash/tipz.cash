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
          fontSize: 150,
          fontWeight: 900,
          fontFamily: "monospace",
          lineHeight: 1,
          textShadow: "0 0 20px rgba(245, 166, 35, 0.7), 0 0 40px rgba(245, 166, 35, 0.3)",
        }}>Z</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
