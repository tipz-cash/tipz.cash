# TIPZ

> Private tips. Any asset. Zero trace.

Privacy-first micro-tipping for creators using Zcash shielded addresses.

## What is TIPZ?

TIPZ lets creators receive tips directly to their Zcash shielded address. Supporters can tip using any token (ETH, USDC, USDT, SOL) — NEAR Intents handles the cross-chain conversion. 100% goes to the creator, zero platform fees.

## Features

### For Creators

- **Zero Fees**: 100% of tips go to you
- **Private Income**: Shielded addresses keep your earnings private
- **Easy Setup**: Sign in with X, enter your shielded address, done
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
│   │   ├── layout.tsx             # Root layout
│   │   ├── error.tsx              # Error boundary
│   │   ├── not-found.tsx          # 404 page
│   │   ├── robots.ts             # robots.txt generation
│   │   ├── sitemap.ts            # Sitemap generation
│   │   ├── icon.tsx              # Favicon generation
│   │   ├── apple-icon.tsx        # Apple touch icon
│   │   ├── landing.css           # Landing page animations/keyframes
│   │   ├── [handle]/page.tsx     # Creator tip page (/:handle)
│   │   ├── my/                   # Creator dashboard (auth-gated)
│   │   │   ├── page.tsx
│   │   │   ├── components/       # ActivityFeed, HeroStat, StampTools, etc.
│   │   │   └── hooks/            # useRealtimeTips (Supabase WebSocket)
│   │   ├── register/page.tsx     # Registration wizard
│   │   ├── creators/page.tsx     # Creator directory
│   │   ├── manifesto/page.tsx    # Mission statement
│   │   ├── docs/page.tsx         # Documentation
│   │   └── api/
│   │       ├── auth/             # Twitter OAuth 2.0 PKCE
│   │       ├── swap/             # Quote, execute, status (NEAR Intents)
│   │       ├── tips/             # Tips data (encrypted)
│   │       ├── og/               # Dynamic OG image generation
│   │       ├── og-spots/         # OG image spot data
│   │       ├── register/         # Creator registration
│   │       ├── creators/         # Creator directory
│   │       ├── creator/          # Single creator lookup
│   │       ├── leaderboard/      # Creator rankings
│   │       ├── activity/         # Recent tip activity
│   │       ├── link/             # Tip link generation
│   │       ├── zec-price/        # ZEC price (CoinGecko)
│   │       └── health/           # Health check
│   ├── components/
│   │   ├── landing/              # Landing page components
│   │   │   ├── IronManMorph.tsx  # SVG morph animation (tweet → card → receipt)
│   │   │   ├── HeroTitle.tsx     # Typing headline animation
│   │   │   ├── TypingComponents.tsx # Cursor, animated characters
│   │   │   ├── TypingHeading.tsx # Section headings with typing effect
│   │   │   ├── TerminalReveal.tsx # Scroll-triggered reveal
│   │   │   ├── LandingUI.tsx     # Stats, chapter nav, card preview
│   │   │   └── constants.tsx     # Chapter data, layout constants
│   │   ├── tipping/              # Tipping flow components
│   │   │   ├── TippingFlow.tsx   # Multi-step tipping wizard
│   │   │   ├── AmountSelector.tsx # Amount input + presets
│   │   │   ├── TokenSelector.tsx # ETH/SOL/USDC/USDT picker
│   │   │   ├── PaymentMethodPicker.tsx # Payment method selection
│   │   │   ├── WalletConnect.tsx # Wallet connection UI
│   │   │   ├── MessageTrench.tsx # Encrypted message input
│   │   │   ├── TransactionStatus.tsx # Tx confirmation
│   │   │   ├── TipHistory.tsx    # Past tips display
│   │   │   ├── TipSummary.tsx    # Tip summary card
│   │   │   ├── ZecDirectSend.tsx # Direct ZEC send
│   │   │   └── designTokens.ts  # Tipping component design tokens
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── SiteHeader.tsx
│   │   ├── CreatorCard.tsx
│   │   ├── CreatorModal.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── ActivityTicker.tsx
│   │   ├── LetterGridBackground.tsx
│   │   └── TipzLogo.tsx
│   ├── hooks/
│   │   ├── useTipping.ts         # Tipping state machine (quote → sign → deliver → poll)
│   │   ├── useWallet.ts          # Wallet connection + balance
│   │   ├── useLandingHooks.ts    # Landing page animations/scroll
│   │   ├── useResponsive.ts      # Breakpoint detection
│   │   └── useTextScramble.ts    # Text scramble effect
│   ├── lib/
│   │   ├── wallet.ts             # Wallet connection, tx execution
│   │   ├── near-intents.ts       # NEAR Intents API (quote/execute/status)
│   │   ├── near.ts               # NEAR core utilities
│   │   ├── session.ts            # JWT session (HS256, httpOnly, 7-day TTL)
│   │   ├── supabase.ts           # Supabase server helpers
│   │   ├── supabase-client.ts    # Supabase browser client
│   │   ├── message-encryption.ts # RSA keypair + E2E encryption
│   │   ├── crypto-client.ts      # Client-side crypto
│   │   ├── twitter-api.ts        # Twitter API integration
│   │   ├── wagmi.ts              # Wagmi EVM wallet config
│   │   ├── tipz.ts               # Core tipz utilities
│   │   ├── qrcode.ts             # QR code generation
│   │   ├── og-fonts.ts           # OG image font loading
│   │   ├── colors.ts             # Design system color palette
│   │   ├── animations.ts         # Framer Motion helpers
│   │   ├── responsive.ts         # Responsive breakpoints
│   │   └── utils.ts              # General utilities
│   ├── __tests__/                # Vitest tests (9 test files)
│   ├── scripts/                  # Dev utilities
│   └── public/
│       ├── fonts/                # JetBrains Mono, Inter
│       ├── icons/                # Wallet icons (Phantom, Rabby)
│       └── zec/                  # Zcash assets
├── supabase/
│   └── migrations/               # 13 migration files
└── docs/
    ├── engineering/              # Architecture, API reference
    ├── technical/                # Implementation guides
    ├── operations/               # Support FAQ
    └── brand/                    # Logo philosophy
