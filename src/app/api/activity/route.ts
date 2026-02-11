import { NextResponse } from "next/server";
import WebSocket from "ws";

let events: string[] = [];
let initialized = false;

function initStream() {
  if (initialized) return;
  initialized = true;

  const API_KEY = process.env.OPENSEA_API_KEY!;
  const SLUG = process.env.OPENSEA_COLLECTION_SLUG!;

  const ws = new WebSocket(
    `wss://stream.openseabeta.com/socket/websocket?token=${API_KEY}`
  );

  ws.on("open", () => {
    // Subscribe to collection
    ws.send(
      JSON.stringify({
        topic: `collection:${SLUG}`,
        event: "phx_join",
        payload: {},
        ref: 1,
      })
    );

    // Heartbeat every 30 seconds
    setInterval(() => {
      ws.send(
        JSON.stringify({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: 0,
        })
      );
    }, 30000);
  });

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      const type = msg?.payload?.event_type;
      const data = msg?.payload?.payload;

      if (!type || !data) return;

      const push = (m: string) => {
        events.unshift(m);
        events = events.slice(0, 30);
      };

      switch (type) {
        case "item_listed": {
          const price =
            Number(data.base_price) / 10 ** data.payment_token.decimals;
          push(`📜 Listed ${data.item.metadata?.name} for ${price} ${data.payment_token.symbol}`);
          break;
        }

        case "item_sold": {
          const price =
            Number(data.sale_price) / 10 ** data.payment_token.decimals;
          push(`💰 Sold ${data.item.metadata?.name} for ${price} ${data.payment_token.symbol}`);
          break;
        }

        case "item_transferred": {
          push(`🔄 Transferred ${data.item.metadata?.name}`);
          break;
        }

        case "item_cancelled": {
          push(`❌ Cancelled listing for ${data.item.metadata?.name}`);
          break;
        }

        case "item_received_bid": {
          const price =
            Number(data.base_price) / 10 ** data.payment_token.decimals;
          push(`💎 Bid on ${data.item.metadata?.name}: ${price} ${data.payment_token.symbol}`);
          break;
        }

        case "collection_offer": {
          const price =
            Number(data.base_price) / 10 ** data.payment_token.decimals;
          push(`📦 Collection offer: ${price} ${data.payment_token.symbol}`);
          break;
        }

        case "trait_offer": {
          const price =
            Number(data.base_price) / 10 ** data.payment_token.decimals;
          push(`🎨 Trait offer on ${data.trait_criteria.trait_type}: ${price} ${data.payment_token.symbol}`);
          break;
        }

        case "order_invalidate": {
          push(`⚠️ Order invalidated`);
          break;
        }

        case "order_revalidate": {
          push(`♻️ Order revalidated`);
          break;
        }
      }
    } catch (err) {
      console.error("Parse error:", err);
    }
  });
}

export async function GET() {
  initStream();
  return NextResponse.json({ events });
}
