// Shared font loader for OG image routes
// Fetches JetBrains Mono Bold as ArrayBuffer for Satori rendering

let fontCache: ArrayBuffer | null = null

export async function getJetBrainsMonoBold(baseUrl: string): Promise<ArrayBuffer> {
  if (fontCache) return fontCache

  const res = await fetch(`${baseUrl}/fonts/JetBrainsMono-Bold.ttf`)
  fontCache = await res.arrayBuffer()
  return fontCache
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
