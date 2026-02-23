import { http, createConfig } from "wagmi"
import { mainnet, polygon, arbitrum, optimism } from "wagmi/chains"
import { injected, coinbaseWallet } from "wagmi/connectors"

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism],
  connectors: [injected(), coinbaseWallet({ appName: "TIPZ" })],
  transports: {
    [mainnet.id]: http("https://eth.llamarpc.com"),
    [polygon.id]: http("https://polygon-rpc.com"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [optimism.id]: http("https://mainnet.optimism.io"),
  },
})
