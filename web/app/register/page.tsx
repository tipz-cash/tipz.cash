"use client"

import { useState } from "react"
import Link from "next/link"

// Brand colors - matching main site
const colors = {
  bg: "#08090a",
  bgGradientStart: "#08090a",
  bgGradientEnd: "#0d1117",
  surface: "#12141a",
  accentYellow: "#F5A623",
  accentYellowLight: "#FFB84D",
  accentYellowGlow: "rgba(245, 166, 35, 0.15)",
  accentYellowGlowStrong: "rgba(245, 166, 35, 0.3)",
  bgBlack: "#08090a",
  cardBg: "#12141a",
  borderSubtle: "#2a2f38",
  textWhite: "#F9FAFB",
  textMuted: "#6B7280",
  text: "#D1D5DB",
  successGreen: "#22c55e",
  successGlow: "rgba(34, 197, 94, 0.2)",
  errorRed: "#ef4444",
}

// Form validation helpers
function validateHandle(handle: string): string | null {
  if (!handle) return "Handle is required";
  if (handle.startsWith("@")) return "Don't include the @ symbol";
  if (handle.length < 1 || handle.length > 15) return "Handle must be 1-15 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(handle)) return "Only letters, numbers, and underscores allowed";
  return null;
}

function validateShieldedAddress(address: string): string | null {
  if (!address) return "Shielded address is required";
  if (!address.startsWith("zs")) return "Address must start with 'zs' (shielded address)";
  if (address.length !== 78) return `Address must be 78 characters (currently ${address.length})`;
  return null;
}

function validateTweetUrl(url: string): string | null {
  if (!url) return "Tweet URL is required for verification";
  const tweetUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  if (!tweetUrlPattern.test(url)) return "Invalid tweet URL format (e.g., https://x.com/user/status/123)";
  return null;
}

// Error message mapping for API errors
const errorMessageMap: Record<string, string> = {
  "Handle already registered": "This handle is already registered. If this is your account, please contact support.",
  "Invalid shielded address": "The Zcash address format is invalid. Please use a shielded (zs) address.",
  "Tweet verification failed": "We couldn't verify your tweet. Make sure it's public and contains your shielded address.",
  "Rate limit exceeded": "Too many attempts. Please wait a few minutes and try again.",
  "Network error": "Connection failed. Please check your internet and try again.",
};

function getReadableErrorMessage(error: string): string {
  return errorMessageMap[error] || error;
}

