'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import ActivityFeed from "@/components/ActivityFeed";
import LiveStatsCard from "@/components/LiveStatsCard";
import { hexToBigInt } from "viem"


import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Home() {
  const { isConnected } = useAccount()
    const [slug, setSlug] = useState<string>('clawcrabnft'); 
  

  const [amount, setAmount] = useState(1)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  
  
  const [showModal, setShowModal] = useState(false)
const [mintedTokenId, setMintedTokenId] = useState<string | null>(null)
const [nftImage, setNftImage] = useState<string | null>(null)

const tweetText = `Just minted my Clawcrab NFT on Base 🦞🔥

Join the colony and watch it evolve onchain. @clawcrab_ai

#NFT #Base #Clawcrab`

  

  // Left activity (OpenSea sales + price change)
  const [agentFeed, setAgentFeed] = useState<string[]>([])

  // Top stats bar from OpenSea
  const [marketStats, setMarketStats] = useState<any>(null)

  // AI console feed
  const [aiFeed, setAiFeed] = useState<string[]>([])


  // Load AI messages
  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/agent')
      const data = await res.json()
      setAiFeed(data.messages ?? [])
    }
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])
  
 

  useEffect(() => {
  const load = async () => {
    const res = await fetch('/api/magiceden-stats')
    const data = await res.json()
    setMarketStats(data)
  }

  load()
  const id = setInterval(load, 30000)
  return () => clearInterval(id)
}, [])


  // Load magiceden activity + daily change feed for left activity box
useEffect(() => {
  const tick = async () => {
    const a = await fetch('/api/activity').then((r) => r.json())
    const p = await fetch('/api/market-change').then((r) => r.json())

    setAgentFeed((prev) =>
      [
        ...(a.sales ?? []),
        ...(p.message ? [p.message] : []),
        ...prev,
      ].slice(0, 7)   // فقط ۵ تا آیتم آخر
    )
  }

  tick()
  const id = setInterval(tick, 15000)
  return () => clearInterval(id)
}, [])



  const { data: totalSupply, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  })

  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxSupply',
  })

  const { data: price } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'PUBLIC_SALE_PRICE',
  })

  const { writeContractAsync } = useWriteContract()

  const { data: receipt, isLoading: confirming, isSuccess } =
  useWaitForTransactionReceipt({
    hash: txHash!,
  })


useEffect(() => {

  if (!receipt || !isSuccess) return

  const transferLog = receipt.logs.find(
    (log: any) => log.topics?.length === 4
  )

  if (!transferLog) {
    setShowModal(true)
    return
  }

  const tokenIdHex = transferLog.topics?.[3]

if (!tokenIdHex) {
  console.error("Token ID not found in log:", transferLog)
  return
}

const id = BigInt(tokenIdHex).toString()

setMintedTokenId(id)
loadNFTImage(id)


}, [receipt, isSuccess])


useEffect(() => {
  if (nftImage) {
    setShowModal(true)
  }
}, [nftImage])



  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'Transfer',
    onLogs() {
      refetch()
    },
  })

 

