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
        {/* Stylized Z mark */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          style={{ filter: "drop-shadow(0 0 2px rgba(245, 166, 35, 0.5))" }}
        >
          {/* Z shape */}
          <path
            d="M0 2 L18 2 L18 5 L7 5 L18 15 L18 18 L0 18 L0 15 L11 15 L0 5 Z"
            fill="#F5A623"
          />
          {/* Strike-through lines */}
          <rect x="-1" y="7" width="22" height="2" fill="#F5A623" />
          <rect x="-1" y="11" width="22" height="2" fill="#F5A623" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
