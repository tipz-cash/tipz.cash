import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// TIPZ Color palette
const colors = {
  bg: "#0A0A0A",
  surface: "#1A1A1A",
  primary: "#F5A623",
  primaryHover: "#FFB84D",
  success: "#00FF00",
  muted: "#888888",
  border: "#333333",
  text: "#E0E0E0",
  twitterBg: "#000000",
  twitterBorder: "#2F3336",
};

// Mock Tweet Component
const Tweet: React.FC<{
  showTipButton: boolean;
  tipButtonHighlight: boolean;
}> = ({ showTipButton, tipButtonHighlight }) => {
  return (
    <div
      style={{
        backgroundColor: colors.twitterBg,
        border: `1px solid ${colors.twitterBorder}`,
        borderRadius: 20,
        padding: 24,
        width: 720,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Tweet Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.bg,
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          S
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: colors.text, fontWeight: 700, fontSize: 18 }}>
              Satoshi
            </span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1D9BF0">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
            </svg>
          </div>
          <span style={{ color: colors.muted, fontSize: 16 }}>@satoshi</span>
        </div>
      </div>

      {/* Tweet Content */}
      <p
        style={{
          color: colors.text,
          fontSize: 20,
          lineHeight: 1.5,
          marginTop: 16,
          marginBottom: 20,
        }}
      >
        Just shipped a major update to my privacy project. Shielded transactions
        are the future. LFG! 🛡️
      </p>

      {/* Tweet Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 56,
          color: colors.muted,
          fontSize: 16,
        }}
      >
        <span>💬 42</span>
        <span>🔁 128</span>
        <span>❤️ 1.2K</span>
        {showTipButton && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 24,
              backgroundColor: tipButtonHighlight
                ? colors.primary
                : "transparent",
              border: `2px solid ${colors.primary}`,
              color: tipButtonHighlight ? colors.bg : colors.primary,
              fontWeight: 600,
              fontSize: 15,
              transition: "all 0.2s",
              transform: tipButtonHighlight ? "scale(1.08)" : "scale(1)",
              boxShadow: tipButtonHighlight
                ? `0 0 30px ${colors.primary}50`
                : "none",
            }}
          >
            <span>🛡️</span>
            <span>TIP</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Tip Modal Component
const TipModal: React.FC<{
  progress: number;
  selectedAmount: number | null;
  showConfirm: boolean;
  showSuccess: boolean;
}> = ({ progress, selectedAmount, showConfirm, showSuccess }) => {
  const amounts = [0.01, 0.05, 0.1, 0.5, 1];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${progress})`,
        backgroundColor: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: 16,
        padding: 32,
        width: 440,
        opacity: progress,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Modal Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingBottom: 16,
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FF5F56",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FFBD2E",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#27CA40",
            }}
          />
        </div>
        <span style={{ color: colors.muted, fontSize: 12, marginLeft: 8 }}>
          [TIPZ] // SEND_TIP
        </span>
      </div>

      {showSuccess ? (
        // Success State
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: `${colors.success}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: `2px solid ${colors.success}`,
            }}
          >
            <span style={{ fontSize: 32, color: colors.success }}>✓</span>
          </div>
          <h3
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: 600,
              margin: "0 0 8px",
            }}
          >
            Tip Sent!
          </h3>
          <p style={{ color: colors.muted, fontSize: 14, margin: 0 }}>
            0.1 ZEC to @satoshi
          </p>
          <p
            style={{
              color: colors.success,
              fontSize: 12,
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            🛡️ Shielded • No trace
          </p>
        </div>
      ) : (
        <>
          {/* Recipient */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{ color: colors.muted, fontSize: 11, marginBottom: 8 }}
            >
              SENDING TO
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.bg,
                  fontWeight: 700,
                }}
              >
                S
              </div>
              <div>
                <div style={{ color: colors.text, fontWeight: 600 }}>
                  @satoshi
                </div>
                <div style={{ color: colors.muted, fontSize: 12 }}>
                  zs1q8w...x7k9
                </div>
              </div>
            </div>
          </div>

          {/* Amount Selection */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{ color: colors.muted, fontSize: 11, marginBottom: 8 }}
            >
              SELECT AMOUNT (ZEC)
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {amounts.map((amount) => (
                <div
                  key={amount}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 6,
                    backgroundColor:
                      selectedAmount === amount ? colors.primary : colors.bg,
                    border: `1px solid ${selectedAmount === amount ? colors.primary : colors.border}`,
                    color:
                      selectedAmount === amount ? colors.bg : colors.text,
                    fontWeight: 500,
                    fontSize: 14,
                    transform:
                      selectedAmount === amount ? "scale(1.05)" : "scale(1)",
                    boxShadow:
                      selectedAmount === amount
                        ? `0 0 15px ${colors.primary}40`
                        : "none",
                  }}
                >
                  {amount}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 6,
              backgroundColor: showConfirm ? colors.primaryHover : colors.primary,
              border: "none",
              color: colors.bg,
              fontWeight: 600,
              fontSize: 15,
              fontFamily: "'JetBrains Mono', monospace",
              transform: showConfirm ? "scale(0.98)" : "scale(1)",
              boxShadow: showConfirm ? `0 0 30px ${colors.primary}60` : "none",
            }}
          >
            {showConfirm ? "Confirming..." : "Confirm Tip →"}
          </button>

          {/* Privacy Note */}
          <p
            style={{
              color: colors.muted,
              fontSize: 11,
              marginTop: 12,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            🛡️ Powered by Zcash shielding
          </p>
        </>
      )}
    </div>
  );
};

