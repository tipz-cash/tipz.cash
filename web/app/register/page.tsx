"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { colors } from "@/lib/colors"
import { animationKeyframes, transitions } from "@/lib/animations"
import { CheckIcon, LockIcon, ShieldIcon, CelebrationIcon, XIcon } from "@/components/Icons"

function validateShieldedAddress(address: string): string | null {
  if (!address) return "Shielded address is required"
  if (!address.startsWith("u1")) {
    return "Must be a unified address (starts with 'u1')"
  }
  return null
}

function isAddressComplete(address: string): boolean {
  if (address.startsWith("u1")) {
    return address.length >= 141
  }
  return false
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [handle, setHandle] = useState("")
  const [shieldedAddress, setShieldedAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [registeredHandle, setRegisteredHandle] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await res.json()

        if (data.authenticated) {
          if (data.registered) {
            // Already registered — go to dashboard
            router.replace("/my")
            return
          }
          // Authenticated but not registered — show address form
          setAuthenticated(true)
          setHandle(data.handle)
        }
      } catch (err) {
        console.error("[register] Session check failed:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }
  }, [])

  // Detect mobile viewport for sticky CTA
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        const isMobileUA = /iPhone|iPad|Android/i.test(navigator.userAgent)
        const isMobileWidth = window.innerWidth < 480
        setIsMobile(isMobileUA || isMobileWidth)
      }
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setFieldErrors({})

    // Validate address
    const errors: Record<string, string> = {}
    if (!isAddressComplete(shieldedAddress)) {
      errors.shielded_address =
        shieldedAddress.length === 0
          ? "Shielded address is required"
          : `Unified address too short (${shieldedAddress.length} chars, need 141+)`
    }
    const addrError = validateShieldedAddress(shieldedAddress)
    if (addrError && !errors.shielded_address) {
      errors.shielded_address = addrError
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shielded_address: shieldedAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setRegisteredHandle(handle)
      setMessage({ type: "success", text: "Registration successful! You can now receive tips." })

      // Auto-copy tip link on success
      const tipLink = `https://tipz.cash/${handle}`
      try {
        await navigator.clipboard.writeText(tipLink)
        setLinkCopied(true)
      } catch (e) {
        console.warn("Could not auto-copy tip link", e)
      }

      // Store verified identity in localStorage for TIPZ extension
      try {
        localStorage.setItem(
          "tipz_creator_identity",
          JSON.stringify({
            handle: handle,
            verified: true,
            verifiedAt: Date.now(),
          })
        )

        window.dispatchEvent(
          new CustomEvent("tipz-registration-success", {
            detail: { handle, verified: true },
          })
        )
      } catch (e) {
        console.warn("Could not store creator identity in localStorage", e)
      }

      setShieldedAddress("")
    } catch (error) {
      const rawError = error instanceof Error ? error.message : "Registration failed"
      setMessage({ type: "error", text: rawError })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyTipLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://tipz.cash/${registeredHandle || handle}`)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (e) {
      console.warn("Could not copy", e)
    }
  }

  const animationStyle = prefersReducedMotion
    ? { opacity: 1 }
    : {
        animation: "fadeInUp 0.4s ease-out forwards",
      }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px 16px",
    minHeight: "58px",
    fontSize: "16px",
    fontFamily: "var(--font-family-mono)",
    backgroundColor: "rgba(8, 9, 10, 0.8)",
    border: `1px solid ${colors.border}`,
    borderRadius: "10px",
    color: colors.textBright,
    boxSizing: "border-box",
    transition: transitions.normal,
    outline: "none",
    WebkitAppearance: "none",
    appearance: "none",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: 600,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontFamily: "var(--font-family-mono)",
  }

  // Calculate progress for progress bar
  const getProgress = () => {
    if (!authenticated) return 10
    if (message?.type === "success") return 100
    if (isAddressComplete(shieldedAddress)) return 75
    if (shieldedAddress.length > 0) return 40
    return 25
  }

  const promoTweetText = `I just signed up to @tipz_cash! Tip me privately: tipz.cash/${registeredHandle || handle}`

  // Loading state
  if (loading) {
    return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: colors.pageBg,
          fontFamily: "var(--font-family-mono)",
        }}
      >
        <div
          className="register-card"
          style={{
            width: "100%",
            maxWidth: "560px",
            position: "relative",
            background: "rgba(26, 26, 26, 0.6)",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            border: `1px solid rgba(245, 166, 35, 0.25)`,
            borderRadius: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
            padding: "48px 24px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: `2px solid ${colors.border}`,
              borderTopColor: colors.primary,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              color: colors.muted,
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            INITIALIZING
          </span>
        </div>
        <style>{`
          ${animationKeyframes}
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .register-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            opacity: 0.03;
            pointer-events: none;
            z-index: 0;
            border-radius: inherit;
          }
          .register-card > * {
            position: relative;
            z-index: 1;
          }
        `}</style>
      </main>
    )
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)",
        paddingTop: "80px",
        background: colors.pageBg,
        fontFamily: "var(--font-family-mono)",
        position: "relative",
      }}
    >
      <div
        className="register-card"
        style={{
          width: "100%",
          maxWidth: "560px",
          position: "relative",
          background: "rgba(26, 26, 26, 0.6)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          border: `1px solid rgba(245, 166, 35, 0.25)`,
          borderRadius: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
          padding: "28px 24px",
          overflow: "hidden",
        }}
      >
        {/* Progress Bar */}
        {authenticated && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: colors.muted,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-family-mono)",
                }}
              >
                REGISTRATION
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: colors.primary,
                  fontWeight: 600,
                }}
              >
                {Math.round(getProgress())}% complete
              </span>
            </div>
            <div
              style={{
                height: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${getProgress()}%`,
                  backgroundColor: colors.primary,
                  transition: "width 300ms ease",
                  boxShadow: `0 0 10px ${colors.primaryGlow}`,
                }}
              />
            </div>
          </div>
        )}

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "24px",
            fontSize: "12px",
            color: colors.muted,
            textDecoration: "none",
            letterSpacing: "1px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          BACK TO HOME
        </Link>

        {/* Value Prop Header */}
        <div
          style={{
            marginBottom: "32px",
            padding: "28px 0",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: colors.primary,
              letterSpacing: "2px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: colors.primary,
                borderRadius: "50%",
                boxShadow: `0 0 10px ${colors.primary}`,
                animation: prefersReducedMotion ? "none" : "pulse-glow 2s ease-in-out infinite",
              }}
            />
            SOVEREIGN IDENTITY
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(28px, 5vw, 38px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              color: colors.textBright,
              fontFamily: "var(--font-family-mono)",
            }}
          >
            <span style={{ color: colors.primary }}>{">"}</span>{" "}
            {authenticated ? (
              <>
                Welcome, <span style={{ color: colors.primary }}>@{handle}</span>
              </>
            ) : (
              "Claim Your Sovereign Identity."
            )}
          </h1>

          <p
            style={{
              margin: "0",
              color: colors.muted,
              fontSize: "14px",
              lineHeight: 1.7,
              fontFamily: "var(--font-family-mono)",
            }}
          >
            {authenticated
              ? "Add your Zcash address to start receiving private tips."
              : "Sign in with X to get started. Two steps, under a minute."}
          </p>
        </div>

        {/* Not authenticated — Sign in with X */}
        {!authenticated && (
          <div
            style={{
              padding: "48px 32px",
              textAlign: "center",
              background: "rgba(18, 20, 26, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(245, 166, 35, 0.12)",
              borderRadius: "12px",
              position: "relative",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
              ...animationStyle,
            }}
          >
            {/* Gold top accent — 3px */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                borderRadius: "12px 12px 0 0",
                backgroundSize: "200% 100%",
                animation: prefersReducedMotion
                  ? "none"
                  : "goldBorderSweep 3s ease-in-out infinite",
              }}
            />

            {/* Shield icon with glow */}
            <div
              style={{
                marginBottom: "24px",
                ...(prefersReducedMotion
                  ? {}
                  : { animation: "scaleSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both" }),
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  filter: "drop-shadow(0 0 30px rgba(245, 166, 35, 0.15))",
                }}
              >
                <ShieldIcon size={48} color={colors.primary} />
              </div>
            </div>

            <p
              style={{
                margin: "0 0 28px",
                color: colors.text,
                fontSize: "14px",
                lineHeight: 1.6,
                maxWidth: "320px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              TIPZ uses X login to verify your handle. Your address stays between you and your
              wallet.
            </p>

            <a
              href="/api/auth/twitter"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 32px",
                fontSize: "15px",
                fontWeight: 700,
                color: colors.bg,
                backgroundColor: colors.primary,
                borderRadius: "8px",
                textDecoration: "none",
                transition: transitions.normal,
                cursor: "pointer",
                boxShadow: `0 0 30px ${colors.primaryGlow}`,
                letterSpacing: "0.04em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryHover
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <XIcon size={16} />
              Sign in with X
            </a>

            <p
              style={{
                margin: "20px 0 0",
                fontSize: "12px",
                color: colors.muted,
              }}
            >
              Already registered?{" "}
              <Link href="/my" style={{ color: colors.primary, textDecoration: "underline" }}>
                Go to dashboard
              </Link>
            </p>
          </div>
        )}

        {/* Authenticated — Address input form */}
        {authenticated && !message?.type && (
          <form onSubmit={handleSubmit}>
            {/* Signed in confirmation */}
            <div
              style={{
                marginBottom: "24px",
                padding: "14px 16px",
                backgroundColor: colors.successGlow,
                border: `1px solid ${colors.success}`,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                color: colors.success,
                ...animationStyle,
              }}
            >
              <CheckIcon size={16} color={colors.success} />
              Signed in as <strong>@{handle}</strong> — verified via X
            </div>

            {/* Zcash Address Input */}
            <div
              style={{
                marginBottom: "32px",
                ...animationStyle,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>Zcash Shielded Address</label>
                {isAddressComplete(shieldedAddress) && (
                  <span
                    style={{
                      animation: prefersReducedMotion ? "none" : "fadeIn 0.3s ease-out",
                    }}
                  >
                    <CheckIcon size={16} color={colors.success} />
                  </span>
                )}
              </div>
              <input
                type="text"
                value={shieldedAddress}
                onChange={(e) => {
                  setShieldedAddress(e.target.value)
                  if (fieldErrors.shielded_address) {
                    setFieldErrors({ ...fieldErrors, shielded_address: "" })
                  }
                }}
                placeholder="u1..."
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.shielded_address
                    ? colors.error
                    : isAddressComplete(shieldedAddress)
                      ? colors.success
                      : colors.border,
                }}
                required
                aria-describedby="address-hint"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.shielded_address
                    ? colors.error
                    : colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${fieldErrors.shielded_address ? colors.error : colors.primary}, 0 0 20px ${fieldErrors.shielded_address ? colors.errorGlow : colors.primaryGlow}`
                }}
                onBlur={(e) => {
                  const isValid = isAddressComplete(shieldedAddress)
                  e.currentTarget.style.borderColor = fieldErrors.shielded_address
                    ? colors.error
                    : isValid
                      ? colors.success
                      : colors.border
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
              {fieldErrors.shielded_address ? (
                <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.error }}>
                  {fieldErrors.shielded_address}
                </p>
              ) : (
                <p
                  id="address-hint"
                  style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    color: isAddressComplete(shieldedAddress) ? colors.success : colors.muted,
                  }}
                >
                  {shieldedAddress.length > 0
                    ? `${shieldedAddress.length} characters (unified address)`
                    : "Unified address (u1...)"}
                </p>
              )}

              {/* Wallet help */}
              <details style={{ marginTop: "16px" }}>
                <summary
                  style={{
                    fontSize: "12px",
                    color: colors.primary,
                    cursor: "pointer",
                    fontWeight: 500,
                    padding: "12px 0",
                  }}
                >
                  Need a wallet?
                </summary>
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px 14px",
                    backgroundColor: "rgba(18, 20, 26, 0.85)",
                    border: "1px solid rgba(245, 166, 35, 0.12)",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "12px", color: colors.text, lineHeight: 1.5 }}>
                    Download{" "}
                    <a
                      href="https://zodl.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: colors.primary, textDecoration: "underline" }}
                    >
                      Zodl
                    </a>{" "}
                    (iOS / Android / desktop) — free, under 2 minutes.
                  </p>
                </div>
              </details>
            </div>

            {/* Submit Button */}
            <div
              style={{
                position: isMobile ? "sticky" : "relative",
                bottom: 0,
                margin: isMobile ? "0 calc(-1 * clamp(16px, 4vw, 24px))" : 0,
                width: isMobile ? "auto" : "100%",
                padding: isMobile ? "16px clamp(16px, 4vw, 24px)" : 0,
                paddingBottom: isMobile ? "max(16px, env(safe-area-inset-bottom))" : 0,
                background: isMobile
                  ? "linear-gradient(180deg, transparent 0%, rgba(26, 26, 26, 0.95) 20%)"
                  : "transparent",
                marginTop: isMobile ? "16px" : 0,
                zIndex: 10,
              }}
            >
              <button
                type="submit"
                disabled={isSubmitting || !isAddressComplete(shieldedAddress)}
                style={{
                  width: "100%",
                  padding: "18px",
                  minHeight: "56px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color:
                    isSubmitting || !isAddressComplete(shieldedAddress) ? colors.muted : colors.bg,
                  backgroundColor:
                    isSubmitting || !isAddressComplete(shieldedAddress)
                      ? "rgba(255, 255, 255, 0.08)"
                      : colors.primary,
                  border:
                    isSubmitting || !isAddressComplete(shieldedAddress)
                      ? `1px solid ${colors.border}`
                      : "none",
                  borderRadius: "10px",
                  cursor:
                    isSubmitting || !isAddressComplete(shieldedAddress) ? "not-allowed" : "pointer",
                  transition: transitions.normal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow:
                    isSubmitting || !isAddressComplete(shieldedAddress)
                      ? "none"
                      : `0 0 30px ${colors.primaryGlow}`,
                  letterSpacing: "0.04em",
                  transform: "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && isAddressComplete(shieldedAddress)) {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.backgroundColor = colors.primaryHover
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.backgroundColor =
                    isSubmitting || !isAddressComplete(shieldedAddress)
                      ? "rgba(255, 255, 255, 0.08)"
                      : colors.primary
                }}
              >
                {isSubmitting && (
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid transparent",
                      borderTopColor: colors.bg,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                )}
                {isSubmitting ? "Registering..." : "Complete Registration"}
              </button>
            </div>

            {/* Security note */}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "12px",
                color: colors.muted,
              }}
            >
              <LockIcon size={14} color={colors.muted} />
              <span>Your address is stored securely. It is not posted publicly.</span>
            </div>
          </form>
        )}

        {/* Error Message */}
        {message && message.type === "error" && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px 16px",
              backgroundColor: colors.errorGlow,
              border: `1px solid ${colors.error}`,
              borderRadius: "10px",
              fontSize: "14px",
              color: colors.error,
            }}
          >
            {message.text}
            <button
              type="button"
              onClick={() => setMessage(null)}
              style={{
                display: "block",
                marginTop: "12px",
                padding: "8px 16px",
                fontSize: "12px",
                backgroundColor: "transparent",
                border: `1px solid ${colors.error}`,
                borderRadius: "4px",
                color: colors.error,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Success Message */}
        {message && message.type === "success" && (
          <div
            style={{
              marginBottom: "24px",
              padding: "24px",
              background: "rgba(18, 20, 26, 0.85)",
              border: "1px solid rgba(245, 166, 35, 0.12)",
              borderRadius: "12px",
              position: "relative",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
              animation: prefersReducedMotion ? "none" : "fadeInUp 0.5s ease-out",
            }}
          >
            {/* Gold top accent bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                borderRadius: "12px 12px 0 0",
                backgroundSize: "200% 100%",
                animation: prefersReducedMotion
                  ? "none"
                  : "goldBorderSweep 3s ease-in-out infinite",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  ...(prefersReducedMotion
                    ? {}
                    : {
                        animation: "scaleSpring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
                      }),
                  filter: "drop-shadow(0 0 30px rgba(245, 166, 35, 0.15))",
                }}
              >
                <CelebrationIcon size={32} color={colors.primary} />
              </span>

              <div
                style={{
                  fontSize: "12px",
                  color: colors.muted,
                  letterSpacing: "3px",
                  fontFamily: "var(--font-family-mono)",
                }}
              >
                REGISTRATION COMPLETE
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: "18px",
                  color: colors.textBright,
                  letterSpacing: "-0.035em",
                }}
              >
                Welcome,{" "}
                <span style={{ color: colors.primary }}>@{registeredHandle || handle}</span>
              </div>

              <div style={{ color: colors.text, fontSize: "13px" }}>
                Tips will arrive directly to your shielded address.
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "rgba(8, 9, 10, 0.6)",
                border: `1px solid ${colors.border}`,
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: colors.muted,
                  marginBottom: "8px",
                  letterSpacing: "2px",
                }}
              >
                YOUR TIP PAGE{" "}
                {linkCopied && <span style={{ color: colors.success }}>• Copied!</span>}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: colors.primary,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>tipz.cash/{registeredHandle || handle || "yourhandle"}</span>
                <button
                  type="button"
                  onClick={copyTipLink}
                  style={{
                    padding: "6px 12px",
                    fontSize: "11px",
                    backgroundColor: linkCopied ? colors.success : colors.surface,
                    border: `1px solid ${linkCopied ? colors.success : colors.border}`,
                    borderRadius: "6px",
                    color: linkCopied ? colors.bg : colors.text,
                    cursor: "pointer",
                    transition: transitions.fast,
                  }}
                >
                  {linkCopied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Action buttons — Dashboard is primary CTA */}
            <div className="success-buttons" style={{ display: "flex", gap: "12px" }}>
              <Link
                href="/my"
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: colors.primary,
                  color: colors.bg,
                  textDecoration: "none",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  letterSpacing: "0.04em",
                  boxShadow: `0 0 20px ${colors.primaryGlow}`,
                }}
              >
                Go to Dashboard
              </Link>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(promoTweetText)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: colors.text,
                  textDecoration: "none",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  border: `1px solid ${colors.border}`,
                  letterSpacing: "0.04em",
                }}
              >
                <XIcon size={14} />
                Share on X
              </a>
            </div>
          </div>
        )}

        {/* Bottom trust bar */}
        {!message?.type && (
          <div
            style={{
              marginTop: "32px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Uncensorable</span>
            </div>
            <div style={{ width: "1px", height: "16px", backgroundColor: colors.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <span>Zero Rent</span>
            </div>
            <div style={{ width: "1px", height: "16px", backgroundColor: colors.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
              </svg>
              <span>Permanent</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        ${animationKeyframes}
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .register-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
          border-radius: inherit;
        }
        .register-card > * {
          position: relative;
          z-index: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
        @media (max-width: 480px) {
          .success-buttons {
            flex-direction: column !important;
          }
        }
      `}</style>
    </main>
  )
}
