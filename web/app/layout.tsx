import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TIPZ - Private Tips. Any Asset. Zero Trace.",
  description: "Private micro-tipping for creators using Zcash shielded addresses. Tip anyone on X with any token.",
  openGraph: {
    title: "TIPZ - Private Tips. Any Asset. Zero Trace.",
    description: "Private micro-tipping for creators using Zcash shielded addresses.",
    type: "website",
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
