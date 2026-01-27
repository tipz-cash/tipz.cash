# TIPZ Engineering Roadmap

Feature priorities and technical milestones.

---

## Current State (v1.0 - MVP Complete)

### Completed ✅

**Web App:**
- [x] Landing page with responsive design + animations
- [x] 4-step creator registration wizard
- [x] Creator directory with pagination
- [x] Individual tip pages at `/{handle}`
- [x] TippingFlow component (AmountSelector, TokenSelector, WalletConnect, etc.)
- [x] Dynamic OG images for social sharing
- [x] Manifesto page
- [x] Documentation page

**API:**
- [x] Single creator lookup (`GET /api/creator`)
- [x] Paginated creator list (`GET /api/creators`)
- [x] Batch creator lookup (`POST /api/creators/batch`)
- [x] Creator registration (`POST /api/register`)
- [x] Creator re-linking (`POST /api/link`)
- [x] Health check (`GET /api/health`)
- [x] ZEC price feed (`GET /api/zec-price`)
- [x] Swap quotes (`POST /api/swap/quote`)
- [x] Swap execution (`POST /api/swap/execute`)
- [x] NEAR Intents (`POST /api/intents/create`, `GET /api/intents/create`)

**Extension (Creator Tool):**
- [x] Creator dashboard popup (revenue stats, recent tips)
- [x] Web bridge for identity linking (tipz-interceptor.tsx)
- [x] Auto-stamp for X compose boxes (x.tsx)
- [x] Real-time tip notifications (Supabase Realtime)
- [x] Polling fallback for notifications
- [x] Badge count for unread tips

**Database:**
- [x] Supabase integration
- [x] Creators table with normalized handles
- [x] Transactions table
- [x] Realtime subscriptions

**Payments:**
- [x] NEAR Intents SDK integration
- [x] Demo mode for testing
- [x] Real CoinGecko price quotes

### Known Gaps
- [ ] Real Twitter API verification (URL-only validation currently)
- [ ] Rate limiting on all endpoints
- [ ] Error monitoring (Sentry)
- [ ] Production NEAR deployment (testnet ready)

---

## Phase 1: Launch Ready ✅ COMPLETE

**Goal**: Functional end-to-end tipping flow

### P0: Critical Path ✅

#### Payment Integration ✅
**Status**: Complete

Completed:
- [x] NEAR Intents SDK integration (near-api-js)
- [x] Token selection UI in web TippingFlow component
- [x] Wallet connection (WalletConnect, MetaMask via web)
- [x] Transaction confirmation flow with TipSummary
- [x] Swap execution endpoints (/api/swap/quote, /api/swap/execute)
- [x] Success/error states with TransactionStatus component

Technical notes:
- Demo mode toggle via NEAR_DEMO_MODE env var
- Production mode requires NEAR_ACCOUNT_ID + NEAR_PRIVATE_KEY
- Real prices from CoinGecko, simulated execution in demo mode

#### Twitter API Verification 🔄 Partial
**Status**: URL validation only (Twitter API optional)

Completed:
- [x] Tweet URL format validation
- [x] Handle matching in URL
- [x] lib/twitter-api.ts ready for API integration

Remaining:
- [ ] Set up Twitter API credentials (developer account)
- [ ] Enable actual tweet content verification
- [ ] Handle API rate limits
- [ ] Cache verified tweets

### P1: Important

#### Rate Limiting ✅
**Status**: Implemented on /api/register

Completed:
- [x] In-memory sliding window rate limiter
- [x] 10 requests/hour per IP on registration
- [x] 429 response with Retry-After header
- [x] Rate limit headers in responses

Remaining:
- [ ] Rate limiting on lookup endpoints
- [ ] Redis/Upstash for distributed limiting

#### Extension UI Polish ✅
**Status**: Complete

Completed:
- [x] Creator dashboard popup matches web design
- [x] Loading states with skeletons
- [x] Real-time stats (total ZEC, tip count, USD)
- [x] Recent tips list with timestamps
- [x] Glassmorphism design system
- [x] Status pulse animations

---

