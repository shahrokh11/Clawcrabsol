import { NextResponse } from "next/server";

export async function GET() {
  const slug = "clawcrab";

  try {
    // PROXY to bypass Cloudflare blocking
    const url = `https://corsproxy.io/?https://api.magiceden.dev/v2/collections/${slug}/stats`;

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Magic Eden failed", status: res.status },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json(
      { error: "Magic Eden timeout", details: String(err) },
      { status: 500 }
    );
  }
}
