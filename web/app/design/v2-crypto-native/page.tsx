"use client"

import { useState, useEffect } from "react"

// Color Palette
const colors = {
  background: "#000000",
  surface: "#1a1a2e",
  primary: "#F4B728",
  secondary: "#8B5CF6",
  accent: "#00D4AA",
  text: "#FFFFFF",
  textMuted: "#888888",
  textDim: "#555555",
}

// Glowing Button Component
function GlowButton({
  children,
  primary = true,
  style = {},
}: {
  children: React.ReactNode
  primary?: boolean
  style?: React.CSSProperties
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "16px 32px",
        fontSize: "16px",
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        transition: "all 300ms ease",
        position: "relative",
        background: primary
          ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
          : "transparent",
        color: primary ? colors.background : colors.text,
        boxShadow: isHovered
          ? `0 0 40px ${primary ? colors.primary : colors.secondary}60`
          : `0 0 20px ${primary ? colors.primary : colors.secondary}30`,
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        ...(primary ? {} : { border: `1px solid ${colors.textDim}` }),
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// Animated Card Component
function AnimatedCard({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: "16px",
        padding: "32px",
        border: `1px solid ${isHovered ? colors.primary + "40" : "#2a2a4e"}`,
        transition: "all 400ms ease",
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? (isHovered ? "translateY(-8px)" : "translateY(0)")
          : "translateY(20px)",
        boxShadow: isHovered
          ? `0 20px 60px ${colors.primary}15`
          : "none",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// Icon Component (using inline SVGs)
function Icon({ name, size = 48 }: { name: string; size?: number }) {
  const icons: Record<string, JSX.Element> = {
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" stroke={colors.accent} />
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={colors.secondary + "30"} />
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    link: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="1.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" fill={colors.secondary + "30"} />
        <line x1="4" y1="4" x2="20" y2="20" stroke={colors.accent} strokeWidth="2" />
      </svg>
    ),
    wallet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="1.5">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" fill={colors.accent + "30"} />
      </svg>
    ),
    send: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" fill={colors.primary + "20"} />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2">
        <circle cx="12" cy="12" r="10" stroke={colors.surface} fill={colors.accent + "20"} />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  }

  return icons[name] || null
}

// Tech Logo Component
function TechLogo({ name }: { name: string }) {
  const [isHovered, setIsHovered] = useState(false)

  const logos: Record<string, { color: string; letter: string; fullName: string; image?: string }> = {
    zcash: { color: colors.primary, letter: "Z", fullName: "Zcash", image: "/zec/brandmark-yellow.svg" },
    near: { color: colors.accent, letter: "N", fullName: "NEAR" },
    thorchain: { color: colors.secondary, letter: "T", fullName: "THORChain" },
  }

  const logo = logos[name]
  if (!logo) return null

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        transition: "all 300ms ease",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          backgroundColor: colors.surface,
          border: `2px solid ${isHovered ? logo.color : "#2a2a4e"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          color: logo.color,
          boxShadow: isHovered ? `0 0 30px ${logo.color}40` : "none",
          transition: "all 300ms ease",
        }}
      >
        {logo.image ? (
          <img src={logo.image} alt={logo.fullName} style={{ width: "48px", height: "48px" }} />
        ) : (
          logo.letter
        )}
      </div>
      <span style={{
        fontSize: "14px",
        color: isHovered ? logo.color : colors.textMuted,
        fontWeight: 500,
        transition: "color 300ms ease",
      }}>
        {logo.fullName}
      </span>
    </div>
  )
}

// How It Works Step Component
function Step({
  number,
  title,
  description,
  icon,
  delay,
}: {
  number: number
  title: string
  description: string
  icon: string
  delay: number
}) {
  return (
    <AnimatedCard delay={delay} style={{ textAlign: "center" }}>
      <div style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        position: "relative",
      }}>
        <Icon name={icon} size={32} />
        <div style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: colors.primary,
          color: colors.background,
          fontSize: "14px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {number}
        </div>
      </div>
      <h3 style={{
        fontSize: "20px",
        fontWeight: 600,
        marginBottom: "12px",
        color: colors.text,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: "15px",
        color: colors.textMuted,
        lineHeight: 1.6,
      }}>
        {description}
      </p>
    </AnimatedCard>
  )
}

// Feature Item Component
function Feature({
  icon,
  title,
  description,
  delay,
}: {
  icon: string
  title: string
  description: string
  delay: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div style={{
      display: "flex",
      gap: "20px",
      alignItems: "flex-start",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateX(0)" : "translateX(-20px)",
      transition: "all 500ms ease",
    }}>
      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: "12px",
        backgroundColor: colors.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name={icon} size={28} />
      </div>
      <div>
        <h4 style={{
          fontSize: "18px",
          fontWeight: 600,
          marginBottom: "8px",
          color: colors.text,
        }}>
          {title}
        </h4>
        <p style={{
          fontSize: "15px",
          color: colors.textMuted,
          lineHeight: 1.6,
        }}>
          {description}
        </p>
      </div>
    </div>
  )
}

// Main Page Component
export default function CryptoNativePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>
      {/* Hero Section */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "40px 24px",
      }}>
        {/* Background Gradient Orbs */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}15 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}10 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }} />

        {/* Navigation */}
        <nav style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 48px",
          zIndex: 10,
        }}>
          <div style={{
            fontSize: "24px",
            fontWeight: 700,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            TIPZ
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <a href="#how-it-works" style={{ color: colors.textMuted, textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>How It Works</a>
            <a href="#features" style={{ color: colors.textMuted, textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>Why TIPZ</a>
            <a href="#tech" style={{ color: colors.textMuted, textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>The Stack</a>
            <GlowButton style={{ padding: "10px 20px", fontSize: "14px" }}>
              Get Started
            </GlowButton>
          </div>
        </nav>

        {/* Hero Content */}
        <div style={{
          textAlign: "center",
          maxWidth: "900px",
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(30px)",
          transition: "all 800ms ease",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: colors.surface,
            borderRadius: "100px",
            marginBottom: "32px",
            border: `1px solid ${colors.primary}30`,
          }}>
            <img
              src="/zec/brandmark-yellow.svg"
              alt="Zcash"
              style={{ width: "16px", height: "16px" }}
            />
            <span style={{ fontSize: "14px", color: colors.textMuted }}>
              Shielded by Zcash zk-SNARKs
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(48px, 8vw, 80px)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "24px",
            background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.textMuted} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Tip in ETH.
            <br />
            <span style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Receive in ZEC.
            </span>
            <br />
            Trace nothing.
          </h1>

          <p style={{
            fontSize: "20px",
            color: colors.textMuted,
            maxWidth: "600px",
            margin: "0 auto 48px",
            lineHeight: 1.6,
          }}>
            Every crypto tip you send today is public. Your wallet, their wallet, the amount.
            TIPZ routes any token through Zcash shielded addresses. 0% platform fees. No KYC.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <GlowButton>
              Send a Private Tip
            </GlowButton>
            <GlowButton primary={false}>
              Create Your Tip Page
            </GlowButton>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          opacity: 0.5,
        }}>
          <span style={{ fontSize: "12px", color: colors.textMuted }}>Scroll</span>
          <div style={{
            width: "24px",
            height: "40px",
            borderRadius: "12px",
            border: `2px solid ${colors.textDim}`,
            display: "flex",
            justifyContent: "center",
            paddingTop: "8px",
          }}>
            <div style={{
              width: "4px",
              height: "8px",
              borderRadius: "2px",
              backgroundColor: colors.textMuted,
              animation: "scrollBounce 2s infinite",
            }} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: "120px 24px",
        position: "relative",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{
              fontSize: "14px",
              fontWeight: 600,
              color: colors.primary,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}>
              How It Works
            </span>
            <h2 style={{
              fontSize: "clamp(36px, 5vw, 48px)",
              fontWeight: 700,
              marginTop: "16px",
            }}>
              Private tips in 60 seconds
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
          }}>
            <Step
              number={1}
              icon="link"
              title="Connect Your Wallet"
              description="Paste your Zcash shielded address. No email, no KYC, no account creation. Your address is your identity."
              delay={100}
            />
            <Step
              number={2}
              icon="send"
              title="Share Your Link"
              description="Drop your TIPZ link anywhere. Supporters tip in ETH, USDC, SOL, or 10+ tokens. We swap to ZEC automatically."
              delay={200}
            />
            <Step
              number={3}
              icon="wallet"
              title="Receive Shielded"
              description="Tips arrive in your shielded address. Sender, amount, and your balance stay encrypted. Only you see your funds."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: "120px 24px",
        backgroundColor: colors.surface + "40",
        position: "relative",
      }}>
        {/* Gradient accent */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${colors.primary}50, ${colors.secondary}50, transparent)`,
        }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "80px",
            alignItems: "center",
          }}>
            <div>
              <span style={{
                fontSize: "14px",
                fontWeight: 600,
                color: colors.secondary,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}>
                Why TIPZ
              </span>
              <h2 style={{
                fontSize: "clamp(36px, 5vw, 48px)",
                fontWeight: 700,
                marginTop: "16px",
                marginBottom: "24px",
              }}>
                Your tips are
                <br />
                <span style={{ color: colors.accent }}>nobody's business</span>
              </h2>
              <p style={{
                fontSize: "18px",
                color: colors.textMuted,
                lineHeight: 1.7,
                marginBottom: "48px",
              }}>
                Competitors track creator income. Stalkers profile supporters.
                On-chain surveillance indexes every transaction. TIPZ ends that.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <Feature
                  icon="shield"
                  title="Encrypted by Default"
                  description="Zcash zk-SNARKs encrypt sender, receiver, and amount. The same tech protecting $1B+ in shielded value."
                  delay={100}
                />
                <Feature
                  icon="globe"
                  title="Tip in Any Token"
                  description="Your supporters pay in ETH, USDC, SOL, BTC, or 10+ assets. THORChain swaps to ZEC automatically."
                  delay={200}
                />
                <Feature
                  icon="eye"
                  title="No Identity Required"
                  description="No email. No phone. No selfie. Your Zcash address is your only identity. Close your curtains."
                  delay={300}
                />
                <Feature
                  icon="zap"
                  title="Keep 100% of Tips"
                  description="0% platform fee. Network fees under $0.01. Compare that to PayPal's 2.9% + $0.30 per transaction."
                  delay={400}
                />
              </div>
            </div>

            {/* Feature Visual */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <div style={{
                width: "100%",
                maxWidth: "400px",
                aspectRatio: "1",
                borderRadius: "24px",
                background: `linear-gradient(135deg, ${colors.surface}, ${colors.background})`,
                border: `1px solid ${colors.primary}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Animated rings */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: `${100 + i * 60}px`,
                      height: `${100 + i * 60}px`,
                      borderRadius: "50%",
                      border: `1px solid ${colors.primary}${30 - i * 8}`,
                      animation: `pulse ${2 + i * 0.5}s infinite`,
                    }}
                  />
                ))}

                {/* Center logo */}
                <div style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "24px",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: 700,
                  color: colors.background,
                  boxShadow: `0 0 60px ${colors.primary}50`,
                }}>
                  T
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" style={{
        padding: "120px 24px",
        position: "relative",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{
              fontSize: "14px",
              fontWeight: 600,
              color: colors.accent,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}>
              The Stack
            </span>
            <h2 style={{
              fontSize: "clamp(36px, 5vw, 48px)",
              fontWeight: 700,
              marginTop: "16px",
              marginBottom: "16px",
            }}>
              Battle-tested infrastructure
            </h2>
            <p style={{
              fontSize: "18px",
              color: colors.textMuted,
              maxWidth: "600px",
              margin: "0 auto",
            }}>
              Three protocols. Billions in TVL. Zero trusted intermediaries.
            </p>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "64px",
            flexWrap: "wrap",
          }}>
            <TechLogo name="zcash" />
            <TechLogo name="near" />
            <TechLogo name="thorchain" />
          </div>

          {/* Tech details */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginTop: "80px",
          }}>
            <div style={{
              padding: "24px",
              backgroundColor: colors.surface,
              borderRadius: "16px",
              border: `1px solid ${colors.primary}20`,
            }}>
              <h4 style={{ color: colors.primary, marginBottom: "8px", fontWeight: 600 }}>
                Zcash Shielded Pool
              </h4>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>
                zk-SNARKs since 2016. The same cryptography protecting dissidents, journalists, and
                anyone who believes finances are private. Audited. Proven. Trusted.
              </p>
            </div>
            <div style={{
              padding: "24px",
              backgroundColor: colors.surface,
              borderRadius: "16px",
              border: `1px solid ${colors.accent}20`,
            }}>
              <h4 style={{ color: colors.accent, marginBottom: "8px", fontWeight: 600 }}>
                NEAR Intents
              </h4>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>
                Chain abstraction for seamless swaps. You specify the outcome, NEAR figures out the
                route. No manual bridging. No wrapped tokens.
              </p>
            </div>
            <div style={{
              padding: "24px",
              backgroundColor: colors.surface,
              borderRadius: "16px",
              border: `1px solid ${colors.secondary}20`,
            }}>
              <h4 style={{ color: colors.secondary, marginBottom: "8px", fontWeight: 600 }}>
                THORChain Liquidity
              </h4>
              <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>
                $200M+ in native liquidity. Cross-chain swaps without CEX custody or KYC.
                Your ETH becomes ZEC without ever leaving your control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}20 0%, ${colors.secondary}10 50%, transparent 70%)`,
          filter: "blur(100px)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: "clamp(40px, 6vw, 56px)",
            fontWeight: 700,
            marginBottom: "24px",
            lineHeight: 1.2,
          }}>
            Stop tipping
            <br />
            <span style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              in public
            </span>
          </h2>
          <p style={{
            fontSize: "20px",
            color: colors.textMuted,
            marginBottom: "48px",
            maxWidth: "500px",
            margin: "0 auto 48px",
            lineHeight: 1.6,
          }}>
            Privacy is not a feature. It is a right.
            Create your shielded tip page in 60 seconds.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <GlowButton>
              Create Your Tip Page
            </GlowButton>
            <GlowButton primary={false}>
              See How It Works
            </GlowButton>
          </div>

          <p style={{
            fontSize: "14px",
            color: colors.textDim,
            marginTop: "24px",
          }}>
            No account. No KYC. No platform fees. Just your Zcash address.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "64px 24px 32px",
        borderTop: `1px solid ${colors.surface}`,
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "48px",
            marginBottom: "64px",
          }}>
            {/* Brand */}
            <div>
              <div style={{
                fontSize: "24px",
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "16px",
              }}>
                TIPZ
              </div>
              <p style={{
                fontSize: "14px",
                color: colors.textMuted,
                lineHeight: 1.6,
              }}>
                The private layer for creator support.
                Your generosity. Their privacy. Zero trace.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Product
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Create Tip Page", "Send a Tip", "Browser Extension", "API Docs"].map((item) => (
                  <a key={item} href="#" style={{
                    color: colors.textMuted,
                    textDecoration: "none",
                    fontSize: "14px",
                    transition: "color 200ms ease",
                  }}>
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Resources
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Get Started", "FAQ", "Privacy Deep Dive", "System Status"].map((item) => (
                  <a key={item} href="#" style={{
                    color: colors.textMuted,
                    textDecoration: "none",
                    fontSize: "14px",
                    transition: "color 200ms ease",
                  }}>
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Legal
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                  <a key={item} href="#" style={{
                    color: colors.textMuted,
                    textDecoration: "none",
                    fontSize: "14px",
                    transition: "color 200ms ease",
                  }}>
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "32px",
            borderTop: `1px solid ${colors.surface}`,
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <p style={{ fontSize: "14px", color: colors.textDim }}>
              2025 TIPZ. Privacy is a right, not a feature.
            </p>
            <div style={{ display: "flex", gap: "24px" }}>
              {["Twitter", "Discord", "GitHub"].map((social) => (
                <a key={social} href="#" style={{
                  color: colors.textMuted,
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "color 200ms ease",
                }}>
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        a:hover {
          color: ${colors.primary} !important;
        }

        @media (max-width: 768px) {
          nav {
            padding: 16px 24px !important;
          }

          nav > div:last-child > a:not(:last-child) {
            display: none;
          }
        }
      `}</style>
    </main>
  )
}
