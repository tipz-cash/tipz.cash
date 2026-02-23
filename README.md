# TIPZ

> Private tips. Any asset. Zero trace.

Privacy-first micro-tipping for creators using Zcash shielded addresses.

## What is TIPZ?

TIPZ lets creators receive tips directly to their Zcash shielded address. Supporters can tip using any token (ETH, USDC, USDT, SOL) — NEAR Intents handles the cross-chain conversion. 100% goes to the creator, zero platform fees.

## Features

### For Creators

- **Zero Fees**: 100% of tips go to you
- **Private Income**: Shielded addresses keep your earnings private
- **Easy Setup**: 4-step registration with tweet verification
- **Sovereign Dashboard**: Real-time earnings, tip feed, encrypted messages, and promotion tools at `tipz.cash/my`
- **Encrypted Messages**: End-to-end encrypted notes from supporters (RSA-OAEP 4096-bit + AES-GCM)
- **Real-Time Notifications**: Instant tip alerts via Supabase Realtime WebSocket

### For Supporters

- **Any Token**: Pay with ETH, USDC, USDT, or SOL
- **Multi-Wallet**: MetaMask, Rabby, Coinbase Wallet (EVM) and Phantom (Solana)
- **Private Giving**: Your generosity stays between you and the creator
- **No Account Needed**: Just connect wallet and tip on creator pages

## Quick Start

```bash
cd web
npm install
cp .env.example .env.local
# Configure Supabase + NEAR credentials (see .env.example for details)
npm run dev
```

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run test         # Vitest (all tests)
npm run test:watch   # Watch mode
npm run lint         # ESLint
```

## Project Structure

```
tipz/
├── web/                           # Next.js 16 app
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── [handle]/page.tsx      # Creator tip page (/:handle)
│   │   ├── my/                    # Creator dashboard (auth-gated)
│   │   │   ├── page.tsx
│   │   │   ├── components/        # Dashboard UI (ActivityFeed, HeroStat, StampTools, etc.)
│   │   │   └── hooks/             # useRealtimeTips (Supabase WebSocket)
│   │   ├── register/page.tsx      # Registration wizard
│   │   ├── creators/page.tsx      # Creator directory
│   │   ├── manifesto/page.tsx     # Mission statement
│   │   ├── docs/page.tsx          # Documentation
│   │   ├── coming-soon/page.tsx   # Pre-launch lockdown
│   │   ├── landing.css            # Landing page animations/keyframes
│   │   └── api/
│   │       ├── auth/              # Twitter OAuth 2.0 PKCE
│   │       ├── swap/              # Quote, execute, status (NEAR Intents)
│   │       ├── tips/              # Tips data (encrypted)
│   │       ├── og/                # Dynamic OG image generation
│   │       ├── register/          # Creator registration
│   │       ├── creators/          # Creator directory
│   │       ├── leaderboard/       # Creator rankings
│   │       ├── activity/          # Recent tip activity
│   │       ├── creator/           # Single creator lookup
│   │       ├── link/              # Extension re-linking
│   │       ├── mesh/              # MeshConnect link tokens
│   │       ├── zec-price/         # ZEC price (CoinGecko)
│   │       └── health/            # Health check
│   ├── components/
│   │   ├── landing/               # Landing page components
│   │   │   ├── IronManMorph.tsx   # SVG morph animation (tweet → card → receipt)
│   │   │   ├── HeroTitle.tsx      # Typing headline animation
│   │   │   ├── TypingComponents.tsx # Cursor, animated characters
│   │   │   ├── TypingHeading.tsx  # Section headings with typing effect
│   │   │   ├── TerminalReveal.tsx # Scroll-triggered reveal
│   │   │   ├── LandingUI.tsx      # Stats, chapter nav, card preview
│   │   │   └── constants.tsx      # Chapter data, layout constants
│   │   ├── tipping/               # Tipping flow components
│   │   │   ├── TippingFlow.tsx    # Multi-step tipping wizard
│   │   │   ├── AmountSelector.tsx # Amount input + presets
│   │   │   ├── TokenSelector.tsx  # ETH/SOL/USDC/USDT picker
│   │   │   ├── WalletConnect.tsx  # Wallet connection UI
│   │   │   ├── MessageTrench.tsx  # Encrypted message input
│   │   │   └── TransactionStatus.tsx # Tx confirmation
│   │   ├── SiteHeader.tsx
│   │   ├── CreatorCard.tsx
│   │   ├── Leaderboard.tsx
│   │   └── TipzLogo.tsx
│   ├── hooks/
│   │   ├── useTipping.ts          # Tipping state machine (quote → sign → deliver → poll)
│   │   ├── useWallet.ts           # Wallet connection + balance
│   │   ├── useLandingHooks.ts     # Landing page animations/scroll
│   │   ├── useResponsive.ts       # Breakpoint detection
│   │   └── useTextScramble.ts     # Text scramble effect
│   ├── lib/
│   │   ├── wallet.ts              # Wallet connection, tx execution
│   │   ├── near-intents.ts        # NEAR Intents API (quote/execute/status)
│   │   ├── near.ts                # NEAR core utilities
│   │   ├── session.ts             # JWT session (HS256, httpOnly, 7-day TTL)
│   │   ├── supabase.ts            # Supabase server helpers
│   │   ├── supabase-client.ts     # Supabase browser client
│   │   ├── message-encryption.ts  # RSA keypair + E2E encryption
│   │   ├── crypto-client.ts       # Client-side crypto
│   │   ├── mesh.ts                # MeshConnect SDK wrapper
│   │   ├── twitter-api.ts         # Twitter API integration
│   │   ├── colors.ts              # Design system color palette
│   │   ├── animations.ts          # Framer Motion helpers
│   │   └── rate-limit.ts          # API rate limiting
│   ├── __tests__/                 # Vitest tests (10 test files)
│   └── public/
│       ├── fonts/                 # JetBrains Mono, Inter
│       ├── icons/                 # Wallet icons (Phantom, Rabby)
│       └── zec/                   # Zcash assets
├── supabase/
│   └── migrations/                # 13 migration files
└── docs/
    ├── engineering/               # Architecture, roadmap
    ├── technical/                  # Implementation guides
    └── operations/                 # Runbooks, support
