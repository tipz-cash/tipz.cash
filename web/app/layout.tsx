import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration"
import { Providers } from "@/components/Providers"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  // Allow pinch zoom for accessibility
}

export const metadata: Metadata = {
  title: "TIPZ",
  description:
    "Non-custodial tipping for creators. Tip anyone on X with any token. 0% platform fees. Shielded ZEC delivery.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://www.tipz.cash"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TIPZ",
  },
  openGraph: {
    title: "TIPZ - Private Tips. Any Asset. Zero Platform Fees.",
    description:
      "Non-custodial tipping for creators. Tip anyone on X with any token. 0% platform fees. Shielded ZEC delivery.",
    type: "website",
    siteName: "TIPZ",
    url: "https://www.tipz.cash",
    images: [{ url: "/og-image.png", width: 3200, height: 1800, alt: "TIPZ - Private tips for creators" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TIPZ - Private Tips. Any Asset. Zero Platform Fees.",
    description:
      "Non-custodial tipping for creators. Tip anyone on X with any token. 0% platform fees. Shielded ZEC delivery.",
    images: [{ url: "/og-image.png", alt: "TIPZ - Private tips for creators" }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>{/* Icons are auto-generated from app/icon.tsx and app/apple-icon.tsx */}</head>
      <body>
        <ServiceWorkerRegistration />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
