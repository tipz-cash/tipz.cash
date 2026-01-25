# TIPZ

> Private tips. Any asset. Zero trace.

Privacy-first micro-tipping for creators using Zcash shielded addresses.

## What is TIPZ?

TIPZ lets creators receive tips directly to their Zcash shielded address. Supporters can tip using any token (ETH, USDC, etc.) — we handle the conversion. 100% goes to the creator, zero platform fees.

## Features

### For Creators

- **Creator Command Center** (Browser Extension)
  - **Auto-QR**: Automatically stamps your content with tip QR codes
  - **Instant Alerts**: Get notified when you receive tips
  - **Revenue Analytics**: Track your tipping income
- **Zero Fees**: 100% of tips go to you
- **Private Income**: Shielded addresses keep your earnings private
- **Easy Setup**: Register in 2 minutes with a verification tweet

### For Supporters

- **Any Token**: Pay with ETH, USDC, SOL, or 20+ other tokens
- **Private Giving**: Your generosity stays between you and the creator
- **No Account Needed**: Just connect wallet and tip

## Project Structure

```
tipz/
├── web/               # Next.js 16 app + API
├── extension/         # Creator Command Center (Plasmo)
├── supabase/          # Database migrations
└── docs/              # Strategy, marketing, engineering docs
    ├── MASTER-TASK-LIST.md
    ├── LAUNCH-FLOWCHART.md
    ├── design/
    ├── marketing/
    ├── gtm/
    ├── engineering/
    ├── grants/
    └── outreach/
```

## Tech Stack

- **Web**: Next.js 16, React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Extension**: Plasmo (Chrome MV3)
- **Payments**: NEAR Intents (cross-chain swaps)
- **Privacy**: Zcash shielded addresses

## Quick Start

### Web App

```bash
cd web
npm install
cp .env.example .env.local
# Configure Supabase credentials
npm run dev
```

### Extension

```bash
cd extension
npm install
cp .env.example .env.local
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/creator` | GET | Lookup creator by handle |
| `/api/creators/batch` | POST | Batch lookup creators |
| `/api/register` | POST | Register as creator |
| `/api/swap/quote` | POST | Get swap quote |
| `/api/swap/execute` | POST | Execute swap |
| `/api/health` | GET | Service health check |

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

See `.env.example` files in `/web` and `/extension` for required configuration:

- **Supabase credentials** (required)
- **NEAR credentials** (required for real payments)
- **Twitter API** (optional, for tweet verification)

## Documentation

- [MVP Launch Checklist](./MVP-LAUNCH-CHECKLIST.md) — Technical deployment guide
- [Master Task List](./docs/MASTER-TASK-LIST.md) — All launch workstreams
- [Launch Flowchart](./docs/LAUNCH-FLOWCHART.md) — Visual dependencies
- [Engineering Roadmap](./docs/engineering/roadmap.md) — Feature priorities
- [Brand Guidelines](./docs/design/brand-guidelines.md) — Design system

## License

MIT
