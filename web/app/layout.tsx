import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TIPZ - Private Tips for X Creators",
  description: "Private tips for X creators. No account needed to tip. Install the extension, connect your wallet, and tip anonymously via Zcash shielded transactions.",
  openGraph: {
    title: "TIPZ - Private Tips for X Creators",
    description: "Private tips for X creators. No account needed. Powered by Zcash shielded transactions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TIPZ - Private Tips for X Creators",
    description: "Private tips for X creators. No account needed to tip.",
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
