"use client";

import { useEffect, useState, useRef } from "react";

// Import JetBrains Mono from Google Fonts
const fontLink = typeof window !== "undefined" ? (() => {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
  return link;
})() : null;

// Color palette
const colors = {
  bg: "#0A0A0A",
  surface: "#1A1A1A",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  success: "#00FF00",
  error: "#FF4444",
  muted: "#888888",
  border: "#333333",
  text: "#E0E0E0",
};

// ASCII Art Logo with ZEC-style Z (single block above and below)
const ASCII_LOGO = `
                     ██
████████╗██╗██████╗███████╗
╚══██╔══╝██║██╔══██╗╚═███╔╝
   ██║   ██║██████╔╝ ███╔╝
   ██║   ██║██╔═══╝ ███╔╝
   ██║   ██║██║    ███╔╝
   ╚═╝   ╚═╝╚═╝   ███████╗
                     ██
`;

// Typing effect hook
function useTypingEffect(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayText("");
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

// Blinking cursor component
function Cursor({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShow((s) => !s), 530);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;
  return (
    <span style={{ color: colors.primary, opacity: show ? 1 : 0 }}>█</span>
  );
}

// Stats data - Updated to show zeros honestly
const stats = [
  { label: "SHIELDED_TXS", value: "0", change: "Be first" },
  { label: "ACTIVE_CREATORS", value: "0", change: "Join now" },
  { label: "ZEC_VOLUME", value: "0.00", change: "Start tipping" },
  { label: "AVG_TIP", value: "-- ZEC", change: "N/A" },
  { label: "UPTIME", value: "99.99%", change: "+0.02%" },
  { label: "P95_LATENCY", value: "87ms", change: "-23ms" },
];

// Tech specs
const techSpecs = `
┌─────────────────────────────────────────────────┐
│  PROTOCOL SPECIFICATIONS                        │
├─────────────────────────────────────────────────┤
│  Network:        Zcash Mainnet (Sapling)        │
│  Encryption:     zk-SNARKs (Groth16)            │
│  Settlement:     1 block (~75s finality)        │
│  Min Tip:        0.0001 ZEC (~$0.003)           │
│  Max Tip:        No limit                       │
│  Platform Fee:   0% (network fee only)          │
│  API:            REST + WebSocket + gRPC        │
│  Auth:           Ed25519 wallet signatures      │
│  Input Tokens:   ETH, USDC, SOL (auto-swap)     │
└─────────────────────────────────────────────────┘
`;

// Features
const features = [
  {
    title: "ZK_SHIELDED",
    desc: "zk-SNARKs encrypt sender, receiver, and amount. Chain analysis sees nothing.",
    icon: "[]",
  },
  {
    title: "ANY_TOKEN_IN",
    desc: "Tip in ETH, USDC, SOL. We swap to ZEC via NEAR Intents. They receive shielded.",
    icon: "{}",
  },
  {
    title: "SELF_CUSTODY",
    desc: "Direct to shielded address. No custodial risk. Your keys, your funds.",
    icon: "()",
  },
  {
    title: "FOSS_LICENSED",
    desc: "MIT licensed. Audit the code. Run your own node. Verify everything.",
    icon: "<>",
  },
];

// Registration form types
type Platform = "x" | "substack";
type FormStatus = "idle" | "submitting" | "success" | "error";

interface FormData {
  platform: Platform;
  handle: string;
  shielded_address: string;
  tweet_url: string;
}

// Registration Form Component
function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    platform: "x",
    handle: "",
    shielded_address: "",
    tweet_url: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setStatus("success");
      setFormData({
        platform: "x",
        handle: "",
        shielded_address: "",
        tweet_url: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    fontFamily: "'JetBrains Mono', monospace",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    color: colors.muted,
    letterSpacing: "0.5px",
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 500,
    color: isActive ? colors.bg : colors.text,
    backgroundColor: isActive ? colors.primary : "transparent",
    border: `1px solid ${isActive ? colors.primary : colors.border}`,
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    transition: "all 0.2s",
  });

  if (status === "success") {
    return (
      <div style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.success}`,
        borderRadius: "8px",
        padding: "32px",
        textAlign: "center",
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "rgba(0, 255, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <span style={{ fontSize: "32px", color: colors.success }}>✓</span>
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600 }}>
          Registration Successful!
        </h3>
        <p style={{ margin: "0 0 24px", color: colors.muted, fontSize: "14px" }}>
          Your tip page is now active. Start sharing your TIPZ link!
        </p>
        <button
          onClick={() => setStatus("idle")}
          style={{
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 600,
            color: colors.bg,
            backgroundColor: colors.primary,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Register Another Account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      padding: "32px",
    }}>
      {/* Terminal-style header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27CA40" }} />
        </div>
        <span style={{ color: colors.muted, fontSize: "12px", marginLeft: "8px" }}>
          [TIPZ] // REGISTER
        </span>
      </div>

      {/* Platform Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>PLATFORM</label>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, platform: "x" })}
            style={buttonStyle(formData.platform === "x")}
          >
            X (Twitter)
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, platform: "substack" })}
            style={buttonStyle(formData.platform === "substack")}
          >
            Substack
          </button>
        </div>
      </div>

      {/* Handle Input */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>
          {formData.platform === "x" ? "X HANDLE" : "SUBSTACK USERNAME"}
        </label>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: colors.muted,
          }}>
            @
          </span>
          <input
            type="text"
            placeholder={formData.platform === "x" ? "yourhandle" : "yoursubstack"}
            value={formData.handle}
            onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
            required
            style={{ ...inputStyle, paddingLeft: "36px" }}
            onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
            onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
          />
        </div>
      </div>

      {/* Shielded Address Input */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>ZCASH SHIELDED ADDRESS</label>
        <input
          type="text"
          placeholder="zs1..."
          value={formData.shielded_address}
          onChange={(e) => setFormData({ ...formData, shielded_address: e.target.value })}
          required
          style={inputStyle}
          onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
          onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
        />
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.muted }}>
          Must start with "zs" and be 78 characters
        </p>
      </div>

      {/* Tweet URL Input */}
      <div style={{ marginBottom: "24px" }}>
        <label style={labelStyle}>VERIFICATION TWEET URL</label>
        <input
          type="url"
          placeholder="https://x.com/yourhandle/status/..."
          value={formData.tweet_url}
          onChange={(e) => setFormData({ ...formData, tweet_url: e.target.value })}
          required
          style={inputStyle}
          onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
          onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
        />
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.muted }}>
          Post a tweet from your account mentioning TIPZ to verify ownership
        </p>
      </div>

      {/* Error Message */}
      {status === "error" && (
        <div style={{
          backgroundColor: "rgba(255, 68, 68, 0.1)",
          border: `1px solid ${colors.error}`,
          borderRadius: "4px",
          padding: "12px 16px",
          marginBottom: "20px",
          color: colors.error,
          fontSize: "13px",
        }}>
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: "16px",
          fontWeight: 600,
          color: colors.bg,
          backgroundColor: status === "submitting" ? colors.muted : colors.primary,
          border: "none",
          borderRadius: "4px",
          cursor: status === "submitting" ? "not-allowed" : "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          transition: "all 0.2s",
        }}
      >
        {status === "submitting" ? "Registering..." : "Register →"}
      </button>
    </form>
  );
}

export default function TerminalHomePage() {
  const heroText = "Tip creators without leaving a trace.";
  const { displayText, isComplete } = useTypingEffect(heroText, 40);
  const [mounted, setMounted] = useState(false);
  const registerRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Check for hash on mount to scroll to registration
    if (typeof window !== "undefined" && window.location.hash === "#register") {
      setTimeout(() => {
        registerRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, []);

  const scrollToRegister = () => {
    registerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "14px",
    lineHeight: 1.6,
  };

  const maxWidthStyle: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
  };

  const borderStyle = `1px solid ${colors.border}`;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header
        style={{
          borderBottom: borderStyle,
          padding: "16px 0",
          position: "sticky",
          top: 0,
          backgroundColor: colors.bg,
          zIndex: 100,
        }}
      >
        <div
          style={{
            ...maxWidthStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: colors.primary, fontWeight: 700 }}>
              [TIPZ]
            </span>
            <span style={{ color: colors.muted, fontSize: "12px" }}>
              v0.1.0-beta
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.muted, fontSize: "12px" }}>
              <img src="/zec/brandmark-yellow.svg" alt="Zcash" style={{ width: "14px", height: "14px" }} />
              ZEC
            </span>
          </div>
          <nav style={{ display: "flex", gap: "24px" }}>
            {["DOCS", "API", "GITHUB", "STATUS"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  color: colors.muted,
                  textDecoration: "none",
                  fontSize: "12px",
                  letterSpacing: "0.5px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = colors.primary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = colors.muted)
                }
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "80px 0",
          borderBottom: borderStyle,
        }}
      >
        <div style={maxWidthStyle}>
          {/* ASCII Logo */}
          <pre
            style={{
              color: colors.primary,
              fontSize: "10px",
              lineHeight: 1.2,
              marginBottom: "32px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {ASCII_LOGO}
          </pre>

          {/* Typing effect headline */}
          <div style={{ marginBottom: "24px" }}>
            <span style={{ color: colors.success }}>{">"}</span>{" "}
            <span style={{ fontSize: "24px", fontWeight: 600 }}>
              {mounted ? displayText : heroText}
              <Cursor visible={mounted && !isComplete} />
            </span>
          </div>

          {/* Subheadline */}
          <p
            style={{
              color: colors.muted,
              maxWidth: "600px",
              marginBottom: "32px",
            }}
          >
            Zcash shielded addresses + any-token swaps. Your tip goes in, the
            creator gets paid. No trace. No trail. No tracking.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={scrollToRegister}
              style={{
                backgroundColor: colors.primary,
                color: colors.bg,
                border: "none",
                padding: "14px 28px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              Start Receiving Tips →
            </button>
            <button
              onClick={scrollToHowItWorks}
              style={{
                backgroundColor: "transparent",
                color: colors.text,
                border: borderStyle,
                padding: "14px 28px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.color = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.text;
              }}
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section
        style={{
          padding: "48px 0",
          borderBottom: borderStyle,
          backgroundColor: colors.surface,
        }}
      >
        <div style={maxWidthStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <span style={{ color: colors.success }}>●</span>
            <span style={{ color: colors.muted, fontSize: "12px" }}>
              NETWORK_STATUS: OPERATIONAL
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1px",
              backgroundColor: colors.border,
              border: borderStyle,
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: colors.bg,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "11px",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: stat.change.startsWith("+")
                      ? colors.success
                      : stat.change.startsWith("-")
                      ? "#FF4444"
                      : colors.primary,
                  }}
                >
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Placeholder */}
      <section
        style={{
          padding: "64px 0",
          borderBottom: borderStyle,
        }}
      >
        <div style={maxWidthStyle}>
          <div
            style={{
              backgroundColor: colors.surface,
              border: borderStyle,
              borderRadius: "4px",
              aspectRatio: "16/9",
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: colors.primary,
              }}
            >
              ▶
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              Watch a tip happen
            </div>
            <div style={{ color: colors.muted, fontSize: "13px", marginTop: "8px" }}>
              15 seconds · No sound required
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps - How It Works */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        style={{
          padding: "64px 0",
          borderBottom: borderStyle,
        }}
      >
        <div style={maxWidthStyle}>
          <h2
            style={{
              color: colors.primary,
              fontSize: "12px",
              letterSpacing: "1px",
              marginBottom: "32px",
            }}
          >
            // HOW_IT_WORKS
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                step: "01",
                title: "Paste your Zcash address",
                desc: "Add your shielded address. Takes 2 minutes. No KYC, no verification hoops.",
              },
              {
                step: "02",
                title: "Share your TIPZ link",
                desc: "Get tipz.link/yourname. Put it in your bio, tweets, videos—anywhere.",
              },
              {
                step: "03",
                title: "Receive tips privately",
                desc: "Fans tip in any token. Auto-swaps to ZEC. You receive shielded.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  border: borderStyle,
                  padding: "32px 24px",
                  backgroundColor: colors.surface,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div
                  style={{
                    color: colors.primary,
                    fontSize: "32px",
                    fontWeight: 700,
                    marginBottom: "16px",
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: colors.muted, fontSize: "14px", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section
        ref={registerRef}
        id="register"
        style={{
          padding: "64px 0",
          borderBottom: borderStyle,
          backgroundColor: colors.surface,
        }}
      >
        <div style={maxWidthStyle}>
          <h2
            style={{
              color: colors.primary,
              fontSize: "12px",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}
          >
            // REGISTER
          </h2>
          <p style={{ color: colors.muted, marginBottom: "32px", maxWidth: "600px" }}>
            Register your account to start receiving private tips. No KYC required.
            Just your handle, a shielded address, and a verification tweet.
          </p>
          <div style={{ maxWidth: "600px" }}>
            <RegistrationForm />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        style={{
          padding: "64px 0",
          borderBottom: borderStyle,
        }}
      >
        <div style={maxWidthStyle}>
          <h2
            style={{
              color: colors.primary,
              fontSize: "12px",
              letterSpacing: "1px",
              marginBottom: "32px",
            }}
          >
            // ARCHITECTURE
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  border: borderStyle,
                  padding: "24px",
                  backgroundColor: colors.surface,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>
                  {feature.icon}
                </div>
                <h3
                  style={{
                    color: colors.text,
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Testimonial */}
      <section
        style={{
          padding: "64px 0",
          borderBottom: borderStyle,
          backgroundColor: colors.surface,
        }}
      >
        <div style={maxWidthStyle}>
          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: colors.primary,
                fontSize: "48px",
                marginBottom: "24px",
                fontFamily: "Georgia, serif",
              }}
            >
              &ldquo;
            </div>
            <blockquote
              style={{
                fontSize: "24px",
                fontWeight: 500,
                lineHeight: 1.5,
                marginBottom: "24px",
                fontStyle: "italic",
              }}
            >
              Finally, tips that don&apos;t broadcast my income to the world.
            </blockquote>
            <div style={{ color: colors.muted, fontSize: "14px" }}>
              <span style={{ color: colors.primary }}>@indie_creator</span>
              <span style={{ margin: "0 8px" }}>·</span>
              12k followers
            </div>
          </div>
        </div>
      </section>

      {/* For Developers - Collapsible */}
      <section
        style={{
          padding: "48px 0",
          borderBottom: borderStyle,
        }}
      >
        <div style={maxWidthStyle}>
          <details style={{ cursor: "pointer" }}>
            <summary
              style={{
                color: colors.muted,
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "24px",
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ color: colors.primary }}>[+]</span> FOR_DEVELOPERS: Protocol specs & SDK
            </summary>
            <pre
              style={{
                color: colors.text,
                fontSize: "12px",
                lineHeight: 1.5,
                overflow: "auto",
                margin: "24px 0 0 0",
                padding: "20px",
                backgroundColor: colors.surface,
                border: borderStyle,
                borderRadius: "4px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {techSpecs}
            </pre>
          </details>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "80px 0",
          borderBottom: borderStyle,
          textAlign: "center",
        }}
      >
        <div style={maxWidthStyle}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Start receiving tips in 2 minutes.
          </h2>
          <p
            style={{
              color: colors.muted,
              marginBottom: "32px",
              maxWidth: "500px",
              margin: "0 auto 32px",
            }}
          >
            Be one of the first creators accepting shielded tips. Zero platform fees.
            Self-custody by default. No KYC required.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={scrollToRegister}
              style={{
                backgroundColor: colors.primary,
                color: colors.bg,
                border: "none",
                padding: "16px 32px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              Create Your Tip Page →
            </button>
            <button
              style={{
                backgroundColor: "transparent",
                color: colors.text,
                border: borderStyle,
                padding: "16px 32px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.color = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.text;
              }}
            >
              I Want to Tip Someone
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 0",
          backgroundColor: colors.bg,
        }}
      >
        <div
          style={{
            ...maxWidthStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: colors.primary, fontWeight: 700 }}>
              [TIPZ]
            </span>
            <span style={{ color: colors.muted, fontSize: "12px" }}>
              v0.1.0-beta
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              color: colors.muted,
              fontSize: "12px",
            }}
          >
            <a
              href="#"
              style={{ color: colors.muted, textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = colors.primary)
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
            >
              GITHUB
            </a>
            <a
              href="#"
              style={{ color: colors.muted, textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = colors.primary)
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
            >
              DISCORD
            </a>
            <a
              href="#"
              style={{ color: colors.muted, textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = colors.primary)
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
            >
              TWITTER
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.muted, fontSize: "11px" }}>
            <span style={{ color: colors.success }}>●</span> All systems
            operational |
            <img src="/zec/brandmark-yellow.svg" alt="Zcash" style={{ width: "12px", height: "12px" }} />
            Powered by Zcash + NEAR Intents
          </div>
        </div>
      </footer>
    </div>
  );
}
