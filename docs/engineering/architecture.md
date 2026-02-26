# TIPZ Architecture

System design and technical architecture documentation.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────┐         ┌───────────────────────┐        │
│   │     Creator      │         │       Tipper          │        │
│   │ (Web Dashboard   │         │    (Web Browser)      │        │
│   │  + Extension)    │         │  Tip Pages at         │        │
│   │  /my + Auto-Stamp│         │  tipz.cash/{handle}   │        │
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
│   │   │   Page     │  │  (4-step)  │  │  /{handle}  │   │      │
│   │   └────────────┘  └────────────┘  └─────────────┘   │      │
│   │                                                       │      │
│   │   ┌────────────┐  ┌────────────┐  ┌─────────────┐   │      │
│   │   │  Creators  │  │   Docs     │  │    API      │   │      │
│   │   │ Directory  │  │   Page     │  │   Routes    │   │      │
│   │   └────────────┘  └────────────┘  └──────┬──────┘   │      │
│   │                                           │          │      │
│   └───────────────────────────────────────────┼──────────┘      │
│                                               │                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │        TIPZ Extension (Plasmo/Chrome MV3)            │      │
│   │        ** Creator Tool - NOT Tipper Tool **          │      │
│   │                                                       │      │
│   │   ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │      │
│   │   │   Popup     │  │ Background  │  │  Content   │  │      │
│   │   │ Dashboard   │  │  (Realtime) │  │  Scripts   │  │      │
│   │   └─────────────┘  └─────────────┘  └────────────┘  │      │
│   │                                                       │      │
│   └──────────────────────────────────────────────────────┘      │
│                                                                  │
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
│   │   └─────────────────────────────────────────────┘    │      │
│   │                                                       │      │
│   │   ┌─────────────────────────────────────────────┐    │      │
│   │   │           transactions table                 │    │      │
│   │   │  id | creator_id | amount_zec | tx_hash     │    │      │
│   │   └─────────────────────────────────────────────┘    │      │
│   │                                                       │      │
│   │   ┌─────────────────────────────────────────────┐    │      │
│   │   │             Realtime (WebSocket)             │    │      │
│   │   │   Pushes tip notifications to dashboard +   │    │      │
│   │   │                  extension                   │    │      │
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
│   │  (any token) │    │  (routing)   │    │  Shielded    │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
│   [ETH/USDC/etc] ──▶ [/api/swap] ──▶ [NEAR] ──▶ [ZEC zs...]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Web Application

**Location**: `/tipz/web`
**Framework**: Next.js 16
**Runtime**: Node.js with App Router

#### Directory Structure
```
web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout + fonts
│   ├── globals.css           # Global styles + Tailwind
│   ├── register/page.tsx     # 4-step registration wizard
│   ├── creators/page.tsx     # Creator directory (paginated)
│   ├── manifesto/page.tsx    # Product manifesto
│   ├── docs/page.tsx         # Documentation
│   ├── [handle]/
│   │   ├── page.tsx          # Individual tip page
│   │   └── layout.tsx        # Tip page layout
│   ├── my/
│   │   ├── page.tsx             # Creator dashboard (command center)
│   │   ├── components/
│   │   │   ├── CommandHeader.tsx   # Handle, connection status, logout
│   │   │   ├── StatsGrid.tsx       # Tips/ZEC/USD stat cards
│   │   │   ├── StampTools.tsx      # Promote tile grid
│   │   │   ├── ImageStampTool.tsx  # Image watermarking tool
│   │   │   ├── ActivityFeed.tsx    # Timeline tip feed
│   │   │   ├── NotificationToast.tsx # Real-time tip toast
│   │   │   ├── LoginCard.tsx       # Pre-auth login card
│   │   │   └── ConnectionIndicator.tsx # Realtime status
│   │   └── hooks/
│   │       └── useRealtimeTips.ts  # Supabase Realtime + polling
│   └── api/
│       ├── health/route.ts   # Health check
│       ├── creator/route.ts  # Single creator lookup
│       ├── creators/route.ts # Paginated creator list
│       ├── creators/batch/route.ts # Batch lookup
│       ├── register/route.ts # Creator registration
│       ├── link/route.ts     # Re-link returning creators
│       ├── zec-price/route.ts # CoinGecko price feed
│       ├── swap/
│       │   ├── quote/route.ts  # Swap quotes
│       │   └── execute/route.ts # Swap execution
│       ├── intents/
│       │   └── create/route.ts # NEAR Intents
│       ├── auth/
│       │   ├── me/route.ts      # Session check
│       │   ├── twitter/route.ts # OAuth login
│       │   └── logout/route.ts  # Clear session
│       ├── tips/
│       │   ├── received/route.ts # Creator's received tips
│       │   ├── stats/route.ts    # Aggregated tip stats
│       │   └── latest/route.ts   # Most recent tip (polling)
│       └── og/[handle]/route.tsx # Dynamic OG images
├── components/
│   ├── tipping/             # Tipping flow components
│   │   ├── TippingFlow.tsx  # Multi-stage payment UI
│   │   ├── AmountSelector.tsx # Preset + custom amounts
│   │   ├── TokenSelector.tsx # Multi-token support
│   │   ├── WalletConnect.tsx # Web3 wallet integration
│   │   ├── MessageTrench.tsx # Private note input
│   │   ├── TipSummary.tsx   # Confirmation view
│   │   └── TransactionStatus.tsx # Processing/success states
│   ├── LetterGridBackground.tsx # Animated background
│   ├── CreatorCard.tsx      # Directory card component
│   └── TipzLogo.tsx         # Logo component
├── lib/
│   ├── supabase.ts          # Database client
│   ├── near.ts              # NEAR Intents integration
│   └── twitter-api.ts       # OAuth token verification + avatar fetching
└── public/
    └── logo.svg             # Static assets
```

