# TIPZ Architecture

System design and technical architecture for the TIPZ web application.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────┐         ┌───────────────────────┐        │
│   │     Creator      │         │       Tipper          │        │
│   │ (Web Dashboard)  │         │    (Web Browser)      │        │
│   │  tipz.cash/my    │         │  tipz.cash/{handle}   │        │
│   └────────┬─────────┘         └───────────┬───────────┘        │
│            │                               │                     │
└────────────┼───────────────────────────────┼─────────────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │              TIPZ Web App (Next.js 16)               │      │
│   │                                                       │      │
│   │   ┌────────────┐  ┌────────────┐  ┌─────────────┐   │      │
│   │   │  Landing   │  │  Register  │  │  Tip Pages  │   │      │
│   │   │   Page     │  │  (OAuth)   │  │  /{handle}  │   │      │
│   │   └────────────┘  └────────────┘  └─────────────┘   │      │
│   │                                                       │      │
│   │   ┌────────────┐  ┌────────────┐  ┌─────────────┐   │      │
│   │   │  Creators  │  │  Creator   │  │    API      │   │      │
│   │   │ Directory  │  │ Dashboard  │  │   Routes    │   │      │
│   │   └────────────┘  └────────────┘  └──────┬──────┘   │      │
│   │                                           │          │      │
│   └───────────────────────────────────────────┼──────────┘      │
│                                               │                  │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │                     Supabase                          │      │
│   │                                                       │      │
│   │   ┌─────────────────────────────────────────────┐    │      │
│   │   │            creators table                    │    │      │
│   │   │  id | platform | handle | shielded_address  │    │      │
│   │   │  public_key | avatar_url                     │    │      │
│   │   └─────────────────────────────────────────────┘    │      │
│   │                                                       │      │
│   │   ┌─────────────────────────────────────────────┐    │      │
│   │   │              tipz table                      │    │      │
│   │   │  id | creator_id | status | data (encrypted) │    │      │
│   │   └─────────────────────────────────────────────┘    │      │
│   │                                                       │      │
│   │   ┌─────────────────────────────────────────────┐    │      │
│   │   │             Realtime (WebSocket)             │    │      │
│   │   │   Pushes tip notifications to dashboard      │    │      │
│   │   └─────────────────────────────────────────────┘    │      │
│   │                                                       │      │
│   └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PAYMENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │  Web3 Wallet │───▶│ NEAR Intents │───▶│   Zcash      │     │
│   │  (any token) │    │  (1Click)    │    │  Shielded    │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
│   [ETH/USDC/SOL] ──▶ [/api/swap] ──▶ [NEAR] ──▶ [ZEC u1...]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Web Application

**Framework**: Next.js 16 (App Router)
**Deployment**: Vercel

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with scroll-triggered animations |
| `/register` | OAuth registration wizard (sign in with X + enter shielded address) |
| `/[handle]` | Individual creator tip page with TippingFlow |
| `/creators` | Paginated creator directory |
| `/my` | Auth-gated creator dashboard (real-time tips, encrypted messages, promotion tools) |
| `/manifesto` | Mission statement |
| `/docs` | Documentation |

### API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/creator` | Single creator lookup |
| GET | `/api/creators` | Paginated creator directory |
| POST | `/api/register` | Creator registration |
| GET | `/api/link` | Re-link returning creator |
| GET | `/api/zec-price` | ZEC price (CoinGecko) |
| POST | `/api/swap/quote` | Swap quote (ETH/USDC/USDT/SOL → ZEC) |
| POST | `/api/swap/execute` | Execute cross-chain swap |
| GET | `/api/swap/status` | Poll swap status |
| GET | `/api/tips/received` | Creator's received tips (encrypted) |
| GET | `/api/tips/stats` | Aggregated tip statistics |
| GET | `/api/tips/latest` | Most recent tips |
| GET | `/api/activity` | Recent tip activity |
| GET | `/api/leaderboard` | Creator rankings |
| GET | `/api/og/[handle]` | Dynamic OG images |
| GET | `/api/auth/twitter` | OAuth 2.0 PKCE login |
| GET | `/api/auth/twitter/callback` | OAuth callback |
| GET | `/api/auth/me` | Session check |
| POST | `/api/auth/logout` | End session |

---

## Database

**Provider**: Supabase (PostgreSQL + Realtime WebSocket)

### Schema