## Phase 2: Stability 🔄 In Progress

**Goal**: Production-ready reliability

### Error Monitoring
**Priority**: P1
**Status**: Not started

Tasks:
- [ ] Integrate Sentry (or similar)
- [ ] Add error boundaries in React
- [ ] Log API errors with context
- [ ] Set up alerting (PagerDuty/Slack)

### Transaction Logging ✅
**Priority**: P1
**Status**: Schema ready, logging implemented

Completed:
- [x] Transactions table in Supabase
- [x] Schema includes: id, creator_id, amount_zec, amount_usd, tx_hash, status, source_platform
- [x] Realtime subscriptions for tip notifications

Schema (current):
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

Remaining:
- [ ] Admin query interface
- [ ] Analytics dashboard for creators

### Health Check Endpoint ✅
**Priority**: P2
**Status**: Complete

Completed:
- [x] GET /api/health endpoint
- [x] Database connectivity check
- [x] NEAR configuration status
- [x] Demo/production mode indicator
- [x] Version and timestamp in response

---

## Phase 3: Growth Features (Week 4+)

**Goal**: Features that drive adoption

### Creator Dashboard
**Priority**: P2
**Owner**: Full Stack
**Effort**: Large

Features:
- View tip history (anonymized)
- Total earnings
- Share registration link
- Update shielded address

Technical:
- New /dashboard route
- Auth via wallet signature
- Aggregated analytics only

### Recurring Tips
**Priority**: P2
**Owner**: Full Stack
**Effort**: Large

Features:
- Set up monthly tips
- Manage subscriptions
- Cancel/pause

Technical:
- Background job system
- Subscription management
- Wallet authorization

### Additional Platforms
**Priority**: P4 (Deferred)
**Owner**: Extension Engineer
**Effort**: Medium per platform
**Status**: ON HOLD - See strategic note below

> **Strategic Note**: Per Zero to One analysis, TIPZ focuses exclusively on X until market saturation. Multi-platform expansion only when:
> 1. X privacy creators are saturated (they all know TIPZ)
> 2. Creators are *pulling* us to new platforms
> 3. New platform shares same "privacy pain" secret
>
> See `docs/strategy/platform-focus-analysis.md` for full rationale.

**Future Expansion Order** (when criteria met):
1. Farcaster - Web3 native, similar ethos
2. Nostr - decentralized, privacy-aligned
3. YouTube/Twitch - only if privacy becomes mainstream creator concern

**DO NOT BUILD** for v1:
- YouTube integration
- Twitch overlays/chat bots
- Generic "creator" positioning
- Multi-platform dashboard analytics

### Mesh Connect (Exchange Payments)
**Priority**: P2
**Owner**: Full Stack
**Effort**: Medium

**Overview**: Add Mesh Connect as an alternative payment method. Allows users to tip directly from their Coinbase/Binance accounts without needing a wallet.

**Flow (non-custodial):**
```
User clicks "Pay with Exchange"
    ↓
Backend gets NEAR Intents quote → deposit address
    ↓
Backend creates Mesh linkToken with toAddress = deposit address
    ↓
Frontend opens Mesh modal
    ↓
User logs into Coinbase, confirms payment
    ↓
Mesh sends USDC directly to NEAR Intents deposit address
    ↓
NEAR Intents automatically processes swap
    ↓
ZEC delivered to creator's shielded address
```

**Architecture Decision**: Two payment paths, same NEAR Intents destination:
1. **Wallet Connect (existing):** User connects wallet → sends to NEAR Intents deposit address → ZEC to creator
2. **Mesh (new):** User logs into exchange → Mesh sends to NEAR Intents deposit address → ZEC to creator

**TIPZ never custodies funds.** Both paths route through NEAR Intents deposit addresses. We're just orchestrating the connection between Mesh and NEAR Intents.

