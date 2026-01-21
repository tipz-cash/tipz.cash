import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TIPZ - Get Tipped. Stay Private. No Fees.",
  description: "No account needed to tip. Zero platform fees. Tips stay private. The only tipping platform where your income isn't public knowledge.",
  openGraph: {
    title: "TIPZ - Get Tipped. Stay Private. No Fees.",
    description: "No account needed to tip. Zero fees. Tips stay private. Unlike Ko-fi or Buy Me a Coffee.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TIPZ - Get Tipped. Stay Private. No Fees.",
    description: "No account needed to tip. Zero fees. Tips stay private.",
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}