```sql
-- Registered creators
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  handle_normalized TEXT NOT NULL,
  shielded_address TEXT NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  public_key JSONB,                    -- RSA-OAEP 4096-bit JWK
  key_created_at TIMESTAMPTZ,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, handle_normalized)
);

-- Tips (all sensitive data encrypted in `data` column)
CREATE TABLE tipz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  source_platform TEXT NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  data TEXT  -- Encrypted blob (RSA + AES-GCM). No plaintext amounts.
);
```

The `data` column contains all tip details (amounts, memos, swap details) encrypted with the creator's RSA public key. Only the creator can decrypt using their private key stored in IndexedDB.

---

## Data Flows

### Creator Registration (OAuth)

```
1. Creator clicks "Sign in with X" → redirects to Twitter OAuth 2.0 PKCE
2. Twitter callback verifies token, extracts handle
3. Creator enters Zcash unified address (u1...)
4. Server upserts to Supabase (platform, handle, shielded_address)
5. Client generates RSA-4096 key pair
6. Private key stored in IndexedDB (never leaves device)
7. Public key uploaded to server via /api/link
```

### Tipping Flow

```
1. Tipper visits tipz.cash/{handle}
2. Selects amount and payment token (ETH, USDC, USDT, or SOL)
3. POST /api/swap/quote → NEAR Intents 1Click API returns quote + deposit address
4. Tipper connects wallet (MetaMask, Rabby, Coinbase Wallet, or Phantom)
5. Tipper sends funds to NEAR Intents deposit address
6. POST /api/swap/execute records the tip in Supabase
7. NEAR Intents market makers fulfill the swap → ZEC to shielded address
8. Client polls GET /api/swap/status until complete
9. Creator receives real-time notification via Supabase Realtime
```

### Creator Dashboard

```
1. Creator logs in at /my via Twitter OAuth
2. Server validates session via /api/auth/me (JWT, HS256, httpOnly, 7-day TTL)
3. RSA key pair auto-generated if missing, private key in IndexedDB
4. Dashboard fetches tips (/api/tips/received) and stats (/api/tips/stats)
5. Supabase Realtime WebSocket pushes new tips in real-time
6. Client decrypts tip data with local RSA private key
7. Toast notifications + activity feed update live
```

### Encrypted Messaging

```
1. Tipper writes optional message alongside tip
2. Client fetches creator's RSA public key from API
3. Hybrid encryption: AES-256-GCM for message body, RSA-OAEP to wrap AES key
4. Encrypted blob stored in tipz.data column
5. Creator decrypts with private key from IndexedDB
6. TIPZ server never has access to plaintext
```

---

## Payment Layer

### NEAR Intents (1Click API)

Cross-chain swaps are handled by the [NEAR Intents 1Click API](https://docs.near-intents.org/). TIPZ never custodies funds.

**Supported tokens**: ETH, USDC (Ethereum/Polygon/Arbitrum/Optimism), USDT (Ethereum), SOL

**Flow**: User wallet → deposit address → NEAR market makers → ZEC shielded

**Key files**:
- `lib/near-intents.ts` — API wrapper (quote, execute, status)
- `lib/wallet.ts` — Wallet connection + transaction execution
- `hooks/useTipping.ts` — Tipping state machine
- `app/api/swap/` — Quote, execute, and status endpoints

---

## Auth

- **Twitter OAuth 2.0 PKCE** for creator login
- **JWT sessions** (HS256, httpOnly cookie, 7-day TTL)
- Session managed in `lib/session.ts`
- Identity derived from session, never from request params

---

## Security

| Area | Status |
|------|--------|
| Input validation | Regex for addresses, Zod for API inputs |
| SQL injection | Parameterized queries via Supabase |
| XSS | React escapes by default |
| Auth | Twitter OAuth 2.0 PKCE + JWT sessions |
| Encryption | RSA-OAEP 4096-bit + AES-GCM for tip data |
| Sensitive data | All tip amounts/memos in encrypted `data` blob only |

---

## Technology Choices

| Choice | Rationale |
|--------|-----------|
| **Next.js 16** | Full-stack, API routes, App Router, Vercel deployment |
| **Supabase** | PostgreSQL + Realtime WebSocket + generous free tier |
| **NEAR Intents** | Cross-chain swaps to ZEC without custodying funds |
| **Zcash shielded** | Encrypted sender/receiver/amount, proven privacy tech |
| **Web Crypto API** | Zero dependencies for E2E encryption |
