"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

// Logo component with TIP + Zcash Z symbol
function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "auto", height: "100%" }}
    >
      <text
        x="0"
        y="56"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="60"
        fontWeight="600"
        fill="#FFFFFF"
        letterSpacing="-0.02em"
      >
        TIP
      </text>
      <g transform="translate(142, 8)">
        <path
          d="M0 6 L48 6 L48 12 L16 12 L48 44 L48 50 L0 50 L0 44 L32 44 L0 12 Z"
          fill="#F4B728"
        />
        <rect x="-6" y="18" width="60" height="4" fill="#F4B728"/>
        <rect x="-6" y="34" width="60" height="4" fill="#F4B728"/>
      </g>
    </svg>
  )
}

// Scroll indicator arrow
function ScrollIndicator() {
  return (
    <div className="scroll-indicator">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7 7 7-7"/>
      </svg>
    </div>
  )
}

// Tweet mockup component with hover interaction
function TweetMockup() {
  return (
    <div style={{
      backgroundColor: "#000",
      border: "1px solid #1a1a1a",
      borderRadius: "16px",
      padding: "16px",
      maxWidth: "400px",
      width: "100%",
      transition: "border-color 200ms ease, box-shadow 200ms ease",
    }}
    className="tweet-mockup"
    >
      {/* Tweet header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
        }}/>
        <div>
          <div style={{ fontWeight: 600, fontSize: "15px" }}>Creator Name</div>
          <div style={{ color: "#888", fontSize: "14px" }}>@creator</div>
        </div>
      </div>

      {/* Tweet content */}
      <p style={{
        fontSize: "15px",
        lineHeight: "1.5",
        marginBottom: "16px",
        color: "#e7e9ea"
      }}>
        This thread changed how I think about building products. The key insight is...
      </p>

      {/* Tweet actions */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "12px",
        borderTop: "1px solid #1a1a1a",
      }}>
        <div style={{ display: "flex", gap: "24px", color: "#888" }}>
          <span style={{ fontSize: "14px" }}>42</span>
          <span style={{ fontSize: "14px" }}>128</span>
          <span style={{ fontSize: "14px" }}>1.2K</span>
        </div>
        <button
          className="tip-button"
          style={{
            backgroundColor: "#F4B728",
            color: "#000",
            border: "none",
            borderRadius: "20px",
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(244, 183, 40, 0.3)",
            transition: "transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease",
          }}>
          TIP
        </button>
      </div>
      <style jsx>{`
        .tweet-mockup:hover {
          border-color: #333;
        }
        .tip-button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(244, 183, 40, 0.5);
          background-color: #fcd34d;
        }
        .tip-button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  )
}

// Step card component with hover effects
function StepCard({
  number,
  title,
  icon
}: {
  number: number
  title: string
  icon: React.ReactNode
}) {
  return (
    <div
      className="step-card"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "32px",
        border: "1px solid #1a1a1a",
        borderRadius: "16px",
        minWidth: "180px",
        flex: 1,
        transition: "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
        cursor: "default",
      }}>
      <div
        className="step-icon"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: "rgba(244, 183, 40, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F4B728",
          transition: "background-color 200ms ease, transform 200ms ease",
        }}>
        {icon}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "14px",
          color: "#F4B728",
          fontWeight: 500,
          marginBottom: "4px"
        }}>
          Step {number}
        </div>
        <div style={{ fontSize: "18px", fontWeight: 500 }}>{title}</div>
      </div>
      <style jsx>{`
        .step-card:hover {
          border-color: rgba(244, 183, 40, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(244, 183, 40, 0.1);
        }
        .step-card:hover .step-icon {
          background-color: rgba(244, 183, 40, 0.2);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}

// Stack item component with hover effects
function StackItem({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div
      className="stack-item"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        textAlign: "center",
        flex: 1,
        minWidth: "200px",
        padding: "24px",
        borderRadius: "16px",
        transition: "background-color 200ms ease, transform 200ms ease",
        cursor: "default",
      }}>
      <div
        className="stack-icon"
        style={{
          fontSize: "48px",
          lineHeight: 1,
          transition: "transform 300ms ease",
        }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>{title}</div>
        <div style={{ fontSize: "16px", color: "#888" }}>{description}</div>
      </div>
      <style jsx>{`
        .stack-item:hover {
          background-color: rgba(244, 183, 40, 0.03);
        }
        .stack-item:hover .stack-icon {
          transform: scale(1.1) rotate(3deg);
        }
      `}</style>
    </div>
  )
}

// Icons
const KeyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

// Zcash Z icon for stack
const ZcashIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="23" stroke="#F4B728" strokeWidth="2"/>
    <g transform="translate(12, 12)">
      <path d="M0 4 L24 4 L24 7 L8 7 L24 17 L24 20 L0 20 L0 17 L16 17 L0 7 Z" fill="#F4B728"/>
      <rect x="-2" y="9" width="28" height="2" fill="#F4B728"/>
    </g>
  </svg>
)

export default function HomePage() {
  const sectionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 }
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }

  return (
    <main>
      {/* Section 1: Hero */}
      <section className="section" style={{ position: "relative", overflow: "hidden" }}>
        {/* Hero glow background */}
        <div className="hero-glow" aria-hidden="true" />

        <div
          ref={addToRefs}
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
            textAlign: "center",
            maxWidth: "800px",
            zIndex: 1,
          }}
        >
          <div style={{ height: "80px" }}>
            <Logo />
          </div>

          <h1 style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 400,
            color: "#888",
            letterSpacing: "-0.01em",
          }}>
            Private tips. Any asset. Zero trace.
          </h1>

          <Link href="/register" className="btn btn--primary">
            Get Started
          </Link>
        </div>
        <ScrollIndicator />
      </section>

      {/* Section 2: Tip Anyone */}
      <section className="section">
        <div
          ref={addToRefs}
          className="fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "80px",
            maxWidth: "1200px",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {/* Left: Text */}
          <div style={{
            flex: "1 1 400px",
            maxWidth: "500px",
          }}>
            <h2 className="heading-section" style={{ marginBottom: "24px" }}>
              Tip anyone on X.<br/>
              <span style={{ color: "#888" }}>Pay with any token.</span>
            </h2>
            <p className="body-text" style={{ fontSize: "20px", lineHeight: "1.6" }}>
              One click. Pick amount. Done.
            </p>
          </div>

          {/* Right: Tweet mockup */}
          <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
            <TweetMockup />
          </div>
        </div>
      </section>

      {/* Section 3: Receive Privately */}
      <section className="section">
        <div
          ref={addToRefs}
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "64px",
            maxWidth: "1000px",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 className="heading-section" style={{ marginBottom: "16px" }}>
              Creators get ZEC.<br/>
              <span style={{ color: "#888" }}>Address stays hidden.</span>
            </h2>
          </div>

          {/* Steps */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}>
            <StepCard number={1} title="Link address" icon={<KeyIcon />} />

            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F4B728" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>

            <StepCard number={2} title="Verify tweet" icon={<CheckIcon />} />

            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F4B728" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>

            <StepCard number={3} title="Receive privately" icon={<ShieldIcon />} />
          </div>

          <p className="body-text" style={{ textAlign: "center" }}>
            No public address. No transaction trail.
          </p>
        </div>
      </section>

      {/* Section 4: The Stack */}
      <section className="section section--half">
        <div
          ref={addToRefs}
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "48px",
            maxWidth: "1000px",
            width: "100%",
          }}
        >
          <h2 style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#888",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            Powered by
          </h2>

          <div style={{
            display: "flex",
            gap: "64px",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}>
            <StackItem
              icon={<ZcashIcon />}
              title="Zcash Shielded"
              description="Private by default"
            />
            <StackItem
              icon={
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="#F4B728" strokeWidth="2"/>
                  <text x="24" y="30" textAnchor="middle" fill="#F4B728" fontSize="18" fontWeight="600">N</text>
                </svg>
              }
              title="NEAR Intents"
              description="Any-to-ZEC conversion"
            />
            <StackItem
              icon={
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="#F4B728" strokeWidth="2"/>
                  <path d="M24 10 L24 38 M18 16 L24 10 L30 16" stroke="#F4B728" strokeWidth="2" fill="none"/>
                </svg>
              }
              title="Instant Swaps"
              description="<$0.01 fees"
            />
          </div>
        </div>
      </section>

      {/* Section 5: Final CTA */}
      <section className="section section--half" style={{ borderTop: "1px solid #1a1a1a" }}>
        <div
          ref={addToRefs}
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
            textAlign: "center",
          }}
        >
          <h2 style={{
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}>
            Ready?
          </h2>

          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}>
            <Link href="/register" className="btn btn--primary">
              Register as Creator
            </Link>
            <a
              href="#"
              className="btn btn--text"
            >
              Install Extension
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          position: "absolute",
          bottom: "24px",
          display: "flex",
          gap: "24px",
          fontSize: "14px",
        }}>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
        </footer>
      </section>
    </main>
  )
}
