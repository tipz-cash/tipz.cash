"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { colors } from "@/lib/colors"
import { animationKeyframes, transitions } from "@/lib/animations"

// SVG Icons (no emojis - brand guidelines)
function CheckIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LockIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CelebrationIcon({ size = 32, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
    </svg>
  );
}

// Form validation helpers
function validateHandle(handle: string): string | null {
  if (!handle) return "Handle is required";
  if (handle.startsWith("@")) return "Without @";
  if (handle.length < 1 || handle.length > 15) return "Handle must be 1-15 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(handle)) return "Only letters, numbers, and underscores allowed";
  return null;
}

function validateShieldedAddress(address: string): string | null {
  if (!address) return "Shielded address is required";
  // Accept Sapling (zs1...) or Unified (u1...) addresses
  if (!address.startsWith("zs1") && !address.startsWith("u1")) {
    return "Must be a shielded address (starts with 'zs1' or 'u1')";
  }
  return null;
}

function isAddressComplete(address: string): boolean {
  // Sapling addresses (zs1): exactly 78 characters
  // Unified addresses (u1): 141+ characters (variable, typically 141-216)
  if (address.startsWith("zs1")) {
    return address.length === 78;
  }
  if (address.startsWith("u1")) {
    return address.length >= 141;
  }
  return false;
}

