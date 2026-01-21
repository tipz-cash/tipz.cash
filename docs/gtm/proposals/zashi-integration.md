# TIPZ + Zashi Wallet Integration Proposal

**Date**: January 2026
**From**: TIPZ Team
**To**: Zashi / Zcash Foundation Team
**Status**: Draft - Ready for submission

---

## Executive Summary

TIPZ is a private micro-tipping platform for content creators that uses Zcash shielded addresses as the settlement layer. We propose integrating with Zashi wallet to create a seamless experience for creators receiving tips and to drive new Zcash users through creator monetization.

**The opportunity**: Turn every TIPZ creator into a Zashi user, and every tip into a shielded transaction.

---

## About TIPZ

### What We Built

TIPZ enables private tipping for content creators on X (Twitter) and other platforms:

- **Creators** register their Zcash shielded address at tipz.app
- **Tippers** install a browser extension that shows tip buttons on supported platforms
- **Any-token support**: Tips can be sent in ETH, USDC, SOL, or other tokens
- **Automatic swap**: NEAR Intents handles cross-chain routing
- **Private settlement**: All tips arrive as shielded ZEC

### Why Zcash

We chose Zcash because:

1. **Shielded by default**: Creator income should be private, period
2. **Proven technology**: Shielded transactions work reliably
3. **Ecosystem support**: Good wallet infrastructure exists
4. **Regulatory clarity**: Zcash has clearer standing than alternatives

### Current Status

- **Web app**: Live at tipz.app
- **Browser extension**: Available for Chrome/Firefox
- **Platforms**: X.com support live, Substack in progress
- **Architecture**: Non-custodial, direct-to-shielded settlement

---

## Proposed Integration

### Integration Options

We propose a phased integration approach, starting lightweight and deepening based on results.

#### Phase 1: Ecosystem Listing (Low Effort)

**What**: Feature TIPZ in Zashi's ecosystem/apps section or recommended tools

**Implementation**:
- Add TIPZ to any "Apps built on Zcash" listings
- Include in onboarding suggestions for new users
- Mention in relevant documentation

**Effort**: Minimal (content update only)
**Timeline**: 1-2 weeks

**Value**:
- *For Zashi*: Showcases real shielded use case
- *For TIPZ*: Credibility from official wallet endorsement

---

#### Phase 2: Deep Linking (Medium Effort)

**What**: Enable "Create address with Zashi" flow from TIPZ registration

**Implementation**:
- TIPZ registration page includes "Get address from Zashi" button
- Deep link opens Zashi app
- User generates/copies shielded address
- Returns to TIPZ to complete registration

