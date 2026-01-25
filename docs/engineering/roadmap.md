# TIPZ Engineering Roadmap

Feature priorities and technical milestones.

---

## Current State (v0.1 - MVP)

### Completed
- [x] Landing page with responsive design
- [x] Creator registration form
- [x] Single creator lookup API
- [x] Batch creator lookup API
- [x] Supabase database integration
- [x] Chrome extension structure (Plasmo)
- [x] X.com content script
- [x] Substack content script
- [x] Tip button injection
- [x] Tip modal UI

### Known Gaps
- [x] Payment integration (SwapKit/NEAR Intents) - NEAR SDK integrated
- [ ] Real Twitter API verification
- [x] Wallet connection - Extension wallet bridge implemented
- [x] Transaction execution - API endpoints ready (demo mode by default)
- [ ] Rate limiting
- [ ] Error monitoring

---

## Phase 1: Launch Ready (Week 1)

**Goal**: Functional end-to-end tipping flow

### P0: Critical Path

#### Payment Integration
**Priority**: P0
**Owner**: Extension Engineer
**Effort**: Large

Tasks:
- [x] Integrate SwapKit SDK - Using NEAR Intents instead
- [x] Implement token selection UI - Extension TipModal complete
- [x] Add wallet connection (MetaMask, WalletConnect) - Wallet bridge implemented
- [x] Build transaction confirmation flow - Multi-step UI in TipModal
- [x] Handle swap execution - /api/swap/execute endpoint ready
- [x] Add success/error states - Full state machine in extension

Technical notes:
- NEAR Intents SDK integrated (near-api-js)
- Demo mode for testing (NEAR_DEMO_MODE=true)
- Production mode with NEAR_ACCOUNT_ID + NEAR_PRIVATE_KEY
- Final destination: Zcash shielded pool via NEAR routing

#### Twitter API Verification
**Priority**: P0
**Owner**: Backend Engineer
**Effort**: Medium

Tasks:
- [ ] Set up Twitter API credentials
- [ ] Implement tweet fetch
- [ ] Verify tweet content contains:
  - Reference to TIPZ
  - The shielded address
  - Posted by claimed handle
- [ ] Handle API rate limits
- [ ] Cache verified tweets

Technical notes:
- Twitter API v2 for tweet lookup
- Store verification timestamp
- Re-verify on address change

### P1: Important

#### Rate Limiting
**Priority**: P1
**Owner**: Backend Engineer
**Effort**: Small

Tasks:
- [ ] Add per-IP rate limits to /api/register
- [ ] Implement sliding window algorithm
- [ ] Return 429 with retry-after header
- [ ] Log rate limit events

Limits:
- Registration: 10/hour per IP
- Lookup: 100/minute per IP

#### Extension UI Polish
**Priority**: P1
**Owner**: Design + Extension
**Effort**: Medium

Tasks:
- [ ] Update popup.tsx design to match web
- [ ] Add loading states to buttons
- [ ] Improve modal animations
- [ ] Add transaction status indicators

---

## Phase 2: Stability (Week 2-3)

**Goal**: Production-ready reliability

### Error Monitoring
**Priority**: P1
**Owner**: Backend Engineer
**Effort**: Medium

Tasks:
- [ ] Integrate Sentry (or similar)
- [ ] Add error boundaries in React
- [ ] Log API errors with context
- [ ] Set up alerting

### Transaction Logging
**Priority**: P1
**Owner**: Backend Engineer
**Effort**: Medium

Tasks:
- [ ] Design transactions table
- [ ] Log tip initiations
- [ ] Track completion status
- [ ] Build admin query interface

Schema:
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES creators(id),
  tipper_address TEXT,  -- hashed for privacy
  amount_zec DECIMAL,
  source_token TEXT,
  status TEXT,  -- pending, completed, failed
  tx_hash TEXT,
  created_at TIMESTAMPTZ
);
```

### Health Check Endpoint
**Priority**: P2
**Owner**: Backend Engineer
**Effort**: Small

Tasks:
- [ ] Create GET /api/health
- [ ] Check database connectivity
- [ ] Return service status
- [ ] Set up uptime monitoring

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
**Priority**: P3
**Owner**: Extension Engineer
**Effort**: Medium per platform

Candidates:
- YouTube (comment sections)
- Twitch (stream overlay?)
- GitHub (sponsor alternative)
- Farcaster (Web3 native)

Technical:
- Platform adapter pattern
- Shared modal/button components
- Platform-specific content scripts

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

| Milestone | Target | Criteria |
|-----------|--------|----------|
| MVP Launch | Week 1 | Tip flow works end-to-end |
| Stable | Week 3 | No critical bugs in 48hr |
| Growth Ready | Week 6 | Dashboard + recurring tips |
| Scale | Week 12 | 10K+ active creators |

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
