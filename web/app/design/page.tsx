"use client"

import Link from "next/link"

const designs = [
  {
    id: "v2-crypto-native",
    name: "Crypto Native",
    description: "Dark, gradients, tech-forward",
    inspiration: "Zashi, NEAR, Phantom wallet",
    colors: ["#000000", "#1a1a2e", "#F4B728", "#8B5CF6", "#00D4AA"],
  },
  {
    id: "v4-terminal",
    name: "Terminal",
    description: "Monospace, dark, amber accents",
    inspiration: "naly.dev, Vercel, Linear",
    colors: ["#0A0A0A", "#1A1A1A", "#F5A623", "#00FF00", "#888888"],
  },
  {
    id: "v5-brutalist",
    name: "Brutalist",
    description: "High contrast, raw, bold typography",
    inspiration: "Balaji's sites, crypto punk",
    colors: ["#FFFFFF", "#000000", "#FF0000", "#FFFF00", "#0000FF"],
  },
]

export default function DesignIndex() {
  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0a0a0a",
      color: "#fff",
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: 700,
          marginBottom: "16px",
        }}>
          TIPZ Design Variants
        </h1>
        <p style={{
          fontSize: "20px",
          color: "#888",
          marginBottom: "48px",
        }}>
          3 finalist directions. Open in separate tabs to compare.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "24px",
        }}>
          {designs.map((design) => (
            <Link
              key={design.id}
              href={`/design/${design.id}`}
              style={{
                display: "block",
                backgroundColor: "#111",
                border: "1px solid #222",
                borderRadius: "12px",
                padding: "24px",
                textDecoration: "none",
                color: "inherit",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#444"
                e.currentTarget.style.transform = "translateY(-4px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#222"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <h2 style={{
                fontSize: "24px",
                fontWeight: 600,
                marginBottom: "8px",
              }}>
                {design.name}
              </h2>
              <p style={{
                fontSize: "16px",
                color: "#888",
                marginBottom: "12px",
              }}>
                {design.description}
              </p>
              <p style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "16px",
              }}>
                Inspiration: {design.inspiration}
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                {design.colors.map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      backgroundColor: color,
                      border: color === "#FFFFFF" ? "1px solid #333" : "none",
                    }}
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          marginTop: "48px",
          padding: "24px",
          backgroundColor: "#111",
          borderRadius: "12px",
          border: "1px solid #222",
        }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Open All in New Tabs</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {designs.map((design) => (
              <a
                key={design.id}
                href={`/design/${design.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#222",
                  borderRadius: "6px",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                {design.name} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
