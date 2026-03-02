import type { Metadata } from "next"

type Props = {
  params: Promise<{ handle: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params

  // Clean handle (remove @ if present)
  const cleanHandle = handle.replace(/^@/, "")

  return {
    title: `@${cleanHandle} | TIPZ`,
    description: `Send private tips to @${cleanHandle} on TIPZ. No account needed - just install the extension and tip.`,
    openGraph: {
      title: `@${cleanHandle} | TIPZ`,
      description: `Send private tips to @${cleanHandle} on TIPZ. Powered by Zcash shielded transactions.`,
      url: `https://tipz.cash/${cleanHandle}`,
      type: "profile",
      images: [
        {
          url: `https://tipz.cash/api/og/${cleanHandle}`,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `Send private tips to @${cleanHandle} on TIPZ`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `@${cleanHandle} | TIPZ`,
      description: `Send private tips to @${cleanHandle} on TIPZ.`,
      images: [
        {
          url: `https://tipz.cash/api/og/${cleanHandle}`,
          width: 1200,
          height: 630,
          alt: `Send private tips to @${cleanHandle} on TIPZ`,
        },
      ],
    },
  }
}

export default function HandleLayout({ children }: Props) {
  return children
}
