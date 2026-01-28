# Pre-Grant Setup Guide

> Complete these steps before applying to Zcash Foundation.
> Total time: 2-3 days (mostly waiting for API approvals)

---

## Quick Status Check

Run this command to see what's configured:

```bash
cd /Users/dylanadams/Desktop/naly-dev/tipz/web
npm run dev
# Then visit: http://localhost:3000/api/health
```

---

## Step 1: Twitter API Access (30 min setup, 24-48h approval)

**Why:** Auto-verify creator registrations instead of manual review.

### 1.1 Apply for Developer Account

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Sign in with your Twitter/X account
3. Click "Sign up for Free Account" (Basic tier is sufficient)
4. Fill out the use case form:
   - **Use case:** "I'm building a tipping platform that verifies creators own their accounts by checking they posted a verification tweet."
   - **Will you tweet/post?** No
   - **Will you analyze tweets?** Yes - to verify ownership

### 1.2 Create Project + App

1. Go to [Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Create a new Project:
   - Name: `TIPZ`
   - Use case: `Making a bot` or `Academic research`
3. Create an App within the project:
   - Name: `tipz-verification`
   - App permissions: `Read`

### 1.3 Generate Bearer Token

1. In your App settings, go to "Keys and tokens"
2. Generate "Bearer Token" under OAuth 2.0
3. Copy the token (starts with `AAAA...`)

### 1.4 Configure TIPZ

Add to `/tipz/web/.env.local`:

```bash
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAxxxxxxxxxxxxxxxxxx
```

### 1.5 Test Verification

1. Restart dev server: `npm run dev`
2. Go to http://localhost:3000/register
3. Complete registration flow
4. Check that status is "verified" (not "pending")

### 1.6 Deploy

After testing locally:

```bash
# Add to Vercel/your hosting provider
vercel env add TWITTER_BEARER_TOKEN production
```

---

## Step 2: NEAR Testnet Setup (1-2 hours)

**Why:** Proves payment infrastructure works (even with test tokens).

### 2.1 Create Testnet Account

1. Go to [wallet.testnet.near.org](https://wallet.testnet.near.org)
2. Click "Create Account"
3. Choose account name: `tipz.testnet` (or similar)
4. Complete security setup (passphrase)

### 2.2 Export Private Key

1. In NEAR Wallet, go to Settings > Export Account
2. Choose "Export Local Private Key"
3. Copy the key (format: `ed25519:xxxxx...`)

**Alternative via CLI:**

```bash
# Install NEAR CLI
npm install -g near-cli

# Login
near login

# Get key
near keys tipz.testnet
```

### 2.3 Fund Account

Testnet NEAR is free! Get tokens from faucet:

1. Visit [near-faucet.io](https://near-faucet.io)
2. Enter your testnet account ID
3. Request ~10 NEAR (enough for thousands of test transactions)

### 2.4 Configure TIPZ

Update `/tipz/web/.env.local`:

```bash
NEAR_NETWORK=testnet
NEAR_ACCOUNT_ID=tipz.testnet
NEAR_PRIVATE_KEY=ed25519:xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEAR_DEMO_MODE=false
```

### 2.5 Test Intent Creation

1. Restart dev server
2. Go to a creator's tip page (e.g., `/creator-handle`)
3. Complete a test tip flow
4. Check NEAR Explorer: [explorer.testnet.near.org](https://explorer.testnet.near.org)
5. Search for your account to see transactions

### 2.6 Verify in Health Check

```bash
curl http://localhost:3000/api/health | jq
```

Should show:
```json
{
  "near": {
    "configured": true,
    "network": "testnet",
    "accountId": "tipz.testnet",
    "mode": "production"
  }
}
```

---

## Step 3: Record Demo Video (1 hour)

**Why:** Grant reviewers want to see the product work.

### What to Show

1. **Homepage** (15 sec)
   - Clean design, clear value prop
   - "Privacy-first tipping for creators"

2. **Creator Registration** (60 sec)
   - Enter X handle
   - Enter Zcash shielded address
   - Post verification tweet
   - See "Verified" status

3. **Tip Page** (45 sec)
   - Navigate to creator's tip page
   - Select amount
   - Connect wallet
   - Show QR code / payment flow

4. **Extension** (30 sec)
   - Show extension popup
   - Auto-stamp toggle
   - Revenue dashboard

5. **Privacy Explanation** (30 sec)
   - Explain shielded addresses
   - No transaction history visible
   - Creator income is private

### Recording Tips

- Use OBS Studio or QuickTime (free)
- 1080p resolution minimum
- Talk through what you're showing
- Keep it under 3 minutes total
- Upload to YouTube (unlisted) or Loom

### Script Template

```
"Hi, I'm [name], builder of TIPZ.

TIPZ is privacy-first tipping for creators using Zcash shielded addresses.

[Show registration]
Creators register with their X handle and Zcash address. They post a
verification tweet, and they're live instantly.

[Show tip page]
Supporters visit the creator's tip page, choose an amount, and send.
Tips go directly to the creator's shielded address - no intermediaries.

[Show extension]
The browser extension lets creators auto-add their tip link to posts
and see real-time notifications when tips arrive.

[Show privacy]
The key difference: these transactions are shielded. You can't look up
a creator's income on a block explorer. Their financial privacy is
protected by default.

We're seeking funding to scale creator onboarding and complete mainnet
payment integration. Thanks for watching."
```

---

## Step 4: Seed 5-10 Real Creators (1-2 days)

**Why:** Shows traction, not just a prototype.

### Who to Contact

**Tier 1: Zcash Community (highest conversion)**
- Search X for "Zcash" mentions in bios
- Look at followers of @ElectricCoinCo, @ZcashFoundation
- Zcash forum contributors

**Tier 2: Privacy Advocates**
- Bitcoin privacy educators
- Cypherpunk/surveillance critics
- Digital rights advocates

**Tier 3: Crypto Creators (General)**
- Newsletter writers
- Tutorial creators
- Traders with tip jars

### Outreach Script

**Initial DM:**

```
Hey [name]!

Quick pitch: I built TIPZ - private tipping for creators using Zcash
shielded addresses. Your income stays invisible on-chain.

Takes 2 min to register → tipz.cash/register
You get a tip page at tipz.cash/[yourhandle]

Looking for 10 early creators before our grant application. Interested?
```

**Follow-up (3-4 days later):**

```
Hey [name], following up on TIPZ. No pressure - just making sure this
didn't get buried. Happy to do a quick call if you have questions!
```

### Track Progress

Update `/docs/outreach/seed-creator-list.md` as you go:

| Handle | Status | Contacted | Response |
|--------|--------|-----------|----------|
| @user1 | Registered | 2025-01-27 | Interested! |
| @user2 | DM sent | 2025-01-27 | |

---

## Step 5: Post on Zcash Forums (1 hour)

**Why:** Community visibility before grant ask.

### Where to Post

1. **Zcash Community Forum:** [forum.zcashcommunity.com](https://forum.zcashcommunity.com)
   - Category: "Community Projects" or "Showcase"

2. **r/zec** (optional): [reddit.com/r/zec](https://reddit.com/r/zec)

### Post Template

See `/docs/gtm/community/forum-intro.md` for the draft.

Key points to hit:
- Problem: Creator income is surveilled
- Solution: Shielded addresses for tips
- Demo: Link to live site + demo video
- Ask: Feedback, early adopters, grant support

---

## Checklist Before Grant Submission

- [ ] Twitter API token configured and working
- [ ] Registrations auto-verify (not stuck in "pending")
- [ ] NEAR testnet configured (optional but impressive)
- [ ] At least 5 real creators registered
- [ ] Demo video recorded and uploaded
- [ ] Forum post published
- [ ] Grant application completed (see `zcash-grant-application.md`)

---

## Troubleshooting

### Twitter API Issues

**"Could not authenticate"**
- Check bearer token is correct (no extra spaces)
- Ensure App permissions include "Read"

**"Rate limit exceeded"**
- Basic tier: 500 requests/month
- Wait 15 minutes and retry

### NEAR Issues

**"Account not found"**
- Confirm account ID is correct
- Check on explorer: `explorer.testnet.near.org/accounts/YOUR_ACCOUNT`

**"Insufficient funds"**
- Get more testnet NEAR from faucet
- Each intent needs ~0.01 NEAR for gas

**"Invalid key format"**
- Key must start with `ed25519:`
- No newlines or spaces in key

---

*Last updated: 2025-01-27*