#### Key Responsibilities
1. **Landing Page**: Marketing, product explanation, privacy manifesto
2. **Registration**: OAuth-first wizard (sign in with X + enter shielded address)
3. **Tip Pages**: Individual creator pages at `/{handle}` with TippingFlow component
4. **Creator Directory**: Paginated list of registered creators
5. **API Routes**: Creator CRUD, swap quotes, NEAR Intents, OG images
6. **Creator Dashboard**: Authenticated command center at `/my` with real-time tips, encrypted message decryption, and promotion tools

### Browser Extension

**Location**: `/tipz/extension`
**Framework**: Plasmo
**Target**: Chrome MV3

**IMPORTANT**: The extension **complements** the web dashboard at `/my` with auto-stamp on X and browser notifications. Tippers use the web app.

#### Directory Structure
```
extension/
├── popup.tsx                 # Creator dashboard UI
│                             # - Revenue stats (total ZEC, tip count, USD)
│                             # - Recent tips list
│                             # - Link to tip page
│                             # - Unlink option
├── background.ts             # Service worker
│                             # - Supabase Realtime subscription
│                             # - Browser notification handling
│                             # - Badge updates for unread tips
├── contents/
│   ├── x.tsx                 # X.com content script
│   │                         # - Auto-stamp toggle in compose box
│   │                         # - Injects tipz.cash/{handle} into tweets
│   └── tipz-interceptor.tsx  # Web bridge for identity linking
│                             # - Reads tipz_creator_identity from tipz.cash localStorage
│                             # - Syncs to chrome.storage.local
├── components/
│   └── AutoStampToggle.tsx   # UI component for auto-stamp button
├── lib/
│   ├── identity.ts           # Creator identity management
│   │                         # - getLinkedCreator()
│   │                         # - setLinkedCreator()
│   │                         # - clearLinkedCreator()
│   │                         # - onLinkedCreatorChange()
│   ├── realtime.ts           # Supabase Realtime client
│   │                         # - WebSocket subscription to tips table
│   │                         # - Polling fallback (30s interval)
│   ├── api.ts                # TIPZ API client
│   │                         # - getReceivedTips()
│   │                         # - getRevenueStats()
│   └── theme.ts              # Design tokens (colors, fonts)
└── assets/                   # Extension icons
```

#### Key Responsibilities
1. **Identity Linking**: Web bridge reads localStorage from tipz.cash and syncs to chrome.storage
2. **Auto-Stamp**: Detects X compose boxes and injects tip link when enabled
3. **Real-Time Notifications**: Subscribes to Supabase Realtime for instant tip alerts
4. **Revenue Dashboard**: Shows earnings, tip count, and recent tips in popup

### Database

**Provider**: Supabase (PostgreSQL)

