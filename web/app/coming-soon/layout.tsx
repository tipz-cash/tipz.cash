import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TIPZ — Launching Soon",
  description: "Private micro-tipping for creators. Any crypto in, shielded ZEC out.",
  openGraph: {
    title: "TIPZ — Launching Soon",
    description: "Private micro-tipping for creators. Any crypto in, shielded ZEC out.",
    type: "website",
    siteName: "TIPZ",
    url: "https://tipz.cash",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "TIPZ — Launching Soon" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tipz_cash",
    title: "TIPZ — Launching Soon",
    description: "Private micro-tipping for creators. Any crypto in, shielded ZEC out.",
    images: ["/api/og"],
  },
}

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return children
}
