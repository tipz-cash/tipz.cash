# TIPZ KOL Email Outreach Templates

**Status: Ready to Send**
**Last Updated: January 2026**

Five email templates for key opinion leader outreach, targeting different personas.

---

## Template 1: Privacy Advocate / Researcher

**Subject Lines (A/B test):**
- "Private tipping infrastructure for creators - feedback request"
- "Built something for financial privacy advocates"
- "Zcash-powered creator tips - your take?"

**Best For:** Privacy researchers, cypherpunk advocates, Zcash community leaders

```
Subject: Private tipping infrastructure for creators - feedback request

Hi [Name],

I've been following your work on [specific topic/article/tweet] - your perspective on financial privacy is exactly why I wanted to reach out.

We just launched TIPZ, a private micro-tipping tool for X (Twitter) creators. The core idea: tips should be private by default, not public records.

How it works:
- Creators register their Zcash shielded address via a tweet
- Supporters install a Chrome extension
- Tips can be sent in any token (ETH, USDC, SOL, etc.)
- We handle the swap - tips arrive as shielded ZEC
- Zero platform fees. Non-custodial. Private by default.

We built this because every existing tipping solution exposes both parties. Creator income is on public blockchains. Supporter wallets are linked forever. We think that's broken.

Would love your honest feedback:
- Does the privacy model make sense?
- What would make this more useful for creators?
- Any concerns we should address?

The product is live at tipz.cash - happy to give you a walkthrough or just answer questions over email.

No ask here except your perspective. Building in public means listening to people who understand what we're trying to do.

Best,
[Your name]
[Your title, TIPZ]

P.S. - If this isn't interesting or relevant, no need to respond. Appreciate you taking the time to read either way.
```

---

## Template 2: Crypto Creator / Influencer

**Subject Lines (A/B test):**
- "A better way for your audience to tip you"
- "Private tips from your X followers - no more public wallet exposure"
- "Quick: made this for creators like you"

**Best For:** Crypto Twitter personalities, DeFi educators, NFT artists, newsletter writers

```
Subject: A better way for your audience to tip you

Hi [Name],

I follow your content on [X/Substack/etc.] - specifically loved [specific piece of content]. You clearly have an engaged audience that values your work.

Quick pitch: We built TIPZ, a private tipping layer for creators. Your audience can tip you directly from your tweets, and the transactions are completely private.

Why this might matter to you:
- Your income stays private (no public wallet balance for competitors to see)
- Your supporters stay private (they can support you without wallet exposure)
- Any token works (they tip in ETH/USDC/whatever, you receive ZEC to a shielded address)
- Zero platform fees (we don't take a cut)

Setup takes 2 minutes:
1. Tweet your Zcash shielded address (we'll show you how to get one)
2. Register at tipz.cash
3. Done - tip button appears on your tweets for anyone with the extension

We're not asking for a promo or anything. Just wanted to let you know this exists in case it's useful.

If you want to try it: tipz.cash

If you have questions: just reply to this email.

Keep creating.

[Your name]
TIPZ

P.S. - We recommend Zashi wallet for your shielded address. Takes 2 minutes to set up.
```

---

## Template 3: Developer / Builder

**Subject Lines (A/B test):**
- "Shipping shielded-by-default: TIPZ architecture"
- "Cross-chain swaps to Zcash shielded - technical breakdown"
- "Open question for a fellow builder"

**Best For:** Crypto developers, protocol builders, open source maintainers

```
Subject: Shipping shielded-by-default: TIPZ architecture

Hi [Name],

Fellow builder here. Saw your work on [project/contribution] and thought you might find this interesting from a technical perspective.

We just launched TIPZ - private micro-tipping for creators using Zcash shielded addresses. The interesting part is the cross-chain swap layer:

Architecture:
- Browser extension injects tip buttons on X.com
- Tippers connect any EVM wallet
- We route through cross-chain swap infrastructure
- Final destination is always a shielded Zcash address
- Non-custodial throughout - we never hold funds

The challenge we solved: How do you let someone tip with ETH and have it arrive in a shielded pool without the tipper needing to understand ZEC?

Tech stack:
- Plasmo for the browser extension
- Next.js + Supabase for the web app
- Cross-chain swaps for any-token support
- THORChain for deep liquidity
- Zcash shielded addresses as the destination

Would be curious to get your take on the architecture. Any obvious improvements or concerns?

Live at tipz.cash - code is [open source / available to review] if you want to dig in.

Happy to chat more about the technical decisions if interesting.

[Your name]
TIPZ

P.S. - If you ever want to accept tips for your open source work, registration takes 2 minutes.
```

---

## Template 4: Podcast Host / Media

**Subject Lines (A/B test):**
- "Story angle: The surveillance problem with crypto tips"
- "Creator income is public - we're fixing it"
- "Privacy infrastructure for the creator economy"