#### Schema
```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,           -- 'x' or 'substack'
  handle TEXT NOT NULL,             -- Original handle (preserves case)
  handle_normalized TEXT NOT NULL,  -- Lowercase, no @ prefix
  shielded_address TEXT NOT NULL,   -- Zcash shielded (zs...)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX idx_creators_platform_handle ON creators(platform, handle_normalized);
```

---

## Data Flow

### Creator Registration (OAuth)

```
Step 1: OAuth Login
  - Creator signs in with X (Twitter OAuth 2.0 PKCE)
  - Server verifies token, extracts handle

Step 2: Wallet Setup
  - Creator enters Zcash unified address (u1...)
  - Client validates address format

Step 3: Confirmation
  - Server upserts to Supabase (platform, handle, handle_normalized, shielded_address)
  - Server sets localStorage `tipz_creator_identity` for extension bridge
  - Returns success with verification_status
```

### Extension Identity Linking (Web Bridge)

```
1. Creator visits tipz.cash after registration
2. tipz-interceptor.tsx content script loads on tipz.cash
3. Script reads `tipz_creator_identity` from localStorage
4. If valid identity found:
   - Stores in chrome.storage.local under `tipz_linked_creator`
   - Dispatches 'tipz-identity-linked' CustomEvent
5. popup.tsx calls getLinkedCreator() to display dashboard
6. background.ts subscribes to tips for linked handle
```

### Real-Time Tip Notifications

```
1. background.ts initializes on extension load
2. Gets linked creator identity from chrome.storage.local
3. If linked:
   - Calls subscribeToTips(handle, callback) from realtime.ts
   - realtime.ts attempts WebSocket connection to Supabase Realtime
   - Falls back to 30-second polling if WebSocket unavailable
4. On new tip:
   - Shows browser notification with amount/message
   - Increments badge count
   - Updates chrome.storage for popup to refresh
```

### Auto-Stamp Flow

```
1. Creator opens X.com compose box (tweet, reply, quote)
2. x.tsx content script detects compose toolbar via MutationObserver
3. If creator is linked:
   - Injects AutoStampToggle button into toolbar
4. When creator clicks stamp (or if auto-stamp enabled):
   - Inserts `tipz.cash/{handle}` at end of tweet text
   - Shows confirmation badge "TIPZ added"
```

### Tipping Flow (Web App)

```
1. Tipper visits tipz.cash/{handle}
2. Tip page loads with TippingFlow component
3. User selects amount (preset or custom USD)
4. User selects payment token (ETH, USDC, etc.)
5. Client calls POST /api/swap/quote
   - Server fetches real prices from CoinGecko
   - Returns: toAmount (ZEC), exchangeRate, fees, route
6. User connects wallet via WalletConnect/MetaMask
7. User confirms transaction
8. Client calls POST /api/swap/execute
   - In demo mode: simulates swap
   - In production: executes via connected wallet
9. Client calls POST /api/intents/create
   - Server creates NEAR Intent for cross-chain routing
   - Returns: intentId, status, estimatedCompletion
10. Transaction logged to Supabase (if configured)
11. Creator receives tip notification via Realtime
```

### Creator Re-Linking (Returning Creator)

```
1. Creator logs in via OAuth at tipz.cash/my
2. Server verifies Twitter token, looks up creator by handle
3. Client generates RSA key pair, uploads public key via POST /api/link
4. Returns success - client sets localStorage for extension bridge
5. Extension detects new identity on next visit
```

### Creator Dashboard Flow

```
1. Creator logs in at `/my` via OAuth (X/Twitter)
2. Server validates session via `/api/auth/me`
3. Client generates RSA-4096 key pair, stores private key in localStorage
4. Public key uploaded to server via `/api/link`
5. Dashboard fetches tips (`/api/tips/received`), stats (`/api/tips/stats`)
6. Supabase Realtime pushes new tips to client in real-time
7. Client decrypts tip data with local RSA private key
8. Toast notifications + activity feed update live
```

---

## API Design

### Design Principles

1. **Stateless**: No session management, each request is independent
2. **Simple**: Minimal endpoints, clear purpose
3. **Fast**: Normalized handles for O(1) lookup
4. **Permissive CORS**: Extension needs cross-origin access
5. **Demo Mode**: All payment APIs support demo/production toggle via NEAR_DEMO_MODE

