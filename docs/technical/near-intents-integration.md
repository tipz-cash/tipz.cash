# NEAR Intents Integration

Technical documentation for the NEAR Intents cross-chain swap integration in TIPZ.

---

## Overview

TIPZ uses the [NEAR Intents 1Click API](https://docs.near-intents.org/near-intents/integration/distribution-channels/1click-api) to convert any supported token (ETH, USDC, USDT, SOL) into ZEC delivered to a creator's shielded address. TIPZ never custodies funds.

**Base URL**: `https://1click.chaindefuser.com`

---

## Supported Payment Methods

| Token | Chain(s) | Deposit Method |
|-------|----------|----------------|
| ETH | Ethereum | Native transfer |
| USDC | Ethereum, Polygon, Arbitrum, Optimism | ERC-20 transfer |
| USDT | Ethereum | ERC-20 transfer |
| SOL | Solana | Native transfer |

All paths output **ZEC to a shielded unified address (u1...)**.

---

## Flow

```
1. Tipper selects amount + token on tipz.cash/{handle}
2. POST /api/swap/quote
   → Calls NEAR Intents 1Click API for quote
   → Returns: deposit address, exchange rate, fees, expiry
3. Tipper connects wallet (MetaMask, Rabby, Coinbase Wallet, or Phantom)
4. Tipper sends funds to NEAR Intents deposit address
5. POST /api/swap/execute
   → Records tip in Supabase (encrypted data blob)
6. NEAR Intents market makers compete to fulfill the swap
7. Client polls GET /api/swap/status until complete
8. ZEC delivered to creator's shielded address
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/near-intents.ts` | NEAR Intents 1Click API wrapper (quote, execute, status) |
| `lib/near.ts` | NEAR core utilities |
| `lib/wallet.ts` | Wallet connection + transaction execution |
| `hooks/useTipping.ts` | Tipping state machine (quote → sign → deliver → poll) |
| `app/api/swap/quote/route.ts` | Quote endpoint |
| `app/api/swap/execute/route.ts` | Execute endpoint |
| `app/api/swap/status/route.ts` | Status polling endpoint |

---

## Authentication

Requests can optionally include a JWT token (`NEAR_INTENTS_JWT` env var) to avoid the 0.1% NEAR Intents fee.

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEAR_ACCOUNT_ID` | Yes | NEAR account for signing |
| `NEAR_PRIVATE_KEY` | Yes | NEAR account private key |
| `NEAR_NETWORK` | Yes | `mainnet` or `testnet` |
| `NEAR_INTENTS_JWT` | No | Avoids 0.1% fee |

---

## Wallets

| Wallet | Chain | Library |
|--------|-------|---------|
| MetaMask | EVM | ethers.js + Wagmi |
| Rabby | EVM | ethers.js + Wagmi |
| Coinbase Wallet | EVM | ethers.js + Wagmi |
| Phantom | Solana | @solana/web3.js |

---

## Resources

- [NEAR Intents 1Click API Docs](https://docs.near-intents.org/near-intents/integration/distribution-channels/1click-api)
- [NEAR Protocol Docs](https://docs.near.org/)
- [Defuse Protocol](https://defuse.org/)
