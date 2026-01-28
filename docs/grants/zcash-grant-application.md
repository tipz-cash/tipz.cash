# TIPZ - Zcash Foundation Grant Application

> **DRAFT** - Review and customize before submission
> Submit at: https://zcashcommunitygrants.org/submit

---

## Project Name

TIPZ: Privacy-First Tipping for Content Creators

---

## One-Sentence Summary

TIPZ enables content creators to receive tips directly to Zcash shielded addresses, ensuring their income remains private and free from financial surveillance.

---

## Problem Statement

**Creator income is surveilled by default.**

When creators use traditional tipping platforms (Ko-fi, Buy Me a Coffee, PayPal), their income is:
- Visible to payment processors
- Reported to tax authorities in real-time
- Subject to platform fees (5-10%)
- Potentially frozen or censored

When creators use transparent crypto (Bitcoin, Ethereum), their income is:
- Publicly visible on block explorers
- Linkable to their identity
- Subject to on-chain analysis
- Permanently recorded

**The result:** Creators face a choice between financial surveillance or technical complexity. Most choose surveillance because existing privacy tools are hard to use.

---

## Solution

TIPZ makes Zcash shielded addresses accessible to everyday creators through:

1. **Simple Registration:** Creator enters X handle + Zcash address. Posts verification tweet. Done.

2. **Tip Pages:** Each creator gets `tipz.cash/handle` - a clean page where supporters can send tips.

3. **Browser Extension:** Auto-adds tip links to creator's posts. Shows real-time tip notifications.

4. **Cross-Chain Payments:** Supporters can pay with ETH/USDC (via NEAR Intents) - funds arrive as shielded ZEC.

**Key innovation:** We abstract away crypto complexity. Supporters see dollars. Creators receive ZEC. Privacy happens automatically.

---

## What We've Built (Current State)

### Working MVP

| Feature | Status | Notes |
|---------|--------|-------|
| Creator registration | Complete | X verification, shielded address validation |
| Tip pages | Complete | Per-creator pages at tipz.cash/handle |
| Browser extension | Complete | Chrome extension with auto-stamp |
| Transaction logging | Complete | Supabase backend |
| Payment flow | Demo mode | UI complete, NEAR testnet ready |
| Twitter verification | Complete | Auto-verifies when API key configured |

### Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Extension:** Plasmo (Chrome/Firefox)
- **Payments:** NEAR Intents protocol for cross-chain swaps

### What's NOT Done

- Mainnet NEAR Intents integration (needs gas funding)
- Creator acquisition at scale (needs marketing budget)
- Chrome Web Store listing (needs developer fee + review)

---

## Traction

| Metric | Current | Month 2 Goal | Month 6 Goal |
|--------|---------|--------------|--------------|
| Registered creators | [X] | 50 | 200 |
| Monthly tip volume | $0 | $5,000 | $50,000 |
| Repeat tippers | 0 | 50 | 500 |

*Note: Update [X] with actual creator count before submission*

---

## Why Zcash?

TIPZ could theoretically work with any privacy coin. We chose Zcash because:

1. **Shielded addresses are production-ready.** Sapling addresses have years of real-world usage.

2. **Ecosystem support.** Zashi wallet makes receiving tips simple for creators.

3. **Regulatory clarity.** Zcash has clearer legal standing than Monero in most jurisdictions.

4. **Mission alignment.** Zcash Foundation's focus on financial privacy matches our goals.

5. **Community.** Active community of privacy advocates who are likely early adopters.

---

## Grant Request

**Total ask:** $40,000 USD (payable in ZEC)

### Budget Breakdown

| Category | Amount | Details |
|----------|--------|---------|
| **Infrastructure** | $5,000 | NEAR mainnet gas, Supabase scaling, monitoring |
| **Development** | $15,000 | 3 months runway for core development |
| **Creator Acquisition** | $10,000 | Referral incentives, community building |
| **Marketing** | $5,000 | Demo video, content, Zcash forum engagement |
| **Contingency** | $5,000 | Unexpected costs, exchange rate buffer |

