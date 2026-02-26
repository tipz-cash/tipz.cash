import Link from "next/link"

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#08090a",
        color: "#D1D5DB",
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(42,47,56,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(42,47,56,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", maxWidth: 480, padding: 32, position: "relative", zIndex: 1 }}>
        {/* Error code */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          <span style={{ color: "#F5A623", textShadow: "0 0 24px rgba(245, 166, 35, 0.4)" }}>4</span>
          <span style={{ color: "#ffffff" }}>0</span>
          <span style={{ color: "#F5A623", textShadow: "0 0 24px rgba(245, 166, 35, 0.4)" }}>4</span>
        </div>

        {/* Message */}
        <p
          style={{
            fontSize: 14,
            color: "#6B7280",
            marginBottom: 32,
            letterSpacing: "0.01em",
            lineHeight: 1.6,
          }}
        >
          This route doesn&apos;t exist.
          <br />
          The address may have changed, or you followed a broken link.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              background: "#F5A623",
              color: "#08090a",
              border: "none",
              padding: "10px 24px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Home
          </Link>
          <Link
            href="/creators"
            style={{
              background: "transparent",
              color: "#D1D5DB",
              border: "1px solid #2a2f38",
              padding: "10px 24px",
              borderRadius: 6,
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Browse Creators
          </Link>
        </div>
      </div>
    </div>
  )
}