**Best For:** Crypto podcast hosts, newsletter writers, journalists covering Web3

```
Subject: Story angle: The surveillance problem with crypto tips

Hi [Name],

I listen to [podcast/read newsletter] regularly - your coverage of [specific topic] was particularly insightful.

I wanted to share a story angle that might resonate with your audience:

**The problem:** Every crypto tip is a public record. When a creator accepts tips in ETH or SOL, anyone can see their income, who supports them, and when. This creates real issues - competitors tracking earnings, supporters being profiled, creators getting doxxed based on wallet balances.

**What we built:** TIPZ is a private tipping layer for creators. Tips arrive in Zcash shielded addresses where sender, receiver, and amount are all encrypted. Supporters can use any token - we handle the swap automatically.

**Why it matters now:**
- Creator economy is growing rapidly
- On-chain analytics are getting more sophisticated
- Privacy is becoming a mainstream concern
- Zcash ecosystem is seeing renewed energy (cashZ launch, etc.)

I'd be happy to:
- Come on the show to discuss creator privacy
- Provide quotes for an article
- Give you early access to demo the product
- Connect you with early creator users (with their permission)

No pressure - just wanted to flag this in case it fits your editorial calendar.

The product is live at tipz.cash if you want to see it firsthand.

Best,
[Your name]
TIPZ

P.S. - We're not paying for coverage. Reaching out because I think this is genuinely interesting for your audience.
```

---

## Template 5: Zcash Ecosystem Leader

**Subject Lines (A/B test):**
- "Building on Zcash: TIPZ launch feedback"
- "Shielded-by-default creator tipping - community input request"
- "New Zcash application: seeking ecosystem guidance"

**Best For:** Zcash Foundation members, ECC alumni, Zcash grant committee, major ZEC holders

```
Subject: Building on Zcash: TIPZ launch feedback

Hi [Name],

I've followed your contributions to the Zcash ecosystem for a while - [specific contribution/role/comment that shows familiarity].

We just launched TIPZ, and I wanted to introduce ourselves to the community properly.

**What we built:**
TIPZ is private micro-tipping for content creators. Tips arrive in shielded addresses, and tippers can use any token (we handle the swap to ZEC).

**Why we chose Zcash:**
- Shielded transactions actually work (not mixers or obfuscation)
- Addresses are familiar format (easy UX)
- Ecosystem is mature enough for production use
- Regulatory clarity compared to alternatives
- The community cares about real-world adoption

**Current status:**
- Chrome extension live
- X (Twitter) integration working
- Creator registration via tweet verification
- Profile pages at tipz.cash/username

**What we're looking for:**
1. Honest feedback on the product
2. Guidance on ecosystem integration (Zashi, ZecHub, etc.)
3. Connections to creators who might benefit
4. Long-term: potentially Zcash grant support for development

I'm not asking for promotion - just want to be a good community member and build something useful for the ecosystem.

Would you have 20 minutes for a call? Or if you prefer, I'm happy to share more detail over email.

Live demo: tipz.cash

Appreciate your time either way.

Best,
[Your name]
TIPZ

P.S. - We're committed to shielded-by-default. No transparent address support planned. This is how we think Zcash should be used.
```

---

## Email Outreach Best Practices

### Before Sending
- [ ] Personalize the [brackets] with specific details
- [ ] Research their recent work/content
- [ ] Verify their email is correct
- [ ] Ensure TIPZ is working properly (they will check)
- [ ] Prepare for a response (have answers ready)

### Subject Line Guidelines
- Keep under 50 characters
- No spam triggers (FREE, URGENT, etc.)
- Be specific, not clickbait
- A/B test when possible

### Timing
- Tuesday-Thursday mornings
- Avoid Mondays and Fridays
- Consider their timezone
- Don't send on weekends

### Follow-Up Strategy
- Wait 5-7 days before follow-up
- Maximum 2 follow-ups total
- Keep follow-up shorter than original
- Add new information if possible

### Follow-Up Template
```
Subject: Re: [Original subject]

Hi [Name],

Quick follow-up on my note about TIPZ.

Since I reached out, we've [hit milestone / added feature / received feedback].

Still happy to chat if interesting. If not, no worries - I'll stop following up.

[Your name]
```

---

## Tracking Spreadsheet Columns

| Name | Email | Template Used | Date Sent | Opened | Replied | Response Type | Follow-Up Date | Notes |
|------|-------|---------------|-----------|--------|---------|---------------|----------------|-------|
| | | | | | | | | |

---

## Response Handling

### If Positive
- Thank them genuinely
- Offer specific next steps
- Deliver on any promises quickly
- Keep them updated on progress

### If Negative/Not Interested
- Thank them for responding
- Don't argue or push
- Leave door open for future
- Move on gracefully

### If No Response (After 2 Follow-Ups)
- Stop emailing
- Add to "revisit in 3 months" list
- Continue building - success attracts attention
- Don't take it personally
