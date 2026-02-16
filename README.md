# TIPZ

> Private tips. Any asset. Zero trace.

Privacy-first micro-tipping for creators using Zcash shielded addresses.

## What is TIPZ?

TIPZ lets creators receive tips directly to their Zcash shielded address. Supporters can tip using any token (ETH, USDC, etc.) — NEAR Intents handles the cross-chain conversion. 100% goes to the creator, zero platform fees.

## Features

### For Creators

- **Zero Fees**: 100% of tips go to you
- **Private Income**: Shielded addresses keep your earnings private
- **Easy Setup**: 4-step registration with tweet verification
- **Sovereign Dashboard**: Real-time earnings, tip feed, encrypted messages, and promotion tools at tipz.cash/my

### For Supporters

- **Any Token**: Pay with ETH, USDC, MATIC, or other supported tokens
- **Private Giving**: Your generosity stays between you and the creator
- **No Account Needed**: Just connect wallet and tip on creator tip pages

## Project Structure

```
tipz/
├── web/               # Next.js 16 app + API
├── supabase/          # Database migrations
└── docs/              # Technical documentation
    ├── engineering/   # Architecture, roadmap
    ├── technical/     # Implementation guides
    └── operations/    # Runbooks, support
```

## Related Repos

- [tipz-extension](https://github.com/defi-naly/tipz-extension) - Browser extension companion (auto-stamp + notifications)
- [tipz-internal](https://github.com/defi-naly/tipz-internal) - Marketing, GTM, and internal docs (private)

## Tech Stack

- **Web**: Next.js 16, React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Payments**: NEAR Intents (cross-chain swaps)
- **Privacy**: Zcash shielded addresses

## Quick Start

```bash
cd web
npm install
cp .env.example .env.local
# Configure Supabase credentials
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health check |
| `/api/creator` | GET | Lookup single creator by handle |
| `/api/creators` | GET | Paginated creator directory |
| `/api/register` | POST | Register as creator with tweet verification |
| `/api/link` | POST | Re-link returning creator's extension |
| `/api/zec-price` | GET | Real-time ZEC price from CoinGecko |
| `/api/swap/quote` | POST | Get swap quote (any token → ZEC) |
| `/api/swap/execute` | POST | Execute token swap |
| `/api/og/[handle]` | GET | Dynamic OG images for tip pages |
| `/api/auth/me` | GET | Check session status |
| `/api/auth/twitter` | GET | OAuth login redirect |
| `/api/tips/received` | GET | Creator's received tips |
| `/api/tips/stats` | GET | Aggregated tip stats |

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, handle_normalized)
);

CREATE INDEX idx_creator_lookup ON creators(platform, handle_normalized);
```

### transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id),
  amount_zec DECIMAL(18, 8) NOT NULL,
  amount_usd DECIMAL(10, 2),
  tx_hash TEXT UNIQUE,
  status transaction_status DEFAULT 'pending',
  source_platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_creator ON transactions(creator_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

## Environment Variables

See `.env.example` in `/web` for required configuration:

- **Supabase credentials** (required)
- **NEAR credentials** (required for real payments)
- **Twitter API** (optional, for tweet verification)

## Documentation

- [MVP Launch Checklist](./MVP-LAUNCH-CHECKLIST.md) — Technical deployment guide
- [Engineering Roadmap](./docs/engineering/roadmap.md) — Feature priorities
- [Architecture](./docs/engineering/) — System design

## License

MIT
