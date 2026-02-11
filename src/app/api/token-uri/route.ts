import { NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tokenId = searchParams.get("tokenId")

  if (!tokenId) {
    return NextResponse.json({ error: "Missing tokenId" }, { status: 400 })
  }

  const client = createPublicClient({ chain: base, transport: http() })

  try {
    
    const tokenURI = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI as any,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    })

    return NextResponse.json({ tokenURI })
  } catch (e: any) {
    return NextResponse.json(
      { error: "tokenURI read failed. Does your contract have tokenURI()?", details: String(e?.message ?? e) },
      { status: 500 }
    )
  }
}
