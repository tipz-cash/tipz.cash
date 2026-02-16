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

**Web Dashboard:**
- [x] Creator dashboard at /my (CommandHeader, StatsGrid, ActivityFeed, StampTools)
- [x] OAuth login with X (Twitter)
- [x] Real-time tip notifications (Supabase Realtime + polling fallback)
- [x] Client-side RSA-4096 encryption for tip decryption
- [x] Promotion tools (copy link, tweet, image stamp)
- [x] Toast notifications for incoming tips
- [x] Connection status indicator (live/connecting/offline)

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

#### Mesh Connect (Exchange Payments)
**Priority**: P1
**Status**: Not started

**Overview**: Add Mesh Connect as an alternative payment method. Allows users to tip directly from their Coinbase/Binance accounts without needing a wallet. This completes the "Universal Intake" story.

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

See: `docs/technical/near-intents-integration.md` for full Mesh implementation details.

#### Direct ZEC (Memo Field Support)
**Priority**: P1
**Status**: Not started

**Overview**: Allow tippers with Zcash wallets to send directly to creator's shielded address with encrypted memo field for messages.

Tasks:
- [ ] Add "Direct ZEC" payment option in TippingFlow
- [ ] Generate payment request with memo field instructions
- [ ] Display creator's shielded address with copy button
- [ ] Document memo field encryption format

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

## Phase 2: Private Messaging (The Monopoly Feature) 🔜 Next

**Goal**: Zero-Knowledge DMs on payments — "X cannot compete"

> **Strategic Note**: This is the 0→1 monopoly play. Per Zero to One analysis, private messaging is the only feature where "X cannot compete" is structurally true. X will never offer encrypted DMs on payments because it undermines their advertising model.

### RSA-OAEP Key Generation
**Priority**: P0 (Critical Path)
**Status**: Not started

Tasks:
- [ ] Generate RSA-OAEP key pair in extension on first link
- [ ] Store private key in `chrome.storage.local` (never transmits)
- [ ] Send public key to server on creator registration
- [ ] Update creators table schema to store public keys
- [ ] Add key rotation mechanism (future enhancement)

Technical approach:
- 4096-bit RSA-OAEP for key exchange (40+ year security margin)
- Hybrid encryption: AES-256-GCM (message) + RSA-OAEP (key)
- Password-protected private key storage (optional)
- ~50 lines of crypto code, no dependencies (`window.crypto.subtle`)

See `docs/engineering/private-messaging-spec.md` for full implementation.

### Blind Relay Endpoint
**Priority**: P0 (Critical Path)
**Status**: Not started

Tasks:
- [ ] Create `POST /api/messages/relay` endpoint
- [ ] Accept `[depositAddress, encryptedBlob, timestamp]`
- [ ] Push to creator via Supabase Realtime
- [ ] Log ONLY delivery timestamp (no content, no sender)
- [ ] Implement rate limiting (10 messages/minute per IP)

Architecture:
```
Tipper encrypts message with creator's public key
    ↓
POST /api/messages/relay { depositAddress, encryptedBlob }
    ↓
Server validates depositAddress exists
    ↓
Server pushes to creator's Realtime channel
    ↓
Server logs: { timestamp, delivered: true } (nothing else)
    ↓
Extension decrypts with local private key
```

Security guarantees:
- Server cannot read message content (RSA-OAEP encryption)
- Server cannot identify sender (no IP logging on message content)
- Server cannot correlate messages to tips (depositAddress is already public)

### Encrypted Notification UI
**Priority**: P1
**Status**: Not started

Tasks:
- [ ] Update extension notification format: `+$5 • [Message]` with lock icon
- [ ] Add message preview in popup (decrypted client-side)
- [ ] Handle messages without tips (future: paid DMs)
- [ ] Add "Messages" tab to extension popup

### Security Documentation
**Priority**: P1
**Status**: Not started

Tasks:
- [ ] Write "We cannot read your DMs" security documentation
- [ ] Create threat model document
- [ ] Document key recovery implications (lost key = lost messages)
- [ ] Add security FAQ to landing page

See: `docs/engineering/private-messaging-spec.md` for full technical specification.

---

## Phase 2.5: Antifragility (System Resilience)

**Goal**: Eliminate single points of failure, ensure system improves from stress

> **Strategic Note**: Per Taleb's Antifragile framework, TIPZ currently scores 3/10 on resilience. Core payment infrastructure depends on a single provider (NEAR Intents). A single outage = complete service failure. This phase addresses structural fragilities before they become trust-destroying incidents.

See full assessment: `docs/engineering/antifragility.md`

### Swap Provider Redundancy
**Priority**: P0 (Critical Path)
**Status**: Not started

**Problem**: NEAR Intents is the only swap provider. If NEAR is down, all tips fail.

Tasks:
- [ ] Create swap provider abstraction layer (`lib/swap-providers/`)
- [ ] Implement THORChain provider as backup
- [ ] Add circuit breaker pattern for automatic failover
- [ ] Test failover scenarios in staging

