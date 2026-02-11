import { NextResponse } from "next/server";

const COLLECTION = "clawcrab"; // کالکشن سولانا

export async function GET() {
  try {
    const res = await fetch(
      `https://api.magiceden.dev/v2/collections/${COLLECTION}/stats`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const s = await res.json();

    // Magic Eden structure:
    const floor = s?.floorPrice;
    const volume = s?.volume24h;
    const sales = s?.sales24h;
    const owners = s?.ownerCount;
    const listed = s?.listedCount;

    const messages: string[] = [];

    if (floor) messages.push(`💰 Floor price: ${floor} SOL`);
    if (volume) messages.push(`🌊 24h volume: ${volume} SOL`);
    if (sales) messages.push(`🦀 24h sales: ${sales} items traded`);
    if (owners) messages.push(`👥 Holders: ${owners}`);
    if (listed) messages.push(`📦 Listed: ${listed} items`);

    messages.push("🤖 Autonomous crab agents scanning Solana seas…");
    messages.push("🦀 Colony reacting to on-chain signals…");

    return NextResponse.json({ messages });

  } catch (err) {
    return NextResponse.json({
      messages: [
        "⚠️ Failed to fetch Magic Eden stats.",
        "🦀 Crab agent switching to fallback mode…",
      ],
    });
  }
}