```

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL + Realtime WebSocket)
- **Payments**: NEAR Intents (cross-chain swaps)
- **Web3**: ethers.js (EVM), @solana/web3.js (Solana)
- **Auth**: Twitter OAuth 2.0 PKCE, JWT sessions
- **Encryption**: RSA-OAEP 4096-bit + AES-GCM (hybrid E2E)
- **Testing**: Vitest, Playwright

## API Endpoints

### Public

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health check |
| `/api/creators` | GET | Paginated creator directory |
| `/api/creator` | GET | Lookup single creator by handle |
| `/api/leaderboard` | GET | Creator rankings |
| `/api/activity` | GET | Recent tip activity |
| `/api/zec-price` | GET | Real-time ZEC price (CoinGecko) |
| `/api/tips/latest` | GET | Latest tips |
| `/api/tips/received` | GET | Creator's received tips (encrypted data) |
| `/api/tips/stats` | GET | Aggregated tip statistics |
| `/api/og` | GET | Default OG image |
| `/api/og/[handle]` | GET | Dynamic OG image per creator |
| `/api/register` | POST | Register as creator (tweet verification) |
| `/api/link` | POST | Re-link returning creator's extension |

### Swap (NEAR Intents)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/swap/quote` | POST | Get swap quote (ETH/USDC/USDT/SOL → ZEC) |
| `/api/swap/execute` | POST | Execute cross-chain swap |
| `/api/swap/status` | GET | Poll swap transaction status |

### Auth-Gated

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/twitter` | GET | OAuth 2.0 PKCE login redirect |
| `/api/auth/twitter/callback` | GET | OAuth callback |
| `/api/auth/me` | GET | Check session status |
| `/api/auth/logout` | POST | End session |

Tips endpoints are safe to be public because all sensitive data (amounts, memos) lives in an encrypted `data` blob — only the creator's RSA private key (stored in IndexedDB) can decrypt it.

## Database Schema

### creators

```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  handle_normalized TEXT NOT NULL,
  shielded_address TEXT NOT NULL,
  tweet_url TEXT NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  public_key JSONB,                    -- RSA-OAEP 4096-bit JWK for message encryption
  key_created_at TIMESTAMPTZ,
  avatar_url TEXT,                     -- X/Twitter profile image
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, handle_normalized)
);
```

### tipz

```sql
CREATE TABLE tipz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  source_platform TEXT NOT NULL,       -- 'x', 'web', 'extension', etc.
  status transaction_status NOT NULL DEFAULT 'pending',
  data TEXT                            -- Encrypted blob (RSA + AES-GCM)
  -- No plaintext amount columns. All tip amounts and memos live
  -- exclusively inside the encrypted data blob.
);
```

## Environment Variables

See `.env.example` in `/web` for full configuration. Key groups:

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Yes | Database + Realtime |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client-side Realtime |
| `NEAR_ACCOUNT_ID`, `NEAR_PRIVATE_KEY`, `NEAR_NETWORK` | Yes | Cross-chain swaps |
| `NEAR_INTENTS_JWT` | No | Avoids 0.1% NEAR fee |
| `TWITTER_BEARER_TOKEN` | No | Automated tweet verification |
| `TWITTER_CLIENT_ID` | No | Creator dashboard OAuth |
| `SESSION_SECRET` | Yes | JWT cookie signing |
| `NEXT_PUBLIC_MESH_CLIENT_ID`, `MESH_CLIENT_SECRET` | No | MeshConnect fiat/exchange payments |
| `COINGECKO_API_KEY` | No | Higher rate limits for ZEC price |

## Testing

```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
```

10 test files covering swap quotes/execute/status, NEAR Intents integration, registration, tips API, payment flows, and rate limiting.

## Documentation

- [Engineering Roadmap](./docs/engineering/roadmap.md)
- [Architecture](./docs/engineering/)
- [Operations](./docs/operations/)

## License

MIT
