import { chromium } from "playwright";
import path from "path";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OUTPUT_PATH = path.join(__dirname, "..", "public", "og-image.png");

async function captureOG() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: OG_WIDTH, height: OG_HEIGHT },
    deviceScaleFactor: 1,
  });

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Wait for hero typing animation + Iron Man Morph to settle
  // The typing animation runs on load, give it time to complete
  await page.waitForTimeout(6000);

  console.log("Capturing screenshot...");
  await page.screenshot({
    path: OUTPUT_PATH,
    clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT },
  });

  await browser.close();
  console.log(`OG image saved to ${OUTPUT_PATH}`);
}

captureOG().catch((err) => {
  console.error("Failed to capture OG image:", err);
  process.exit(1);
});
