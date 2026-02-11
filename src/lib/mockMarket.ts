export type MarketStats = {
  floorPrice: string
  floorDelta: string
  topOffer: string
  vol24h: string
  sales24h: string
  allVol: string
  marketCap: string
  listedSupply: string
  listedPct: string
  owners: string
}

export const mockMarketStats: MarketStats = {
  floorPrice: '0 SOL',
  floorDelta: '0%',
  topOffer: '0 SOL',
  vol24h: '0 SOL',
  sales24h: '0',
  allVol: '0 SOL',
  marketCap: '$1K',
  listedSupply: '3 / 4,200',
  listedPct: '0%',
  owners: '3',
}
