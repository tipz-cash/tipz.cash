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
      type: "profile",
      images: [`/api/og/${cleanHandle}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `@${cleanHandle} | TIPZ`,
      description: `Send private tips to @${cleanHandle} on TIPZ.`,
      images: [`/api/og/${cleanHandle}`],
    },
  }
}

export default function HandleLayout({ children }: Props) {
  return children
}
