import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http("https://rpc.ankr.com/eth_ba"),
  },
  ssr: true,
})
