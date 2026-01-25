# TIPZ Master Task List

> Central coordination document for all launch workstreams.
> Filter by owner to see your tasks. Check dependencies before starting.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Complete |
| `[!]` | Blocked |
| **P0** | Critical path - blocks launch |
| **P1** | Important - needed for Week 1 |
| **P2** | Nice to have - can defer |

**Owners:** `@founder` `@engineer` `@growth` `@bd` `@writer`

---

## Phase 0: Demo Ready (NOW)

Must complete before team delegation.

| Task | Owner | Priority | Status | Dependencies |
|------|-------|----------|--------|--------------|
| Verify demo mode works end-to-end | @founder | P0 | [ ] | - |
| Document all repos/access | @founder | P0 | [ ] | - |
| Identify 2-3 potential team members | @founder | P0 | [ ] | - |
| Share demo with potential team | @founder | P0 | [ ] | Demo works |
| Assign workstream owners | @founder | P0 | [ ] | Team identified |
| Create shared task tracker | @founder | P1 | [ ] | Team assigned |

---

## Track T: Technical / Payment Flow

**Owner:** @engineer
**Goal:** Real $1 tip executes end-to-end on mainnet
**Critical Path:** This track blocks production launch

### T.1 Infrastructure Setup (Week 1, Days 1-2)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Create Supabase project | P0 | [ ] | - | https://supabase.com |
| Run database migrations | P0 | [ ] | Supabase project | `creators` + `transactions` tables |
| Set SUPABASE_URL env var | P0 | [ ] | Supabase project | |
| Set SUPABASE_SERVICE_KEY env var | P0 | [ ] | Supabase project | |
| Verify `/api/health` returns "database: connected" | P0 | [ ] | All above | |

### T.2 NEAR Testnet Integration (Week 1, Days 2-4)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Create NEAR testnet account | P0 | [ ] | - | wallet.testnet.near.org |
| Export private key from wallet settings | P0 | [ ] | NEAR account | |
| Fund account with test NEAR | P0 | [ ] | NEAR account | https://near-faucet.io |
| Set `NEAR_NETWORK=testnet` | P0 | [ ] | NEAR account | |
| Set `NEAR_ACCOUNT_ID=<account>.testnet` | P0 | [ ] | NEAR account | |
| Set `NEAR_PRIVATE_KEY=ed25519:...` | P0 | [ ] | Private key | |
| Set `NEAR_DEMO_MODE=false` | P0 | [ ] | All above | |
| Test: Create test creator registration | P0 | [ ] | All above | |
| Test: Execute test tip ($1) | P0 | [ ] | Test creator | |
| Test: Verify intent created on NEAR testnet | P0 | [ ] | Test tip | |
| Test: Confirm ZEC arrives at shielded address | P0 | [ ] | Intent created | 5-10 min wait |
| Test: Check transactions table populated | P0 | [ ] | Tip complete | |

### T.3 NEAR Mainnet Migration (Week 1, Days 5-6)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Create NEAR mainnet account | P0 | [ ] | Testnet works | wallet.near.org |
| Fund with ~1 NEAR for gas | P0 | [ ] | Mainnet account | ~$3-5 |
| Update `NEAR_NETWORK=mainnet` | P0 | [ ] | Funded account | |
| Update `NEAR_ACCOUNT_ID=<account>.near` | P0 | [ ] | Mainnet account | |
| Update `NEAR_PRIVATE_KEY` | P0 | [ ] | Mainnet account | |
| Test: Small real tip ($1-5) | P0 | [ ] | All above | Use trusted creator |
| Monitor: Transaction completes end-to-end | P0 | [ ] | Test tip | |

### T.4 Twitter API (Optional)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Apply at developer.twitter.com | P2 | [ ] | - | |
| Request tweet.read, users.read scopes | P2 | [ ] | Application | |
| Set TWITTER_BEARER_TOKEN | P2 | [ ] | Approved | |
| Test: Register creator, verify auto-verified | P2 | [ ] | Token set | |

**Alternative:** Manual verification for first 50 creators (skip Twitter API)

### T.5 Creator Command Center Extension (Week 1, Day 7)

The extension is for CREATORS, not tippers.
- **Auto-QR**: Stamps creator content with tip QR codes
- **Instant Alerts**: Notifications when tips received
- **Revenue Analytics**: Tip income dashboard

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Set `PLASMO_PUBLIC_API_URL` to production | P0 | [ ] | Production URL | |
| Set `PLASMO_PUBLIC_DEMO_MODE=false` | P0 | [ ] | Mainnet works | |
| Build extension: `npm run build` | P0 | [ ] | Env vars set | |
| Test: QR auto-injected on creator content | P0 | [ ] | Build complete | |
| Test: Tip notifications appear | P1 | [ ] | Build complete | |
| Test: Analytics dashboard shows history | P1 | [ ] | Build complete | |
| Package: `npm run package` | P0 | [ ] | Tests pass | |

