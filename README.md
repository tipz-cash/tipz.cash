# TIPZ

Private micro-tipping for X and Substack creators using Zcash shielded addresses.

## Project Structure

```
tipz/
├── extension/     # Plasmo browser extension
├── web/           # Next.js app + API
└── README.md
```

## Features

- **Browser Extension**: Injects tip buttons on X tweets and Substack articles
- **Private Payments**: Creators receive ZEC to shielded addresses
- **Creator Registration**: Verify ownership via tweet

## Supabase Schema

```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  handle_normalized TEXT NOT NULL,
  shielded_address TEXT NOT NULL,
  tweet_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, handle_normalized)
);

CREATE INDEX idx_creator_lookup ON creators(platform, handle_normalized);
```

## Development

### Extension

```bash
cd extension
pnpm install
pnpm dev
```

### Web App

```bash
cd web
pnpm install
pnpm dev
```

## API Endpoints

- `GET /api/creator?platform=x&handle=username` - Lookup single creator
- `POST /api/creators/batch` - Batch lookup creators
- `POST /api/register` - Register as a creator
