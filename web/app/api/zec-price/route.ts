import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 60 } }
    )
    const data = await response.json()
    return NextResponse.json({
      price: data.zcash.usd,
      change24h: data.zcash.usd_24h_change,
    })
  } catch {
    return NextResponse.json({ price: 27.50, change24h: 0 })
  }
}