### Why This Amount?

- **Not asking for salaries.** This is runway to reach sustainable tip volume.
- **Infrastructure is real cost.** NEAR mainnet gas is ~$0.01/tx, but we need buffer for scale.
- **Creator acquisition is key.** 200 active creators = ~$50K monthly tip volume = self-sustaining.

---

## Milestones

### Month 1-2: Foundation

**Deliverables:**
- [ ] NEAR mainnet integration live
- [ ] Chrome Web Store listing approved
- [ ] 50 creators registered
- [ ] $5,000 monthly tip volume

**Acceptance criteria:**
- Real ZEC payments flowing to creator addresses
- Extension installable from Chrome Web Store
- Public dashboard showing creator count and volume

### Month 3-4: Growth

**Deliverables:**
- [ ] 100 creators registered
- [ ] $20,000 monthly tip volume
- [ ] Creator referral program live
- [ ] Firefox extension submitted

**Acceptance criteria:**
- Organic creator sign-ups (not just outreach)
- 10+ creators earning $100+/month
- Referral tracking in analytics

### Month 5-6: Scale

**Deliverables:**
- [ ] 200 creators registered
- [ ] $50,000 monthly tip volume
- [ ] Substack integration (v2)
- [ ] Public launch announcement

**Acceptance criteria:**
- 20+ creators earning $500+/month
- Coverage in 2+ crypto publications
- Clear path to sustainability

---

## Team

### [Your Name]
**Role:** Founder & Developer

**Background:**
- [X years] software development experience
- Previously: [relevant experience]
- Built: [relevant projects]

**Why me:**
- Deep interest in financial privacy
- Full-stack capable (can ship without dependencies)
- Committed to shipping, not just ideating

**Contact:**
- X: @[handle]
- Email: [email]
- GitHub: [github]

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| NEAR Intents reliability | High | Fallback to direct ZEC payments |
| Low creator adoption | High | Focus on Zcash community first |
| Regulatory concerns | Medium | Non-custodial design, no money transmission |
| Twitter API changes | Low | Manual verification fallback exists |
| Competition | Low | Privacy focus is unique differentiator |

---

## How This Benefits Zcash

1. **More shielded transactions.** Every tip = 1 shielded tx on Zcash network.

2. **Real-world use case.** "Get paid privately" is more compelling than "store value privately."

3. **Creator advocacy.** Creators talk about their tools. TIPZ creators become Zcash advocates.

4. **Cross-chain bridge.** ETH/USDC -> ZEC flow brings new users to Zcash ecosystem.

5. **Privacy normalization.** When tipping is private by default, privacy becomes normal.

---

## FAQ

**Q: Why not just have creators share their z-address directly?**
A: UX matters. A tipz.cash link is more shareable than a 78-character address. Plus we provide verification, analytics, and notifications.

**Q: How do you handle fiat on/off ramps?**
A: We don't. TIPZ is crypto-native. Supporters pay with crypto. Creators receive ZEC. Fiat conversion is their choice.

**Q: What's your revenue model?**
A: Phase 1: 0% fee (grow the pie). Phase 2: Optional premium features (analytics, custom branding). We never take a cut of tips.

**Q: Is this legal?**
A: TIPZ is non-custodial. We never hold funds. We're a directory and notification service, not a money transmitter.

---

## Supporting Materials

- **Live demo:** [tipz.cash](https://tipz.cash)
- **Demo video:** [YouTube/Loom link]
- **GitHub:** [repository link if public]
- **Forum post:** [link to Zcash forum intro]

---

## Contact

**Primary contact:** [Your name]
**Email:** [email]
**X/Twitter:** @[handle]
**Telegram:** @[handle] (optional)

---

*Application prepared: [DATE]*
*TIPZ version: 1.0.0*
