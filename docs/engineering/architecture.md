# TIPZ Architecture

System design and technical architecture documentation.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   Creator    │    │   Tipper     │    │   Tipper     │     │
│   │  (Browser)   │    │  (Browser)   │    │  (Extension) │     │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│          │                   │                   │              │
└──────────┼───────────────────┼───────────────────┼──────────────┘
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │              TIPZ Web App (Next.js 16)               │      │
│   │                                                       │      │
│   │   ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │      │
│   │   │  Landing    │  │  Register   │  │    API     │  │      │
│   │   │   Page      │  │    Form     │  │   Routes   │  │      │
│   │   └─────────────┘  └─────────────┘  └─────┬──────┘  │      │
│   │                                           │          │      │
│   └───────────────────────────────────────────┼──────────┘      │
│                                               │                  │
│   ┌──────────────────────────────────────────────────────┐      │
│   │           TIPZ Extension (Plasmo/Chrome MV3)         │      │
│   │                                                       │      │
│   │   ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │      │
│   │   │   Popup     │  │  Content    │  │    Tip     │  │      │
│   │   │    UI       │  │  Scripts    │  │   Modal    │  │      │
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
│   │   │                                              │    │      │
│   │   │  id | platform | handle | shielded_address  │    │      │
│   │   └─────────────────────────────────────────────┘    │      │
│   │                                                       │      │
│   └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PAYMENT LAYER (Planned)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   SwapKit    │───▶│ NEAR Intents │───▶│   Zcash      │     │
│   │    SDK       │    │              │    │  Shielded    │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
│   [Any Token] ────────▶ [Swap] ────────▶ [ZEC] ────────▶ [zs...]│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Web Application

**Location**: `/tipz/web`
**Framework**: Next.js 16.1.4
**Runtime**: Node.js with App Router

#### Directory Structure
```
web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── register/
│   │   └── page.tsx          # Registration form
│   └── api/
│       ├── creator/route.ts  # Single creator lookup
│       ├── register/route.ts # Creator registration
│       └── creators/
│           └── batch/route.ts # Batch creator lookup
├── lib/
│   └── supabase.ts           # Database client
└── public/
    └── logo.svg              # Static assets
```

#### Key Responsibilities
1. **Landing Page**: Marketing and product explanation
2. **Registration Form**: Creator onboarding
3. **API Routes**: CRUD operations for creators

### Browser Extension

**Location**: `/tipz/extension`
**Framework**: Plasmo 0.90.5
**Target**: Chrome MV3

#### Directory Structure
```
extension/
├── contents/
│   ├── x.tsx                 # X.com content script
│   └── substack.tsx          # Substack content script
├── components/
│   ├── TipButton.tsx         # Injected tip button
│   └── TipModal.tsx          # Tipping interface
├── lib/
│   └── api.ts                # API client
├── popup.tsx                 # Extension popup
└── assets/                   # Icons
```

#### Key Responsibilities
1. **Content Scripts**: Detect tweets/articles, inject UI
2. **TipButton**: Display registration status, trigger modal
3. **TipModal**: Amount selection, payment execution
4. **Popup**: Extension settings and status

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
  tweet_url TEXT NOT NULL,          -- Verification tweet
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX idx_creators_platform_handle ON creators(platform, handle_normalized);
```

---

## Data Flow

### Creator Registration

```
1. Creator visits /register
2. Fills form: platform, handle, shielded_address, tweet_url
3. Client submits to POST /api/register
4. Server validates:
   - Required fields present
   - Platform is 'x' or 'substack'
   - Shielded address format (zs + 76 chars)
   - Tweet URL format matches handle
5. Server upserts to Supabase
6. Returns success/error
```

### Creator Lookup (Single)

```
1. Extension detects tweet author handle
2. Calls GET /api/creator?platform=x&handle=username
3. Server normalizes handle (lowercase, strip @)
4. Queries Supabase by platform + handle_normalized
5. Returns { found: true/false, creator?: {...} }
6. Extension renders appropriate button
```

### Creator Lookup (Batch)

```
1. Extension collects visible tweet authors
2. Calls POST /api/creators/batch
   Body: { platform: 'x', handles: ['user1', 'user2', ...] }
3. Server normalizes all handles
4. Single Supabase query with IN clause
5. Returns { results: { handle: { found, creator? }, ... } }
6. Extension renders buttons for all visible tweets
```

### Tipping Flow (Planned)

```
1. User clicks "Tip" button
2. TipModal opens with creator info
3. User selects amount and token
4. SwapKit calculates swap (token → ZEC)
5. User confirms in wallet
6. Swap executes via NEAR Intents
7. ZEC sent to creator's shielded address
8. Success confirmation displayed
```

---

## API Design

### Design Principles

1. **Stateless**: No session management, each request is independent
2. **Simple**: Minimal endpoints, clear purpose
3. **Fast**: Normalized handles for O(1) lookup
4. **Permissive CORS**: Extension needs cross-origin access

### Endpoints Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/creator | Single creator lookup |
| POST | /api/register | Create/update registration |
| POST | /api/creators/batch | Batch creator lookup |

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
| Tweet verification | ⚠️ | URL-only, no content check |

### Recommended Improvements

1. **Rate limiting**: Implement per-IP limits on /api/register
2. **Twitter API verification**: Actually fetch and verify tweet content
3. **Request signing**: Sign extension requests for authenticity
4. **Audit logging**: Log all registrations for review

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
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Extension
```env
PLASMO_PUBLIC_API_URL=https://tipz.app
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

## Future Architecture

### Phase 2: Payment Integration
```
Extension → SwapKit SDK → Token Swap → NEAR Intents → Zcash Shielded
```

### Phase 3: Analytics
```
tipz.app/dashboard → Analytics API → Supabase (anonymized)
```

### Phase 4: Multi-Platform
```
Extension → Platform Adapters → {X, Substack, YouTube, Twitch, ...}
```