**Technical requirements**:
- Zashi deep link protocol (zashi://)
- Address generation/copy flow
- Return URL handling (optional)

**Effort**: Medium (requires Zashi development)
**Timeline**: 4-6 weeks

**Value**:
- *For Zashi*: Every TIPZ creator becomes a Zashi user
- *For TIPZ*: Frictionless onboarding, no address confusion

---

#### Phase 3: Tip Notifications (Higher Effort)

**What**: Show incoming tip notifications in Zashi app

**Implementation**:
- TIPZ sends webhook when tip is initiated
- Zashi displays "Incoming tip from TIPZ" notification
- Links to transaction once confirmed

**Technical requirements**:
- TIPZ webhook API
- Zashi notification system
- Transaction linking

**Effort**: Higher (requires coordination)
**Timeline**: 8-12 weeks

**Value**:
- *For Zashi*: Increased engagement, users check app more
- *For TIPZ*: Better creator experience, faster acknowledgment

---

#### Phase 4: Native Tip Receiving (Future)

**What**: "I receive tips" toggle in Zashi with TIPZ integration

**Implementation**:
- In-app feature to enable tip receiving
- Generates/selects shielded address
- Automatically registers with TIPZ
- Manages tip settings in-wallet

**Effort**: Significant (joint feature development)
**Timeline**: 3-6 months

**Value**:
- *For Zashi*: New feature, differentiation from other wallets
- *For TIPZ*: Ultimate frictionless onboarding

---

## Value Proposition

### Value for Zashi

| Benefit | Description |
|---------|-------------|
| **New users** | Every TIPZ creator needs a wallet - we recommend Zashi |
| **Transaction volume** | Each tip = shielded transaction through Zashi |
| **Real use case** | Demonstrates practical shielded utility beyond speculation |
| **Creator economy** | High-value users who actively use their wallet |
| **Ecosystem growth** | Success attracts more builders to Zcash |

### Value for TIPZ

| Benefit | Description |
|---------|-------------|
| **Smoother onboarding** | "Download Zashi" is simpler than "get any wallet" |
| **Credibility** | Official wallet partnership validates our approach |
| **Shared promotion** | Access to Zashi's user base and channels |
| **Technical support** | Collaboration on edge cases |

### Shared Benefits

- **Narrative alignment**: Both pushing "shielded by default"
- **Ecosystem growth**: More ZEC users, more demand
- **Proof of utility**: Real-world privacy use case
- **Community goodwill**: Building together, not competing

---

## User Journey with Integration

### Current Flow (Without Integration)

1. Creator discovers TIPZ
2. Visits tipz.app to register
3. Needs a shielded address - confused about where to get one
4. Searches for Zcash wallets
5. Maybe downloads one, maybe gives up
6. Eventually gets address, returns to TIPZ
7. Completes registration

**Drop-off risk**: High at step 3-6

### Proposed Flow (With Phase 2 Integration)

1. Creator discovers TIPZ
2. Visits tipz.app to register
3. Clicks "Get address with Zashi"
4. Downloads Zashi (or opens if installed)
5. Zashi guides address creation
6. One tap to copy shielded address
7. Returns to TIPZ, pastes address
8. Done

**Drop-off risk**: Minimal - clear path

### Future Flow (With Phase 4 Integration)

1. Creator already has Zashi
2. Enables "Receive Tips" in Zashi settings
3. TIPZ registration happens automatically
4. Done - start receiving tips

**Drop-off risk**: Near zero for existing users

---

## Technical Details

### TIPZ Architecture

```
[Tipper Wallet]
    |
    v
[NEAR Intents - Cross-chain swap]
    |
    v
[ZEC Shielded Transaction]
    |
    v
[Creator's Shielded Address in Zashi]
```

### Data We Store

- Creator's X handle
- Creator's shielded address (public for registration, but tips are private)
- Registration timestamp

### Data We Don't Store

- Wallet balances
- Transaction history
- Private keys or viewing keys
- Personal information

### API Endpoints (For Integration)

**Check if creator is registered:**
```
GET /api/creator?handle={x_handle}
Response: { registered: boolean, address?: string }
```

**Register creator (potential Zashi integration point):**
```
POST /api/register
Body: { handle: string, address: string, source?: "zashi" }
```

**Webhook for tip notifications (Phase 3):**
```
POST {zashi_webhook_url}
Body: {
  type: "tip_initiated",
  destination_address: string,
  amount_zec: number,
  source_token: string,
  estimated_arrival: timestamp
}
```

---

## Implementation Timeline

### Recommended Approach

| Phase | Effort | Timeline | Prerequisites |
|-------|--------|----------|---------------|
| Phase 1: Listing | Low | 1-2 weeks | None |
| Phase 2: Deep Link | Medium | 4-6 weeks | Phase 1 live |
| Phase 3: Notifications | Medium-High | 8-12 weeks | Both APIs ready |
| Phase 4: Native | High | 3-6 months | Phases 1-3 success |

### Suggested Starting Point

We recommend starting with **Phase 1 (Ecosystem Listing)** immediately:
- Zero development required
- Validates partnership interest
- Creates foundation for deeper integration

Then proceed to **Phase 2 (Deep Linking)** once we have initial traction metrics to share.

---

## Success Metrics

### For This Partnership

| Metric | Target (90 days) |
|--------|------------------|
| TIPZ creators using Zashi | 50+ |
| Tips received in Zashi | 200+ |
| Conversion rate from TIPZ registration | 60%+ |
| Joint marketing impressions | 50K+ |

### Long-Term Goals

- TIPZ becomes the recommended way for Zashi users to receive tips
- Zashi becomes the default wallet for TIPZ creators
- Combined we onboard 1000+ new shielded users per quarter

---

## Marketing & Co-Promotion

### Launch Activities (If Partnership Proceeds)

**From TIPZ**:
- "Powered by Zashi" or "Zashi Recommended" badge on registration
- Blog post announcing partnership
- Social media promotion
- Community posts highlighting Zashi

**Requested from Zashi**:
- Ecosystem listing / recommendation
- Social media mention at integration launch
- Optional: Blog post or newsletter mention

### Ongoing

- Cross-promotion in respective communities
- Shared success stories (creator testimonials)
- Joint presence at Zcash community events

---

## Questions for Zashi Team

1. **Deep linking**: Does Zashi currently support deep links? What's the protocol?

2. **Address generation flow**: What's the simplest way for a user to copy their shielded address from Zashi?

3. **Notification system**: Does Zashi have push notification infrastructure for Phase 3?

4. **Partnership process**: Who should we coordinate with for ecosystem listing?

5. **Timeline**: What's the team's current bandwidth for integration work?

---

## Next Steps

1. **Initial call**: 30-minute discussion to align on interest and approach
2. **Phase 1 execution**: Add TIPZ to ecosystem listings (immediate)
3. **Technical review**: Assess deep linking feasibility (Week 2)
4. **Agreement**: Confirm scope for Phase 2 (Week 3)
5. **Implementation**: Build and launch Phase 2 (Weeks 4-8)

---

## Contact

**TIPZ Team**
- Website: tipz.app
- X: @tipz_app (or appropriate handle)
- Email: [team email]

We're excited about the possibility of working together to make private tipping the standard for creator monetization. Zashi is the natural wallet partner for this mission, and we believe this integration benefits the entire Zcash ecosystem.

Looking forward to discussing.

---

## Appendix: Screenshots

*[Would include TIPZ product screenshots here]*

- Registration page
- Extension tip button on X.com
- Tip modal
- Creator dashboard (if applicable)
