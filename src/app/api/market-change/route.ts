import { NextResponse } from "next/server";

export async function GET() {
  const slug = "clawcrab"; // کالکشن سولانا

  try {
    const res = await fetch(
      `https://api.magiceden.dev/v2/collections/${slug}/stats`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const stats = await res.json();

    // Magic Eden structure:
    const floor = stats?.floorPrice;
    const volume = stats?.volume24h;
    const sales = stats?.sales24h;

    const messages: string[] = [];

    if (floor !== undefined)
      messages.push(`💰 Floor price: ${floor} SOL`);

    if (volume !== undefined)
      messages.push(`🌊 24h volume: ${volume} SOL`);

    if (sales !== undefined)
      messages.push(`🦀 24h sales: ${sales} items traded`);

    messages.push("🤖 Crab agents scanning Solana waters…");

    return NextResponse.json({ message: messages.join(" | ") });

  } catch (err) {
    return NextResponse.json({
      message: "⚠️ Failed to fetch Magic Eden stats.",
    });
  }
}
