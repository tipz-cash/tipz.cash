import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "TIPZ - Private Tips. Any Asset. Zero Trace.",
  description: "Private micro-tipping for creators using Zcash shielded addresses. Tip anyone on X with any token.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://tipz.cash"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TIPZ",
  },
  openGraph: {
    title: "TIPZ - Private Tips. Any Asset. Zero Trace.",
    description: "Private micro-tipping for creators using Zcash shielded addresses.",
    type: "website",
    siteName: "TIPZ",
    url: "https://tipz.cash",
  },
  twitter: {
    card: "summary_large_image",
    title: "TIPZ - Private Tips. Any Asset. Zero Trace.",
    description: "Private micro-tipping for creators using Zcash shielded addresses.",
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Icons are auto-generated from app/icon.tsx and app/apple-icon.tsx */}
      </head>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
