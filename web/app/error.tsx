"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480, padding: 32 }}>
        <h2 style={{ color: "#F5A623", fontSize: 20, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, marginBottom: 24, opacity: 0.7 }}>
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          style={{
            background: "#F5A623",
            color: "#08090a",
            border: "none",
            padding: "10px 24px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