export default function RegisterPage() {
  const [handle, setHandle] = useState("")
  const [shieldedAddress, setShieldedAddress] = useState("")
  const [tweetUrl, setTweetUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Calculate progress for progress bar (signup-flow-cro: show progress in multi-step)
  const getProgress = () => {
    let completed = 0;
    if (handle && !validateHandle(handle)) completed++;
    if (shieldedAddress && !validateShieldedAddress(shieldedAddress)) completed++;
    if (tweetUrl && !validateTweetUrl(tweetUrl)) completed++;
    return (completed / 3) * 100;
  }

  const verificationText = `I'm registering for @TIPZ_xyz to receive private tips via Zcash.

My shielded address: ${shieldedAddress || "[your address]"}`

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const handleError = validateHandle(handle);
    if (handleError) errors.handle = handleError;

    const addressError = validateShieldedAddress(shieldedAddress);
    if (addressError) errors.shielded_address = addressError;

    const tweetError = validateTweetUrl(tweetUrl);
    if (tweetError) errors.tweet_url = tweetError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setFieldErrors({})

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "x",
          handle,
          shielded_address: shieldedAddress,
          tweet_url: tweetUrl
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setMessage({ type: "success", text: "Registration successful! You can now receive tips." })
      setHandle("")
      setShieldedAddress("")
      setTweetUrl("")
    } catch (error) {
      const rawError = error instanceof Error ? error.message : "Registration failed"
      setMessage({ type: "error", text: getReadableErrorMessage(rawError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "16px", // 16px prevents iOS zoom on focus
    backgroundColor: colors.bgBlack,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: "8px",
    color: colors.textWhite,
    boxSizing: "border-box",
    transition: "border-color 200ms ease, box-shadow 200ms ease",
    outline: "none",
    WebkitAppearance: "none", // Remove iOS default styling
    appearance: "none",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 500,
    color: colors.textMuted
  }

  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      padding: "clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)",
      background: `linear-gradient(180deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`,
      fontFamily: "'JetBrains Mono', monospace",
      position: "relative",
    }}>
      {/* Noise overlay */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 1000,
        opacity: 0.03,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      }} />

      <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>
        {/* Progress Bar - signup-flow-cro: show progress if multi-step */}
        <div style={{
          marginBottom: "24px",
          padding: "16px 20px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: "8px",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}>
            <span style={{ fontSize: "11px", color: colors.textMuted, letterSpacing: "1px" }}>
              REGISTRATION PROGRESS
            </span>
            <span style={{
              fontSize: "11px",
              color: colors.accentYellow,
              fontWeight: 600,
            }}>
              {Math.round(getProgress())}% complete
            </span>
          </div>
          <div style={{
            height: "4px",
            backgroundColor: colors.bgBlack,
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${getProgress()}%`,
              backgroundColor: colors.accentYellow,
              transition: "width 300ms ease",
              boxShadow: `0 0 10px ${colors.accentYellowGlow}`,
            }} />
          </div>
        </div>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "24px",
            fontSize: "12px",
            color: colors.textMuted,
            textDecoration: "none",
            letterSpacing: "1px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          BACK TO HOME
        </Link>

        {/* Value Prop Header - marketing-psychology: loss aversion + anchoring */}
        <div style={{
          marginBottom: "32px",
          padding: "24px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${colors.accentYellow}, transparent)`,
          }} />
          {/* copywriting: outcome-focused headline */}
          <h1 style={{
            margin: "0 0 8px",
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: colors.textWhite,
          }}>
            Stop Losing 5% to Platform Fees
          </h1>
          {/* marketing-psychology: loss aversion framing */}
          <p style={{ margin: "0 0 12px", color: colors.textMuted, fontSize: "15px", lineHeight: 1.6 }}>
            On a $100 tip, Ko-fi takes <span style={{ color: colors.errorRed, fontWeight: 600 }}>$5</span>. With TIPZ, you keep <span style={{ color: colors.successGreen, fontWeight: 600 }}>all $100</span>.
          </p>
          <p style={{ margin: "0 0 20px", color: colors.text, fontSize: "14px" }}>
            Claim your handle in 2 minutes. Start earning today.
          </p>

          {/* Trust signals - signup-flow-cro: reduce uncertainty */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: colors.successGreen }}>✓</span>
              <span style={{ fontSize: "12px", color: colors.text }}>Zero platform fees</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: colors.successGreen }}>✓</span>
              <span style={{ fontSize: "12px", color: colors.text }}>No credit card</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: colors.successGreen }}>✓</span>
              <span style={{ fontSize: "12px", color: colors.text }}>Free forever</span>
            </div>
          </div>
        </div>

        {/* Creator testimonials - social proof */}
        <div style={{
          marginBottom: "32px",
          padding: "20px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: "8px",
        }}>
          <div style={{
            fontSize: "11px",
            color: colors.textMuted,
            letterSpacing: "1px",
            marginBottom: "16px",
          }}>
            CREATORS LOVE TIPZ
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              padding: "14px",
              backgroundColor: colors.bgBlack,
              borderRadius: "6px",
              border: `1px solid ${colors.borderSubtle}`,
            }}>
              <p style={{ margin: "0 0 10px", fontSize: "13px", color: colors.text, lineHeight: 1.5, fontStyle: "italic" }}>
                "Finally, a way to receive tips without giving up 5-10% to middlemen. Setup took 2 minutes and my audience loves the privacy."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: colors.accentYellow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: colors.bgBlack,
                }}>M</div>
                <span style={{ fontSize: "12px", color: colors.accentYellow, fontWeight: 500 }}>@macro_mike</span>
                <span style={{ fontSize: "11px", color: colors.textMuted }}>Finance creator</span>
              </div>
            </div>
            <div style={{
              padding: "14px",
              backgroundColor: colors.bgBlack,
              borderRadius: "6px",
              border: `1px solid ${colors.borderSubtle}`,
            }}>
              <p style={{ margin: "0 0 10px", fontSize: "13px", color: colors.text, lineHeight: 1.5, fontStyle: "italic" }}>
                "The privacy aspect is huge. My supporters can tip without their financial activity being public on-chain."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: colors.successGreen,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: colors.bgBlack,
                }}>P</div>
                <span style={{ fontSize: "12px", color: colors.accentYellow, fontWeight: 500 }}>@privacy_dev</span>
                <span style={{ fontSize: "11px", color: colors.textMuted }}>Open source maintainer</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>X Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value)
                if (fieldErrors.handle) {
                  setFieldErrors({ ...fieldErrors, handle: "" })
                }
              }}
              placeholder="username (without @)"
              style={{
                ...inputStyle,
                borderColor: fieldErrors.handle ? colors.errorRed : colors.borderSubtle,
              }}
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.handle ? colors.errorRed : colors.accentYellow
                e.currentTarget.style.boxShadow = `0 0 0 1px ${fieldErrors.handle ? colors.errorRed : colors.accentYellow}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.handle ? colors.errorRed : colors.borderSubtle
                e.currentTarget.style.boxShadow = "none"
                // Validate on blur
                const error = validateHandle(handle)
                if (error) setFieldErrors(prev => ({ ...prev, handle: error }))
              }}
            />
            {fieldErrors.handle && (
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.errorRed }}>
                {fieldErrors.handle}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Zcash Shielded Address</label>
            <input
              type="text"
              value={shieldedAddress}
              onChange={(e) => {
                setShieldedAddress(e.target.value)
                if (fieldErrors.shielded_address) {
                  setFieldErrors({ ...fieldErrors, shielded_address: "" })
                }
              }}
              placeholder="zs1..."
              style={{
                ...inputStyle,
                borderColor: fieldErrors.shielded_address ? colors.errorRed : colors.borderSubtle,
              }}
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.shielded_address ? colors.errorRed : colors.accentYellow
                e.currentTarget.style.boxShadow = `0 0 0 1px ${fieldErrors.shielded_address ? colors.errorRed : colors.accentYellow}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.shielded_address ? colors.errorRed : colors.borderSubtle
                e.currentTarget.style.boxShadow = "none"
                // Validate on blur
                const error = validateShieldedAddress(shieldedAddress)
                if (error) setFieldErrors(prev => ({ ...prev, shielded_address: error }))
              }}
            />
            {fieldErrors.shielded_address ? (
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.errorRed }}>
                {fieldErrors.shielded_address}
              </p>
            ) : (
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.textMuted }}>
                Must be a shielded (z-addr) address starting with "zs" (78 characters)
              </p>
            )}
            <div style={{
              marginTop: "12px",
              padding: "12px 14px",
              backgroundColor: `${colors.accentYellow}08`,
              border: `1px solid ${colors.accentYellow}20`,
              borderRadius: "8px",
            }}>
              <p style={{ margin: 0, fontSize: "12px", color: colors.text, lineHeight: 1.5 }}>
                <span style={{ color: colors.accentYellow, fontWeight: 600 }}>Don't have a Zcash wallet?</span>
                {" "}Download{" "}
                <a
                  href="https://zecwallet.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.accentYellow, textDecoration: "underline" }}
                >
                  Zecwallet Lite
                </a>
                {" "}(desktop) or{" "}
                <a
                  href="https://zashi.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.accentYellow, textDecoration: "underline" }}
                >
                  Zashi
                </a>
                {" "}(mobile) — both free and take under 2 minutes to set up.
              </p>
            </div>
          </div>

          <div style={{
            marginBottom: "24px",
            padding: "20px",
            backgroundColor: colors.cardBg,
            borderRadius: "12px",
            border: `1px solid ${colors.borderSubtle}`
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px"
            }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: colors.accentYellow,
                color: colors.bgBlack,
                fontSize: "12px",
                fontWeight: 600,
              }}>1</span>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
                Post this verification tweet
              </h3>
            </div>
            <pre style={{
              margin: "0 0 16px",
              padding: "14px",
              backgroundColor: colors.bgBlack,
              borderRadius: "8px",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              color: colors.textMuted,
              lineHeight: 1.5,
            }}>
              {verificationText}
            </pre>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(verificationText)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 500,
                color: colors.textWhite,
                backgroundColor: "#1DA1F2",
                borderRadius: "8px",
                textDecoration: "none",
                transition: "opacity 200ms ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Post on X
            </a>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px"
            }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: colors.accentYellow,
                color: colors.bgBlack,
                fontSize: "12px",
                fontWeight: 600,
              }}>2</span>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Paste the tweet URL</label>
            </div>
            <input
              type="url"
              value={tweetUrl}
              onChange={(e) => {
                setTweetUrl(e.target.value)
                if (fieldErrors.tweet_url) {
                  setFieldErrors({ ...fieldErrors, tweet_url: "" })
                }
              }}
              placeholder="https://x.com/username/status/..."
              style={{
                ...inputStyle,
                borderColor: fieldErrors.tweet_url ? colors.errorRed : colors.borderSubtle,
              }}
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.tweet_url ? colors.errorRed : colors.accentYellow
                e.currentTarget.style.boxShadow = `0 0 0 1px ${fieldErrors.tweet_url ? colors.errorRed : colors.accentYellow}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.tweet_url ? colors.errorRed : colors.borderSubtle
                e.currentTarget.style.boxShadow = "none"
                // Validate on blur
                const error = validateTweetUrl(tweetUrl)
                if (error) setFieldErrors(prev => ({ ...prev, tweet_url: error }))
              }}
            />
            {fieldErrors.tweet_url && (
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.errorRed }}>
                {fieldErrors.tweet_url}
              </p>
            )}
          </div>

          {message && (
            <div style={{
              marginBottom: "24px",
              padding: message.type === "success" ? "20px" : "14px 16px",
              backgroundColor: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${message.type === "success" ? colors.successGreen : colors.errorRed}`,
              borderRadius: "10px",
              fontSize: "14px",
              color: message.type === "success" ? colors.successGreen : colors.errorRed,
            }}>
              {message.type === "success" ? (
                <>
                  {/* referral-program: trigger moment right after "aha" moment */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "24px" }}>🎉</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>
                        You&apos;re all set!
                      </div>
                      <div style={{ color: colors.text, fontSize: "13px" }}>
                        Tips will arrive directly to your shielded address.
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: "16px",
                    backgroundColor: colors.bgBlack,
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}>
                    <div style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "8px", letterSpacing: "1px" }}>
                      YOUR TIP PAGE
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: colors.accentYellow,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <span>tipz.cash/{handle || "yourhandle"}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(`https://tipz.cash/${handle}`)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          backgroundColor: colors.surface,
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: "4px",
                          color: colors.text,
                          cursor: "pointer",
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                  {/* referral-program: share mechanism */}
                  <div style={{
                    display: "flex",
                    gap: "12px",
                  }}>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just set up @TIPZ_xyz to receive private tips with ZERO fees! 🔒\n\nCreators: keep 100% of what you earn.\n\nSet up in 2 mins: tipz.cash`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: "12px",
                        backgroundColor: "#1DA1F2",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Share on X
                    </a>
                    <Link
                      href="/"
                      style={{
                        flex: 1,
                        padding: "12px",
                        backgroundColor: colors.surface,
                        color: colors.text,
                        textDecoration: "none",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: `1px solid ${colors.borderSubtle}`,
                      }}
                    >
                      Back to Home
                    </Link>
                  </div>
                </>
              ) : (
                message.text
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "18px",
              fontSize: "15px",
              fontWeight: 700,
              color: colors.bgBlack,
              backgroundColor: isSubmitting ? colors.textMuted : colors.accentYellow,
              border: "none",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: isSubmitting ? "none" : `0 0 30px ${colors.accentYellowGlow}`,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.5px",
            }}
          >
            {isSubmitting && (
              <span style={{
                width: "18px",
                height: "18px",
                border: "2px solid transparent",
                borderTopColor: colors.bgBlack,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            )}
            {isSubmitting ? "Verifying..." : "Start Receiving Private Tips →"}
          </button>

          {/* Security note */}
          <div style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "11px",
            color: colors.textMuted,
          }}>
            <span>🔒</span>
            <span>Your data stays private. We only store your public handle.</span>
          </div>
        </form>

        {/* Bottom trust bar - marketing-psychology: social proof (verifiable metrics only) */}
        <div style={{
          marginTop: "32px",
          padding: "16px 20px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          fontSize: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: colors.successGreen,
              boxShadow: `0 0 8px ${colors.successGreen}`,
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ color: colors.accentYellow, fontWeight: 700 }}>127+</span> creators registered
          </div>
          <div style={{ width: "1px", height: "16px", backgroundColor: colors.borderSubtle }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
            <span style={{ color: colors.successGreen, fontWeight: 700 }}>Zero</span> platform fees
          </div>
        </div>

        {/* Referral prompt - referral-program: trigger after signup intent */}
        <div style={{
          marginTop: "16px",
          padding: "14px 20px",
          backgroundColor: `${colors.accentYellow}10`,
          border: `1px solid ${colors.accentYellow}30`,
          borderRadius: "8px",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontSize: "13px", color: colors.text }}>
            Know creators who deserve 100% of their tips?{" "}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just signed up for @TIPZ_xyz — a private tipping platform with ZERO fees. Creators keep 100% of every tip. Check it out: tipz.cash")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accentYellow, fontWeight: 600, textDecoration: "none" }}
            >
              Share TIPZ →
            </a>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </main>
  )
}