### T.6 Chrome Web Store Submission (Week 2)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Prepare screenshots (Auto-QR, Alerts, Analytics) | P0 | [ ] | Extension works | 5 screenshots |
| Update store description for creators | P0 | [ ] | - | NOT tippers |
| Submit for review | P0 | [ ] | Package ready | |
| Respond to any review feedback | P1 | [ ] | Submitted | |

### T.7 Production Monitoring (Week 2)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Set up error monitoring (Sentry) | P1 | [ ] | Production live | |
| Configure uptime monitoring on `/api/health` | P1 | [ ] | Health endpoint | |
| Set up alerts for transaction failures | P1 | [ ] | Monitoring up | |
| Document rollback procedure | P1 | [ ] | - | Set NEAR_DEMO_MODE=true |

---

## Track A: Grants & Funding

**Owner:** @writer (research) + @founder (pitch)
**Goal:** 2+ grant applications submitted by Week 3

### A.1 Research Phase (Week 1)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Research Zcash Foundation grant programs | P1 | [ ] | - | |
| Research NEAR ecosystem grants | P1 | [ ] | - | |
| Determine realistic ask amounts | P1 | [ ] | Research done | |
| Create `/tipz/docs/grants/grant-research.md` | P1 | [ ] | Research done | |

### A.2 Zcash Foundation Grant (Week 2-3)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Draft proposal outline | P1 | [ ] | Research complete | |
| Gather Week 1 traction metrics | P1 | [ ] | Launch complete | 100+ creators target |
| Write full proposal | P1 | [ ] | Metrics gathered | |
| Create `/tipz/docs/grants/zcash-foundation-proposal.md` | P1 | [ ] | Draft complete | |
| Submit application | P1 | [ ] | Proposal complete | |
| Follow up on feedback | P2 | [ ] | Submitted | |

### A.3 NEAR Ecosystem Grant (Week 2-3)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Draft proposal outline | P1 | [ ] | Research complete | |
| Write full proposal | P1 | [ ] | Outline done | Focus: Intents use case |
| Create `/tipz/docs/grants/near-ecosystem-proposal.md` | P1 | [ ] | Draft complete | |
| Submit application | P1 | [ ] | Proposal complete | |
| Follow up on feedback | P2 | [ ] | Submitted | |

---

## Track B: Wallet Partnerships

**Owner:** @bd + @founder
**Goal:** 1+ wallet partnership confirmed by Week 4
**PREREQUISITE:** Community presence established first (see Track D)

### B.0 Build Credibility First (Week 1)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Join Zcash Discord | P0 | [ ] | - | |
| Engage authentically for 1-2 weeks | P0 | [ ] | Joined | |
| Get 50+ creators registered | P0 | [ ] | Launch | Proof of traction |
| Get positive forum reception | P0 | [ ] | Forum post (D.2) | Before outreach |

### B.1 cashZ Partnership (Week 2+)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Review Josh Swihart DM template | P0 | [ ] | - | `/tipz/docs/gtm/outreach-ready/josh-dm.md` |
| Customize DM with your DeFi expertise | P0 | [ ] | Template reviewed | |
| Send DM to Josh Swihart | P0 | [ ] | Forum positive, 50+ creators | Builder-to-builder |
| Schedule partnership call | P1 | [ ] | DM response | |
| Discuss integration possibilities | P1 | [ ] | Call scheduled | |
| Negotiate terms | P2 | [ ] | Discussion | |

### B.2 Zashi Integration (Week 2+)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Review existing proposal | P0 | [ ] | - | `/tipz/docs/gtm/proposals/zashi-integration.md` |
| Update with current metrics | P0 | [ ] | Launch metrics | |
| Identify Zcash Foundation contact channel | P0 | [ ] | - | |
| Submit proposal | P0 | [ ] | Forum positive | |
| Follow up on response | P1 | [ ] | Submitted | |
| Schedule integration discussion | P2 | [ ] | Response received | |

---

## Track D: Creator Outreach

**Owner:** @growth + @founder
**Goal:** 100+ creators by Week 1, 500+ by Week 4

