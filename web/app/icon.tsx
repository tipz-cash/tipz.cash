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
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "monospace",
          textShadow: "0 0 4px rgba(245, 166, 35, 0.5)",
        }}>Z</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