const mint = async () => {
  if (typeof price !== "bigint") return

  const totalValue = price * BigInt(amount)

  const hash = await writeContractAsync({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mint',
    args: [BigInt(amount)],
    value: totalValue,
  })

  setTxHash(hash)
}



  
const loadNFTImage = async (tokenId: string) => {
  try {
    const res = await fetch(`/api/token-uri?tokenId=${tokenId}`);
    const data = await res.json();
    let tokenURI = data.tokenURI;

    if (tokenURI.startsWith("ipfs://")) {
      tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const meta = await fetch(tokenURI).then((r) => r.json());
    let img = meta.image;

    if (img.startsWith("ipfs://")) {
      img = img.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    setNftImage(img);
    
  } catch (error) {
    console.error(error);
    
  }
};



  const progress =
    totalSupply && maxSupply
      ? Math.floor((Number(totalSupply) / Number(maxSupply)) * 100)
      : 0

// ---- Top bar values from Magic Eden
const os = marketStats ?? {}

const floor = os.floorPrice
const oneDayVol = os.volume24h
const oneDaySales = os.sales24h
const totalVol = os.totalVolume
const marketCap = os.marketCap
const owners = os.ownerCount
const listed = os.listedCount



const FloatingLogo = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
      <img
        src="/images/logo.png"
        alt="logo"
        className="w-96 opacity-90 animate-float"
      />
    </div>
  )
}



  

  return (
    <main className="min-h-screen bg-transparent text-foreground px-6">
      {/* Header */}
      <header className="flex items-center justify-between py-4 
border-b border-[#5A0F18]
bg-[radial-gradient(circle_at_center,_#8F1D2C,_#130308)]
text-red-200">

        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-3 pixel">
          <span className="text-4xl">🦞</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl text-zinc-100">Clawcrab</span>
            <span className="text-[12px] text-zinc-500 uppercase">nft</span>
          </div>
        </a>

        {/* Right */}
        <div className="flex items-center gap-2">
		


  {/* X / Twitter */}
  <a
    href="https://x.com/mr_dashtiii"
    target="_blank"
    className="opacity-70 hover:opacity-100 transition"
  >
    <img src="/icons/x.png" className="w-7 h-7" />
  </a>

  

  {/* Magic Eden */}
  <a
    href="https://magiceden.io/marketplace/clawcrab"
    target="_blank"
    className="opacity-70 hover:opacity-100 transition"
  >
    <img src="/icons/magiceden.png" className="w-7 h-7" />
  </a>

  <ConnectButton />
</div>

      </header>

      {/* Stats bar (OpenSea) */}
      <section className="pixel py-4 border-b border-zinc-800 bg-zinc-800/100 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <MarketStat label="Floor Price" value={fmtNum(floor, 'ETH')} tone="green" />
            <Divider />
            <MarketStat label="24h Vol" value={fmtNum(oneDayVol, 'ETH')} tone="yellow" />
            <Divider />
            <MarketStat label="24h Sales" value={fmtNum(oneDaySales)} tone="neutral" />
            <Divider />
            <MarketStat label="All Vol" value={fmtNum(totalVol, 'ETH')} tone="purple" />
            <Divider />
            <MarketStat label="Market Cap" value={fmtNum(marketCap, 'ETH')} tone="yellow" />
            <Divider />
            <MarketStat
              label="Listed"
              value={fmtNum(listed)}
              sub={maxSupply ? `/${maxSupply.toString()}` : undefined}
              tone="red"
            />
            <Divider />
            <MarketStat label="Owners" value={fmtNum(owners)} tone="neutral" />
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="w-full py-2">
        <div className="max-w-7xl mx-auto px-6">
          <img
            src="/images/banner.png"
            alt="Banner"
            className="w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      {/* Hero */}
 <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-8">

  {/* Floating Logo وسط */}
  <FloatingLogo />

  {/* Left Text */}
        <div className="space-y-6">
          <h2 className="text-5xl font-bold leading-tight">
            A living NFT collection
            <br />
            powered by <span className="text-[#8F1D2C] font-bold-semibold">autonomous</span> agents
          </h2>

<p className="text-zinc-400 max-w-xl leading-relaxed space-y-2 flex flex-col">
  <span>Once upon a block, a colony of Claw Crabs emerged on Solana.</span>

  <span>They are not static JPEGs.</span>
  <span>They do not sleep.</span>
  <span>They do not wait for commands.</span>

  <span>
    Each Claw Crab is part of a living system   
    an autonomous onchain organism that observes, reacts,  
    and executes its own routines without human intervention.
  </span>

  <span>
    As the collection evolves, so does the agent behind it.
  </span>

  <span className="text-[#8F1D2C] font-semibold tracking-wide">
    Minting is not the end.  
    It is the beginning.
  </span>
</p>


        </div>


{/* Mint Card replaced with image */}
<div className="w-full max-w-lg mx-auto">
  <img
    src="/2026.png"
    alt="Clawcrab Banner"
    className="rounded-2xl border border-zinc-800"
  />
</div>






        {/* Mint Card (hidden) */}
{false && (
  <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 w-full max-w-lg mx-auto">
    <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
      <div>
        <p className="text-sm text-zinc-300 font-semibold">Mint Claw Crab</p>
        <p className="text-xs text-zinc-500 mt-1">
          Public mint on Base • max 10 per tx
        </p>
      </div>

      <span className="text-xs px-3 py-1 rounded-full border border-zinc-800 text-zinc-300">
        {!isConnected
          ? 'disconnected'
          : confirming
          ? 'pending'
          : isSuccess
          ? 'success'
          : 'ready'}
      </span>
    </div>

    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="border border-zinc-800 rounded-lg p-3 bg-black">
          <p className="text-zinc-500">Supply</p>
          <p className="text-white font-semibold mt-1">
            {totalSupply?.toString() ?? '—'} / {maxSupply?.toString() ?? '—'}
          </p>
        </div>

        <div className="border border-zinc-800 rounded-lg p-3 bg-black">
          <p className="text-zinc-500">Mint Price</p>
          <p className="text-white font-semibold mt-1">
            {price ? (Number(price) / 1e18).toFixed(4) : '—'} ETH
          </p>
        </div>

        <div className="border border-zinc-800 rounded-lg p-3 bg-black">
          <p className="text-zinc-500">Total</p>
          <p className="text-white font-semibold mt-1">
            {price ? ((Number(price) / 1e18) * amount).toFixed(4) : '—'} ETH
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Minted</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 items-center">
        <button
          className="py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition"
          onClick={() => setAmount((a) => Math.max(1, a - 1))}
        >
          −
        </button>

        <div className="text-center">
          <p className="text-xs text-zinc-500">Amount</p>
          <p className="text-2xl font-semibold">{amount}</p>
        </div>

        <button
          className="py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition"
          onClick={() => setAmount((a) => Math.min(10, a + 1))}
        >
          +
        </button>
      </div>

      <button
        onClick={mint}
        disabled={!isConnected || confirming}
        className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
      >
        {!isConnected ? 'Connect wallet' : confirming ? 'Confirming…' : 'Mint now'}
      </button>

      {txHash && (
        <div className="text-xs text-blue-400 flex items-center justify-between">
          <span className="truncate max-w-[70%]">tx: {txHash}</span>
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            className="underline"
          >
            BaseScan
          </a>
        </div>
      )}
    </div>
  </div>
)}

      </section>

      {/* Activity + Agent */}
<section className="mt-20">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"> 

    {/* Left */}
    <div className="h-full flex flex-col"> 
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

      <div className="flex-1 border border-zinc-800 rounded-xl p-6 text-sm bg-zinc-950"> 
        <ul className="space-y-2 text-yellow-400">
          {agentFeed.length === 0 ? (
            <li className="text-zinc-500">Waiting for activity…</li>
          ) : (
            agentFeed.map((m, i) => <li key={i}>{m}</li>)
          )}
        </ul>
      </div>
    </div>

    {/* Right */}
    <div className="h-full flex flex-col space-y-4"> 
      <h3 className="text-lg font-semibold mb-4">Agent Console</h3>
      <LiveStatsCard />
      <AgentFeedCard aiFeed={aiFeed} />
    </div>

  </div>
</section>


      {/* Footer with alerts on right */}
      <SiteFooter />
	{showModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-[#c3414a] border border-[#d7d7d7] rounded-xl p-6 w-[320px] max-w-sm text-center space-y-4 shadow-2xl">
      
      {nftImage && (
        <img
          src={nftImage}
          className="rounded-lg mx-auto mb-4 border border-[#7A1A25]"
          alt="NFT Image"
        />
      )}

      <div className="mt-4 space-y-3">

        {/* Twitter */}
        <a
          target="_blank"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
          className="block w-full bg-black text-white py-2 rounded-lg font-semibold 
                     hover:bg-zinc-800 transition"
        >
          Share on Twitter
        </a>

        {/* OpenSea */}
        <a
          target="_blank"
          href={`https://opensea.io/assets/base/${CONTRACT_ADDRESS}/${mintedTokenId}`}
          className="block w-full bg-black text-white py-2 rounded-lg font-semibold 
                     hover:bg-zinc-800 transition"
        >
          View on OpenSea
        </a>

        {/* Close */}
        <button
          onClick={() => setShowModal(false)}
          className="text-xs text-red-200 hover:text-white transition"
        >
          close
        </button>

      </div>
    </div>
  </div>
)}


  
    </main>
  )
}

/* ---------- Components ---------- */

function MarketStat({
  label,
  value,
  delta,
  sub,
  tone = 'neutral',
}: {
  label: string
  value: string
  delta?: string
  sub?: string
  tone?: 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'neutral'
}) {
  const toneMap: Record<string, string> = {
    green: 'text-emerald-400',
    blue: 'text-sky-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
    yellow: 'text-amber-400',
    neutral: 'text-zinc-200',
  }

  return (
    <div className="flex flex-col items-center justify-center px-2">
      <span className="text-[12px] uppercase tracking-widest text-zinc-500">
        {label}
      </span>

      <span className={`pixel text-sm mt-1 ${toneMap[tone]}`}>{value}</span>

      {delta && (
        <span
          className={`text-[9px] mt-0.5 ${
            delta.startsWith('-') ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {delta}
        </span>
      )}

      {sub && <span className="text-[9px] text-zinc-600 mt-0.5">{sub}</span>}
    </div>
  )
}

function Divider() {
  return <span className="text-zinc-700 px-1"></span>
}




function AgentFeedCard({ aiFeed }: { aiFeed: string[] }) {
  const listRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [aiFeed])


  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-zinc-500">Crab</div>
        <span className="text-[10px] px-2 py-1 rounded-full border border-zinc-800 text-green-400">
          ● online
        </span>
     
      </div>

      <div className="border border-zinc-800 rounded-lg p-3 bg-black mt-3">
        <div className="text-xs text-zinc-500 mb-2">AI Live Activity</div>

        <div
          ref={listRef}
          className="max-h-[220px] overflow-y-auto space-y-2 text-sm text-zinc-200"
        >
          {aiFeed.length === 0 ? (
            <div className="text-zinc-500 animate-pulse">Agent is thinking…</div>
          ) : (
            aiFeed.map((m, i) => (
              <div key={i} className="leading-snug">
                {m}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function SiteFooter() {
  const alerts = ['⚠️ Only trust official links.', '🛡️ Never share seed phrase.']

  return (
<footer className="mt-[48px] py-[10px] text-sm text-red-200 border-t border-[#5A0F18] 
bg-[radial-gradient(circle_at_center,_#8F1D2C,_#130308)]">


  <div className="max-w-9xl mx-auto px-6">   

    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>Clawcrab NFT — Built on Solana</div>

      <div className="border border-zinc-800 rounded-lg p-2 bg-black max-w-xs">
        <div className="text-xs text-zinc-600 mb-2">Alerts</div>
        <ul className="space-y-2 text-sm text-zinc-300">
          {alerts.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
    </div>

  </div>
</footer>

  )
}

function fmtNum(x: any, suffix?: string) {
  if (x === null || x === undefined || x === '') return '—'
  const n = Number(x)
  if (Number.isNaN(n)) return String(x)

  // small formatting
  const v =
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)}M`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(2)}K`
      : n.toFixed(4).replace(/\.?0+$/, '')

  return suffix ? `${v} ${suffix}` : v
}