### Endpoints Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/health | Health check with database/NEAR status |
| GET | /api/creator | Single creator lookup |
| GET | /api/creators | Paginated creator directory |
| POST | /api/creators/batch | Batch creator lookup (max 100) |
| POST | /api/register | Create/update registration |
| POST | /api/link | Re-link returning creator's extension |
| GET | /api/zec-price | Real-time ZEC price from CoinGecko |
| POST | /api/swap/quote | Get swap quote (any token → ZEC) |
| POST | /api/swap/execute | Execute token swap |
| POST | /api/intents/create | Create NEAR Intent for cross-chain routing |
| GET | /api/intents/create | Query NEAR Intent status |
| GET | /api/og/[handle] | Dynamic OG images for tip pages |

---

## Security Considerations

### Current State

| Area | Status | Notes |
|------|--------|-------|
| Input validation | ✅ | Regex for addresses, URL patterns |
| SQL injection | ✅ | Parameterized queries via Supabase |
| XSS | ✅ | React escapes by default |
| CSRF | ⚠️ | No state-changing GET routes |
| Rate limiting | ❌ | Not implemented |
| Auth | ❌ | No user authentication |
| OAuth verification | ✅ | Twitter OAuth 2.0 PKCE |

### Recommended Improvements

1. **Rate limiting**: Implement per-IP limits on /api/register
2. **Request signing**: Sign extension requests for authenticity
3. **Audit logging**: Log all registrations for review

---

## Scalability

### Current Capacity

- **Supabase free tier**: Suitable for MVP
- **Vercel edge**: Low-latency globally
- **Single table**: Simple, fast queries

### Scaling Path

**10K creators**:
- Current architecture handles fine
- Add caching for batch lookups

**100K creators**:
- Consider read replicas
- Add Redis cache layer
- Optimize batch queries

**1M+ creators**:
- Shard by platform
- Consider dedicated database
- CDN for static assets

---

## Technology Choices

### Why Next.js?
- Full-stack in one framework
- API routes for backend
- App Router for modern patterns
- Easy deployment to Vercel

### Why Plasmo?
- React-based extension development
- Built-in HMR for development
- Handles Chrome MV3 complexity
- Good TypeScript support

### Why Supabase?
- PostgreSQL with nice API
- Generous free tier
- Auth available if needed later
- Easy setup and management

### Why Zcash Shielded?
- Encrypted sender/receiver/amount
- Proven privacy technology
- Active development ecosystem
- Regulatory clarity (not delisted)

---

## Environment Variables

### Web App
```env
# Database (required)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Twitter API (optional - enables avatar fetching)
TWITTER_BEARER_TOKEN=your-bearer-token

# NEAR Intents (required for real payments)
NEAR_NETWORK=testnet                # or mainnet
NEAR_ACCOUNT_ID=tipz.testnet        # Your NEAR account
NEAR_PRIVATE_KEY=ed25519:...        # Your private key
NEAR_DEMO_MODE=true                 # Set to false for real payments
```

### Extension
```env
PLASMO_PUBLIC_API_URL=https://tipz.cash
PLASMO_PUBLIC_DEMO_MODE=true
PLASMO_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Supabase Realtime (optional - enables WebSocket notifications)
PLASMO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Development Setup

### Web App
```bash
cd tipz/web
npm install
cp .env.example .env.local  # Fill in Supabase credentials
npm run dev
```

### Extension
```bash
cd tipz/extension
npm install
cp .env.example .env.development  # Set API URL
npm run dev  # Opens Chrome with extension loaded
```

---

## Deployment

### Web App (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy from main branch
4. Custom domain: tipz.app

### Extension (Chrome Web Store)
1. Build production: `npm run build`
2. Zip `build/chrome-mv3-prod` directory
3. Upload to Chrome Developer Dashboard
4. Submit for review

---

## Current Architecture

### Payment Flow (Implemented)
```
Tipper (Web) → WalletConnect → /api/swap → NEAR Intents → Zcash Shielded
```

### Creator Notifications (Implemented)
```
Supabase Realtime → Dashboard Toast + Extension Background → Browser Notification
```

### Identity Bridge (Implemented)
```
tipz.cash localStorage → tipz-interceptor.tsx → chrome.storage → popup.tsx
```

## Future Architecture

### Phase 2: Multi-Platform Support
```
Extension → Platform Adapters → {YouTube, Twitch, GitHub, Farcaster}
```

### Phase 3: Recurring Tips
```
User → Subscription Setup → Background Job → Monthly Tips
```