**Files to Create/Modify:**
| File | Action | Purpose |
|------|--------|---------|
| `web/.env.example` | Modify | Add `MESH_CLIENT_ID`, `MESH_CLIENT_SECRET`, `NEXT_PUBLIC_MESH_CLIENT_ID` |
| `web/app/api/mesh/link-token/route.ts` | Create | Generate Mesh linkToken + NEAR Intents quote |
| `web/lib/mesh.ts` | Create | Mesh API client utilities |
| `web/components/tipping/TippingFlow.tsx` | Modify | Add Mesh payment option |
| `web/components/tipping/MeshPayButton.tsx` | Create | Mesh payment button + modal trigger |

**Prerequisites:**
1. Sign up at dashboard.meshconnect.com, get sandbox API keys
2. Verify Mesh supports Polygon USDC transfers and get exact `networkId` value
3. Contact Mesh sales to understand production costs

**Edge Cases:**
- Quote expiry: NEAR Intents quotes expire in ~10 minutes. If user takes too long in Mesh modal, show error and prompt to retry
- Mesh transfer fails: Funds stay in user's exchange - show error message
- NEAR Intents swap fails: Funds refund to the `refundTo` address
- Network mismatch: Ensure Mesh `networkId` matches the chain NEAR Intents deposit address is on

See: `docs/technical/near-intents-integration.md` for full technical implementation details.

---

## Technical Debt

### Code Quality
- [ ] Add ESLint configuration
- [ ] Add Prettier configuration
- [ ] Set up pre-commit hooks
- [ ] Increase TypeScript strictness

### Testing
- [ ] Unit tests for API routes
- [ ] Integration tests for registration flow
- [ ] E2E tests for extension
- [ ] Load testing

### Documentation
- [ ] Code comments for complex logic
- [ ] Developer setup guide
- [ ] Contributing guidelines
- [ ] Architecture decision records (ADRs)

---

## Milestones

| Milestone | Target | Status | Criteria |
|-----------|--------|--------|----------|
| MVP Launch | Week 1 | ✅ Complete | Tip flow works end-to-end (demo mode) |
| Testnet Ready | Week 2 | ✅ Complete | NEAR testnet integration working |
| Mainnet Ready | Week 4 | 🔄 In Progress | Production NEAR + Twitter API |
| Stable | Week 6 | Pending | No critical bugs in 48hr, error monitoring |
| Growth Ready | Week 10 | Pending | Creator analytics dashboard |
| Scale | Week 16 | Pending | 10K+ active creators |

---

## Decision Log

### Why Plasmo for Extension?
**Date**: Project start
**Decision**: Use Plasmo over raw Chrome APIs
**Rationale**: React support, TypeScript, faster development
**Trade-offs**: Slightly larger bundle, framework dependency

### Why Supabase?
**Date**: Project start
**Decision**: Use Supabase over custom PostgreSQL
**Rationale**: Faster setup, built-in auth if needed, generous free tier
**Trade-offs**: Vendor lock-in, less control

### Why NEAR Intents?
**Date**: 2025-01-23
**Decision**: Use NEAR Intents for cross-chain swaps (replacing SwapKit)
**Rationale**: Better cross-chain privacy routing, direct Zcash shielded support, decentralized solver network
**Trade-offs**: Dependency on NEAR network, requires NEAR account for API signing

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| NEAR Intents solver availability | High | Demo mode fallback, error handling |
| Zcash network issues | High | Error handling, retry logic |
| Twitter API rate limits | Medium | Caching, graceful degradation |
| Extension store rejection | Medium | Follow guidelines, prepare appeals |
| Low adoption | Medium | Focus on community building |

---

## Success Metrics

### Week 1
- [ ] 100+ creator registrations
- [ ] 100+ tips sent
- [ ] < 1% error rate

### Week 4
- [ ] 500+ creator registrations
- [ ] 1000+ tips sent
- [ ] 99.5% uptime

### Week 12
- [ ] 5000+ creator registrations
- [ ] 10000+ tips sent
- [ ] 1+ ecosystem partnership

---

## Team Responsibilities

| Area | Primary | Backup |
|------|---------|--------|
| Web App | Full Stack | - |
| Extension | Extension Eng | Full Stack |
| API | Backend Eng | Full Stack |
| Database | Backend Eng | - |
| DevOps | TBD | - |
| Design | Design Lead | - |
