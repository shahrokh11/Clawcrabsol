import { NextResponse } from "next/server"

export async function GET() {

  // کالکشن تو
  const slug = "clawcrab"

  // گرفتن آمار از Magic Eden
  const stats = await fetch(`https://api.magiceden.dev/v2/collections/${slug}/stats`, {
    method: "GET",
    cache: "no-store"
  })
    .then(r => r.json())
    .catch(() => null)

  // استخراج داده‌ها از Magic Eden
  const floor = stats?.floorPrice
  const change = stats?.volume24h // Magic Eden one_day_change ندارد

  let messages = []

  if (floor) {
    messages.push(`💰 Floor price now ${floor} SOL`)
  }

  if (change) {
    messages.push(`📈 24h Volume: ${change} SOL`)
  }

  messages.push("🦞 Crab energy detected.")

  return NextResponse.json({
    messages
  })
}