Technical approach:
```typescript
interface SwapProvider {
  name: string
  getQuote(params: QuoteParams): Promise<Quote>
  executeSwap(quote: Quote): Promise<SwapResult>
  getStatus(id: string): Promise<SwapStatus>
  isHealthy(): Promise<boolean>
}

class SwapProviderManager {
  providers: SwapProvider[] // Ordered by preference
  circuitBreaker: CircuitBreaker

  async executeWithFallback(params): Promise<SwapResult> {
    for (const provider of this.providers) {
      if (await this.circuitBreaker.isOpen(provider.name)) continue
      try {
        return await provider.executeSwap(params)
      } catch (e) {
        this.circuitBreaker.recordFailure(provider.name)
      }
    }
    throw new Error('All providers failed')
  }
}
```

### Honest Success Messaging
**Priority**: P0 (Critical Path)
**Status**: Not started

**Problem**: "Fire-and-forget" pattern shows success before ZEC is delivered. User closes page, swap fails silently, trust destroyed.

Tasks:
- [ ] Change `success` state to `processing_swap` until confirmed
- [ ] Add `pending_confirmation` UI state with clear messaging
- [ ] Implement email/push notification on actual completion
- [ ] Add pending tip tracking to user dashboard

UI States (Before → After):
```
BEFORE:
  Wallet confirms deposit → "Success! Tip sent"

AFTER:
  Wallet confirms deposit → "Processing... ZEC delivery in progress"
  NEAR confirms swap → "Success! ZEC delivered to creator"
```

### Local Persistence (IndexedDB)
**Priority**: P1
**Status**: Not started

**Problem**: All state in Supabase. If Supabase down, users can't see their tip history or resume pending tips.

Tasks:
- [ ] Create IndexedDB persistence layer (`lib/tip-persistence.ts`)
- [ ] Store pending tips locally with full state
- [ ] Sync with Supabase when online
- [ ] Resume incomplete tips on page reload
- [ ] Enable offline read access to tip history

Schema:
```typescript
interface LocalTipRecord {
  id: string
  depositAddress: string
  creatorHandle: string
  amount: string
  tokenSymbol: string
  status: 'pending' | 'processing' | 'confirmed' | 'failed'
  createdAt: number
  lastChecked: number
  remoteId?: string // Supabase ID when synced
}
```

### Circuit Breaker Implementation
**Priority**: P1
**Status**: Not started

**Problem**: No graceful degradation. API failures cascade to complete outage.

Tasks:
- [ ] Implement circuit breaker class (`lib/circuit-breaker.ts`)
- [ ] Track failure rates per provider (5-minute sliding window)
- [ ] Auto-open circuit after 3 failures in 60 seconds
- [ ] Half-open state for recovery testing
- [ ] Expose circuit state in `/api/health`

States:
```
CLOSED → (failures exceed threshold) → OPEN
OPEN → (timeout expires) → HALF-OPEN
HALF-OPEN → (success) → CLOSED
HALF-OPEN → (failure) → OPEN
```

### Chaos Testing
**Priority**: P2
**Status**: Not started

**Problem**: Can't verify resilience without controlled failure injection.

Tasks:
- [ ] Create staging environment with chaos flags
- [ ] Implement random API failure injection (10% rate)
- [ ] Test quote expiration mid-signing
- [ ] Test network partition scenarios
- [ ] Document chaos test playbook

---

## Phase 2.6: Stability (Bundled with Launch)

**Goal**: Production-ready reliability (ship alongside Phase 2)

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

## Phase 3: Growth Features (Post-Launch)

**Goal**: Features that drive adoption after core loop + private messaging are live

### Creator Dashboard ✅ COMPLETE
**Priority**: P2
**Status**: Shipped at /my

Completed:
- [x] Creator dashboard at tipz.cash/my
- [x] OAuth login via X (Twitter)
- [x] View tip history with encrypted memo decryption
- [x] Total earnings (animated ZEC counter)
- [x] Real-time activity feed with timeline layout
- [x] Promotion tools (copy link, tweet, image stamp)
- [x] Toast notifications
- [x] Connection status indicator
- [x] Image stamping tool (drag/drop, paste, download)

### Recurring Tips
**Priority**: P3
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

---

## Phase 4: Mobile (DEFERRED)

**Status**: DEFERRED until proven demand

> **Strategic Note**: Per Zero to One power law analysis, mobile is deferred to maintain concentration on the 0→1 monopoly feature (Private Messaging). Build mobile only when:
> 1. X privacy creators are saturated (extension/web)
> 2. Creators are explicitly pulling for mobile
> 3. Clear 10x mobile insight emerges (not just "convenience")

**Potential Features** (when demand proven):
- Mobile wallet for creators
- Push notifications for tips
- Auto-divestment (ZEC → stablecoin) - novel feature
- "Swiss Vault" / Relationship Manager

**Evaluation Criteria**:
- [ ] 50+ creator requests for mobile functionality
- [ ] Clear use case that can't be served by web/extension
- [ ] Identified 10x insight specific to mobile

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
| Private Messaging | Week 6 | Pending | RSA-OAEP + Blind Relay working |
| Genesis Launch | Week 8 | Pending | Ship to Genesis 50 with full feature set |
| Stable | Week 10 | Pending | No critical bugs in 48hr, error monitoring |
| Growth Ready | Week 14 | Pending | Creator analytics dashboard |
| Scale | Week 20 | Pending | 10K+ active creators |

