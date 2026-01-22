"use client"

import { useState } from "react"
import Link from "next/link"

// Brand colors
const colors = {
  accentYellow: "#F4B728",
  accentYellowLight: "#fcd34d",
  bgBlack: "#000000",
  cardBg: "#1a1a1a",
  borderSubtle: "#333333",
  textWhite: "#FFFFFF",
  textMuted: "#888888",
  successGreen: "#22c55e",
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
      padding: "clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)"
    }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <Link
          href="/"
          className="footer-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "32px",
            fontSize: "14px"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to home
        </Link>

        <h1 style={{
          margin: "0 0 8px",
          fontSize: "32px",
          fontWeight: 600,
          letterSpacing: "-0.02em"
        }}>
          Register as Creator
        </h1>
        <p style={{ margin: "0 0 32px", color: colors.textMuted }}>
          Set up your profile to receive private tips
        </p>

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
              padding: "14px 16px",
              backgroundColor: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${message.type === "success" ? colors.successGreen : colors.errorRed}`,
              borderRadius: "10px",
              fontSize: "14px",
              color: message.type === "success" ? colors.successGreen : colors.errorRed,
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn--primary"
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              fontWeight: 500,
              color: colors.bgBlack,
              backgroundColor: isSubmitting ? colors.textMuted : colors.accentYellow,
              border: "none",
              borderRadius: "10px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 200ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isSubmitting && (
              <span className="spinner" style={{
                width: "18px",
                height: "18px",
                border: "2px solid transparent",
                borderTopColor: colors.bgBlack,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            )}
            {isSubmitting ? "Registering..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </main>
  )
}
