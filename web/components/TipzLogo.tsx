"use client";

interface TipzLogoProps {
  size?: number;
  glow?: boolean;
  className?: string;
}

export function TipzLogo({
  size = 18,
  glow = true,
  className,
}: TipzLogoProps) {
  return (
    <span
      className={className}
      style={{
        fontWeight: 700,
        fontSize: `${size}px`,
        fontFamily: "var(--font-family-mono)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span style={{ color: "#FFFFFF" }}>TIP</span>
      <span
        style={{
          color: "#F5A623",
          textShadow: glow ? "0 0 20px rgba(245, 166, 35, 0.4)" : "none",
        }}
      >
        Z
      </span>
    </span>
  );
}
