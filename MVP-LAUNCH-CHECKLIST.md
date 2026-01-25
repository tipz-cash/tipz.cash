# TIPZ MVP Launch Checklist

This document outlines everything needed to transition TIPZ from demo mode to production.

## Current Status

**Demo Mode:** All payment flows work but are simulated. No real transactions occur.

**What Works Today:**
- Creator registration with tweet verification (pending status without Twitter API)
- Creator directory with pagination
- Extension injects TIP buttons on X.com
- Full tipping UI flow with wallet connection
- Real ZEC price quotes from CoinGecko
- Transaction logging to database (when configured)

## Pre-Launch Configuration

### 1. Supabase (Required)

**Status:** Web app requires these for any functionality.

```bash
# /tipz/web/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

**Actions:**
- [ ] Create Supabase project at https://supabase.com
- [ ] Run migrations: `supabase db push` or apply manually
- [ ] Set environment variables

### 2. Twitter API (Recommended)

**Status:** Without this, registrations are "pending" and require manual review.

```bash
# /tipz/web/.env
TWITTER_BEARER_TOKEN=your-bearer-token
```

**Actions:**
- [ ] Apply at https://developer.twitter.com/en/portal/projects
- [ ] Request read-only access (tweet.read, users.read scopes)
- [ ] Generate Bearer Token
- [ ] Set environment variable

**Alternative:** Skip Twitter API and manually verify first 50 creators.

### 3. NEAR Protocol (Required for Real Payments)

**Status:** This is the main blocker for real transactions.

```bash
# /tipz/web/.env
NEAR_NETWORK=testnet           # Start with testnet
NEAR_ACCOUNT_ID=tipz.testnet   # Your NEAR account
NEAR_PRIVATE_KEY=ed25519:...   # Your private key
NEAR_DEMO_MODE=false           # THE SWITCH
```

**Actions:**
- [ ] Create NEAR testnet account at https://wallet.testnet.near.org
- [ ] Export private key from wallet settings
- [ ] Fund account with test NEAR (faucet: https://near-faucet.io)
- [ ] Set `NEAR_DEMO_MODE=false`
- [ ] Test with small amounts ($1-5)

**For Mainnet:**
- [ ] Create mainnet account at https://wallet.near.org
- [ ] Fund with ~1 NEAR for gas (~$3-5)
- [ ] Set `NEAR_NETWORK=mainnet`
- [ ] Run testnet tests first!

### 4. Browser Extension

```bash
# /tipz/extension/.env
PLASMO_PUBLIC_API_URL=https://your-production-url.com
PLASMO_PUBLIC_DEMO_MODE=false
PLASMO_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

**Actions:**
- [ ] Get WalletConnect Project ID at https://cloud.walletconnect.com
- [ ] Update API URL to production
- [ ] Set demo mode to false
- [ ] Build extension: `npm run build`
- [ ] Package for Chrome Web Store: `npm run package`

## Launch Sequence

### Phase 1: Testnet Validation

1. **Configure testnet environment**
   ```bash
   NEAR_NETWORK=testnet
   NEAR_DEMO_MODE=false
   ```

2. **Register a test creator**
   - Use a test X account
   - Post verification tweet with shielded address
   - Verify registration succeeds

3. **Execute test tips**
   - Connect wallet (testnet ETH)
   - Send $1 tip
   - Verify intent is created on NEAR testnet
   - Confirm ZEC arrives at shielded address (may take 5-10 min)

4. **Validate transaction logging**
   - Check Supabase transactions table
   - Verify all fields populated correctly

### Phase 2: Limited Mainnet Alpha

1. **Switch to mainnet**
   ```bash
   NEAR_NETWORK=mainnet
   NEAR_DEMO_MODE=false
   ```

2. **Invite 5-10 trusted creators**
   - Manually verify their registrations
   - Test real tips with small amounts

3. **Monitor for issues**
   - Check `/api/health` endpoint
   - Review server logs
   - Verify transactions complete

### Phase 3: Public Launch

1. **Enable Twitter verification** (if approved)

2. **Submit extension to Chrome Web Store**
   - Extension works in demo mode while pending

3. **Announce on social**
   - Share registration flow
   - Encourage creators to register

## API Health Check

The `/api/health` endpoint returns production readiness:

```json
{
  "status": "healthy",
  "mode": "production",
  "checks": {
    "database": { "status": "connected" },
    "transactions_table": { "status": "connected" },
    "near": {
      "status": "configured",
      "network": "mainnet",
      "message": "Production mode - real payments enabled"
    },
    "twitter": {
      "status": "configured",
      "message": "Tweet verification enabled"
    }
  }
}
```

## Troubleshooting

### Payments Not Working

1. Check `NEAR_DEMO_MODE` is set to `false`
2. Verify NEAR credentials are correct
3. Check NEAR account has gas (view on nearblocks.io)
4. Look for errors in server logs

### Tweet Verification Failing

1. Verify `TWITTER_BEARER_TOKEN` is set
2. Check Twitter API rate limits (300/15min)
3. Ensure tweet contains "TIPZ" keyword
4. Ensure tweet contains shielded address

### Extension Not Working

1. Check `PLASMO_PUBLIC_API_URL` points to production
2. Verify CORS headers on API
3. Check browser console for errors

## Security Checklist

- [ ] NEAR private key is stored securely (env variable, not committed)
- [ ] Supabase service key has appropriate RLS policies
- [ ] Rate limiting is enabled (already configured)
- [ ] No sensitive data in extension bundle

## Rollback Plan

To revert to demo mode:

```bash
# /tipz/web/.env
NEAR_DEMO_MODE=true
```

```bash
# /tipz/extension/.env
PLASMO_PUBLIC_DEMO_MODE=true
```

Rebuild and redeploy. All functionality continues working in simulated mode.

---

**Last Updated:** January 2025
