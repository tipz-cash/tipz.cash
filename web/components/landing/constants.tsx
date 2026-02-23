import { colors } from "@/lib/colors";

// IronManMorph animation constants
export const IRONMAN_SPRING_CONFIG = { type: "spring" as const, stiffness: 120, damping: 20 };
export const IRONMAN_BASE_WIDTH = 460;
export const IRONMAN_BASE_HEIGHT = 580;
export const IRONMAN_TWEET_WIDTH = 400;
export const IRONMAN_CARD_WIDTH = 340;

// Naval avatar URL - preloaded to prevent animation lag
export const NAVAL_AVATAR_URL = "https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg";

// Header height constant for scroll-padding calculations
export const HEADER_HEIGHT = 60; // px

// Chapter definitions
export const chapters = [
  { id: "hero", num: "01", title: "VISION" },
  { id: "broken", num: "02", title: "THE FALSE CHOICE" },
  { id: "solution", num: "03", title: "THE SOLUTION" },
  { id: "any-token", num: "04", title: "UNIVERSAL INTAKE" },
  { id: "creator-tools", num: "05", title: "COMMAND CENTER" },
  { id: "proof", num: "06", title: "GENESIS COHORT" },
  { id: "faq", num: "07", title: "FAQ" },
  { id: "how-it-works", num: "08", title: "GET STARTED" },
  { id: "join", num: "09", title: "EXIT" },
];

// Helper to render text with "tipz" in primary color
export function renderWithTipzHighlight(text: string, primaryColor: string) {
  const tipzIndex = text.toLowerCase().indexOf("tipz");
  if (tipzIndex === -1) return text;

  const before = text.slice(0, tipzIndex);
  const tipz = text.slice(tipzIndex, tipzIndex + 4);
  const after = text.slice(tipzIndex + 4);

  return (
    <>
      {before}
      <span style={{ color: primaryColor }}>{tipz}</span>
      {after}
    </>
  );
}