### D.1 Seed Creators (Week 0-1)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Identify 10 privacy-conscious creators | P0 | [ ] | - | Zcash users preferred |
| Create `/tipz/docs/outreach/seed-creator-list.md` | P0 | [ ] | List identified | |
| Prepare personalized outreach templates | P0 | [ ] | - | |
| Begin seed creator DMs | P0 | [ ] | Templates ready | |
| Walk seed creators through demo | P0 | [ ] | DM responses | |
| Get first 5 creators registered | P0 | [ ] | Demo calls | |

### D.2 Community Launch (Week 1) - CRITICAL FOR CREDIBILITY

This step unlocks wallet partnership outreach (Track B).

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Day 1: Post in Zcash Discord | P0 | [ ] | - | #general or #projects |
| Day 2: Post Zcash Forum intro | P0 | [ ] | Discord post | `/tipz/docs/gtm/community/forum-intro.md` |
| Day 3: Post in Reddit r/zcash | P0 | [ ] | Forum post | |
| Submit to ZecHub | P1 | [ ] | Forum post | |
| Engage with all responses | P0 | [ ] | Posts live | Don't be promotional |
| Monitor sentiment (positive/negative) | P0 | [ ] | Posts live | |

**Success signal:** Positive forum reception → proceed with wallet outreach (B.1, B.2)

### D.3 KOL Outreach (Week 1-2)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Review KOL outreach doc | P1 | [ ] | - | `/tipz/docs/gtm/kol-outreach.md` |
| Prioritize targets (@0xMert_, @zcash_community) | P1 | [ ] | Review complete | |
| Customize DMs with DeFi expertise angle | P1 | [ ] | Targets prioritized | |
| Send first batch of KOL DMs | P1 | [ ] | DMs ready | |
| Track response rates | P2 | [ ] | DMs sent | |
| Schedule calls with interested KOLs | P2 | [ ] | Responses | |

### D.4 Scale to 100+ (Week 1-2)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Hit 50 creator target | P0 | [ ] | Community launch | Week 1 mid |
| Hit 100 creator target | P0 | [ ] | 50 reached | Week 1 end |
| Collect user feedback | P1 | [ ] | 50+ creators | |
| Iterate based on feedback | P1 | [ ] | Feedback collected | |

### D.5 Scale to 500+ (Week 3-4)

| Task | Priority | Status | Dependencies | Notes |
|------|----------|--------|--------------|-------|
| Hit 250 creator target | P1 | [ ] | 100 reached | Week 3 |
| Hit 500 creator target | P1 | [ ] | 250 reached | Week 4 |
| Create feature content | P2 | [ ] | 100+ creators | Success stories |
| Launch referral incentives | P2 | [ ] | 250+ creators | Optional |

---

## Weekly Milestones

### Week 1
- [ ] NEAR testnet integration working (@engineer)
- [ ] First real mainnet tip executes (@engineer)
- [ ] `/api/health` shows all "configured" (@engineer)
- [ ] Zcash Forum post live (@growth)
- [ ] 100+ creator registrations (@growth)
- [ ] 1+ grant application drafted (@writer)

### Week 2
- [ ] Chrome Web Store submission (@engineer)
- [ ] Production monitoring active (@engineer)
- [ ] Josh Swihart DM sent (@bd)
- [ ] Zashi proposal submitted (@bd)
- [ ] ZF grant proposal drafted (@writer)

### Week 3
- [ ] 99%+ transaction success rate (@engineer)
- [ ] ZF grant submitted (@writer)
- [ ] NEAR grant submitted (@writer)
- [ ] 1+ wallet partnership response (@bd)
- [ ] 100+ creators confirmed (@growth)

### Week 4
- [ ] Extension approved in Chrome Store (@engineer)
- [ ] 1+ wallet partnership confirmed (@bd)
- [ ] 500+ creator registrations (@growth)
- [ ] 1000+ tips sent (all)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `/tipz/MVP-LAUNCH-CHECKLIST.md` | Technical deployment guide |
| `/tipz/docs/engineering/roadmap.md` | Feature roadmap |
| `/tipz/web/lib/near.ts` | NEAR SDK integration |
| `/tipz/web/app/api/swap/execute/route.ts` | Swap execution |
| `/tipz/web/app/api/health/route.ts` | Health check |
| `/tipz/docs/gtm/outreach-ready/josh-dm.md` | cashZ outreach template |
| `/tipz/docs/gtm/proposals/zashi-integration.md` | Zashi proposal |
| `/tipz/docs/gtm/community/forum-intro.md` | Forum post template |
| `/tipz/docs/gtm/kol-outreach.md` | KOL outreach guide |

---

*Last updated: January 2025*
