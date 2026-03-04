// Shared font loader for OG image routes
// Reads JetBrains Mono Bold at build time — no runtime self-fetch needed

const fontPromise = fetch(
  new URL("../public/fonts/JetBrainsMono-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer())

export async function getJetBrainsMonoBold(): Promise<ArrayBuffer> {
  return fontPromise
}

export function getOgFonts(fontData: ArrayBuffer) {
  return [
    {
      name: "JetBrains Mono",
      data: fontData,
      style: "normal" as const,
      weight: 700 as const,
    },
  ]
}