// Cursor Component
const Cursor: React.FC<{ x: number; y: number; clicking: boolean }> = ({
  x,
  y,
  clicking,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-2px, -2px)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <svg
        width={clicking ? 28 : 32}
        height={clicking ? 28 : 32}
        viewBox="0 0 24 24"
        fill="white"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          transition: "all 0.1s",
        }}
      >
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.97 2.88a.5.5 0 0 0-.47.33z" />
      </svg>
      {clicking && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: `${colors.primary}40`,
            animation: "pulse 0.3s ease-out",
          }}
        />
      )}
    </div>
  );
};

// Main Video Component
export const TipDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline (in frames at 30fps) - SLOWER for smoother feel:
  // 0-45: Show tweet without tip button
  // 45-90: Tip button appears with glow
  // 90-150: Cursor moves to tip button (slower, smoother)
  // 150-180: Cursor clicks tip button
  // 180-270: Modal appears, cursor moves to 0.1 ZEC
  // 270-315: Click 0.1 ZEC
  // 315-390: Cursor moves to confirm button
  // 390-420: Click confirm
  // 420-480: Processing animation
  // 480-540: Success state

  // Tip button visibility
  const showTipButton = frame > 45;
  const tipButtonHighlight = frame > 135 && frame < 180;

  // Modal state with smoother spring
  const modalProgress =
    frame > 180
      ? spring({
          frame: frame - 180,
          fps,
          config: { damping: 20, stiffness: 80 },
        })
      : 0;

  const selectedAmount = frame > 270 ? 0.1 : null;
  const showConfirm = frame > 390 && frame < 480;
  const showSuccess = frame > 480;

  // Cursor position animation with smoother easing
  let cursorX = 500;
  let cursorY = 300;
  let clicking = false;

  // Smooth easing function
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  if (frame > 90 && frame <= 150) {
    // Move to tip button - slower
    const t = easeInOutCubic((frame - 90) / 60);
    cursorX = interpolate(t, [0, 1], [500, 920]);
    cursorY = interpolate(t, [0, 1], [300, 540]);
  } else if (frame > 150 && frame <= 180) {
    cursorX = 920;
    cursorY = 540;
    clicking = frame > 160 && frame < 175;
  } else if (frame > 180 && frame <= 270) {
    // Move to 0.1 ZEC button - slower
    const t = easeInOutCubic((frame - 180) / 90);
    cursorX = interpolate(t, [0, 1], [920, 800]);
    cursorY = interpolate(t, [0, 1], [540, 600]);
  } else if (frame > 270 && frame <= 315) {
    cursorX = 800;
    cursorY = 600;
    clicking = frame > 285 && frame < 300;
  } else if (frame > 315 && frame <= 390) {
    // Move to confirm button - slower
    const t = easeInOutCubic((frame - 315) / 75);
    cursorX = interpolate(t, [0, 1], [800, 960]);
    cursorY = interpolate(t, [0, 1], [600, 720]);
  } else if (frame > 390 && frame <= 420) {
    cursorX = 960;
    cursorY = 720;
    clicking = frame > 400 && frame < 415;
  } else if (frame > 420) {
    // Fade out cursor during success
    cursorX = -100;
    cursorY = -100;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.border}40 1px, transparent 1px),
            linear-gradient(90deg, ${colors.border}40 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: 0.3,
        }}
      />

      {/* TIPZ Logo */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{ color: colors.primary, fontWeight: 700, fontSize: 24 }}
        >
          [TIPZ]
        </span>
        <span style={{ color: colors.muted, fontSize: 14 }}>
          // DEMO
        </span>
      </div>

      {/* Tweet */}
      <div style={{ position: "relative" }}>
        <Tweet
          showTipButton={showTipButton}
          tipButtonHighlight={tipButtonHighlight}
        />
      </div>

      {/* Modal Overlay */}
      {frame > 120 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(0,0,0,${modalProgress * 0.7})`,
          }}
        />
      )}

      {/* Tip Modal */}
      {frame > 120 && (
        <TipModal
          progress={modalProgress}
          selectedAmount={selectedAmount}
          showConfirm={showConfirm}
          showSuccess={showSuccess}
        />
      )}

      {/* Cursor */}
      <Cursor x={cursorX} y={cursorY} clicking={clicking} />

      {/* Caption */}
      <Sequence from={0} durationInFrames={150}>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            color: colors.text,
            fontSize: 22,
            opacity: interpolate(frame, [0, 20, 130, 150], [0, 1, 1, 0]),
          }}
        >
          Browse X and spot the TIP button...
        </div>
      </Sequence>

      <Sequence from={180} durationInFrames={210}>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            color: colors.text,
            fontSize: 22,
            opacity: interpolate(
              frame,
              [180, 200, 370, 390],
              [0, 1, 1, 0]
            ),
          }}
        >
          Select amount and confirm...
        </div>
      </Sequence>

      <Sequence from={480} durationInFrames={120}>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            color: colors.success,
            fontSize: 24,
            fontWeight: 600,
            opacity: interpolate(frame, [480, 500, 580, 600], [0, 1, 1, 0]),
          }}
        >
          Private tip sent! No trace, no trail.
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
