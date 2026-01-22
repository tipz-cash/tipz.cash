import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from "remotion";

// TIPZ Color palette - Terminal aesthetic
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

// Video is zoomed in 1.4x for better focus on the action
const ZOOM_SCALE = 1.4;

// Mock Tweet Component
const Tweet: React.FC<{
  showTipButton: boolean;
  tipButtonHighlight: boolean;
  tipButtonOpacity?: number;
}> = ({ showTipButton, tipButtonHighlight, tipButtonOpacity = 1 }) => {
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
              padding: "8px 18px",
              borderRadius: 6,
              backgroundColor: tipButtonHighlight
                ? colors.primary
                : colors.bg,
              border: `2px solid ${colors.primary}`,
              color: tipButtonHighlight ? colors.bg : colors.primary,
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.5px",
              opacity: tipButtonOpacity,
              transform: tipButtonHighlight ? "scale(1.05)" : "scale(1)",
              boxShadow: tipButtonHighlight
                ? `0 0 24px ${colors.primary}60, 0 0 8px ${colors.primary}40`
                : `0 0 12px ${colors.primary}20`,
            }}
          >
            <span style={{ fontSize: 13 }}>[TIP]</span>
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

  // Smoother scale with slight overshoot then settle
  const displayScale = progress * (1 + (1 - progress) * 0.05);

  return (
    <div
      style={{
        position: "absolute",
        top: "48%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${displayScale})`,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: 28,
        width: 380,
        opacity: Math.min(progress * 1.2, 1),
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: `0 20px 60px ${colors.bg}80, 0 0 1px ${colors.primary}40`,
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
  const { fps, width, height } = useVideoConfig();

  // Timeline (in frames at 30fps) - SMOOTHER with longer transitions:
  // 0-30: Fade in tweet
  // 30-60: Show tweet, tip button fades in
  // 60-120: Cursor smoothly moves to tip button
  // 120-150: Hover effect, then click
  // 150-210: Modal opens with smooth spring
  // 210-270: Cursor moves to 0.1 ZEC with bezier curve
  // 270-300: Select amount with satisfying click
  // 300-360: Cursor moves to confirm button
  // 360-390: Click confirm with press animation
  // 390-450: Processing animation with spinner
  // 450-540: Success state with celebration

  // Tip button visibility - smoother fade in
  const tipButtonOpacity = frame > 30
    ? interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" })
    : 0;
  const showTipButton = frame > 30;
  const tipButtonHighlight = frame > 100 && frame < 150;

  // Modal state with buttery smooth spring
  const modalProgress =
    frame > 150
      ? spring({
          frame: frame - 150,
          fps,
          config: { damping: 15, stiffness: 60, mass: 1.2 },
        })
      : 0;

  const selectedAmount = frame > 270 ? 0.1 : null;
  const showConfirm = frame > 360 && frame < 450;
  const showSuccess = frame > 450;

  // Cursor position animation with ultra-smooth bezier easing
  let cursorX = 600;
  let cursorY = 350;
  let clicking = false;

  // Smoother easing with bezier-like curve
  const easeInOutQuart = (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

  // Even smoother for longer movements
  const easeInOutQuint = (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

  if (frame > 60 && frame <= 120) {
    // Move to tip button - very smooth 60-frame transition
    const t = easeInOutQuint((frame - 60) / 60);
    cursorX = interpolate(t, [0, 1], [600, 880]);
    cursorY = interpolate(t, [0, 1], [350, 500]);
  } else if (frame > 120 && frame <= 150) {
    cursorX = 880;
    cursorY = 500;
    clicking = frame > 135 && frame < 145;
  } else if (frame > 150 && frame <= 210) {
    // Slight cursor movement during modal open
    const t = easeInOutQuart((frame - 150) / 60);
    cursorX = interpolate(t, [0, 1], [880, 820]);
    cursorY = interpolate(t, [0, 1], [500, 520]);
  } else if (frame > 210 && frame <= 270) {
    // Move to 0.1 ZEC button - smooth arc motion
    const t = easeInOutQuint((frame - 210) / 60);
    cursorX = interpolate(t, [0, 1], [820, 780]);
    cursorY = interpolate(t, [0, 1], [520, 580]);
  } else if (frame > 270 && frame <= 300) {
    cursorX = 780;
    cursorY = 580;
    clicking = frame > 280 && frame < 290;
  } else if (frame > 300 && frame <= 360) {
    // Move to confirm button - smooth 60-frame arc
    const t = easeInOutQuint((frame - 300) / 60);
    cursorX = interpolate(t, [0, 1], [780, 960]);
    cursorY = interpolate(t, [0, 1], [580, 690]);
  } else if (frame > 360 && frame <= 390) {
    cursorX = 960;
    cursorY = 690;
    clicking = frame > 370 && frame < 382;
  } else if (frame > 390) {
    // Smooth cursor fade out
    const t = easeInOutQuart(Math.min((frame - 390) / 30, 1));
    cursorX = interpolate(t, [0, 1], [960, 1000]);
    cursorY = interpolate(t, [0, 1], [690, 720]);
  }

  // Calculate zoom offset to keep content centered
  const zoomOffsetX = (width * (ZOOM_SCALE - 1)) / 2;
  const zoomOffsetY = (height * (ZOOM_SCALE - 1)) / 2;

  // Fade in effect for the whole scene
  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Cursor opacity for smooth fade out at end
  const cursorOpacity = frame > 390
    ? interpolate(frame, [390, 420], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        fontFamily: "'JetBrains Mono', monospace",
        overflow: "hidden",
      }}
    >
      {/* Zoomed content container */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          transform: `scale(${ZOOM_SCALE})`,
          transformOrigin: "center center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: sceneOpacity,
        }}
      >
        {/* Background grid pattern - subtle */}
        <div
          style={{
            position: "absolute",
            inset: -200,
            backgroundImage: `
              linear-gradient(${colors.border}30 1px, transparent 1px),
              linear-gradient(90deg, ${colors.border}30 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.25,
          }}
        />

        {/* Ambient glow effect */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            width: 600,
            height: 400,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse, ${colors.primary}08 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Tweet - slightly offset up for better composition when zoomed */}
        <div style={{ position: "relative", marginTop: -40 }}>
          <Tweet
            showTipButton={showTipButton}
            tipButtonHighlight={tipButtonHighlight}
            tipButtonOpacity={tipButtonOpacity}
          />
        </div>

        {/* Modal Overlay - smoother fade */}
        {frame > 100 && (
          <div
            style={{
              position: "absolute",
              inset: -200,
              backgroundColor: `rgba(0,0,0,${modalProgress * 0.75})`,
              transition: "background-color 0.3s ease",
            }}
          />
        )}

        {/* Tip Modal */}
        {frame > 100 && (
          <TipModal
            progress={modalProgress}
            selectedAmount={selectedAmount}
            showConfirm={showConfirm}
            showSuccess={showSuccess}
          />
        )}

        {/* Cursor with fade */}
        <div style={{ opacity: cursorOpacity }}>
          <Cursor x={cursorX} y={cursorY} clicking={clicking} />
        </div>
      </div>

      {/* Captions - positioned outside zoom container */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 100,
        }}
      >
        <Sequence from={0} durationInFrames={150}>
          <div
            style={{
              color: colors.text,
              fontSize: 20,
              fontFamily: "'JetBrains Mono', monospace",
              opacity: interpolate(frame, [0, 25, 120, 150], [0, 1, 1, 0]),
              textShadow: `0 2px 8px ${colors.bg}`,
              padding: "8px 16px",
              backgroundColor: `${colors.bg}90`,
              borderRadius: 4,
            }}
          >
            <span style={{ color: colors.muted }}>{'>'}</span> Spot the [TIP] button on any tweet...
          </div>
        </Sequence>

        <Sequence from={150} durationInFrames={240}>
          <div
            style={{
              color: colors.text,
              fontSize: 20,
              fontFamily: "'JetBrains Mono', monospace",
              opacity: interpolate(
                frame,
                [150, 175, 360, 390],
                [0, 1, 1, 0]
              ),
              textShadow: `0 2px 8px ${colors.bg}`,
              padding: "8px 16px",
              backgroundColor: `${colors.bg}90`,
              borderRadius: 4,
            }}
          >
            <span style={{ color: colors.muted }}>{'>'}</span> Select amount and confirm...
          </div>
        </Sequence>

        <Sequence from={450} durationInFrames={150}>
          <div
            style={{
              color: colors.success,
              fontSize: 22,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              opacity: interpolate(frame, [450, 475, 560, 590], [0, 1, 1, 0]),
              textShadow: `0 0 20px ${colors.success}40`,
              padding: "10px 20px",
              backgroundColor: `${colors.bg}90`,
              borderRadius: 4,
              border: `1px solid ${colors.success}40`,
            }}
          >
            <span style={{ marginRight: 8 }}>{'>'}</span> Tip sent privately. No trace.
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