```

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL + Realtime WebSocket)
- **Payments**: NEAR Intents (cross-chain swaps)
- **Web3**: ethers.js (EVM), @solana/web3.js (Solana), Wagmi
- **Auth**: Twitter OAuth 2.0 PKCE, JWT sessions
- **Testing**: Vitest

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
| `/api/register` | POST | Register as creator |
| `/api/link` | GET | Tip link generation |

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

## Database Schema

### creators

```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  handle_normalized TEXT NOT NULL,
  shielded_address TEXT NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  public_key JSONB,
  key_created_at TIMESTAMPTZ,
  avatar_url TEXT,
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
  source_platform TEXT NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  data TEXT
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
| `TWITTER_BEARER_TOKEN` | No | Avatar fetching from X |
| `TWITTER_CLIENT_ID` | No | Creator dashboard OAuth |
| `SESSION_SECRET` | Yes | JWT cookie signing |
| `COINGECKO_API_KEY` | No | Higher rate limits for ZEC price |

## Testing

```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
```

9 test files covering swap quotes/execute/status, NEAR Intents integration, registration, tips API, and payment flows.

## Documentation

- [Architecture](./docs/engineering/architecture.md)
- [API Reference](./docs/engineering/api-reference.md)
- [NEAR Intents Integration](./docs/technical/near-intents-integration.md)
- [Private Messaging Spec](./docs/engineering/private-messaging-spec.md)
- [Support FAQ](./docs/operations/support.md)
- [Design System](./docs/design-system.md)
- [Brand Philosophy](./docs/brand/logo-philosophy.md)