function validateTweetUrl(url: string): string | null {
  if (!url) return "Tweet URL is required for verification";
  const tweetUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  if (!tweetUrlPattern.test(url)) return "Invalid tweet URL (e.g., https://x.com/user/status/123)";
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
  const [registeredHandle, setRegisteredHandle] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [linkCopied, setLinkCopied] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Detect mobile viewport for sticky CTA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const isMobileUA = /iPhone|iPad|Android/i.test(navigator.userAgent);
        const isMobileWidth = window.innerWidth < 480;
        setIsMobile(isMobileUA || isMobileWidth);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Progressive disclosure: advance steps as fields complete
  useEffect(() => {
    if (handle && !validateHandle(handle) && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [handle, currentStep]);

  useEffect(() => {
    if (isAddressComplete(shieldedAddress) && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [shieldedAddress, currentStep]);

  // Calculate progress for progress bar (starts at 10% for sunk cost psychology)
  const getProgress = () => {
    let completed = 0;
    if (handle && !validateHandle(handle)) completed++;
    if (isAddressComplete(shieldedAddress)) completed++;
    if (tweetUrl && !validateTweetUrl(tweetUrl)) completed++;
    // Base 10% + 30% per step (10 + 30 + 30 + 30 = 100)
    return 10 + (completed / 3) * 90;
  }

  const verificationText = `I'm registering for @TIPZ_xyz to receive private tips via Zcash.

My shielded address: ${shieldedAddress || "[your address]"}`

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const handleError = validateHandle(handle);
    if (handleError) errors.handle = handleError;

    if (!isAddressComplete(shieldedAddress)) {
      errors.shielded_address = shieldedAddress.length === 0
        ? "Shielded address is required"
        : shieldedAddress.startsWith("u1")
          ? `Unified address too short (${shieldedAddress.length} chars, need 141+)`
          : `Sapling address must be 78 characters (${shieldedAddress.length}/78)`;
    }

    const tweetError = validateTweetUrl(tweetUrl);
    if (tweetError) errors.tweet_url = tweetError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setFieldErrors({})

    if (!validateForm()) return;

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

      setRegisteredHandle(handle)
      setMessage({ type: "success", text: "Registration successful! You can now receive tips." })

      // Auto-copy tip link on success
      const tipLink = `https://tipz.cash/${handle}`;
      try {
        await navigator.clipboard.writeText(tipLink);
        setLinkCopied(true);
      } catch (e) {
        console.warn('Could not auto-copy tip link', e);
      }

      // Store verified identity in localStorage for TIPZ extension
      try {
        localStorage.setItem('tipz_creator_identity', JSON.stringify({
          handle: handle,
          verified: true,
          verifiedAt: Date.now()
        }))

        // Dispatch custom event for TIPZ extension to auto-link
        // The extension's tipz-interceptor.tsx listens for this event
        window.dispatchEvent(new CustomEvent('tipz-registration-success', {
          detail: { handle, verified: true }
        }))
      } catch (e) {
        console.warn('Could not store creator identity in localStorage', e)
      }

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

  const copyTipLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://tipz.cash/${registeredHandle || handle}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      console.warn('Could not copy', e);
    }
  }

  const animationStyle = prefersReducedMotion ? {} : {
    animation: "fadeInUp 0.4s ease-out forwards",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px 16px",
    minHeight: "58px",
    fontSize: "16px", // Prevents iOS zoom on focus
    fontFamily: "'JetBrains Mono', monospace",
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
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
    fontSize: "14px",
    fontWeight: 500,
    color: colors.muted
  }

  const stepNumberStyle = (stepNum: number, active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: active ? colors.primary : colors.surface,
    color: active ? colors.bg : colors.muted,
    fontSize: "13px",
    fontWeight: 700,
    transition: transitions.normal,
  });

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
      <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>
        {/* Progress Bar */}
        <div style={{
          marginBottom: "24px",
          padding: "16px 20px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "10px",
          }}>
            <span style={{
              fontSize: "11px",
              color: colors.primary,
              fontWeight: 600,
            }}>
              {Math.round(getProgress())}% complete
            </span>
          </div>
          <div style={{
            height: "4px",
            backgroundColor: colors.bg,
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${getProgress()}%`,
              backgroundColor: colors.primary,
              transition: "width 300ms ease",
              boxShadow: `0 0 10px ${colors.primaryGlow}`,
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
            color: colors.muted,
            textDecoration: "none",
            letterSpacing: "1px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          BACK TO HOME
        </Link>

        {/* Value Prop Header - Matches home page aesthetic */}
        <div style={{
          marginBottom: "32px",
          padding: "28px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "20px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Chapter-style header */}
          <div style={{
            fontSize: "11px",
            color: colors.primary,
            letterSpacing: "2px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: colors.primary,
              borderRadius: "50%",
              boxShadow: `0 0 10px ${colors.primary}`,
              animation: prefersReducedMotion ? "none" : "pulse-glow 2s ease-in-out infinite",
            }} />
            SOVEREIGN IDENTITY
          </div>

          {/* Main headline */}
          <h1 style={{
            margin: "0 0 12px",
            fontSize: "clamp(28px, 5vw, 38px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            color: colors.textBright,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ color: colors.primary }}>{">"}</span>{" "}
            Claim Your Sovereign Identity.
          </h1>

          {/* Subheadline */}
          <p style={{
            margin: "0",
            color: colors.muted,
            fontSize: "14px",
            lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            One handle for every asset. Your universal address for the private web.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: X Handle */}
          <div style={{
            marginBottom: "32px",
            ...animationStyle,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={stepNumberStyle(1, currentStep >= 1)}>1</span>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Reserve your handle</label>
              {handle && !validateHandle(handle) && (
                <span style={{
                  animation: prefersReducedMotion ? "none" : "fadeIn 0.3s ease-out",
                }}><CheckIcon size={16} color={colors.success} /></span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.muted,
                fontSize: "16px",
                fontFamily: "'JetBrains Mono', monospace",
                pointerEvents: "none",
              }}>@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value)
                  if (fieldErrors.handle) {
                    setFieldErrors({ ...fieldErrors, handle: "" })
                  }
                }}
                placeholder="yourXhandle"
                style={{
                  ...inputStyle,
                  paddingLeft: "36px",
                  borderColor: fieldErrors.handle ? colors.error :
                    (handle && !validateHandle(handle)) ? colors.success : colors.border,
                }}
                required
                aria-describedby={fieldErrors.handle ? "handle-error" : undefined}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.handle ? colors.error : colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${fieldErrors.handle ? colors.error : colors.primary}`
                }}
                onBlur={(e) => {
                  const isValid = handle && !validateHandle(handle);
                  e.currentTarget.style.borderColor = fieldErrors.handle ? colors.error :
                    isValid ? colors.success : colors.border
                  e.currentTarget.style.boxShadow = "none"
                  const error = validateHandle(handle)
                  if (error) setFieldErrors(prev => ({ ...prev, handle: error }))
                }}
              />
            </div>
            {fieldErrors.handle && (
              <p id="handle-error" style={{ margin: "8px 0 0", fontSize: "12px", color: colors.error }}>
                {fieldErrors.handle}
              </p>
            )}
          </div>

          {/* Step 2: Zcash Address - Revealed after valid handle */}
          {currentStep >= 2 && (
            <div style={{
              marginBottom: "32px",
              opacity: 0,
              ...animationStyle,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={stepNumberStyle(2, currentStep >= 2)}>2</span>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Zcash Shielded Address</label>
                {isAddressComplete(shieldedAddress) && (
                  <span style={{
                    animation: prefersReducedMotion ? "none" : "fadeIn 0.3s ease-out",
                  }}><CheckIcon size={16} color={colors.success} /></span>
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
                placeholder="zs1..."
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.shielded_address ? colors.error :
                    isAddressComplete(shieldedAddress) ? colors.success : colors.border,
                }}
                required
                aria-describedby="address-hint"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.shielded_address ? colors.error : colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${fieldErrors.shielded_address ? colors.error : colors.primary}`
                }}
                onBlur={(e) => {
                  const isValid = isAddressComplete(shieldedAddress);
                  e.currentTarget.style.borderColor = fieldErrors.shielded_address ? colors.error :
                    isValid ? colors.success : colors.border
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
              {fieldErrors.shielded_address ? (
                <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.error }}>
                  {fieldErrors.shielded_address}
                </p>
              ) : (
                <p id="address-hint" style={{
                  margin: "8px 0 0",
                  fontSize: "12px",
                  color: isAddressComplete(shieldedAddress) ? colors.success : colors.muted
                }}>
                  {shieldedAddress.length > 0
                    ? shieldedAddress.startsWith("u1")
                      ? `${shieldedAddress.length} characters (unified address)`
                      : `${shieldedAddress.length}/78 characters`
                    : "Shielded address (zs1... or u1...)"}
                </p>
              )}

              {/* Wallet help - collapsible style */}
              <details style={{ marginTop: "16px" }}>
                <summary style={{
                  fontSize: "12px",
                  color: colors.primary,
                  cursor: "pointer",
                  fontWeight: 500,
                }}>
                  Need a wallet?
                </summary>
                <div style={{
                  marginTop: "12px",
                  padding: "12px 14px",
                  backgroundColor: colors.goldGlow,
                  border: `1px solid ${colors.primaryGlow}`,
                  borderRadius: "8px",
                }}>
                  <p style={{ margin: 0, fontSize: "12px", color: colors.text, lineHeight: 1.5 }}>
                    Download{" "}
                    <a
                      href="https://zecwallet.co/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: colors.primary, textDecoration: "underline" }}
                    >
                      Zecwallet Lite
                    </a>
                    {" "}(desktop) or{" "}
                    <a
                      href="https://zashi.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: colors.primary, textDecoration: "underline" }}
                    >
                      Zashi
                    </a>
                    {" "}(mobile) — free, under 2 minutes.
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* Step 3: Tweet Verification - Revealed after valid address */}
          {currentStep >= 3 && (
            <>
              <div style={{
                marginBottom: "24px",
                padding: "20px",
                backgroundColor: colors.surface,
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                opacity: 0,
                ...animationStyle,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px"
                }}>
                  <span style={stepNumberStyle(3, currentStep >= 3)}>3</span>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: colors.textBright }}>
                    Post to verify
                  </h3>
                </div>
                <pre style={{
                  margin: "0 0 16px",
                  padding: "14px",
                  backgroundColor: colors.bg,
                  borderRadius: "8px",
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  color: colors.muted,
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
                    color: colors.textBright,
                    backgroundColor: "#1DA1F2",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: transitions.fast,
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

              <div style={{
                marginBottom: "32px",
                opacity: 0,
                ...animationStyle,
                animationDelay: prefersReducedMotion ? "0s" : "0.1s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={stepNumberStyle(4, true)}>4</span>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Paste tweet URL</label>
                  {tweetUrl && !validateTweetUrl(tweetUrl) && (
                    <span style={{
                      animation: prefersReducedMotion ? "none" : "fadeIn 0.3s ease-out",
                    }}><CheckIcon size={16} color={colors.success} /></span>
                  )}
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
                    borderColor: fieldErrors.tweet_url ? colors.error :
                      (tweetUrl && !validateTweetUrl(tweetUrl)) ? colors.success : colors.border,
                  }}
                  required
                  aria-describedby={fieldErrors.tweet_url ? "tweet-error" : undefined}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = fieldErrors.tweet_url ? colors.error : colors.primary
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${fieldErrors.tweet_url ? colors.error : colors.primary}`
                  }}
                  onBlur={(e) => {
                    const isValid = tweetUrl && !validateTweetUrl(tweetUrl);
                    e.currentTarget.style.borderColor = fieldErrors.tweet_url ? colors.error :
                      isValid ? colors.success : colors.border
                    e.currentTarget.style.boxShadow = "none"
                    const error = validateTweetUrl(tweetUrl)
                    if (error) setFieldErrors(prev => ({ ...prev, tweet_url: error }))
                  }}
                />
                {fieldErrors.tweet_url && (
                  <p id="tweet-error" style={{ margin: "8px 0 0", fontSize: "12px", color: colors.error }}>
                    {fieldErrors.tweet_url}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Success Message with enhanced celebration */}
          {message && message.type === "success" && (
            <div style={{
              marginBottom: "24px",
              padding: "24px",
              backgroundColor: colors.successGlow,
              border: `1px solid ${colors.success}`,
              borderRadius: "12px",
              animation: prefersReducedMotion ? "none" : "fadeInUp 0.5s ease-out",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}>
                <span style={{
                  animation: prefersReducedMotion ? "none" : "stampIn 0.6s ease-out",
                }}><CelebrationIcon size={32} color={colors.success} /></span>
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    marginBottom: "4px",
                    color: colors.success,
                  }}>
                    You&apos;re all set!
                  </div>
                  <div style={{ color: colors.text, fontSize: "13px" }}>
                    Tips will arrive directly to your shielded address.
                  </div>
                </div>
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: colors.bg,
                borderRadius: "8px",
                marginBottom: "16px",
              }}>
                <div style={{ fontSize: "11px", color: colors.muted, marginBottom: "8px", letterSpacing: "1px" }}>
                  YOUR TIP PAGE {linkCopied && <span style={{ color: colors.success }}>• Copied!</span>}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: colors.primary,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span>tipz.cash/{registeredHandle || handle || "yourhandle"}</span>
                  <button
                    type="button"
                    onClick={copyTipLink}
                    style={{
                      padding: "6px 12px",
                      fontSize: "11px",
                      backgroundColor: linkCopied ? colors.success : colors.surface,
                      border: `1px solid ${linkCopied ? colors.success : colors.border}`,
                      borderRadius: "4px",
                      color: linkCopied ? colors.bg : colors.text,
                      cursor: "pointer",
                      transition: transitions.fast,
                    }}
                  >
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Share CTA */}
              <div className="success-buttons" style={{ display: "flex", gap: "12px" }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just set up @TIPZ_xyz to receive private tips with ZERO fees.\n\nCreators: keep 100% of what you earn.\n\nSet up in 2 mins: tipz.cash`)}`}
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
                    fontFamily: "Inter, -apple-system, sans-serif",
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
                    border: `1px solid ${colors.border}`,
                    fontFamily: "Inter, -apple-system, sans-serif",
                  }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Error Message */}
          {message && message.type === "error" && (
            <div style={{
              marginBottom: "24px",
              padding: "14px 16px",
              backgroundColor: colors.errorGlow,
              border: `1px solid ${colors.error}`,
              borderRadius: "10px",
              fontSize: "14px",
              color: colors.error,
            }}>
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

          {/* Submit Button - Only show after step 3 and not on success */}
          {/* Sticky on mobile for thumb zone accessibility */}
          {currentStep >= 3 && !message?.type && (
            <div style={{
              position: isMobile ? "sticky" : "relative",
              bottom: 0,
              left: isMobile ? "-16px" : 0,
              right: isMobile ? "-16px" : 0,
              width: isMobile ? "calc(100% + 32px)" : "100%",
              padding: isMobile ? "16px" : 0,
              paddingBottom: isMobile ? "max(16px, env(safe-area-inset-bottom))" : 0,
              background: isMobile ? `linear-gradient(180deg, transparent 0%, ${colors.bgGradientEnd} 20%)` : "transparent",
              marginTop: isMobile ? "16px" : 0,
              zIndex: 10,
            }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "18px",
                  minHeight: "56px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: colors.bg,
                  backgroundColor: isSubmitting ? colors.muted : colors.primary,
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: transitions.normal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: isSubmitting ? "none" : `0 0 30px ${colors.primaryGlow}`,
                  fontFamily: "Inter, -apple-system, sans-serif",
                  letterSpacing: "0.3px",
                  transform: "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.backgroundColor = colors.primaryHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.backgroundColor = isSubmitting ? colors.muted : colors.primary;
                }}
                onMouseDown={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = "scale(0.98)";
                  }
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
              >
                {isSubmitting && (
                  <span style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid transparent",
                    borderTopColor: colors.bg,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                )}
                {isSubmitting ? "Verifying..." : "Claim Your Handle →"}
              </button>
            </div>
          )}

          {/* Security note - moved to footer area */}
          {!message?.type && (
            <div style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "11px",
              color: colors.muted,
            }}>
              <LockIcon size={14} color={colors.muted} />
              <span>Your data stays private. We only store your public handle.</span>
            </div>
          )}
        </form>

        {/* Bottom trust bar - only show when not on success */}
        {!message?.type && (
          <div style={{
            marginTop: "32px",
            padding: "16px 20px",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            fontSize: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted }}>
              {/* Shield icon for Uncensorable */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Uncensorable</span>
            </div>
            <div style={{ width: "1px", height: "16px", backgroundColor: colors.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted }}>
              {/* Ban/slash icon for Zero Rent */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <span>Zero Rent</span>
            </div>
            <div style={{ width: "1px", height: "16px", backgroundColor: colors.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted }}>
              {/* Infinity icon for Permanent */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