### Pre-Launch Bundle

> **Decision**: Bundle Phase 1 + Phase 2 before public launch. Ship the complete 0→1 story.

```
Pre-Launch Build (Ship Together)
├── Phase 1: Core Loop
│   ├── NEAR Intents mainnet deployment
│   ├── Mesh Connect integration (Universal Intake)
│   ├── Watermark auto-stamp polish
│   └── Direct ZEC (memo field support)
│
├── Phase 2: Private Messaging
│   ├── RSA-OAEP key gen in extension
│   ├── Blind Relay endpoint
│   ├── Encrypted notification UI (+$5 • [Message])
│   └── Security documentation
│
└── Launch Assets
    ├── Landing page chapters ready
    ├── Zooko-style pill mockup
    └── "Zero-Knowledge DMs" marketing copy

Launch
├── Genesis 50 onboarding (privacy-affinity creators)
├── Zooko / Shielded Labs outreach with complete story
└── Public announcement with full feature set
```

**Rationale**: Launching without private messaging would position TIPZ as "another tipping app." Bundling both features ships the complete monopoly story: "Private payments + Zero-Knowledge DMs. X cannot compete."

---

## Decision Log

### Bundle Phase 1 + Phase 2 for Launch
**Date**: 2026-01-29
**Decision**: Ship Private Messaging alongside Core Loop, not after
**Rationale**: Per Zero to One analysis, partial launch = 1→n positioning. Complete story = monopoly positioning. "Private payments + Zero-Knowledge DMs. X cannot compete."
**Framework**: Zero to One: Monopoly

### Phase 2 Before Mobile
**Date**: 2026-01-29
**Decision**: Prioritize Private Messaging over mobile app development
**Rationale**: Private messaging is the 0→1 monopoly feature. Mobile is 1→n (many wallets exist). Power law thinking = concentrate resources on the feature that creates structural moat.
**Framework**: Zero to One: Power law concentration

### Defer Mobile Until Demand Proven
**Date**: 2026-01-29
**Decision**: No mobile development until explicit creator pull
**Rationale**: Avoid resource spread. Mobile is expensive. No clear 10x mobile insight yet. Extension/web serves current needs.
**Framework**: Zero to One: Definite optimism vs option-hoarding

### Genesis 50 = Privacy Affinity
**Date**: 2026-01-29
**Decision**: Select Genesis creators by privacy alignment, not volume
**Rationale**: Smaller but aligned > large but indifferent. Privacy-aligned creators become evangelists, not just users. Specific knowledge compounds.
**Framework**: Naval: Long-term games with long-term people

### Private Messaging = Free Tier
**Date**: 2026-01-29
**Decision**: Encrypted messages are free, not premium-gated
**Rationale**: This is the monopoly mechanic, not a revenue gate. Network effects compound when everyone can send private messages. Gate premium features that benefit from scale (analytics, badges).
**Framework**: Zero to One: Network effects

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

### Antifragility Assessment
**Date**: 2026-01-29
**Decision**: Prioritize system resilience before scale
**Rationale**: Per Taleb's Antifragile framework, TIPZ has critical single points of failure. A single NEAR Intents outage = complete service failure. "Fire-and-forget" success pattern risks silent failures that destroy trust. Trust loss compounds faster than trust gain.
**Framework**: Antifragile (Taleb) + Thinking in Systems (Meadows)
**Action**: Add Phase 2.5 (Antifragility) with swap provider redundancy, honest success messaging, and local persistence.
**Documentation**: `docs/engineering/antifragility.md`

### THORChain as Backup Provider
**Date**: 2026-01-29 (Planned)
**Decision**: Add THORChain as fallback when NEAR Intents unavailable
**Rationale**: Proven cross-chain infrastructure (~4 years, Lindy-tested), native ZEC support, decentralized
**Trade-offs**: Additional integration complexity, different fee structure, need to abstract provider interface

---

## Risks & Mitigations

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| **NEAR Intents single dependency** | **Critical** | THORChain backup provider, circuit breaker | Planned (Phase 2.5) |
| **Silent swap failures** | **Critical** | Honest success messaging, pending tip tracking | Planned (Phase 2.5) |
| **Supabase as SPOF** | High | IndexedDB local persistence layer | Planned (Phase 2.5) |
| NEAR Intents solver availability | High | Demo mode fallback, error handling | Implemented |
| Zcash network issues | High | Error handling, retry logic | Implemented |
| Twitter API rate limits | Medium | Caching, graceful degradation | Implemented |
| Quote expiry race condition | Medium | Auto-refresh quotes before execution | Planned |
| Extension store rejection | Medium | Follow guidelines, prepare appeals | Monitoring |
| Low adoption | Medium | Focus on community building | Ongoing |

See detailed fragility analysis: `docs/engineering/antifragility.md`

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
